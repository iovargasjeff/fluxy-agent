import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import {
  makeRelationshipEdge,
  makeTableNode,
  serializeSchema,
  type EditorColumn,
  type EditorDialect,
  type EditorNode,
  type RelationshipCardinality,
} from '@/lib/editor-schema'

const SQL_PLACEHOLDER = `-- FluxSQL Editor
-- Escribe tu DDL aquí

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL
);
`

interface EditorStore {
  nodes: Node[]
  edges: Edge[]
  selectedNodeId: string | null
  hoveredNodeId: string | null
  dialect: EditorDialect
  syncPaused: boolean
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void
  setSelectedNodeId: (nodeId: string | null) => void
  setHoveredNodeId: (nodeId: string | null) => void
  setDialect: (dialect: EditorDialect) => void
  setSyncPaused: (paused: boolean) => void
  addTable: () => void
  updateTable: (nodeId: string, data: Partial<EditorNode['data']>) => void
  deleteTable: (nodeId: string) => void
  addColumn: (nodeId: string) => void
  updateColumn: (nodeId: string, columnIndex: number, column: Partial<EditorColumn>) => void
  deleteColumn: (nodeId: string, columnIndex: number) => void
  addRelationship: (sourceId: string, sourceColumn: string, targetId: string, targetColumn: string, cardinality?: RelationshipCardinality) => void
  syncSqlFromCanvas: () => void
  sqlValue: string
  setSqlValue: (value: string) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  dialect: 'postgresql',
  syncPaused: false,
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  setNodesAndEdges: (nodes, edges) => set({ nodes, edges }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setHoveredNodeId: (hoveredNodeId) => set({ hoveredNodeId }),
  setDialect: (dialect) => set((state) => ({ dialect, sqlValue: serializeSchema(state.nodes, dialect, state.edges) || state.sqlValue, syncPaused: true })),
  setSyncPaused: (syncPaused) => set({ syncPaused }),
  addTable: () =>
    set((state) => {
      const node = makeTableNode(state.nodes.length + 1)
      return {
        nodes: [...state.nodes, node],
        selectedNodeId: node.id,
        sqlValue: serializeSchema([...state.nodes, node], state.dialect, state.edges),
      }
    }),
  updateTable: (nodeId, data) =>
    set((state) => {
      const nodes = state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
      return { nodes, sqlValue: serializeSchema(nodes, state.dialect, state.edges) }
    }),
  deleteTable: (nodeId) =>
    set((state) => {
      const nodes = state.nodes.filter((node) => node.id !== nodeId)
      const edges = state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      return {
        nodes,
        edges,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        sqlValue: serializeSchema(nodes, state.dialect, edges),
      }
    }),
  addColumn: (nodeId) =>
    set((state) => {
      const nodes = state.nodes.map((node) => {
        if (node.id !== nodeId) return node
        const columns = Array.isArray(node.data.columns) ? node.data.columns : []
        return {
          ...node,
          data: {
            ...node.data,
            columns: [
              ...columns,
              {
                name: `campo_${columns.length + 1}`,
                type: 'VARCHAR(100)',
                nullable: true,
              },
            ],
          },
        }
      })
      return { nodes, sqlValue: serializeSchema(nodes, state.dialect, state.edges) }
    }),
  updateColumn: (nodeId, columnIndex, column) =>
    set((state) => {
      const nodes = state.nodes.map((node) => {
        if (node.id !== nodeId) return node
        const columns = Array.isArray(node.data.columns) ? [...node.data.columns] : []
        columns[columnIndex] = { ...columns[columnIndex], ...column }
        return { ...node, data: { ...node.data, columns } }
      })
      return { nodes, sqlValue: serializeSchema(nodes, state.dialect, state.edges) }
    }),
  deleteColumn: (nodeId, columnIndex) =>
    set((state) => {
      const targetNode = state.nodes.find((node) => node.id === nodeId)
      const targetColumn = Array.isArray(targetNode?.data.columns) ? targetNode.data.columns[columnIndex]?.name : undefined
      const nodes = state.nodes.map((node) => {
        if (node.id !== nodeId) return node
        const columns = Array.isArray(node.data.columns) ? node.data.columns.filter((_, index) => index !== columnIndex) : []
        return { ...node, data: { ...node.data, columns } }
      })
      const edges = targetColumn
        ? state.edges.filter((edge) => edge.sourceHandle !== `${targetColumn}-source` && edge.targetHandle !== `${targetColumn}-target`)
        : state.edges
      return { nodes, edges, sqlValue: serializeSchema(nodes, state.dialect, edges) }
    }),
  addRelationship: (sourceId, sourceColumn, targetId, targetColumn, cardinality = 'many-to-one') =>
    set((state) => {
      const source = state.nodes.find((node): node is EditorNode => node.id === sourceId && node.type === 'tableNode') 
      const target = state.nodes.find((node): node is EditorNode => node.id === targetId && node.type === 'tableNode')
      const sourceCol = source?.data.columns.find((column) => column.name === sourceColumn)
      const targetCol = target?.data.columns.find((column) => column.name === targetColumn)
      if (!source || !target || !sourceCol || !targetCol) return state

      const nodes = state.nodes.map((node) => {
        if (node.id !== sourceId) return node
        const columns = Array.isArray(node.data.columns) ? node.data.columns : []
        return {
          ...node,
          data: {
            ...node.data,
            columns: columns.map((column) =>
              column.name === sourceColumn
                ? { ...column, isForeignKey: true, references: { table: target.data.tableName, column: targetColumn } }
                : column
            ),
          },
        }
      })
      const edge = makeRelationshipEdge(source, { ...sourceCol, isForeignKey: true }, target, targetCol, cardinality)
      const edges = [...state.edges.filter((item) => item.id !== edge.id), edge]
      return { nodes, edges, sqlValue: serializeSchema(nodes, state.dialect, edges) }
    }),
  syncSqlFromCanvas: () => set((state) => ({ sqlValue: serializeSchema(state.nodes, state.dialect, state.edges) })),
  sqlValue: SQL_PLACEHOLDER,
  setSqlValue: (value) => set({ sqlValue: value }),
}))

/**
 * Stamps a parser-generated FlowEdge with the markerEnd arrow config.
 * Call this when converting ParseResult.edges → React Flow edges.
 */
export function toReactFlowEdge(edge: Edge): Edge {
  return {
    ...edge,
    type: 'relationship',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#00D4FF',
    },
  }
}
