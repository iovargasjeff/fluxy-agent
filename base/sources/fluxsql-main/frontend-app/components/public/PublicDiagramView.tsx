'use client'

import { ReactFlow, Background, Controls, ReactFlowProvider, type Edge, type Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { TableNode } from '@/components/editor/nodes/TableNode'
import { RelationshipEdge } from '@/components/editor/edges/RelationshipEdge'
const nodeTypes = { tableNode: TableNode }
const edgeTypes = { relationship: RelationshipEdge }

interface PublicDiagramViewProps {
  flowJson: {
    nodes?: Node[]
    edges?: Edge[]
  }
}

function PublicDiagramInner({ flowJson }: PublicDiagramViewProps) {
  return (
    <div className="w-full h-full bg-[#0A0F1E]">
      <ReactFlow
        nodes={flowJson?.nodes ?? []}
        edges={flowJson?.edges ?? []}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E2A45" gap={20} size={1} />
        <Controls showInteractive={false} className="bg-[#111827] border-[#1E2A45] fill-white" />
      </ReactFlow>
    </div>
  )
}

export function PublicDiagramView(props: PublicDiagramViewProps) {
  return (
    <ReactFlowProvider>
      <PublicDiagramInner {...props} />
    </ReactFlowProvider>
  )
}
