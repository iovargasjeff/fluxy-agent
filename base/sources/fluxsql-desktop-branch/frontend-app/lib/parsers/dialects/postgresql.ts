import { ParseResult, Column } from '../types'
import { calculateLayout } from '../utils/layout'

export function parsePostgreSQL(ddl: string): ParseResult {
  const result: ParseResult = {
    nodes: [],
    edges: [],
    errors: []
  }

  try {
    // 1. Normalizar: eliminar comentarios (-- y /* */) y colapsar espacios extra
    let normalized = ddl.replace(/--.*$/gm, '') // single-line comments
    normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '') // multi-line comments
    
    // 2. Extraer bloques CREATE TABLE
    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["']?(\w+)["']?\s*\(([\s\S]*?)\);/gi
    let match
    
    const rawTables: Array<{ tableName: string; body: string }> = []
    
    while ((match = tableRegex.exec(normalized)) !== null) {
      const tableName = match[1].trim()
      const body = match[2].trim()
      rawTables.push({ tableName, body })
    }

    const positions = calculateLayout(rawTables.length)

    rawTables.forEach(({ tableName, body }, index) => {
      const id = tableName.toLowerCase()
      const columns: Column[] = []

      // Split body by commas that are not inside parentheses
      const parts = body.split(/,(?![^\(]*\))/)
      
      let tableLevelPkFound = false
      let pkColumns: string[] = []

      // Identify table level PRIMARY KEY constraint first
      for (const part of parts) {
        const p = part.trim()
        const pkMatch = p.match(/PRIMARY\s+KEY\s*\(\s*([^)]+)\s*\)/i)
        if (pkMatch) {
          tableLevelPkFound = true
          pkColumns = pkMatch[1].split(',').map(c => c.trim().replace(/['"]/g, ''))
        }
      }

      for (const part of parts) {
        const p = part.trim()
        if (!p) continue

        // Skip constraints definitions since we either handle them separately or they are table-level
        if (/^(?:CONSTRAINT|PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)/i.test(p)) {
          continue
        }

        // Parse column
        // e.g., id UUID PRIMARY KEY DEFAULT ...
        // owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
        const columnRegex = /^["']?(\w+)["']?\s+([\w\(\)]+)/i
        const colMatch = p.match(columnRegex)
        
        if (colMatch) {
          const colName = colMatch[1]
          const colType = colMatch[2].toUpperCase()
          
          let isPrimaryKey = false
          if (tableLevelPkFound && pkColumns.includes(colName)) {
            isPrimaryKey = true
          } else if (/PRIMARY\s+KEY/i.test(p)) {
            isPrimaryKey = true
          }

          let isForeignKey = false
          let references: { table: string; column: string } | undefined = undefined

          const refMatch = p.match(/REFERENCES\s+["']?(\w+)["']?\s*\(["']?(\w+)["']?\)/i)
          if (refMatch) {
            isForeignKey = true
            const refTable = refMatch[1]
            const refCol = refMatch[2]
            references = { table: refTable, column: refCol }

            // Create edge immediately
            result.edges.push({
              id: `fk-${id}-${refTable.toLowerCase()}`,
              source: id,
              target: refTable.toLowerCase(),
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#00D4FF' }
            })
          }

          columns.push({
            name: colName,
            type: colType,
            isPrimaryKey,
            isForeignKey,
            references
          })
        }
      }

      result.nodes.push({
        id,
        type: 'tableNode',
        position: positions[index] || { x: 0, y: 0 },
        data: {
          tableName,
          columns
        }
      })
    })

    return result
  } catch (error) {
    result.errors.push({
      message: error instanceof Error ? error.message : 'Error desconocido al parsear PostgreSQL'
    })
    return result
  }
}
