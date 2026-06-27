import { ParseResult, Column } from '../types'
import { calculateLayout } from '../utils/layout'

export function parseMongoDB(code: string): ParseResult {
  const result: ParseResult = {
    nodes: [],
    edges: [],
    errors: []
  }

  try {
    let normalized = code.replace(/\/\/.*$/gm, '')
    normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '')

    // Find Schema definitions (Mongoose style)
    const schemaRegex = /(?:const|let|var)\s+(\w+)Schema\s*=\s*new\s+(?:mongoose\.)?Schema\s*\(/gi
    
    // Find Native MongoDB insertions: db.collection.insertMany(...)
    const dbRegex = /db\.(\w+)\.insert(?:Many|One)\s*\(/gi

    let match
    const rawSchemas: Array<{ name: string; body: string }> = []
    
    // Parse Mongoose schemas
    while ((match = schemaRegex.exec(normalized)) !== null) {
      let name = match[1].trim()
      if (name.toLowerCase().endsWith('schema')) {
        name = name.substring(0, name.length - 6)
      }
      
      const startIndex = normalized.indexOf('{', match.index)
      if (startIndex === -1) continue

      const endIndex = findClosingBracket(normalized, startIndex, '{', '}')
      if (endIndex !== -1) {
        rawSchemas.push({ name, body: normalized.substring(startIndex, endIndex + 1) })
      }
    }

    // Parse Native MongoDB scripts
    while ((match = dbRegex.exec(normalized)) !== null) {
      const name = match[1].trim()
      
      // We look for the first object '{' inside the insert(...) argument
      const startIndex = normalized.indexOf('{', match.index)
      if (startIndex === -1) continue

      const endIndex = findClosingBracket(normalized, startIndex, '{', '}')
      if (endIndex !== -1) {
        rawSchemas.push({ name, body: normalized.substring(startIndex, endIndex + 1) })
      }
    }

    // Helper to find closing bracket
    function findClosingBracket(text: string, startIndex: number, openBracket: string, closeBracket: string): number {
      let depth = 0
      let inString = false
      let quoteChar = ''

      for (let i = startIndex; i < text.length; i++) {
        const char = text[i]
        if (!inString) {
          if (char === '"' || char === "'") {
            inString = true; quoteChar = char
          } else if (char === openBracket) {
            depth++
          } else if (char === closeBracket) {
            depth--
            if (depth === 0) return i
          }
        } else {
          if (char === quoteChar && text[i-1] !== '\\') inString = false
        }
      }
      return -1
    }

    const positions = calculateLayout(rawSchemas.length)

    // A simple heuristic parser for object bodies
    function parseFields(bodyStr: string, parentId: string, prefix = ''): Column[] {
      const cols: Column[] = []
      
      // Clean up bodyStr: remove outer braces
      let inner = bodyStr.trim()
      if (inner.startsWith('{') && inner.endsWith('}')) {
        inner = inner.substring(1, inner.length - 1).trim()
      }

      // Split by comma, but respect brackets and braces
      const items: string[] = []
      let current = ''
      let depth = 0
      let inString = false
      let quoteChar = ''

      for (let i = 0; i < inner.length; i++) {
        const char = inner[i]
        if (!inString) {
          if (char === '"' || char === "'") {
            inString = true; quoteChar = char; current += char
          } else if (char === '{' || char === '[') {
            depth++; current += char
          } else if (char === '}' || char === ']') {
            depth--; current += char
          } else if (char === ',' && depth === 0) {
            if (current.trim()) items.push(current.trim())
            current = ''
          } else {
            current += char
          }
        } else {
          if (char === quoteChar && inner[i-1] !== '\\') inString = false
          current += char
        }
      }
      if (current.trim()) items.push(current.trim())

      for (const item of items) {
        const colonIdx = item.indexOf(':')
        if (colonIdx === -1) continue

        let fieldName = item.substring(0, colonIdx).trim()
        // Remove quotes if present
        fieldName = fieldName.replace(/^['"]|['"]$/g, '')

        let fieldConfig = item.substring(colonIdx + 1).trim()

        let isArray = false
        if (fieldConfig.startsWith('[') && fieldConfig.endsWith(']')) {
          isArray = true
          fieldConfig = fieldConfig.substring(1, fieldConfig.length - 1).trim()
        }

        let colType = 'String'
        let isForeignKey = false
        let references: { table: string; column: string } | undefined = undefined
        let subFields: Column[] | undefined = undefined

        if (fieldConfig.startsWith('{') && fieldConfig.endsWith('}')) {
          // Check if it's a Mongoose config object (has 'type' or 'ref') OR a nested document
          const isMongooseConfig = /type\s*:|ref\s*:/.test(fieldConfig)
          
          if (isMongooseConfig) {
            const typeMatch = fieldConfig.match(/type\s*:\s*([\w.[\]]+)/i)
            if (typeMatch) {
              colType = typeMatch[1].replace('Schema.Types.', '').replace('mongoose.Schema.Types.', '')
            } else if (isArray) {
               colType = 'ObjectId' // implicit for ref arrays
            }

            const refMatch = fieldConfig.match(/ref\s*:\s*['"](\w+)['"]/i)
            if (refMatch) {
              isForeignKey = true
              const refTable = refMatch[1]
              references = { table: refTable, column: '_id' }

              result.edges.push({
                id: `rel-${parentId}-${prefix}${fieldName}-${refTable.toLowerCase()}-_id`,
                source: parentId,
                sourceHandle: `${prefix}${fieldName}-source`,
                target: refTable.toLowerCase(),
                targetHandle: `_id-target`,
                type: 'relationship',
                animated: false,
                style: { stroke: '#10B981', strokeWidth: 1.5 }
              })
            }
          } else {
            // It's a nested subdocument
            colType = 'Object'
            subFields = parseFields(fieldConfig, parentId, `${prefix}${fieldName}.`)
          }
        } else {
          // Shorthand syntax: field: String
          colType = fieldConfig.replace('Schema.Types.', '').replace('mongoose.Schema.Types.', '')
        }

        cols.push({
          name: fieldName,
          type: colType,
          isPrimaryKey: fieldName === '_id',
          isForeignKey,
          references,
          isArray,
          subFields
        })
      }

      return cols
    }

    rawSchemas.forEach(({ name, body }, index) => {
      const id = name.toLowerCase()
      const columns = parseFields(body, id)

      const existingNode = result.nodes.find(n => n.id === id)
      if (existingNode) {
        // Merge new columns into existing node
        const existingCols = existingNode.data.columns as Column[]
        for (const col of columns) {
          if (!existingCols.some(c => c.name === col.name)) {
            existingCols.push(col)
          }
        }
      } else {
        // Add implicit _id if not exists at root
        if (!columns.some(c => c.name === '_id')) {
          columns.unshift({
            name: '_id',
            type: 'ObjectId',
            isPrimaryKey: true,
            isForeignKey: false
          })
        }

        result.nodes.push({
          id,
          type: 'mongoNode',
          position: positions[index] || { x: 0, y: 0 },
          data: {
            tableName: name,
            columns
          }
        })
      }
    })

    // Flatten nested objects into separate nodes
    const flattenNodes = (cols: Column[], parentId: string) => {
      for (const col of cols) {
        if (col.subFields && col.subFields.length > 0) {
          const subNodeId = `${parentId}_${col.name}`
          
          result.nodes.push({
            id: subNodeId,
            type: 'mongoNode',
            position: { x: 0, y: 0 }, // Will be laid out later
            data: {
              tableName: col.name,
              columns: col.subFields,
              isSubDocument: true,
              isArray: col.isArray
            }
          })

          result.edges.push({
            id: `edge-subdoc-${parentId}-${col.name}-${subNodeId}`,
            source: parentId,
            sourceHandle: `${col.name}-source`,
            target: subNodeId,
            targetHandle: `header-target`,
            type: 'smoothstep',
            animated: false,
            label: col.isArray ? 'Arr' : 'Obj',
            style: { stroke: '#64748B', strokeWidth: 1.5 }
          })

          // Recursively flatten children
          flattenNodes(col.subFields, subNodeId)
          
          // Remove subFields from parent so it doesn't render recursively
          col.subFields = undefined
        }
      }
    }

    result.nodes.forEach(node => {
      flattenNodes(node.data.columns as Column[], node.id)
    })

    // Recalculate layout for ALL nodes including subdocuments
    const allPositions = calculateLayout(result.nodes.length)
    result.nodes.forEach((n, i) => {
      if (n.position.x === 0 && n.position.y === 0) {
        n.position = allPositions[i] || { x: 0, y: 0 }
      }
    })

    return result
  } catch (error) {
    result.errors.push({
      message: error instanceof Error ? error.message : 'Error al parsear MongoDB'
    })
    return result
  }
}
