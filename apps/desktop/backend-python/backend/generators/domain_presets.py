DOMAIN_COLUMN_RULES = {
    "ecommerce": {
        "status": {"choices": ["pending", "paid", "shipped", "cancelled"]},
        "estado": {"choices": ["pendiente", "pagado", "enviado", "cancelado"]},
        "price": {"min": 1, "max": 5000, "precision": 2},
        "precio": {"min": 1, "max": 5000, "precision": 2},
        "quantity": {"min": 1, "max": 50},
        "cantidad": {"min": 1, "max": 50},
    },
    "clinic": {
        "status": {"choices": ["scheduled", "completed", "cancelled"]},
        "estado": {"choices": ["programada", "completada", "cancelada"]},
        "blood_type": {"choices": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]},
        "tipo_sangre": {"choices": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]},
    },
    "booking": {
        "status": {"choices": ["reserved", "checked_in", "checked_out", "cancelled"]},
        "estado": {"choices": ["reservado", "check_in", "check_out", "cancelado"]},
        "guests": {"min": 1, "max": 8},
        "huespedes": {"min": 1, "max": 8},
    },
    "inventory": {
        "status": {"choices": ["active", "inactive", "discontinued"]},
        "estado": {"choices": ["activo", "inactivo", "descontinuado"]},
        "stock": {"min": 0, "max": 10000},
        "quantity": {"min": 0, "max": 10000},
        "cantidad": {"min": 0, "max": 10000},
    },
}


def get_domain_rule(domain: str | None, column_name: str):
    if not domain:
        return None
    rules = DOMAIN_COLUMN_RULES.get(domain.lower())
    if not rules:
        return None
    return rules.get(column_name.lower())
