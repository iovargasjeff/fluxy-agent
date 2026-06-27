'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown, ChevronUp, Play, X } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { useSyncEditor } from '@/hooks/useSyncEditor'
import type { Edge, Node } from '@xyflow/react'
import type { Monaco } from '@monaco-editor/react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: '#0F172A' }}
    >
      <span className="text-xs" style={{ color: '#444' }}>Cargando editor Cypher...</span>
    </div>
  ),
})

interface Neo4jCommandBarProps {
  emitSqlChange?: (nodes: Node[], edges: Edge[]) => void
}

function handleEditorWillMount(monaco: Monaco) {
  monaco.editor.defineTheme('flux-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0F172A',
      'editor.lineHighlightBackground': '#1E293B',
      'editorGutter.background': '#0F172A',
    }
  })
}

const COLLAPSED_H = 42   // px — just the toolbar row visible
const EXPANDED_H  = 200  // px — editor open

export function Neo4jCommandBar({ emitSqlChange }: Neo4jCommandBarProps) {
  const { sqlValue, setSqlValue } = useEditorStore()
  const [expanded, setExpanded] = useState(true)
  useSyncEditor('neo4j', emitSqlChange)

  const barHeight = expanded ? EXPANDED_H : COLLAPSED_H

  return (
    <div
      className="shrink-0 flex flex-col overflow-hidden transition-all duration-200"
      style={{
        height: barHeight,
        background: '#0F172A',
        borderBottom: '1px solid #1E293B',
      }}
    >
      {/* ── Toolbar row ────────────────────────────────────── */}
      <div
        className="flex shrink-0 items-center gap-2 px-3"
        style={{
          height: COLLAPSED_H,
          borderBottom: expanded ? '1px solid #1E293B' : 'none',
        }}
      >
        {/* $ symbol like Neo4j Browser */}
        <span
          className="font-mono text-sm font-bold select-none"
          style={{ color: '#6b5fa0' }}
        >
          $
        </span>

        {/* Inline preview of SQL when collapsed */}
        {!expanded && (
          <span
            className="flex-1 truncate font-mono text-xs cursor-pointer"
            style={{ color: '#666' }}
            onClick={() => setExpanded(true)}
          >
            {sqlValue.trim().split('\n')[0] || 'Escribe Cypher aquí...'}
          </span>
        )}

        {expanded && <div className="flex-1" />}

        {/* Execute button */}
        <button
          onClick={() => {
            // Trigger a re-parse by touching the SQL value
            setSqlValue(sqlValue + ' ', false)
            setTimeout(() => setSqlValue(sqlValue, false), 50)
          }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          style={{
            background: 'rgba(76,158,219,0.15)',
            border: '1px solid rgba(76,158,219,0.3)',
            color: '#4C9EDB',
          }}
          title="Ejecutar Cypher"
        >
          <Play size={11} />
          Ejecutar
        </button>

        {/* Collapse / Expand */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="rounded-lg p-1.5 transition hover:opacity-80"
          style={{ color: '#555' }}
          title={expanded ? 'Colapsar editor' : 'Expandir editor'}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ── Monaco Editor (visible only when expanded) ──────── */}
      {expanded && (
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <MonacoEditor
            height="100%"
            language="cypher"
            theme="flux-dark"
            value={sqlValue}
            onChange={(value) => setSqlValue(value ?? '')}
            beforeMount={handleEditorWillMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              renderLineHighlight: 'none',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              padding: { top: 10, bottom: 10 },
              overviewRulerLanes: 0,
              folding: false,
              glyphMargin: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,
            }}
          />
        </div>
      )}
    </div>
  )
}
