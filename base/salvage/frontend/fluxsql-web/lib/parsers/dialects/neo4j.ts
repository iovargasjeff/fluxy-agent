import { ParseResult, Column } from '../types'
import { MarkerType } from '@xyflow/react'
import { applyForceLayout } from '../utils/forceLayout'

// Updated Palette: Blue/Slate tones instead of rainbow
const NEO4J_LABEL_PALETTE = [
  '#3B82F6', // Blue 500
  '#0EA5E9', // Sky 500
  '#06B6D4', // Cyan 500
  '#6366F1', // Indigo 500
  '#60A5FA', // Blue 400
  '#38BDF8', // Sky 400
  '#22D3EE', // Cyan 400
  '#818CF8', // Indigo 400
]

function getLabelColor(label: string): string {
  let hash = 0
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash)
  }
  return NEO4J_LABEL_PALETTE[Math.abs(hash) % NEO4J_LABEL_PALETTE.length]
}

export function parseNeo4j(code: string): ParseResult {
  const result: ParseResult = {
    nodes: [],
    edges: [],
    errors: []
  }

  try {
    let normalized = code.replace(/\/\/.*$/gm, '')
    normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '')

    // ────────────────────────────────────────────────────────
    // PASO 1: Extraer nodos (instancias individuales)
    // Patrón: (varName:Label {props}) o (:Label {props})
    // ────────────────────────────────────────────────────────
    const nodeRegex = /\(\s*(\w*)\s*:\s*(\w+)\s*(?:\{([\s\S]*?)\})?\s*\)/gi
    let match
    let nodeCounter = 0
    const nodeVarMap = new Map<string, string>() // varName -> internal id

    while ((match = nodeRegex.exec(normalized)) !== null) {
      const rawVar = match[1].trim()
      const label = match[2].trim()
      const propsStr = match[3] ? match[3].trim() : ''
      
      const nodeId = rawVar || `node_${++nodeCounter}`
      if (rawVar) {
        nodeVarMap.set(rawVar, nodeId)
      }

      // Evitar procesar el mismo nodo dos veces si se menciona en un MATCH y luego en otra parte
      if (result.nodes.some(n => n.id === nodeId)) {
        continue
      }

      // Extraer propiedades y sus valores
      const columns: Column[] = []
      const properties: Record<string, string> = {}
      
      if (propsStr) {
        const propRegex = /([\w_]+)\s*:\s*(['"][^'"]*['"]|\d[\d.]*|true|false|[\w.]+)/g
        let propMatch
        while ((propMatch = propRegex.exec(propsStr)) !== null) {
          const propName = propMatch[1].trim()
          let val = propMatch[2].trim()
          
          properties[propName] = val

          let propType = 'String'
          if (val.startsWith('"') || val.startsWith("'")) {
            propType = 'String'
            val = val.substring(1, val.length - 1) // clean quotes
            properties[propName] = val
          } else if (!isNaN(Number(val))) {
            propType = 'Number'
          } else if (val === 'true' || val === 'false') {
            propType = 'Boolean'
          }

          columns.push({
            name: propName,
            type: propType,
            isPrimaryKey: propName === 'id' || propName === '_id',
            isForeignKey: false,
          })
        }
      }

      // Asegurar que haya un campo _id implícito si no existe id
      if (!columns.some(c => c.name === 'id' || c.name === '_id')) {
        columns.unshift({
          name: '_id',
          type: 'ID',
          isPrimaryKey: true,
          isForeignKey: false,
        })
      }

      // Determinar el displayValue (nombre representativo para mostrar en el círculo)
      // Prioridad: nombre, name, titulo, title, id, o el primer string, o el label
      const lowerProps = Object.keys(properties).map(k => k.toLowerCase())
      let displayValue = ''
      
      const priorityKeys = ['nombre', 'name', 'titulo', 'title', 'alias', 'id']
      for (const pk of priorityKeys) {
        const exactKey = Object.keys(properties).find(k => k.toLowerCase() === pk)
        if (exactKey) {
          displayValue = properties[exactKey]
          break
        }
      }
      
      if (!displayValue) {
        // Fallback al primer valor si no hay keys prioritarias, si no hay, usar Label
        displayValue = Object.values(properties)[0] ?? label
      }
      
      // Limitar la longitud del texto
      if (displayValue.length > 15) {
        displayValue = displayValue.substring(0, 12) + '...'
      }

      result.nodes.push({
        id: nodeId,
        type: 'neo4jNode',
        position: { x: 0, y: 0 }, // Se calculará después o por ReactFlow
        data: {
          tableName: label, // Mantenemos tableName como el Label (ej. Usuario) para que sirva al Legend
          displayValue: displayValue, // El texto real que se mostrará (ej. Elena)
          columns: columns,
          color: getLabelColor(label),
        },
      })
    }

    // Calcular un layout orgánico inicial
    const posMap = applyForceLayout(
      result.nodes.map(n => ({ id: n.id, position: { x: 0, y: 0 } })),
      result.edges.map(e => ({ source: e.source, target: e.target })),
      780, 560
    )
    result.nodes.forEach((n) => {
      n.position = posMap.get(n.id) ?? { x: 0, y: 0 }
    })

    // ────────────────────────────────────────────────────────
    // PASO 2: Extraer relaciones (instancias de aristas)
    // Soporta: (var1)-[:REL]->(var2) o variaciones sin dirección
    // ────────────────────────────────────────────────────────
    const relRegex = /\(\s*(\w+)(?:\s*:[^)]+)?\s*\)\s*-\s*\[\s*:(\w+)[^\]]*\]\s*->\s*\(\s*(\w+)(?:\s*:[^)]+)?\s*\)/gi
    let relMatch
    let edgeCounter = 0

    while ((relMatch = relRegex.exec(normalized)) !== null) {
      edgeCounter++
      const sourceVar = relMatch[1].trim()
      const relType = relMatch[2].trim()
      const targetVar = relMatch[3].trim()

      const sourceId = nodeVarMap.get(sourceVar) ?? sourceVar
      const targetId = nodeVarMap.get(targetVar) ?? targetVar

      // Solo crear arista si ambos nodos existen en el canvas
      const sourceExists = result.nodes.some(n => n.id === sourceId)
      const targetExists = result.nodes.some(n => n.id === targetId)

      if (!sourceExists || !targetExists) continue

      const edgeId = `rel-${sourceId}-${targetId}-${relType}-${edgeCounter}`

      result.edges.push({
        id: edgeId,
        source: sourceId,
        sourceHandle: 'center-source',
        target: targetId,
        targetHandle: 'center-target',
        type: 'neo4jEdge',
        animated: false,
        label: relType,
        data: { relType },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: '#555',
        },
      })
    }

    return result
  } catch (error) {
    result.errors.push({
      message: error instanceof Error ? error.message : 'Error al parsear Neo4j',
    })
    return result
  }
}
