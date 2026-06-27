'use client'

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

export function RelationshipEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
  const relationData = data as {
    sourceCardinality?: string
    targetCardinality?: string
    label?: string
    sourceColumn?: string
    targetColumn?: string
  } | undefined
  const sourceCardinality = relationData?.sourceCardinality ?? 'N'
  const targetCardinality = relationData?.targetCardinality ?? '1'
  const label = relationData?.label ?? `${sourceCardinality}:${targetCardinality}`

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <Badge x={sourceX} y={sourceY} label={sourceCardinality} />
        <Badge x={targetX} y={targetY} label={targetCardinality} />
        <div
          className="pointer-events-none absolute rounded border border-[#1E2A45] bg-[#0A0F1E] px-1.5 py-0.5 text-[10px] font-semibold text-[#00D4FF]"
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

function Badge({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <div
      className="pointer-events-none absolute flex h-4 min-w-4 items-center justify-center rounded-full border border-[#164E63] bg-[#07101F] px-1 text-[9px] font-bold text-[#67E8F9] shadow shadow-black/40"
      style={{ transform: `translate(-50%, -50%) translate(${x}px,${y}px)` }}
    >
      {label}
    </div>
  )
}
