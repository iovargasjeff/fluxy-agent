import { ParseResult, FlowNode, FlowEdge, Column } from './types'
import { parsePostgreSQL } from './dialects/postgresql'
import { parseMySQL } from './dialects/mysql'
import { parseSQLServer } from './dialects/sqlserver'
import { calculateLayout } from './utils/layout'

export * from './types'

export function parseSQL(
  ddl: string,
  dialect: 'postgresql' | 'mysql' | 'sqlserver' = 'postgresql'
): ParseResult {
  try {
    if (!ddl || typeof ddl !== 'string' || ddl.trim() === '') {
      return { nodes: [], edges: [], errors: [] }
    }

    if (dialect === 'postgresql') {
      return parsePostgreSQL(ddl)
    } else if (dialect === 'mysql') {
      return parseMySQL(ddl)
    } else if (dialect === 'sqlserver') {
      return parseSQLServer(ddl)
    }

    return {
      nodes: [],
      edges: [],
      errors: [{ message: `Dialecto ${dialect} no implementado` }]
    }
  } catch (err) {
    return {
      nodes: [],
      edges: [],
      errors: [{ message: err instanceof Error ? err.message : 'Error desconocido' }]
    }
  }
}

export function parseJSON(jsonString: string): ParseResult {
  try {
    const parsed = JSON.parse(jsonString)
    if (!parsed || typeof parsed !== 'object') {
      return { nodes: [], edges: [], errors: [{ message: 'El JSON debe ser un objeto' }] }
    }
    return processJsonObject(parsed as Record<string, unknown>)
  } catch (err) {
    return {
      nodes: [],
      edges: [],
      errors: [{ message: err instanceof Error ? err.message : 'JSON inválido' }]
    }
  }
}

function processJsonObject(obj: Record<string, unknown>): ParseResult {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []

  if (!obj || typeof obj !== 'object') return { nodes: [], edges: [], errors: [] }

  const isJsonSchema = obj.$schema !== undefined || obj.properties !== undefined

  if (isJsonSchema) {
    return processJsonSchema(obj)
  }

  const hasStructuredTables = obj.tables && typeof obj.tables === 'object' && !Array.isArray(obj.tables)
  const tableSource = hasStructuredTables ? obj.tables as Record<string, unknown> : obj
  const entries = Object.entries(tableSource).filter(([key]) => key !== 'relations')
  const positions = calculateLayout(entries.length)

  entries.forEach(([collectionName, fields], index) => {
    const columns: Column[] = []

    if (typeof fields === 'object' && fields !== null) {
      Object.entries(fields as Record<string, unknown>).forEach(([fieldName, fieldType]) => {
        let typeStr = 'UNKNOWN'
        let isPrimaryKey = fieldName === '_id' || fieldName === 'id'
        let isForeignKey = false
        let references: Column['references'] = undefined
        if (typeof fieldType === 'string') {
          typeStr = fieldType.toUpperCase()
        } else if (typeof fieldType === 'object' && fieldType !== null) {
          const descriptor = fieldType as { type?: unknown; primaryKey?: unknown; isPrimaryKey?: unknown; references?: unknown }
          typeStr = typeof descriptor.type === 'string' ? descriptor.type.toUpperCase() : 'OBJECT'
          isPrimaryKey = Boolean(descriptor.primaryKey ?? descriptor.isPrimaryKey ?? isPrimaryKey)
          if (descriptor.references && typeof descriptor.references === 'object') {
            const ref = descriptor.references as { table?: unknown; column?: unknown }
            if (typeof ref.table === 'string' && typeof ref.column === 'string') {
              isForeignKey = true
              references = { table: ref.table, column: ref.column }
            }
          }
        } else {
          typeStr = String(typeof fieldType).toUpperCase()
        }

        columns.push({
          name: fieldName,
          type: typeStr,
          isPrimaryKey,
          isForeignKey,
          references,
        })
      })
    }

    nodes.push({
      id: collectionName.toLowerCase(),
      type: 'tableNode',
      position: positions[index] ?? { x: 0, y: 0 },
      data: { tableName: collectionName, columns }
    })
  })

  const tableIdByName = new Map(nodes.map((node) => [node.data.tableName, node.id]))
  const relationItems = Array.isArray(obj.relations) ? obj.relations : []
  relationItems.forEach((item, index) => {
    if (!item || typeof item !== 'object') return
    const relation = item as { source?: unknown; target?: unknown; sourceHandle?: unknown; targetHandle?: unknown; sourceColumn?: unknown; targetColumn?: unknown; sourceCardinality?: unknown; targetCardinality?: unknown; label?: unknown }
    if (typeof relation.source !== 'string' || typeof relation.target !== 'string') return
    const source = tableIdByName.get(relation.source) ?? relation.source
    const target = tableIdByName.get(relation.target) ?? relation.target
    edges.push({
      id: `json-rel-${source}-${target}-${index}`,
      source,
      target,
      sourceHandle: typeof relation.sourceHandle === 'string' ? relation.sourceHandle : (typeof relation.sourceColumn === 'string' ? `${relation.sourceColumn}-source` : undefined),
      targetHandle: typeof relation.targetHandle === 'string' ? relation.targetHandle : (typeof relation.targetColumn === 'string' ? `${relation.targetColumn}-target` : undefined),
      type: 'relationship',
      animated: false,
      style: { stroke: '#00D4FF' },
      data: {
        sourceColumn: relation.sourceColumn,
        targetColumn: relation.targetColumn,
        sourceCardinality: relation.sourceCardinality ?? 'N',
        targetCardinality: relation.targetCardinality ?? '1',
        label: relation.label ?? 'N:1',
      },
    })
  })

  return { nodes, edges, errors: [] }
}

function processJsonSchema(obj: Record<string, unknown>): ParseResult {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []

  const title = typeof obj.title === 'string' ? obj.title : 'Root'
  const properties = (obj.properties && typeof obj.properties === 'object'
    ? obj.properties
    : {}) as Record<string, { type?: unknown }>
  const positions = calculateLayout(1)
  
  const columns: Column[] = []
  Object.entries(properties).forEach(([fieldName, fieldSchema]) => {
    let typeStr = 'UNKNOWN'
    if (fieldSchema && typeof fieldSchema === 'object' && 'type' in fieldSchema) {
      typeStr = String(fieldSchema.type).toUpperCase()
    }

    columns.push({
      name: fieldName,
      type: typeStr,
      isPrimaryKey: fieldName === '_id' || fieldName === 'id',
      isForeignKey: false,
    })
  })

  nodes.push({
    id: title.toLowerCase(),
    type: 'tableNode',
    position: positions[0] ?? { x: 0, y: 0 },
    data: { tableName: title, columns }
  })

  return { nodes, edges, errors: [] }
}

export interface MermaidResult {
  code: string
  isEmpty: boolean
}

type MermaidNode = Pick<FlowNode, 'id' | 'data'>
type MermaidEdge = Pick<FlowEdge, 'source' | 'target'> & { data?: Record<string, unknown> }

export function toMermaid(nodes: MermaidNode[], edges: MermaidEdge[]): MermaidResult {
  if (nodes.length === 0) {
    return { code: 'erDiagram\n', isEmpty: true }
  }

  let code = 'erDiagram\n'

  // Print tables and columns
  nodes.forEach((node) => {
    const tableName = node.data.tableName.replace(/\s+/g, '_')
    code += `  ${tableName} {\n`
    
    node.data.columns.forEach((col) => {
      let suffix = ''
      if (col.isPrimaryKey) suffix = ' PK'
      else if (col.isForeignKey) suffix = ' FK'
      
      // Sanitizamos el tipo y nombre reemplazando espacios
      const colType = col.type.replace(/\s+/g, '_')
      const colName = col.name.replace(/\s+/g, '_')
      code += `    ${colType} ${colName}${suffix}\n`
    })
    
    code += `  }\n`
  })

  // Print relationships
  const uniqueEdges = new Set<string>()
  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source)
    const targetNode = nodes.find((n) => n.id === edge.target)
    
    const sourceTable = (sourceNode?.data.tableName ?? edge.source).replace(/\s+/g, '_')
    const targetTable = (targetNode?.data.tableName ?? edge.target).replace(/\s+/g, '_')
    
    const sourceCardinality = edge.data?.sourceCardinality === '1' ? '||' : '}o'
    const targetCardinality = edge.data?.targetCardinality === 'N' ? 'o{' : '||'
    const label = typeof edge.data?.label === 'string' ? edge.data.label : 'FK'
    const key = `${sourceTable}-${targetTable}-${label}`
    if (!uniqueEdges.has(key)) {
      uniqueEdges.add(key)
      code += `  ${sourceTable} ${sourceCardinality}--${targetCardinality} ${targetTable} : "${label}"\n`
    }
  })

  return { code, isEmpty: false }
}
