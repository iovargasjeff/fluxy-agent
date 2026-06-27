import { ParseResult, Column } from '../types'
import { calculateLayout } from '../utils/layout'

export function parseMySQL(ddl: string): ParseResult {
  const result: ParseResult = { nodes: [], edges: [], errors: [] }

  try {
    let normalized = ddl.replace(/--.*$/gm, '')
    normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '')
    normalized = normalized.replace(/`([^`]+)`/g, '$1') // Normalize backticks

    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\)(?:\s+ENGINE[\s\S]*?)?;/gi
    let match

    const rawTables: Array<{ tableName: string; body: string }> = []
    
    while ((match = tableRegex.exec(normalized)) !== null) {
      rawTables.push({ tableName: match[1].trim(), body: match[2].trim() })
    }

    const positions = calculateLayout(rawTables.length)

    rawTables.forEach(({ tableName, body }, index) => {
      const id = tableName.toLowerCase()
      const columns: Column[] = []

      const parts = body.split(/,(?![^\(]*\))/)
      
      const pkColumns: string[] = []
      for (const part of parts) {
        const p = part.trim()
        const pkMatch = p.match(/PRIMARY\s+KEY\s*\(\s*([^)]+)\s*\)/i)
        if (pkMatch) {
          pkColumns.push(...pkMatch[1].split(',').map(c => c.trim()))
        }
      }

      for (const part of parts) {
        const p = part.trim()
        if (!p) continue

        if (/^PRIMARY\s+KEY/i.test(p) || /^UNIQUE/i.test(p) || /^CHECK/i.test(p) || /^KEY/i.test(p) || /^INDEX/i.test(p)) {
          continue
        }

        const fkMatch = p.match(/CONSTRAINT\s+\w+\s+FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES\s+(\w+)\s*\(\s*(\w+)\s*\)/i)
        if (fkMatch) {
          const colName = fkMatch[1]
          const refTable = fkMatch[2]
          const refCol = fkMatch[3]
          
          const col = columns.find(c => c.name === colName)
          if (col) {
            col.isForeignKey = true
            col.references = { table: refTable, column: refCol }
          }
          
          result.edges.push({
            id: `fk-${id}-${refTable.toLowerCase()}`,
            source: id,
            target: refTable.toLowerCase(),
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#00D4FF' }
          })
          continue
        }
        
        const columnRegex = /^(\w+)\s+([A-Za-z]+(?:\s*\([^)]+\))?)(.*)/i
        const colMatch = p.match(columnRegex)
        
        if (colMatch && !/^CONSTRAINT/i.test(p)) {
          const colName = colMatch[1]
          const colType = colMatch[2].toUpperCase().replace(/\s+/g, '')
          const rest = colMatch[3] || ''
          
          const isPrimaryKey = pkColumns.includes(colName) || /PRIMARY\s+KEY/i.test(rest)
          const isAutoIncrement = /AUTO_INCREMENT/i.test(rest)

          let isForeignKey = false
          let references: { table: string; column: string } | undefined = undefined

          const inlineRefMatch = rest.match(/REFERENCES\s+(\w+)\s*\(\s*(\w+)\s*\)/i)
          if (inlineRefMatch) {
            isForeignKey = true
            const refTable = inlineRefMatch[1]
            const refCol = inlineRefMatch[2]
            references = { table: refTable, column: refCol }

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
            references,
            ...(isAutoIncrement ? { isAutoIncrement: true } : {})
          })
        }
      }

      columns.forEach(col => {
        if (pkColumns.includes(col.name)) {
          col.isPrimaryKey = true
        }
      })

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
      message: error instanceof Error ? error.message : 'Error desconocido al parsear MySQL'
    })
    return result
  }
}
