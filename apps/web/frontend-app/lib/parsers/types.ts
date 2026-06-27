import type { EdgeMarker } from '@xyflow/react'

export interface ParseResult {
  nodes: FlowNode[]
  edges: FlowEdge[]
  errors: ParseError[]
}

export interface FlowNode {
  id: string
  type: 'tableNode' | 'nosqlNode' | 'mongoNode' | 'neo4jNode'
  position: { x: number; y: number }
  data: {
    tableName: string
    columns: Column[]
    isSubDocument?: boolean
    isArray?: boolean
    displayValue?: string
    color?: string
  }
}

export interface Column {
  name: string
  type: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  references?: {
    table: string
    column: string
  }
  isAutoIncrement?: boolean
  isIdentity?: boolean
  isArray?: boolean
  subFields?: Column[]
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type: 'smoothstep' | 'relationship' | 'neo4jEdge'
  animated: boolean
  style?: { stroke: string; strokeWidth?: number }
  label?: string
  markerEnd?: EdgeMarker
  data?: {
    relType?: string
  }
}

export interface ParseError {
  line?: number
  message: string
}
