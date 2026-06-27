'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useEditorStore } from '@/store/useEditorStore'
import { useSyncEditor } from '@/hooks/useSyncEditor'
import type { Edge, Node } from '@xyflow/react'
import type { EditorDialect } from '@/lib/editor-schema'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full animate-pulse items-center justify-center bg-[#0B1322]">
        <span className="text-sm text-[#64748B]">Cargando editor...</span>
      </div>
    ),
  }
)

interface EditorPanelProps {
  mode: EditorDialect
  emitSqlChange?: (nodes: Node[], edges: Edge[]) => void
}

export function EditorPanel({ mode, emitSqlChange }: EditorPanelProps) {
  const { sqlValue, setSqlValue } = useEditorStore()
  const { resolvedTheme } = useTheme()
  useSyncEditor(mode, emitSqlChange)

  let fileExtension = 'sql'
  let editorLanguage = 'sql'

  if (mode === 'json') {
    fileExtension = 'json'
    editorLanguage = 'json'
  } else if (mode === 'mongodb') {
    fileExtension = 'js' // Mongoose models
    editorLanguage = 'javascript'
  } else if (mode === 'neo4j') {
    fileExtension = 'cypher'
    editorLanguage = 'cypher'
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#0B1322] border-r border-[#1E2A45]">
      <div className="flex shrink-0 items-center border-b border-[#1E2A45] bg-[#07101F] px-4 py-2">
        <span className="font-mono text-xs text-[#94A3B8] font-semibold">schema.{fileExtension}</span>
        <span className="ml-auto rounded-md border border-[#1E2A45] bg-[#111827] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#64748B]">
          {mode}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={editorLanguage}
          theme="vs-dark"
          value={sqlValue}
          onChange={(value) => setSqlValue(value ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            renderLineHighlight: 'line',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  )
}
