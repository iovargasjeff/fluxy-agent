'use client'

import { Activity, AlertTriangle, CheckCircle2, ChevronRight, Zap } from 'lucide-react'

interface AnalysisResultsProps {
  results: AnalysisResult | null
  aiAnalysis: AIAnalysis | null
}

type PlanTree = {
  node_type?: string
  cost?: string | number
  actual_rows?: string | number
  properties?: Record<string, unknown>
  children?: PlanTree[]
}

type AnalysisResult = {
  execution_time_ms?: string | number
  executionTimeMs?: string | number
  warnings?: string[]
  plan_summary?: string
  planSummary?: string
  metrics?: Record<string, unknown>
  plan_tree?: PlanTree
}

type AIAnalysis = {
  summary?: string
  recommendations?: string[]
}

export function AnalysisResults({ results, aiAnalysis }: AnalysisResultsProps) {
  if (!results) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-6 text-slate-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500">
        <Activity className="mb-4 h-12 w-12 opacity-20" />
        <p>Ejecuta el analizador para ver el plan de ejecucion y sugerencias.</p>
      </div>
    )
  }

  const executionTimeMs = results.execution_time_ms || results.executionTimeMs || 0
  const warnings = results.warnings || []
  const planSummary = results.plan_summary || results.planSummary || 'Plan de ejecucion analizado.'

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 dark:border-gray-800">
        <Activity className="h-5 w-5 text-purple-500" />
        <h2 className="text-lg font-semibold">Resultados del Analisis</h2>
      </div>

      <div className="flex flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
        <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-500">Tiempo de Ejecucion</span>
        <div className="flex items-end gap-2 text-3xl font-bold">
          {executionTimeMs} <span className="mb-1 text-lg text-slate-400 dark:text-gray-400">ms</span>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/10">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-orange-600 dark:text-orange-400">Advertencias</h3>
          </div>
          <ul className="space-y-2">
            {warnings.map((warning: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm text-orange-700 dark:text-orange-300">
                <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
        <h3 className="mb-2 font-semibold text-slate-700 dark:text-gray-300">Resumen del Plan</h3>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-gray-400">{planSummary}</p>
      </div>

      {results.metrics && Object.keys(results.metrics).length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300">Metricas Adicionales</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Object.entries(results.metrics).map(([key, value]) => (
              <div key={key} className="flex flex-col rounded-lg border border-slate-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-500">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.plan_tree && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-gray-300">Arbol de Ejecucion</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm dark:border-gray-800 dark:bg-[#0A0F1E]">
            <PlanTreeNode node={results.plan_tree} depth={0} />
          </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/5">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-600 dark:text-blue-400">Analisis con IA</h3>
          </div>
          <div className="space-y-4">
            {aiAnalysis.summary && (
              <div>
                <h4 className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-gray-500">Resumen</h4>
                <p className="text-sm text-slate-700 dark:text-gray-300">{aiAnalysis.summary}</p>
              </div>
            )}
            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-gray-500">Recomendaciones</h4>
                <ul className="space-y-2">
                  {aiAnalysis.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-gray-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PlanTreeNode({ node, depth }: { node: PlanTree; depth: number }) {
  if (!node) return null
  const indent = depth * 16

  return (
    <div className="mb-2 flex flex-col gap-1">
      <div className="flex items-center gap-2" style={{ marginLeft: `${indent}px` }}>
        <span className="text-purple-500 dark:text-purple-400">|-</span>
        <span className="font-bold text-blue-600 dark:text-blue-300">{node.node_type}</span>
        {node.cost && <span className="text-xs text-slate-500 dark:text-gray-500">(cost: {node.cost})</span>}
        {node.actual_rows !== undefined && <span className="text-xs text-emerald-600 dark:text-emerald-500">(rows: {node.actual_rows})</span>}
      </div>

      {node.properties && Object.keys(node.properties).length > 0 && (
        <div className="grid grid-cols-1 gap-1 text-xs text-slate-600 dark:text-gray-400" style={{ marginLeft: `${indent + 24}px` }}>
          {Object.entries(node.properties).map(([key, value]) => (
            <div key={key}><span className="text-slate-500 dark:text-gray-500">{key}:</span> {String(value)}</div>
          ))}
        </div>
      )}

      {node.children && node.children.length > 0 && (
        <div className="ml-1.5 mt-1 border-l border-slate-200 pl-2 dark:border-gray-800">
          {node.children.map((child, index) => (
            <PlanTreeNode key={index} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
