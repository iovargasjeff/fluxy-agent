import { MarkerType, type Edge, type Node } from '@xyflow/react'

export type EditorDialect = 'postgresql' | 'mysql' | 'sqlserver' | 'json' | 'mongodb' | 'neo4j'

export type EditorColumn = {
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  nullable?: boolean
  defaultValue?: string
  references?: {
    table: string
    column: string
  }
}

export type EditorTableData = {
  tableName: string
  columns: EditorColumn[]
  comment?: string
  color?: string
}

export type EditorNode = Node<EditorTableData, 'tableNode' | 'nosqlNode' | 'mongoNode' | 'neo4jNode'>

export const DEFAULT_TABLE_COLOR = '#1A6CF6'

export function isEditorNode(node: Node): node is EditorNode {
  return (
    (node.type === 'tableNode' || node.type === 'nosqlNode' || node.type === 'mongoNode' || node.type === 'neo4jNode') &&
    typeof node.data?.tableName === 'string' &&
    Array.isArray(node.data?.columns)
  )
}

export function makeTableNode(index: number, name = `tabla_${index}`): EditorNode {
  return {
    id: crypto.randomUUID(),
    type: 'tableNode',
    position: { x: 120 + (index % 3) * 320, y: 120 + Math.floor(index / 3) * 220 },
    data: {
      tableName: name,
      color: DEFAULT_TABLE_COLOR,
      columns: [
        {
          name: 'id',
          type: 'SERIAL',
          isPrimaryKey: true,
          nullable: false,
        },
      ],
    },
  }
}

export function makeRelationshipEdge(source: EditorNode, sourceColumn: EditorColumn, target: EditorNode, targetColumn: EditorColumn): Edge {
  return {
    id: `rel-${source.id}-${sourceColumn.name}-${target.id}-${targetColumn.name}`,
    source: source.id,
    sourceHandle: `${sourceColumn.name}-source`,
    target: target.id,
    targetHandle: `${targetColumn.name}-target`,
    type: 'relationship',
    animated: false,
    style: { stroke: '#1A6CF6', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#1A6CF6',
    },
    label: `${sourceColumn.name} -> ${targetColumn.name}`,
  }
}

function quoteIdentifier(name: string, dialect: EditorDialect) {
  if (dialect === 'mysql') return `\`${name}\``
  if (dialect === 'sqlserver') return `[${name}]`
  return `"${name}"`
}

function normalizeType(type: string, dialect: EditorDialect) {
  const upper = (type || 'TEXT').toUpperCase()
  if (dialect === 'postgresql') {
    if (upper.includes('AUTO_INCREMENT') || upper.includes('IDENTITY')) return 'SERIAL'
    if (upper === 'DATETIME') return 'TIMESTAMP'
    if (upper === 'NVARCHAR') return 'VARCHAR'
  }
  if (dialect === 'sqlserver') {
    if (upper === 'SERIAL' || upper.includes('AUTO_INCREMENT')) return 'INT IDENTITY(1,1)'
    if (upper === 'TEXT') return 'NVARCHAR(MAX)'
    if (upper === 'BOOLEAN') return 'BIT'
    if (upper === 'JSONB' || upper === 'JSON') return 'NVARCHAR(MAX)'
  }
  if (dialect === 'mysql') {
    if (upper === 'SERIAL' || upper.includes('IDENTITY')) return 'INT AUTO_INCREMENT'
    if (upper === 'BOOLEAN') return 'TINYINT(1)'
    if (upper === 'JSONB') return 'JSON'
  }
  return type || 'TEXT'
}

export function serializeSchema(nodes: Node[], dialect: EditorDialect) {
  const tables = nodes.filter(isEditorNode)

  if (dialect === 'json') {
    const json = Object.fromEntries(
      tables.map((table) => [
        table.data.tableName,
        Object.fromEntries(table.data.columns.map((column) => [column.name, column.type || 'string'])),
      ])
    )
    return JSON.stringify(json, null, 2)
  }

  if (dialect === 'mongodb') {
    return tables.map((table) => {
      const collectionName = table.data.tableName
      const fields = table.data.columns.map((column) => {
        let typeStr = column.type || 'String'
        if (typeStr.toUpperCase() === 'VARCHAR' || typeStr.toUpperCase() === 'TEXT') typeStr = 'String'
        if (typeStr.toUpperCase() === 'INT' || typeStr.toUpperCase() === 'INTEGER') typeStr = 'Number'
        if (typeStr.toUpperCase() === 'BOOLEAN') typeStr = 'Boolean'
        if (typeStr.toUpperCase() === 'DATETIME' || typeStr.toUpperCase() === 'TIMESTAMP') typeStr = 'Date'
        
        let fieldDef = `type: ${typeStr}`
        if (column.references?.table) {
          fieldDef = `type: Schema.Types.ObjectId, ref: '${column.references.table}'`
        }
        
        const isRequired = column.nullable === false && !column.isPrimaryKey ? `, required: true` : ''
        
        if (column.isPrimaryKey && column.name === '_id') {
          return null // _id is implicit in mongoose
        }
        
        return `  ${column.name}: { ${fieldDef}${isRequired} }`
      }).filter(Boolean)

      return `const ${collectionName}Schema = new mongoose.Schema({\n${fields.join(',\n')}\n});\n\nconst ${collectionName} = mongoose.model('${collectionName}', ${collectionName}Schema);`
    }).join('\n\n')
  }

  if (dialect === 'neo4j') {
    return tables.map((table) => {
      const label = table.data.tableName
      const props = table.data.columns
        .filter(c => !c.references) // Ignorar FKs puras, en Neo4j son relaciones
        .map(c => `${c.name}: "${c.type}"`)
      
      const createNode = `CREATE (n:${label} { ${props.join(', ')} });`
      
      const relationships = table.data.columns
        .filter(c => c.references?.table)
        .map(c => `MATCH (a:${label}), (b:${c.references?.table})\nCREATE (a)-[:RELATES_TO]->(b);`)
        
      return [createNode, ...relationships].join('\n')
    }).join('\n\n')
  }

  return tables.map((table) => {
    const tableName = quoteIdentifier(table.data.tableName, dialect)
    const primaryKeys = table.data.columns.filter((column) => column.isPrimaryKey).map((column) => quoteIdentifier(column.name, dialect))

    const lines = table.data.columns.map((column) => {
      const pieces = [
        quoteIdentifier(column.name, dialect),
        normalizeType(column.type, dialect),
        column.nullable === false ? 'NOT NULL' : '',
        column.defaultValue ? `DEFAULT ${column.defaultValue}` : '',
        column.isPrimaryKey && primaryKeys.length === 1 ? 'PRIMARY KEY' : '',
      ].filter(Boolean)

      if (column.references?.table && column.references?.column) {
        pieces.push(`REFERENCES ${quoteIdentifier(column.references.table, dialect)}(${quoteIdentifier(column.references.column, dialect)})`)
      }

      return `  ${pieces.join(' ')}`
    })

    if (primaryKeys.length > 1) {
      lines.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`)
    }

    return `CREATE TABLE ${tableName} (\n${lines.join(',\n')}\n);`
  }).join('\n\n')
}

export function serializeAllDialects(nodes: Node[]) {
  return {
    postgresql: serializeSchema(nodes, 'postgresql'),
    mysql: serializeSchema(nodes, 'mysql'),
    sqlserver: serializeSchema(nodes, 'sqlserver'),
    json: serializeSchema(nodes, 'json'),
    mongodb: serializeSchema(nodes, 'mongodb'),
    neo4j: serializeSchema(nodes, 'neo4j'),
  }
}

export function getSchemaStats(nodes: Node[], edges: Edge[]) {
  const tables = nodes.filter(isEditorNode)
  const warnings = tables.reduce((count, table) => {
    if (table.data.columns.length === 0) return count + 1
    if (!table.data.columns.some((column) => column.isPrimaryKey)) return count + 1
    return count
  }, 0)

  return {
    tables: tables.length,
    relations: edges.length,
    warnings,
  }
}
