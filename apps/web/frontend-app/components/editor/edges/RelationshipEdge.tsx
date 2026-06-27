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
  label,
}: EdgeProps) {
  if (
    typeof sourceX !== 'number' ||
    typeof sourceY !== 'number' ||
    typeof targetX !== 'number' ||
    typeof targetY !== 'number' ||
    Number.isNaN(sourceX) ||
    Number.isNaN(targetX)
  ) {
    return null
  }

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="absolute text-[10px] font-semibold text-[#00D4FF] bg-[#0A0F1E] px-1 rounded pointer-events-none border border-[#1E2A45]"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
