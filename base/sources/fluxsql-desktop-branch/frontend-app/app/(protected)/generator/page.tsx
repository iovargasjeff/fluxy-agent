'use client'

import { useCallback, useEffect, useState } from 'react'
import { Database } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { SchemaViewer } from '@/components/generator/SchemaViewer'
import { DataPreview } from '@/components/generator/DataPreview'
import { ExportPanel } from '@/components/generator/ExportPanel'
import { DatabaseRowsPanel, type DatabaseRows } from '@/components/generator/DatabaseRowsPanel'
import { generatorAPI } from '@/lib/api/client'
import { useConnectionStore } from '@/lib/store/useConnectionStore'

export default function GeneratorPage() {
  const activeConnection = useConnectionStore((state) => state.activeConnection)
  const [tables, setTables] = useState<{ name: string; rowCount: number }[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null)
  const [databaseRows, setDatabaseRows] = useState<DatabaseRows | null>(null)
  const [databaseRowsError, setDatabaseRowsError] = useState<string | null>(null)
  const [listingTable, setListingTable] = useState<string | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isInserting, setIsInserting] = useState(false)
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)

  const loadSchema = useCallback(async () => {
    if (!activeConnection) return
    setIsLoadingSchema(true)
    try {
      const schemaData = await generatorAPI.getSchema(activeConnection)
      setTables(schemaData.tables.map((table) => ({
        name: typeof table === 'string' ? table : table.name,
        rowCount: 100,
      })))
    } catch (error) {
      setTables([])
      toast.error(error instanceof Error ? error.message : 'No se pudo cargar el esquema.')
    } finally {
      setIsLoadingSchema(false)
    }
  }, [activeConnection])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeConnection) void loadSchema()
  }, [activeConnection, loadSchema])

  const selectedConfigs = () => tables
    .filter((table) => selectedTables.includes(table.name))
    .map((table) => ({ table_name: table.name, record_count: table.rowCount, selected: true }))

  async function handleGeneratePreview() {
    if (!activeConnection) return
    setIsPreviewing(true)
    try {
      const schema = await generatorAPI.getSchema(activeConnection)
      setPreviewData(await generatorAPI.generatePreview({
        schema,
        table_configs: selectedConfigs(),
        preview_rows: 10,
        locale: 'es_ES',
      }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo generar la vista previa.')
    } finally {
      setIsPreviewing(false)
    }
  }

  async function handleListRows(tableName: string, page = 1) {
    if (!activeConnection) return
    setListingTable(tableName)
    setDatabaseRowsError(null)
    try {
      setDatabaseRows(await generatorAPI.listTableRows(activeConnection, tableName, page))
    } catch (error) {
      setDatabaseRowsError(error instanceof Error ? error.message : 'No se pudieron listar los datos.')
    } finally {
      setListingTable(null)
    }
  }

  async function handleExport(format: 'sql' | 'csv' | 'json') {
    if (!activeConnection) return
    setIsExporting(true)
    try {
      const schema = await generatorAPI.getSchema(activeConnection)
      await generatorAPI.exportData({ connection: activeConnection, schema, table_configs: selectedConfigs(), format, locale: 'es_ES' })
      toast.success(`Exportación ${format.toUpperCase()} generada.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo exportar.')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleInsertDirectly() {
    if (!activeConnection) return
    setIsInserting(true)
    try {
      const schema = await generatorAPI.getSchema(activeConnection)
      await generatorAPI.insertData({ connection: activeConnection, schema, table_configs: selectedConfigs(), locale: 'es_ES' })
      toast.success('Datos insertados exitosamente.')
      if (databaseRows) await handleListRows(databaseRows.table_name, databaseRows.page)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron insertar los datos.')
    } finally {
      setIsInserting(false)
    }
  }

  const isConfigured = selectedTables.length > 0

  return (
    <div className="flex min-h-screen bg-[#0A0F1E]">
      <DashboardSidebar userName="Usuario Local" activeSection="" onSectionChange={() => {}} />
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-[#1E2A45] bg-[#111827] px-6 shadow-sm">
          <div className="flex items-center">
            <Database className="mr-3 h-5 w-5 text-blue-500" />
            <span className="text-base font-semibold text-white">Generador de Datos Ficticios</span>
          </div>
          {isLoadingSchema && <span className="text-xs text-blue-400">Cargando esquema...</span>}
        </header>

        <div className="flex-1 overflow-auto">
          <div className="container mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8 pb-20">
            <SchemaViewer
              tables={tables}
              selectedTables={selectedTables}
              onToggleTable={(name) => setSelectedTables((current) => current.includes(name) ? current.filter((table) => table !== name) : [...current, name])}
              onSelectAll={() => setSelectedTables(tables.map((table) => table.name))}
              onDeselectAll={() => setSelectedTables([])}
              onRowCountChange={(name, count) => setTables((current) => current.map((table) => table.name === name ? { ...table, rowCount: count } : table))}
              onListRows={(name) => void handleListRows(name)}
              listingTable={listingTable}
            />

            <DatabaseRowsPanel
              data={databaseRows}
              loading={Boolean(listingTable)}
              error={databaseRowsError}
              onPageChange={(page) => databaseRows && void handleListRows(databaseRows.table_name, page)}
              onClose={() => {
                setDatabaseRows(null)
                setDatabaseRowsError(null)
              }}
            />

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <DataPreview previewData={previewData} isLoading={isPreviewing} onGeneratePreview={() => void handleGeneratePreview()} disabled={!isConfigured} />
              <ExportPanel onExport={(format) => void handleExport(format)} onInsertDirectly={() => void handleInsertDirectly()} isExporting={isExporting} isInserting={isInserting} disabled={!isConfigured} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
