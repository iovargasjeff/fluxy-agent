export interface ParseResult {
  nodes: FlowNode[]
  edges: FlowEdge[]
  errors: ParseError[]
}

export interface FlowNode {
  id: string
  type: 'tableNode'
  position: { x: number; y: number }
  data: {
    tableName: string
    columns: Column[]
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
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type: 'smoothstep' | 'relationship'
  animated: boolean
  style: { stroke: string }
  data?: Record<string, unknown>
}

export interface ParseError {
  line?: number
  message: string
}
