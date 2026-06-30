'use client'

import { useEffect, useMemo, useState } from 'react'
import { ReactFlow, Background, MiniMap, MarkerType, useReactFlow, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '@/store/useEditorStore'
import { TableNode } from './nodes/TableNode'
import { NoSqlNode } from './nodes/NoSqlNode'
import { MongoNode } from './nodes/MongoNode'
import { Neo4jNode } from './nodes/Neo4jNode'
import { RelationshipEdge } from './edges/RelationshipEdge'
import { Neo4jEdge } from './edges/Neo4jEdge'
import { applyForceLayout } from '@/lib/parsers/utils/forceLayout'
import { calculateCircularLayout } from '@/lib/parsers/utils/layout'
import { Eye, GitBranch, Grid3X3, Maximize2, MoreHorizontal, Rows3, Save } from 'lucide-react'
import { CommitModal } from './CommitModal'
import { useTheme } from 'next-themes'

// CRITICAL: nodeTypes and edgeTypes MUST be defined outside the component
const nodeTypes = {
  tableNode: TableNode,
  nosqlNode: NoSqlNode,
  mongoNode: MongoNode,
  neo4jNode: Neo4jNode,
}

const edgeTypes = {
  relationship: RelationshipEdge,
  neo4jEdge: Neo4jEdge,
}

const DEMO_NODES: Node[] = [
  {
    id: 'users',
    type: 'tableNode',
    position: { x: 80, y: 100 },
    data: {
      tableName: 'users',
      columns: [
        { name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false },
        { name: 'email', type: 'TEXT', isPrimaryKey: false, isForeignKey: false },
        { name: 'name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'TIMESTAMPTZ', isPrimaryKey: false, isForeignKey: false },
      ],
    },
  },
  {
    id: 'projects',
    type: 'tableNode',
    position: { x: 460, y: 100 },
    data: {
      tableName: 'projects',
      columns: [
        { name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false },
        { name: 'name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false },
        { name: 'owner_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true },
        { name: 'created_at', type: 'TIMESTAMPTZ', isPrimaryKey: false, isForeignKey: false },
      ],
    },
  },
]

const DEMO_EDGES: Edge[] = [
  {
    id: 'fk-projects-users',
    source: 'projects',
    sourceHandle: 'owner_id-source',
    target: 'users',
    targetHandle: 'id-target',
    type: 'relationship',
    animated: false,
    style: { stroke: '#00D4FF', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#00D4FF',
    },
  },
]

interface CanvasProps {
  emitNodeMove?: (nodeId: string, position: { x: number; y: number }) => void
  projectId?: string
  onSave?: () => void
}

export function Canvas({ emitNodeMove, projectId, onSave }: CanvasProps) {
  const { fitView } = useReactFlow()
  const { resolvedTheme } = useTheme()
  const [showGrid, setShowGrid] = useState(true)
  const { nodes, edges, hoveredNodeId, dialect, onNodesChange, onEdgesChange, setNodesAndEdges, setSelectedNodeId, setHoveredNodeId, neo4jFilterLabel, neo4jFilterRelationship } = useEditorStore()

  const isNeo4j = dialect === 'neo4j'

  // ── Neo4j Filters ──────────────────────────────────────────
  
  // 1. Filter edges first based on relationship filter
  const filteredEdges = isNeo4j
    ? (neo4jFilterRelationship 
        // If a specific relationship is selected, show only those edges
        ? edges.filter(e => {
            const relType = (e.data as { relType?: string })?.relType ?? e.label
            return relType === neo4jFilterRelationship
          })
        // If asterisk or label is selected, hide ALL edges
        : [])
    : edges

  // 2. Filter nodes based on active filters
  const filteredNodes = useMemo(() => {
    if (!isNeo4j) return nodes

    if (neo4jFilterRelationship) {
      // Show only nodes connected by the filtered edges
      const connectedIds = new Set<string>()
      filteredEdges.forEach(e => {
        connectedIds.add(e.source)
        connectedIds.add(e.target)
      })
      return nodes.filter(n => connectedIds.has(n.id))
    }

    if (neo4jFilterLabel) {
      // Show only nodes of the specific label
      return nodes.filter(n => {
        const label = (n.data as { tableName?: string })?.tableName ?? ''
        return label.toLowerCase() === neo4jFilterLabel.toLowerCase()
      })
    }

    // Asterisk active: show all nodes
    return nodes
  }, [isNeo4j, nodes, filteredEdges, neo4jFilterRelationship, neo4jFilterLabel])

  const visibleEdges = useMemo(() => {
    const baseEdges = filteredEdges
    if (!hoveredNodeId) return baseEdges
    return baseEdges.map((edge) => {
      const active = edge.source === hoveredNodeId || edge.target === hoveredNodeId
      if (isNeo4j) {
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: active ? '#aaa' : '#555',
            strokeWidth: active ? 2 : 1,
            opacity: active ? 1 : 0.35,
          },
        }
      }
      return {
        ...edge,
        animated: active,
        style: {
          ...edge.style,
          stroke: active ? '#1A6CF6' : '#E2E8F0',
          strokeWidth: active ? 3 : 1,
          opacity: active ? 1 : 0.25,
        },
      }
    })
  }, [filteredEdges, hoveredNodeId, isNeo4j])

  useEffect(() => {
    if (nodes.length === 0) {
      setNodesAndEdges(DEMO_NODES, DEMO_EDGES)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dynamic layout applying function
  const applyNeo4jLayout = () => {
    if (!isNeo4j || nodes.length === 0) return

    // Apply force layout to naturally cluster nodes (with or without edges)
    const posMap = applyForceLayout(filteredNodes, filteredEdges, 780, 560)
    
    const laid = nodes.map(n => ({
      ...n,
      position: posMap.get(n.id) ?? n.position,
    }))

    setNodesAndEdges(laid, edges)
    window.setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 80)
  }

  // Auto layout on filter change
  useEffect(() => {
    if (isNeo4j) {
      applyNeo4jLayout()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neo4jFilterRelationship, neo4jFilterLabel, isNeo4j])

  function handleNeo4jAutoLayout() {
    applyNeo4jLayout()
  }

  // ─── Canvas background based on dialect ───────────────────
  const isDark = resolvedTheme === 'dark'
  const canvasBg = isDark ? (isNeo4j ? '#0F172A' : '#07101F') : '#F8FAFC'
  const canvasGridStyle = isNeo4j
    ? {} // No dot grid for Neo4j
    : { backgroundImage: `radial-gradient(${isDark ? '#1E3A5F' : '#CBD5E1'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }

  return (
    <div
      className="relative isolate h-full min-h-0 w-full overflow-hidden"
      style={{ backgroundColor: canvasBg, ...canvasGridStyle }}
    >
      <ReactFlow
        nodes={filteredNodes}
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
        style={{ backgroundColor: canvasBg }}
      >
        {/* Only show grid for non-Neo4j editors */}
        {showGrid && !isNeo4j && <Background color={isDark ? '#1E2A45' : '#CBD5E1'} gap={20} size={1} />}

        {/* MiniMap — hide for Neo4j, matches official Neo4j Browser behavior */}
        {!isNeo4j && (
          <MiniMap
            pannable
            zoomable
            className="!bottom-5 !right-5 !h-28 !w-40 overflow-hidden !rounded-xl !border !border-slate-200 !bg-white dark:!border-[#1E2A45] dark:!bg-[#0D1424]"
            nodeColor="#1A6CF6"
            maskColor={isDark ? 'rgba(7,16,31,0.72)' : 'rgba(248,250,252,0.72)'}
          />
        )}
      </ReactFlow>

      {/* Bottom toolbar */}
      <div className="pointer-events-auto absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-300/40 backdrop-blur dark:border-[#1E2A45] dark:bg-[#0D1424]/95 dark:shadow-black/40">
        <ToolButton icon={Maximize2} label="Ajustar" onClick={() => fitView({ duration: 350, padding: 0.22 })} />
        <ToolButton
          icon={GitBranch}
          label="Auto-layout"
          onClick={() => isNeo4j ? handleNeo4jAutoLayout() : autoLayout(nodes, setNodesAndEdges, fitView)}
          active
        />
        {!isNeo4j && (
          <>
            <ToolButton icon={Rows3} label="Alinear" onClick={() => alignRows(nodes, setNodesAndEdges)} />
            <ToolButton icon={Grid3X3} label="Cuadrícula" onClick={() => setShowGrid((value) => !value)} active={showGrid} />
          </>
        )}
        {projectId && <CommitModal projectId={projectId} asToolbarButton />}
        {onSave && <ToolButton icon={Save} label="Guardar" onClick={onSave} />}
      </div>
    </div>
  )
}

function ToolButton({ icon: Icon, label, onClick, active = false }: { icon: React.ElementType; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`flex min-w-20 flex-col items-center gap-1 border-r border-slate-200 px-3 py-2 text-[11px] last:border-r-0 dark:border-[#1E2A45] ${active ? 'text-[#1A6CF6] dark:text-[#60A5FA]' : 'text-slate-500 hover:text-[#1A6CF6] dark:text-[#94A3B8] dark:hover:text-white'}`}>
      <Icon size={15} />
      {label}
    </button>
  )
}

function autoLayout(nodes: Node[], setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void, fitView: ReturnType<typeof useReactFlow>['fitView']) {
  const edges = useEditorStore.getState().edges
  const laidOut = nodes.map((node, index) => ({
    ...node,
    position: {
      x: 120 + (index % 3) * 340,
      y: 150 + Math.floor(index / 3) * 230,
    },
  }))
  setNodesAndEdges(laidOut, edges)
  window.setTimeout(() => fitView({ duration: 350, padding: 0.22 }), 50)
}

function alignRows(nodes: Node[], setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void) {
  const edges = useEditorStore.getState().edges
  setNodesAndEdges(nodes.map((node, index) => ({ ...node, position: { ...node.position, y: 160 + Math.floor(index / 3) * 220 } })), edges)
}
