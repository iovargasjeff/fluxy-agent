'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, GitCompareArrows, Minus, Plus } from 'lucide-react'

const DiffEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.DiffEditor),
  { ssr: false, loading: () => <div className="h-96 w-full animate-pulse rounded bg-slate-100" /> }
)

interface DiffViewerModalProps {
  open: boolean
  onClose: () => void
  originalCode: string
  modifiedCode: string
  versionLabel: string
}

type DiffRow = {
  type: 'added' | 'removed' | 'same'
  text: string
}

function buildLineDiff(originalCode: string, modifiedCode: string) {
  const original = originalCode.split('\n')
  const modifiedSet = new Set(modifiedCode.split('\n').map((line) => line.trim()).filter(Boolean))
  const originalSet = new Set(original.map((line) => line.trim()).filter(Boolean))
  const modified = modifiedCode.split('\n')

  const removed: DiffRow[] = original
    .filter((line) => line.trim() && !modifiedSet.has(line.trim()))
    .map((text) => ({ type: 'removed', text }))

  const added: DiffRow[] = modified
    .filter((line) => line.trim() && !originalSet.has(line.trim()))
    .map((text) => ({ type: 'added', text }))

  return { rows: [...removed, ...added], added: added.length, removed: removed.length }
}

export function DiffViewerModal({ open, onClose, originalCode, modifiedCode, versionLabel }: DiffViewerModalProps) {
  const { resolvedTheme } = useTheme()
  const hasDiff = originalCode.trim() !== modifiedCode.trim()
  const diff = buildLineDiff(originalCode, modifiedCode)

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="flex h-[86vh] w-[min(1200px,96vw)] max-w-none flex-col gap-0 overflow-hidden border-slate-200 bg-white p-0 text-slate-900">
        <DialogHeader className="border-b border-slate-200 bg-slate-50 p-4">
          <DialogTitle className="flex items-center gap-3 text-base">
            <span className="rounded-lg bg-[#1A6CF6]/10 p-2 text-[#1A6CF6]"><GitCompareArrows size={18} /></span>
            Comparación de versiones
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs text-slate-500">{versionLabel}</span>
          </DialogTitle>
        </DialogHeader>

        {!hasDiff ? (
          <div className="flex flex-1 flex-col items-center justify-center text-slate-500">
            <CheckCircle2 className="mb-4 h-12 w-12 text-[#10B981]" />
            <p className="text-lg text-slate-900">No hay diferencias entre estas versiones</p>
            <p className="text-sm">El SQL actual coincide con la versión seleccionada.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 border-b border-slate-200 bg-slate-50 p-3">
              <SummaryCard tone="red" label="Líneas eliminadas" value={diff.removed} />
              <SummaryCard tone="green" label="Líneas agregadas" value={diff.added} />
              <SummaryCard tone="blue" label="Total cambios" value={diff.added + diff.removed} />
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[1fr_320px]">
              <div className="min-h-0">
                <div className="grid grid-cols-2 border-b border-slate-200 bg-white text-xs font-semibold text-slate-500">
                  <div className="border-r border-slate-200 px-4 py-2">Versión antigua</div>
                  <div className="px-4 py-2">Versión actual</div>
                </div>
                <DiffEditor
                  original={originalCode}
                  modified={modifiedCode}
                  language="sql"
                  theme="light"
                  options={{
                    readOnly: true,
                    renderSideBySide: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                    renderOverviewRuler: true,
                  }}
                />
              </div>

              <aside className="min-h-0 overflow-y-auto border-l border-slate-200 bg-slate-50 p-3">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">Cambios detectados</h3>
                <div className="space-y-2">
                  {diff.rows.length === 0 ? (
                    <p className="text-xs text-slate-500">Hay cambios de formato o espacios.</p>
                  ) : diff.rows.slice(0, 80).map((row, index) => (
                    <div key={`${row.type}-${index}`} className={`rounded-lg border p-2 text-xs ${row.type === 'added' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {row.type === 'added' ? <Plus className="mr-1 inline h-3 w-3" /> : <Minus className="mr-1 inline h-3 w-3" />}
                      <code className="break-words">{row.text.trim()}</code>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'red' | 'green' | 'blue' }) {
  const tones = {
    red: 'border-red-200 bg-red-50 text-red-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blue: 'border-blue-200 bg-blue-50 text-[#1A6CF6]',
  }

  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  )
}
