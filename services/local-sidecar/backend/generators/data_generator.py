"""
generators/data_generator.py
Clase principal para la generación de datos sintéticos.
Respeta orden de llaves foráneas y constraints únicos.
"""
from typing import Dict, List, Any, Set
from collections import defaultdict, deque
from faker import Faker
from backend.models.schemas import DatabaseSchema, TableGenerationConfig
from backend.generators.domain_presets import get_domain_rule
from backend.generators.faker_mappings import get_faker_method_for_column

class DataGenerator:
    def __init__(self, locale: str = "es_ES", seed: int | None = None, domain: str | None = None):
        self.fake = Faker(locale)
        self.domain = domain
        if seed is not None:
            self.fake.seed_instance(seed)

    def generate(self, schema: DatabaseSchema, table_configs: List[TableGenerationConfig], pk_offsets: Dict[str, int] = None) -> Dict[str, Dict[str, Any]]:
        """
        Genera datos para las tablas solicitadas, resolviendo dependencias de FK.
        Retorna un dict con los datos generados por tabla.
        Formato:
        {
            "users": {
                "columns": ["id", "name", ...],
                "rows": [[1, "John"], [2, "Jane"]]
            }
        }
        """
        config_map = {tc.table_name: tc for tc in table_configs if tc.selected}
        tables_to_generate = list(config_map.keys())

        # 1. Topological Sort para resolver dependencias (FKs)
        ordered_tables = self._topological_sort(schema, tables_to_generate)

        # Almacenar PKs generadas para usar en FKs
        generated_pks: Dict[str, Dict[str, List[Any]]] = defaultdict(lambda: defaultdict(list))
        
        result = {}

        for table_name in ordered_tables:
            table_schema = next((t for t in schema.tables if t.name == table_name), None)
            if not table_schema:
                continue
            
            count = config_map[table_name].record_count
            rows = []
            columns = [c.name for c in table_schema.columns]
            
            # Preparar generadores por columna
            generators = {}
            for col in table_schema.columns:
                explicit_rule = config_map[table_name].column_rules.get(col.name)
                domain_rule = get_domain_rule(self.domain, col.name)
                if explicit_rule:
                    generators[col.name] = self._generator_from_rule(explicit_rule, col.name, col.data_type)
                elif domain_rule:
                    generators[col.name] = self._generator_from_rule(domain_rule, col.name, col.data_type)
                elif col.foreign_key and col.foreign_key["table"] in generated_pks:
                    fk_table = col.foreign_key["table"]
                    fk_col = col.foreign_key["column"]
                    if generated_pks[fk_table][fk_col]:
                        # Generator function that picks a random existing FK value
                        generators[col.name] = lambda fk_list=generated_pks[fk_table][fk_col]: self.fake.random_element(fk_list)
                    else:
                        generators[col.name] = get_faker_method_for_column(self.fake, col.name, col.data_type)
                elif col.is_primary_key and any(
                    t in col.data_type.upper()
                    for t in ["INT", "SERIAL", "BIGSERIAL", "SMALLSERIAL"]
                ):
                    import itertools
                    start_val = (pk_offsets.get(table_name, 0) if pk_offsets else 0) + 1
                    counter = itertools.count(start_val)
                    generators[col.name] = lambda c=counter: next(c)
                else:
                    generators[col.name] = get_faker_method_for_column(self.fake, col.name, col.data_type)

            # Estructuras para unique constraints
            unique_sets: Dict[str, Set[Any]] = defaultdict(set)

            for i in range(count):
                row = []
                used_columns = []
                for col in table_schema.columns:
                    # Omitir columnas con valor por defecto del servidor (pero NO si es PK)
                    if col.default_value and any(
                        kw in col.default_value.lower()
                        for kw in ["now()", "gen_random_uuid()", "nextval(", "uuid_generate", "current_timestamp"]
                    ) and not col.is_primary_key:
                        continue

                    gen_func = generators[col.name]
                    val = gen_func()

                    # Manejar Unique constraints
                    if col.is_unique or col.is_primary_key:
                        attempts = 0
                        while val in unique_sets[col.name] and attempts < 100:
                            val = gen_func()
                            attempts += 1
                        unique_sets[col.name].add(val)

                    # Enforce max length si es string
                    if col.max_length and isinstance(val, str):
                        val = val[:col.max_length]

                    row.append(val)
                    used_columns.append(col.name)

                    # Guardar PKs para tablas dependientes
                    if col.is_primary_key or col.is_unique:
                        generated_pks[table_name][col.name].append(val)


                rows.append(row)

            result[table_name] = {
                "columns": used_columns if rows else columns,
                "rows": rows
            }

        return result

    def _generator_from_rule(self, rule: Dict[str, Any], column_name: str, data_type: str):
        if "constant" in rule:
            return lambda value=rule["constant"]: value
        if "choices" in rule and rule["choices"]:
            return lambda choices=rule["choices"]: self.fake.random_element(choices)
        if "faker" in rule and hasattr(self.fake, rule["faker"]):
            return getattr(self.fake, rule["faker"])
        if "min" in rule or "max" in rule:
            min_value = rule.get("min", 0)
            max_value = rule.get("max", 1000)
            precision = rule.get("precision")
            is_float = any(t in data_type.upper() for t in ["DECIMAL", "NUMERIC", "FLOAT", "DOUBLE", "REAL"])
            if precision is not None or is_float:
                return lambda: round(
                    self.fake.pyfloat(min_value=min_value, max_value=max_value, positive=min_value >= 0),
                    int(precision or 2),
                )
            return lambda: self.fake.random_int(min=min_value, max=max_value)
        return get_faker_method_for_column(self.fake, column_name, data_type)

    def _topological_sort(self, schema: DatabaseSchema, tables: List[str]) -> List[str]:
        """
        Ordena las tablas de forma que las dependencias (FK) se generen primero.
        """
        graph = {t: [] for t in tables}
        in_degree = {t: 0 for t in tables}

        schema_tables = {t.name: t for t in schema.tables}

        for table_name in tables:
            if table_name not in schema_tables:
                continue
            for fk in schema_tables[table_name].foreign_keys:
                ref_table = fk["referenced_table"] if "referenced_table" in fk else fk.get("table")
                if ref_table in graph and ref_table != table_name:  # ignorar auto-referencias
                    graph[ref_table].append(table_name)
                    in_degree[table_name] += 1

        queue = deque([t for t in tables if in_degree[t] == 0])
        ordered = []

        while queue:
            node = queue.popleft()
            ordered.append(node)
            for neighbor in graph[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Si hay un ciclo (ej: tables self-referencing o circular dependency), in_degree no bajará a 0
        for t in tables:
            if in_degree[t] > 0 and t not in ordered:
                ordered.append(t)

        return ordered
