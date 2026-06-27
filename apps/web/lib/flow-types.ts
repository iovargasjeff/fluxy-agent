import type { Edge, Node } from '@xyflow/react'

export type FlowJson = {
  nodes?: Node[]
  edges?: Edge[]
  viewport?: {
    x: number
    y: number
    zoom: number
  }
}

export function toFlowJson(value: unknown): FlowJson {
  if (!value || typeof value !== 'object') return {}

  const candidate = value as FlowJson
  const viewport =
    candidate.viewport &&
    typeof candidate.viewport.x === 'number' &&
    typeof candidate.viewport.y === 'number' &&
    typeof candidate.viewport.zoom === 'number'
      ? candidate.viewport
      : undefined

  return {
    nodes: Array.isArray(candidate.nodes) ? candidate.nodes : [],
    edges: Array.isArray(candidate.edges) ? candidate.edges : [],
    viewport,
  }
}
