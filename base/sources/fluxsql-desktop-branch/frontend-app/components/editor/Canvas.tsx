'use client'

import { useMemo, useState } from 'react'
import { ReactFlow, Background, MiniMap, useReactFlow, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '@/store/useEditorStore'
import { TableNode } from './nodes/TableNode'
import { RelationshipEdge } from './edges/RelationshipEdge'
import { GitBranch, Grid3X3, Maximize2, Rows3, Save, GitCommit } from 'lucide-react'
import { CommitModal } from './CommitModal'

// CRITICAL: nodeTypes and edgeTypes MUST be defined outside the component
const nodeTypes = {
  tableNode: TableNode,
}

const edgeTypes = {
  relationship: RelationshipEdge,
}

interface CanvasProps {
  projectId: string
  emitNodeMove?: (nodeId: string, position: { x: number, y: number }) => void
  onSave?: () => void
}

export function Canvas({ projectId, emitNodeMove, onSave }: CanvasProps) {
  const { fitView } = useReactFlow()
  const [showGrid, setShowGrid] = useState(true)
  const { nodes, edges, hoveredNodeId, onNodesChange, onEdgesChange, setNodesAndEdges, setSelectedNodeId, setHoveredNodeId } = useEditorStore()

  const visibleEdges = useMemo(() => {
    if (!hoveredNodeId) return edges
    return edges.map((edge) => {
      const active = edge.source === hoveredNodeId || edge.target === hoveredNodeId
      return {
        ...edge,
        animated: active,
        style: {
          ...edge.style,
          stroke: active ? '#60A5FA' : '#1E3A5F',
          strokeWidth: active ? 3 : 1,
          opacity: active ? 1 : 0.25,
        },
      }
    })
  }, [edges, hoveredNodeId])

  return (
    <div className={`relative isolate h-full min-h-0 w-full overflow-hidden bg-[#07101F] ${showGrid ? '[background-image:radial-gradient(#1E3A5F_1px,transparent_1px)] [background-size:24px_24px]' : ''}`}>
      <ReactFlow
        nodes={nodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        onPaneClick={() => setSelectedNodeId(null)}
        onNodeDragStop={(_, node) => emitNodeMove?.(node.id, node.position)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        {showGrid && <Background color="#1E2A45" gap={20} size={1} />}
        <MiniMap
          pannable
          zoomable
          className="!bottom-5 !right-5 !h-28 !w-40 overflow-hidden !rounded-xl !border !border-[#1E2A45] !bg-[#0D1424]"
          nodeColor="#1A6CF6"
          maskColor="rgba(7,16,31,0.72)"
        />
      </ReactFlow>
      <div className="pointer-events-auto absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 overflow-hidden rounded-xl border border-[#1E2A45] bg-[#0D1424]/95 shadow-2xl shadow-black/40 backdrop-blur">
        <ToolButton icon={Maximize2} label="Ajustar" onClick={() => fitView({ duration: 350, padding: 0.22 })} />
        <ToolButton icon={GitBranch} label="Auto-layout" onClick={() => autoLayout(nodes, setNodesAndEdges, fitView)} active />
        <ToolButton icon={Rows3} label="Alinear" onClick={() => alignRows(nodes, setNodesAndEdges)} />
        <ToolButton icon={Grid3X3} label="Cuadrícula" onClick={() => setShowGrid((value) => !value)} active={showGrid} />
        <CommitModal projectId={projectId}>
          <ToolButton icon={GitCommit} label="Commit" />
        </CommitModal>
        <ToolButton icon={Save} label="Guardar" onClick={() => onSave?.()} />
      </div>
    </div>
  )
}

import { forwardRef } from 'react'

const ToolButton = forwardRef<HTMLButtonElement, { icon: React.ElementType; label: string; onClick?: () => void; active?: boolean }>(
  ({ icon: Icon, label, onClick, active = false, ...props }, ref) => {
    return (
      <button ref={ref} onClick={onClick} {...props} className={`flex min-w-20 flex-col items-center gap-1 border-r border-[#1E2A45] px-3 py-2 text-[11px] last:border-r-0 ${active ? 'text-[#60A5FA]' : 'text-[#94A3B8] hover:text-white'}`}>
        <Icon size={15} />
        {label}
      </button>
    )
  }
)
ToolButton.displayName = 'ToolButton'

function autoLayout(nodes: Node[], setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void, fitView: ReturnType<typeof useReactFlow>['fitView']) {
  const edges = useEditorStore.getState().edges
  const laidOut = layoutByRelationships(nodes, edges)
  setNodesAndEdges(laidOut, edges)
  window.setTimeout(() => fitView({ duration: 350, padding: 0.22 }), 50)
}

function alignRows(nodes: Node[], setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void) {
  const edges = useEditorStore.getState().edges
  setNodesAndEdges(nodes.map((node, index) => ({ ...node, position: { ...node.position, y: 160 + Math.floor(index / 3) * 220 } })), edges)
}

function layoutByRelationships(nodes: Node[], edges: Edge[]) {
  const nodeIds = new Set(nodes.map((node) => node.id))
  const childrenByParent = new Map<string, string[]>()
  const parentByChild = new Map<string, Set<string>>()

  nodes.forEach((node) => {
    childrenByParent.set(node.id, [])
    parentByChild.set(node.id, new Set())
  })

  edges.forEach((edge) => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return
    childrenByParent.get(edge.target)?.push(edge.source)
    parentByChild.get(edge.source)?.add(edge.target)
  })

  const roots = nodes
    .filter((node) => (parentByChild.get(node.id)?.size ?? 0) === 0)
    .sort(compareNodes)
  const queue = roots.length > 0 ? [...roots.map((node) => node.id)] : [nodes[0]?.id].filter(Boolean) as string[]
  const levels = new Map<string, number>()
  queue.forEach((id) => levels.set(id, 0))

  while (queue.length > 0) {
    const parentId = queue.shift()!
    const parentLevel = levels.get(parentId) ?? 0
    const children = [...(childrenByParent.get(parentId) ?? [])]
      .map((id) => nodes.find((node) => node.id === id))
      .filter((node): node is Node => Boolean(node))
      .sort(compareNodes)

    children.forEach((child) => {
      const nextLevel = parentLevel + 1
      const currentLevel = levels.get(child.id)
      if (currentLevel === undefined || nextLevel > currentLevel) {
        levels.set(child.id, nextLevel)
        queue.push(child.id)
      }
    })
  }

  nodes.forEach((node, index) => {
    if (!levels.has(node.id)) levels.set(node.id, Math.floor(index / 3))
  })

  const lanes = new Map<number, Node[]>()
  nodes.forEach((node) => {
    const level = levels.get(node.id) ?? 0
    lanes.set(level, [...(lanes.get(level) ?? []), node])
  })

  lanes.forEach((items) => items.sort(compareNodes))

  const columnGap = 330
  const rowGap = 170
  const startX = 80
  const startY = 120

  return nodes.map((node) => {
    const level = levels.get(node.id) ?? 0
    const lane = lanes.get(level) ?? []
    const row = Math.max(0, lane.findIndex((item) => item.id === node.id))
    const laneOffset = Math.max(0, (3 - lane.length) * 42)

    return {
      ...node,
      position: {
        x: startX + level * columnGap,
        y: startY + row * rowGap + laneOffset,
      },
    }
  })
}

function compareNodes(a: Node, b: Node) {
  const aName = typeof a.data?.tableName === 'string' ? a.data.tableName : a.id
  const bName = typeof b.data?.tableName === 'string' ? b.data.tableName : b.id
  return aName.localeCompare(bName)
}
