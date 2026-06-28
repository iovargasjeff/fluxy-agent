'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useEditorStore } from '@/store/useEditorStore'
import type { EditorDialect } from '@/lib/editor-schema'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full animate-pulse items-center justify-center bg-[#101827]">
        <span className="text-sm text-[#6B7280]">Cargando editor...</span>
      </div>
    ),
  }
)

interface EditorPanelProps {
  mode: EditorDialect
}

export function EditorPanel({ mode }: EditorPanelProps) {
  const { sqlValue, setSqlValue } = useEditorStore()
  const { resolvedTheme } = useTheme()

  return (
    <div className="flex h-full w-full flex-col bg-[#101827]">
      <div className="flex shrink-0 items-center border-b border-[#1E2A45] bg-[#111827] px-4 py-2">
        <span className="font-mono text-xs text-[#9CDCFE]">schema.{mode === 'json' ? 'json' : 'sql'}</span>
        <span className="ml-auto rounded-md border border-[#1E2A45] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#64748B]">
          {mode}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={mode === 'json' ? 'json' : 'sql'}
          theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
          value={sqlValue}
          onChange={(value) => setSqlValue(value ?? '')}
          options={{
            readOnly: false,
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
