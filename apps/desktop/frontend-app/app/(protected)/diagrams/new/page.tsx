'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Database, FileEdit, Loader2, Wand2 } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { SchemaViewer } from '@/components/generator/SchemaViewer'
import { generatorAPI, diagramsAPI } from '@/lib/api/client'
import { useConnectionStore } from '@/lib/store/useConnectionStore'
import { toast } from 'sonner'

export default function NewDiagramPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams?.get('projectId') as string
  const { activeConnection } = useConnectionStore()

  const [tables, setTables] = useState<{ name: string; rowCount: number }[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [diagramName, setDiagramName] = useState('Diagrama Principal')

  const loadSchema = useCallback(async () => {
    if (!activeConnection) return
    setIsLoadingSchema(true)
    try {
      const schemaData = await generatorAPI.getSchema(activeConnection)
      const tableRows = (schemaData.tables ?? []).map((table) => ({
        name: typeof table === 'string' ? table : table.name,
        rowCount: 100,
      }))
      setTables(tableRows)
      setSelectedTables(tableRows.map((table) => table.name))
    } catch {
      toast.error('Error al cargar el esquema de la base de datos.')
    } finally {
      setIsLoadingSchema(false)
    }
  }, [activeConnection])

  useEffect(() => {
    if (!projectId) {
      router.push('/dashboard')
      return
    }

    if (activeConnection) {
      void loadSchema()
    } else {
      setTables([])
      setSelectedTables([])
    }
  }, [activeConnection, loadSchema, projectId, router])

  const handleToggleTable = (tableName: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((table) => table !== tableName)
        : [...prev, tableName]
    )
  }

  const handleSelectAll = () => setSelectedTables(tables.map((table) => table.name))
  const handleDeselectAll = () => setSelectedTables([])

  const handleGenerate = async () => {
    if (!activeConnection) {
      toast.error('No hay conexion activa a la base de datos.')
      return
    }

    if (selectedTables.length === 0) {
      toast.error('Selecciona al menos una tabla')
      return
    }

    setIsGenerating(true)
    try {
      await diagramsAPI.generate(projectId, {
        connection: activeConnection,
        selected_tables: selectedTables,
        name: diagramName,
      })
      toast.success('Diagrama generado con exito')
      router.push(`/editor?projectId=${projectId}`)
    } catch {
      toast.error('Error al generar el diagrama.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateBlank = async () => {
    setIsGenerating(true)
    try {
      await diagramsAPI.create({
        project_id: Number(projectId),
        name: diagramName,
        schema_json: JSON.stringify({ nodes: [], edges: [] }),
        sql_content: '',
        active_dialect: 'postgresql',
      })
      toast.success('Diagrama libre creado')
      router.push(`/editor?projectId=${projectId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo crear el diagrama libre.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0A0F1E]">
      <DashboardSidebar
        userName="Usuario Local"
        activeSection=""
        onSectionChange={() => {}}
      />
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 shrink-0 border-b border-[#1E2A45] bg-[#111827] shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4 text-gray-400 transition-colors hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Database className="mr-3 h-5 w-5 text-purple-500" />
              <span className="text-base font-semibold text-white">
                {activeConnection ? 'Ingenieria inversa ER' : 'Nuevo diagrama libre'}
              </span>
            </div>
            {isLoadingSchema && (
              <div className="flex items-center gap-2 text-xs text-purple-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Cargando esquema...
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8 pb-20">
            <div className={`flex flex-col items-start justify-between gap-4 rounded-xl border border-[#1E2A45] bg-[#111827] p-6 transition-all duration-500 sm:flex-row sm:items-center ${!isLoadingSchema ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-400">Nombre del diagrama</label>
                <input
                  type="text"
                  value={diagramName}
                  onChange={(e) => setDiagramName(e.target.value)}
                  className="w-full max-w-md rounded-lg border border-[#1E2A45] bg-[#0A0F1E] px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Ej: Diagrama Principal"
                />
              </div>
              {activeConnection && (
                <button
                  onClick={handleGenerate}
                  disabled={selectedTables.length === 0 || isGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-purple-900/20 transition-colors hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-500 sm:w-auto"
                >
                  {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                  Generar Canvas
                </button>
              )}
            </div>

            {activeConnection ? (
              <div className={`transition-all duration-500 ${!isLoadingSchema ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
                <SchemaViewer
                  tables={tables}
                  selectedTables={selectedTables}
                  onToggleTable={handleToggleTable}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onRowCountChange={() => {}}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-[#1E2A45] bg-[#111827] p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg border border-blue-500/25 bg-blue-500/10 p-3 text-blue-200">
                    <FileEdit className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white">Crear sin base de datos</h2>
                    <p className="mt-1 text-sm text-[#94A3B8]">
                      Puedes disenar tablas, campos y relaciones manualmente. Nada se aplica a una base de datos.
                    </p>
                    <button
                      type="button"
                      onClick={handleCreateBlank}
                      disabled={isGenerating}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1A6CF6] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileEdit className="h-4 w-4" />}
                      Crear canvas libre
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
