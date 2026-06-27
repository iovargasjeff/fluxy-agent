'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { CheckCircle2 } from 'lucide-react'

// Updated Palette: Blue/Slate tones instead of rainbow
const NEO4J_PALETTE = [
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
  return NEO4J_PALETTE[Math.abs(hash) % NEO4J_PALETTE.length]
}

export function Neo4jSidebar() {
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const neo4jFilterLabel = useEditorStore((state) => state.neo4jFilterLabel)
  const setNeo4jFilterLabel = useEditorStore((state) => state.setNeo4jFilterLabel)

  const neo4jFilterRelationship = useEditorStore((state) => state.neo4jFilterRelationship)
  const setNeo4jFilterRelationship = useEditorStore((state) => state.setNeo4jFilterRelationship)

  // ── Legend data ──────────────────────────────────────────
  const labels = Array.from(
    new Set(nodes.map(n => (n.data as { tableName?: string })?.tableName).filter(Boolean))
  ) as string[]

  const relTypes = Array.from(
    new Set(
      edges
        .map(e => (e.data as { relType?: string })?.relType ?? (typeof e.label === 'string' ? e.label : null))
        .filter(Boolean)
    )
  ) as string[]

  // ── Auto-clear orphaned filters ──────────────────────────
  useEffect(() => {
    if (neo4jFilterLabel && !labels.includes(neo4jFilterLabel)) {
      setNeo4jFilterLabel(null)
    }
  }, [labels, neo4jFilterLabel, setNeo4jFilterLabel])

  useEffect(() => {
    if (neo4jFilterRelationship && !relTypes.includes(neo4jFilterRelationship)) {
      setNeo4jFilterRelationship(null)
    }
  }, [relTypes, neo4jFilterRelationship, setNeo4jFilterRelationship])

  const propertyKeys = Array.from(
    new Set(
      nodes.flatMap(n => {
        const cols = (n.data as { columns?: Array<{ name: string; type: string }> })?.columns ?? []
        return cols.filter(c => c.type !== 'Relation' && c.name !== '_id').map(c => c.name)
      })
    )
  ).sort() as string[]

  const warnings = nodes.filter(n => {
    const cols = (n.data as { columns?: Array<{ name: string }> })?.columns ?? []
    return cols.length === 0
  }).length

  const isAllActive = neo4jFilterLabel === null && neo4jFilterRelationship === null

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ background: '#1E293B', borderRight: '1px solid #334155', minWidth: 0 }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="shrink-0 px-5 py-4"
        style={{ borderBottom: '1px solid #334155' }}
      >
        <p className="text-sm font-bold" style={{ color: '#ccc' }}>
          Database information
        </p>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* ── Nodes section ──────────────────────────────────── */}
        {labels.length > 0 ? (
          <div>
            <p className="mb-2 text-[11px] font-semibold" style={{ color: '#666' }}>
              Nodes ({nodes.length})
            </p>

            <div className="flex flex-wrap gap-1.5">
              {/* ★ Asterisk pill — show ALL nodes */}
              <button
                onClick={() => {
                  setNeo4jFilterLabel(null)
                  setNeo4jFilterRelationship(null)
                }}
                title="Mostrar todos los nodos sin conexiones"
                className="flex items-center justify-center rounded-full transition-all duration-150"
                style={{
                  width: 28,
                  height: 28,
                  background: isAllActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: isAllActive ? '1.5px solid rgba(255,255,255,0.50)' : '1.5px solid rgba(255,255,255,0.15)',
                  color: isAllActive ? '#fff' : '#888',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                *
              </button>

              {/* Label pills — click to filter */}
              {labels.map(label => {
                const nodeColor =
                  (nodes.find(n => (n.data as { tableName?: string })?.tableName === label)?.data as { color?: string })?.color
                  ?? getLabelColor(label)
                const isActive = neo4jFilterLabel === label

                return (
                  <button
                    key={label}
                    onClick={() => setNeo4jFilterLabel(isActive ? null : label)}
                    title={isActive ? `Ocultar filtro: ${label}` : `Filtrar: solo ${label}`}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-150"
                    style={{
                      background: isActive ? nodeColor + '44' : nodeColor + '18',
                      color: nodeColor,
                      border: isActive
                        ? `2px solid ${nodeColor}`
                        : `1px solid ${nodeColor}55`,
                      cursor: 'pointer',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: nodeColor,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Active filter indicator */}
            {neo4jFilterLabel && (
              <p className="mt-2 text-[10px]" style={{ color: '#666' }}>
                Mostrando solo:{' '}
                <span style={{ color: getLabelColor(neo4jFilterLabel), fontWeight: 600 }}>
                  {neo4jFilterLabel}
                </span>
                {' '}·{' '}
                <button
                  onClick={() => setNeo4jFilterLabel(null)}
                  className="underline"
                  style={{ color: '#555', cursor: 'pointer' }}
                >
                  ver todos
                </button>
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs" style={{ color: '#444' }}>
            Sin nodos. Escribe Cypher y ejecuta para ver el grafo.
          </p>
        )}

        {/* ── Relationships ────────────────────────────────── */}
        {relTypes.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold" style={{ color: '#666' }}>
              Relationships ({edges.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {relTypes.map(rel => {
                const isActive = neo4jFilterRelationship === rel
                return (
                  <button
                    key={rel}
                    onClick={() => setNeo4jFilterRelationship(isActive ? null : rel)}
                    title={isActive ? `Ocultar filtro de relación: ${rel}` : `Filtrar por relación: ${rel}`}
                    className="rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-all duration-150"
                    style={{ 
                      background: isActive ? 'rgba(255,255,255,0.15)' : '#1E293B', 
                      color: isActive ? '#fff' : '#888', 
                      border: isActive ? '1px solid rgba(255,255,255,0.4)' : '1px solid #333',
                      cursor: 'pointer',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {rel}
                  </button>
                )
              })}
            </div>
            {neo4jFilterRelationship && (
              <p className="mt-2 text-[10px]" style={{ color: '#666' }}>
                Relación activa:{' '}
                <span style={{ color: '#aaa', fontWeight: 600 }}>
                  {neo4jFilterRelationship}
                </span>
              </p>
            )}
          </div>
        )}

        {/* ── Property Keys ────────────────────────────────── */}
        {propertyKeys.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold" style={{ color: '#666' }}>
              Property keys
            </p>
            <div className="flex flex-wrap gap-1.5">
              {propertyKeys.map(key => (
                <span
                  key={key}
                  className="rounded px-2 py-0.5 text-[10px]"
                  style={{ background: '#1E293B', color: '#777', border: '1px solid #334155' }}
                >
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div
        className="shrink-0 px-5 py-3"
        style={{ borderTop: '1px solid #334155', background: '#0F172A' }}
      >
        <div
          className="rounded-lg p-2.5 text-xs"
          style={
            warnings > 0
              ? { background: 'rgba(227,98,9,0.08)', border: '1px solid rgba(227,98,9,0.2)', color: '#E36209' }
              : { background: 'rgba(44,159,91,0.08)', border: '1px solid rgba(44,159,91,0.2)', color: '#2C9F5B' }
          }
        >
          <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" />
          {warnings > 0 ? `${warnings} nodo(s) sin propiedades` : 'Sin errores detectados.'}
        </div>
        <p className="mt-2 text-[10px]" style={{ color: '#475569' }}>
          {nodes.length} nodos · {edges.length} relaciones
        </p>
      </div>
    </div>
  )
}
