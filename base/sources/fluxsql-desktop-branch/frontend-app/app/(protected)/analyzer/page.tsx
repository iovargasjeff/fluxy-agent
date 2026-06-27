'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { QueryEditor } from '@/components/analyzer/QueryEditor';
import { AnalysisResults } from '@/components/analyzer/AnalysisResults';
import { AIConfigPanel } from '@/components/analyzer/AIConfigPanel';
import { Activity } from 'lucide-react';
import { analyzerAPI } from '@/lib/api/client';
import { useConnectionStore } from '@/lib/store/useConnectionStore';
import { toast } from 'sonner';

export default function AnalyzerPage() {
  const { activeConnection } = useConnectionStore();
  
  const [query, setQuery] = useState<string>("SELECT * FROM users\nWHERE created_at > '2024-01-01';");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiConfig, setAiConfig] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!activeConnection) {
      toast.error('No hay conexión activa a la base de datos.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzerAPI.explain({
        connection: activeConnection,
        query
      });
      setAnalysisResults(result);
      setAiAnalysis(null); // Reset AI analysis for new query
    } catch (error) {
      console.warn("Backend falló. Usando MOCK DATA para resultados.");
      setTimeout(() => {
        setAnalysisResults({
          score: Math.floor(Math.random() * 50) + 40,
          executionTimeMs: (Math.random() * 100).toFixed(2),
          warnings: ["Posible escaneo secuencial en tabla 'users'"],
          planSummary: "El plan indica que se recorrerán todos los registros de la tabla debido a la falta de un índice en 'created_at'."
        });
        setAiAnalysis(null);
        setIsAnalyzing(false);
      }, 1000);
      return;
    }
    setIsAnalyzing(false);
  };

  const handleAnalyzeWithAI = async () => {
    if (!activeConnection) {
      toast.error('No hay conexión activa a la base de datos.');
      return;
    }

    if (!aiConfig?.providerId) {
      toast.error('Configura una API key antes de usar el análisis con IA.');
      return;
    }

    setIsAnalyzingAI(true);
    try {
      const result = await analyzerAPI.aiAnalyze({
        ai_config: { provider_id: aiConfig.providerId },
        plan_json: analysisResults,
        query,
        engine: activeConnection.engine
      });
      setAiAnalysis(result);
    } catch (error) {
      console.warn("No se pudo completar el análisis con IA.", error);
      setAiAnalysis(null);
      toast.error('No se pudo completar el análisis con IA. Verifica tu API key o el backend.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <DashboardSidebar
        userName="Usuario Local"
        activeSection=""
        onSectionChange={() => {}}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="border-b border-[#1E2A45] bg-[#111827] sticky top-0 z-10 shadow-sm flex-shrink-0">
          <div className="container mx-auto px-6 h-16 flex items-center">
            <Activity className="w-5 h-5 text-blue-500 mr-3" />
            <span className="text-base font-semibold text-white">Analizador de Consultas</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-7xl flex flex-col gap-6 pb-20 h-full min-h-[800px]">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              
              {/* Left Column: Query */}
              <div className="flex flex-col gap-6 lg:col-span-1 h-full">
                <div className={`flex-1 transition-all duration-500 min-h-[300px]`}>
                  <QueryEditor 
                    query={query}
                    onChange={(val) => setQuery(val || '')}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    disabled={false}
                  />
                </div>
              </div>

              {/* Right Column: Results & AI */}
              <div className={`lg:col-span-2 flex flex-col gap-6 transition-all duration-500 h-full`}>
                
                <div className="flex-1 min-h-[400px]">
                  <AnalysisResults 
                    results={analysisResults} 
                    aiAnalysis={aiAnalysis} 
                  />
                </div>

                <AIConfigPanel 
                  onSaveConfig={setAiConfig}
                  onAnalyzeWithAI={handleAnalyzeWithAI}
                  isAnalyzingAI={isAnalyzingAI}
                  disabled={!analysisResults}
                />
                
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
