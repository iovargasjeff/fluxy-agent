'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SchemaViewer } from '@/components/generator/SchemaViewer';
import { Database, Loader2, ArrowLeft, Wand2 } from 'lucide-react';
import { generatorAPI, diagramsAPI } from '@/lib/api/client';
import { useConnectionStore } from '@/lib/store/useConnectionStore';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewDiagramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('projectId') as string;
  
  const { activeConnection } = useConnectionStore();
  
  const [tables, setTables] = useState<{name: string, rowCount: number}[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagramName, setDiagramName] = useState('Diagrama Principal');

  const loadSchema = useCallback(async () => {
    if (!activeConnection) return;
    setIsLoadingSchema(true);
    try {
      const schemaData = await generatorAPI.getSchema(activeConnection);
      setTables(schemaData.tables.map((table) => ({
        name: typeof table === 'string' ? table : table.name,
        rowCount: 100,
      })));
    } catch {
      toast.error("Error al cargar el esquema de la base de datos.");
    } finally {
      setIsLoadingSchema(false);
    }
  }, [activeConnection]);

  useEffect(() => {
    if (!projectId) {
      router.push('/dashboard');
      return;
    }
    
    if (activeConnection) {
      loadSchema();
    } else {
      toast.error('No hay conexión activa a la base de datos.');
      router.push('/connect');
    }
  }, [activeConnection, loadSchema, projectId, router]);

  const handleToggleTable = (tableName: string) => {
    setSelectedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const handleSelectAll = () => setSelectedTables(tables.map(t => t.name));
  const handleDeselectAll = () => setSelectedTables([]);

  const handleGenerate = async () => {
    if (!activeConnection) {
      toast.error('No hay conexión activa a la base de datos.');
      router.push('/connect');
      return;
    }

    if (selectedTables.length === 0) {
      toast.error('Selecciona al menos una tabla');
      return;
    }
    
    setIsGenerating(true);
    try {
      await diagramsAPI.generate(projectId, {
        connection: activeConnection,
        selected_tables: selectedTables,
        name: diagramName
      });
      toast.success('Diagrama generado con éxito!');
      router.push(`/editor?projectId=${projectId}`);
    } catch (error) {
      toast.error('Error al generar el diagrama.');
    } finally {
      setIsGenerating(false);
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
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-400 hover:text-white mr-4 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Database className="w-5 h-5 text-purple-500 mr-3" />
              <span className="text-base font-semibold text-white">Ingeniería Inversa (ER)</span>
            </div>
            {isLoadingSchema && (
              <div className="text-xs text-purple-400 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Cargando esquema...
              </div>
            )}
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-5xl flex flex-col gap-8 pb-20">
            
            {/* Header config */}
            <div className={`bg-[#111827] border border-[#1E2A45] rounded-xl p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center transition-all duration-500 ${!isLoadingSchema ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Nombre del Diagrama</label>
                <input 
                  type="text" 
                  value={diagramName}
                  onChange={(e) => setDiagramName(e.target.value)}
                  className="bg-[#0A0F1E] border border-[#1E2A45] rounded-lg px-4 py-2 text-white w-full max-w-md focus:border-purple-500 focus:outline-none"
                  placeholder="Ej: Diagrama Principal"
                />
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleGenerate}
                  disabled={selectedTables.length === 0 || isGenerating}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  Generar Canvas
                </button>
              </div>
            </div>

            <div className={`transition-all duration-500 ${!isLoadingSchema ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
              <SchemaViewer 
                tables={tables}
                selectedTables={selectedTables}
                onToggleTable={handleToggleTable}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onRowCountChange={() => {}} // Not needed for diagrams
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
