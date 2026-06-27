'use client';

import { Activity, AlertTriangle, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface AnalysisResultsProps {
  results: any | null;
  aiAnalysis: any | null;
}

export function AnalysisResults({ results, aiAnalysis }: AnalysisResultsProps) {
  
  if (!results) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col items-center justify-center text-gray-500 h-full">
        <Activity className="w-12 h-12 mb-4 opacity-20" />
        <p>Ejecuta el analizador para ver el plan de ejecución y sugerencias.</p>
      </div>
    );
  }

  // Mapear los datos reales del backend o usar fallback si no existen
  const executionTimeMs = results.execution_time_ms || results.executionTimeMs || 0;
  const warnings = results.warnings || [];
  const planSummary = results.plan_summary || results.planSummary || "Plan de ejecución analizado.";

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-gray-800 pb-4">
        <Activity className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg font-semibold text-white">Resultados del Análisis</h2>
      </div>

      <div className="bg-gray-950 rounded-xl border border-gray-800 p-4 flex flex-col justify-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tiempo de Ejecución</span>
        <div className="text-3xl font-bold text-white flex items-end gap-2">
          {executionTimeMs} <span className="text-lg text-gray-400 mb-1">ms</span>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-orange-500">Advertencias</h3>
          </div>
          <ul className="space-y-2">
            {warnings.map((w: string, i: number) => (
              <li key={i} className="text-sm text-orange-400 flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
        <h3 className="font-semibold text-gray-300 mb-2">Resumen del Plan</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{planSummary}</p>
      </div>

      {/* Metrics Section */}
      {results.metrics && Object.keys(results.metrics).length > 0 && (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-gray-300 mb-3 text-sm tracking-wider uppercase">Métricas Adicionales</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(results.metrics).map(([k, v]: [string, any]) => (
              <div key={k} className="flex flex-col bg-gray-900 p-2 rounded-lg border border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase font-bold">{k.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium text-gray-300">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Tree Rendering Component */}
      {results.plan_tree && (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-gray-300 mb-3 text-sm tracking-wider uppercase">Árbol de Ejecución (Plan)</h3>
          <div className="bg-[#0A0F1E] rounded-lg p-4 font-mono text-sm border border-gray-800 overflow-x-auto">
            <PlanTreeNode node={results.plan_tree} depth={0} />
          </div>
        </div>
      )}

      {/* AI Analysis Section */}
      {aiAnalysis && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-blue-400">Análisis con IA</h3>
          </div>
          
          <div className="space-y-4">
            {aiAnalysis.summary && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Resumen</h4>
                <p className="text-sm text-gray-300">{aiAnalysis.summary}</p>
              </div>
            )}
            
            {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recomendaciones</h4>
                <ul className="space-y-2">
                  {aiAnalysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent to render the tree recursively
function PlanTreeNode({ node, depth }: { node: any; depth: number }) {
  if (!node) return null;
  const indent = depth * 16; // 16px per depth level
  
  return (
    <div className="flex flex-col gap-1 mb-2">
      <div className="flex items-center gap-2" style={{ marginLeft: `${indent}px` }}>
        <span className="text-purple-400">├─</span>
        <span className="font-bold text-blue-300">{node.node_type}</span>
        {node.cost && <span className="text-xs text-gray-500">(cost: {node.cost})</span>}
        {node.actual_rows !== undefined && <span className="text-xs text-emerald-500">(rows: {node.actual_rows})</span>}
      </div>
      
      {node.properties && Object.keys(node.properties).length > 0 && (
        <div className="text-xs text-gray-400 grid grid-cols-1 gap-1" style={{ marginLeft: `${indent + 24}px` }}>
          {Object.entries(node.properties).map(([k, v]: [string, any]) => (
            <div key={k}><span className="text-gray-500">{k}:</span> {String(v)}</div>
          ))}
        </div>
      )}
      
      {node.children && node.children.length > 0 && (
        <div className="mt-1 border-l border-gray-800 ml-1.5 pl-2">
          {node.children.map((child: any, i: number) => (
            <PlanTreeNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
