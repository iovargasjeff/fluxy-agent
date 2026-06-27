'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Database,
  HardDrive,
  Loader2,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Table2,
  XCircle,
} from 'lucide-react'
import { FluxyLocalApiClient, LocalConnectionRequest, SavedConnectionProfile } from '@/lib/api/local-api-client'
import { getLocalSidecarBaseUrl, resolveDesktopSidecarPort } from '@/lib/runtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ConnectionStatus = 'idle' | 'checking' | 'ok' | 'error'

interface DatabaseSchemaPreview {
  motor: string
  database_name: string
  tables: Array<{
    name: string
    columns: Array<{ name: string; data_type: string; is_primary_key?: boolean }>
  }>
}

const defaultConnection: LocalConnectionRequest = {
  motor: 'postgresql',
  host: '127.0.0.1',
  puerto: 5432,
  usuario: 'postgres',
  password: '',
  nombre_bd: 'postgres',
}

export function DesktopLocalDashboard() {
  const [sidecarPort, setSidecarPort] = useState<number | undefined>()
  const [sidecarReady, setSidecarReady] = useState(false)
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [message, setMessage] = useState('Conecta una base de datos PostgreSQL local para empezar.')
  const [form, setForm] = useState<LocalConnectionRequest>(defaultConnection)
  const [schema, setSchema] = useState<DatabaseSchemaPreview | null>(null)
  const [savedConnections, setSavedConnections] = useState<SavedConnectionProfile[]>([])

  const client = useMemo(() => {
    return new FluxyLocalApiClient({ baseUrl: getLocalSidecarBaseUrl(sidecarPort) })
  }, [sidecarPort])

  useEffect(() => {
    let cancelled = false

    async function boot() {
      const port = await resolveDesktopSidecarPort()
      if (!cancelled && port) {
        setSidecarPort(port)
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadLocalState() {
      try {
        await client.health()
        if (cancelled) return
        setSidecarReady(true)
        const saved = await client.listSavedConnections()
        if (!cancelled) {
          setSavedConnections(saved)
        }
      } catch {
        if (!cancelled) {
          setSidecarReady(false)
        }
      }
    }

    loadLocalState()
    const timer = window.setInterval(loadLocalState, 6000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [client])

  function updateField<K extends keyof LocalConnectionRequest>(field: K, value: LocalConnectionRequest[K]) {
    setForm(current => ({ ...current, [field]: value }))
  }

  async function testConnection() {
    setStatus('checking')
    setMessage('Probando conexion local...')
    setSchema(null)

    try {
      const result = await client.testConnection(form)
      setStatus('ok')
      setMessage(`Conexion lista. Tablas detectadas: ${result.tables_count ?? 0}.`)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'No se pudo conectar a la base de datos.')
    }
  }

  async function inspectSchema(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('checking')
    setMessage('Inspeccionando esquema y guardando perfil local...')

    try {
      const result = await client.inspectSchema(form) as DatabaseSchemaPreview
      setSchema(result)
      setStatus('ok')
      setMessage(`Esquema cargado desde ${result.database_name}: ${result.tables.length} tabla(s).`)
      setSavedConnections(await client.listSavedConnections())
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'No se pudo inspeccionar el esquema.')
    }
  }

  const statusIcon = {
    idle: <Activity className="h-4 w-4 text-slate-500" />,
    checking: <Loader2 className="h-4 w-4 animate-spin text-blue-600" />,
    ok: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    error: <XCircle className="h-4 w-4 text-red-600" />,
  }[status]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Fluxy Desktop</h1>
              <p className="text-sm text-slate-500">Modo local sin login</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm">
            <span className={`h-2 w-2 rounded-full ${sidecarReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{sidecarReady ? `Sidecar activo ${sidecarPort ? `:${sidecarPort}` : ''}` : 'Esperando sidecar'}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <PlugZap className="h-5 w-5 text-blue-700" />
            <div>
              <h2 className="font-semibold">Conexion local</h2>
              <p className="text-sm text-slate-500">PostgreSQL primero; login solo sera para sync/cloud.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={inspectSchema}>
            <div className="grid grid-cols-[1fr_110px] gap-3">
              <div>
                <Label htmlFor="host">Host</Label>
                <Input id="host" value={form.host} onChange={event => updateField('host', event.target.value)} />
              </div>
              <div>
                <Label htmlFor="port">Puerto</Label>
                <Input
                  id="port"
                  type="number"
                  value={form.puerto}
                  onChange={event => updateField('puerto', Number(event.target.value))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="database">Base de datos</Label>
              <Input id="database" value={form.nombre_bd} onChange={event => updateField('nombre_bd', event.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="user">Usuario</Label>
                <Input id="user" value={form.usuario} onChange={event => updateField('usuario', event.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={event => updateField('password', event.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={testConnection} disabled={status === 'checking'}>
                {status === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                Probar
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={status === 'checking'}>
                <Database className="h-4 w-4" />
                Inspeccionar
              </Button>
            </div>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            {statusIcon}
            <p>{message}</p>
          </div>
        </section>

        <section className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Local-first
              </div>
              <p className="text-2xl font-semibold">{sidecarReady ? 'Activo' : 'Pendiente'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Database className="h-4 w-4 text-blue-600" />
                Conexiones
              </div>
              <p className="text-2xl font-semibold">{savedConnections.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Table2 className="h-4 w-4 text-violet-600" />
                Tablas
              </div>
              <p className="text-2xl font-semibold">{schema?.tables.length ?? 0}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-semibold">Esquema inspeccionado</h2>
                <p className="text-sm text-slate-500">Vista local de tablas y columnas.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => void testConnection()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[360px] overflow-auto p-4">
              {schema ? (
                <div className="space-y-3">
                  {schema.tables.map(table => (
                    <div key={table.name} className="rounded-lg border border-slate-200 p-3">
                      <div className="mb-2 flex items-center gap-2 font-medium">
                        <Table2 className="h-4 w-4 text-slate-500" />
                        {table.name}
                      </div>
                      <div className="grid gap-1 text-sm text-slate-600 md:grid-cols-2">
                        {table.columns.slice(0, 12).map(column => (
                          <div key={`${table.name}-${column.name}`} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1">
                            <span>{column.name}</span>
                            <span className="text-xs text-slate-500">{column.data_type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[220px] items-center justify-center text-center text-sm text-slate-500">
                  Inspecciona una base local para ver sus tablas aqui.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Conexiones guardadas</h2>
              <p className="text-sm text-slate-500">Credenciales cifradas en el almacenamiento local del sidecar.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {savedConnections.length ? savedConnections.map(connection => (
                <div key={connection.connection_id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{connection.database}</p>
                    <p className="text-slate-500">{connection.engine} · {connection.host_masked}:{connection.port}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{connection.environment}</span>
                </div>
              )) : (
                <div className="px-5 py-8 text-center text-sm text-slate-500">Todavia no hay conexiones guardadas.</div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
