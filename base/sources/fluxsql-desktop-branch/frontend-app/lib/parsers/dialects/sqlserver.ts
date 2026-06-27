import { ParseResult, Column } from '../types'
import { calculateLayout } from '../utils/layout'

function removeSqlServerBrackets(str: string): string {
  return str.replace(/\[([^\]]+)\]/g, '$1')
}

function removeSchemaPrefix(name: string): string {
  return name.includes('.') ? name.split('.').pop()! : name
}

export function parseSQLServer(ddl: string): ParseResult {
  const result: ParseResult = { nodes: [], edges: [], errors: [] }

  try {
    let normalized = ddl.replace(/--.*$/gm, '')
    normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '')
    normalized = removeSqlServerBrackets(normalized)

    const tableRegex = /CREATE\s+TABLE\s+([\w\.]+)\s*\(([\s\S]*?)\)(?:;|$)/gi
    let match

    const rawTables: Array<{ tableName: string; body: string }> = []
    
    while ((match = tableRegex.exec(normalized)) !== null) {
      rawTables.push({ tableName: removeSchemaPrefix(match[1].trim()), body: match[2].trim() })
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

        if (/^CONSTRAINT/i.test(p) && !/FOREIGN\s+KEY/i.test(p)) {
           if (/PRIMARY\s+KEY/i.test(p)) {
              const pkMatch = p.match(/PRIMARY\s+KEY\s*\(\s*([^)]+)\s*\)/i)
              if (pkMatch) {
                pkColumns.push(...pkMatch[1].split(',').map(c => c.trim()))
              }
           }
           continue
        }
        
        if (/^PRIMARY\s+KEY/i.test(p) || /^UNIQUE/i.test(p) || /^CHECK/i.test(p)) {
          continue
        }

        const columnRegex = /^(\w+)\s+([A-Za-z]+(?:\s*\([^)]+\))?)(.*)/i
        const colMatch = p.match(columnRegex)
        
        if (colMatch && !/^(CONSTRAINT|FOREIGN)/i.test(p)) {
          const colName = colMatch[1]
          const colType = colMatch[2].toUpperCase().replace(/\s+/g, '')
          const rest = colMatch[3] || ''
          
          const isPrimaryKey = pkColumns.includes(colName) || /PRIMARY\s+KEY/i.test(rest)
          const isIdentity = /IDENTITY\s*\(\s*\d+\s*,\s*\d+\s*\)/i.test(rest)

          let isForeignKey = false
          let references: { table: string; column: string } | undefined = undefined

          const inlineRefMatch = rest.match(/REFERENCES\s+([\w\.]+)\s*\(\s*(\w+)\s*\)/i)
          if (inlineRefMatch) {
            isForeignKey = true
            const refTable = removeSchemaPrefix(inlineRefMatch[1])
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
            ...(isIdentity ? { isIdentity: true } : {})
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

    const alterRegex = /ALTER\s+TABLE\s+([\w\.]+)\s+(?:ADD\s+CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES\s+([\w\.]+)\s*\(\s*(\w+)\s*\)/gi
    let alterMatch

    while ((alterMatch = alterRegex.exec(normalized)) !== null) {
      const sourceTable = removeSchemaPrefix(alterMatch[1].trim()).toLowerCase()
      const sourceCol = alterMatch[2].trim()
      const targetTable = removeSchemaPrefix(alterMatch[3].trim()).toLowerCase()
      const targetCol = alterMatch[4].trim()

      const sourceNode = result.nodes.find(n => n.id === sourceTable)
      if (sourceNode) {
        const column = sourceNode.data.columns.find(c => c.name === sourceCol)
        if (column) {
          column.isForeignKey = true
          column.references = { table: targetTable, column: targetCol }
        }
      }

      result.edges.push({
        id: `fk-${sourceTable}-${targetTable}`,
        source: sourceTable,
        target: targetTable,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#00D4FF' }
      })
    }

    return result
  } catch (error) {
    result.errors.push({
      message: error instanceof Error ? error.message : 'Error desconocido al parsear SQL Server'
    })
    return result
  }
}
