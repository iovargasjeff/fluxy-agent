'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Brain, CheckCircle2, Database, Link as LinkIcon, Plug, Server, Trash2 } from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useConnectionStore } from '@/lib/store/useConnectionStore';
import { connectorAPI, generatorAPI, type SavedConnection } from '@/lib/api/client';

export default function ConnectPage() {
  const router = useRouter();
  const { setActiveConnection } = useConnectionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  const [config, setConfig] = useState({
    engine: 'postgresql',
    host: 'localhost',
    port: '5432',
    username: 'postgres',
    password: '',
    database: '',
  });

  const fetchSaved = useCallback(async () => {
    setIsLoadingSaved(true);
    try {
      const saved = await connectorAPI.listSaved();
      setSavedConnections(saved);
    } catch (err) {
      console.error('Error fetching saved connections:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSaved();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchSaved]);

  const handleDeleteSaved = async (id: string) => {
    if (!confirm('Eliminar esta conexion local?')) return;
    setError(null);
    setSuccess(null);
    try {
      await connectorAPI.deleteSaved(id);
      await fetchSaved();
      setSuccess('Conexion local eliminada. Sus credenciales ya no quedan disponibles en este Desktop.');
    } catch (err) {
      console.error('Error deleting connection:', err);
      setError(err instanceof Error ? err.message : 'Error eliminando la conexion.');
    }
  };

  const handleConnectSaved = async (saved: SavedConnection) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const savedConfig = {
        engine: saved.engine,
        host: saved.host,
        port: saved.port.toString(),
        username: saved.username || '',
        password: '',
        database: saved.database,
      };

      await generatorAPI.testConnection(savedConfig);
      setActiveConnection(savedConfig);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar a la base guardada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await generatorAPI.testConnection(config);
      await generatorAPI.getSchema(config);
      setActiveConnection(config);
      await fetchSaved();
      setSuccess('Conexion validada y guardada localmente. Ya puedes generar diagramas desde esta base.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar a la base de datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-950 dark:bg-[#0A0F1E] dark:text-white">
      <DashboardSidebar userName="Usuario Local" userAvatarUrl={null} />
      <main className="flex-1 overflow-auto">
        <div className="border-b border-slate-200 bg-white px-6 py-5 dark:border-[#1E2A45] dark:bg-[#111827]">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Conexiones</h1>
              <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Gestiona las bases locales que usaran los diagramas, skills y el MCP.</p>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-6 py-8">
          <form onSubmit={handleConnect} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1E2A45] dark:bg-[#111827]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Agregar conexion</h2>
                <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Las credenciales se cifran y quedan solo en esta maquina.</p>
              </div>
              <Server className="h-5 w-5 text-[#1A6CF6]" />
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-6">
              <label className="grid gap-1 lg:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-[#94A3B8]">Motor</span>
                <select
                  value={config.engine}
                  onChange={(e) => setConfig({ ...config, engine: e.target.value })}
                  className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="sqlserver">SQL Server</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="cassandra">Cassandra</option>
                  <option value="neo4j">Neo4j</option>
                </select>
              </label>
              <label className="grid gap-1 lg:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-[#94A3B8]">Host</span>
                <input
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
                  placeholder="localhost"
                  required
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-[#94A3B8]">Puerto</span>
                <input
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: e.target.value })}
                  className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
                  placeholder="5432"
                  required
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-[#94A3B8]">Base</span>
                <input
                  value={config.database}
                  onChange={(e) => setConfig({ ...config, database: e.target.value })}
                  className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
                  placeholder="fluxy_test"
                  required
                />
              </label>
              <label className="grid gap-1 lg:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-[#94A3B8]">Usuario</span>
                <input
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
                  placeholder="postgres"
                  required
                />
              </label>
              <label className="grid gap-1 lg:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-[#94A3B8]">Password</span>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322]"
                  placeholder="********"
                />
              </label>
              <div className="flex items-end lg:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1A6CF6] px-4 text-sm font-medium text-white transition hover:bg-[#1559d1] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                  Conectar y guardar
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Conexiones guardadas</h2>
                <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Selecciona una conexion para usarla en diagramas o herramientas agenticas.</p>
              </div>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-[#1E2A45] dark:text-[#94A3B8]">{savedConnections.length} locales</span>
            </div>

            {isLoadingSaved ? (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-[#1E2A45] dark:bg-[#111827] dark:text-[#94A3B8]">Cargando conexiones...</div>
            ) : savedConnections.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-[#1E2A45] dark:bg-[#111827]">
                <Plug className="mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm font-medium">Aun no hay conexiones guardadas.</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#94A3B8]">Agrega una arriba para empezar con diagramas desde una base real.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {savedConnections.map((conn) => (
                  <article key={conn.connection_id} className="group flex aspect-square flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#111827]">
                    <div>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1A6CF6] dark:bg-blue-500/10">
                          <Database className="h-5 w-5" />
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDeleteSaved(conn.connection_id)}
                          className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-500/10"
                          title="Eliminar conexion"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="line-clamp-2 text-sm font-semibold">{conn.alias || conn.database}</h3>
                      <p className="mt-2 text-xs uppercase tracking-wide text-slate-500 dark:text-[#94A3B8]">{conn.engine}</p>
                      <p className="mt-1 break-all text-xs text-slate-500 dark:text-[#94A3B8]">{conn.host_masked}:{conn.port}</p>
                      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-[#94A3B8]">Memoria DB: proposito, etapa, reglas de negocio y decisiones de tablas.</p>
                    </div>
                    <div className="mt-4 grid gap-2">
                      <button
                        type="button"
                        onClick={() => void handleConnectSaved(conn)}
                        disabled={isLoading}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-medium text-[#1A6CF6] transition hover:border-[#1A6CF6] dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        Usar para diagramas
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/agent-tools?tool=memory&scope=database&subject=${encodeURIComponent(conn.connection_id)}`)}
                        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 transition hover:border-[#1A6CF6] hover:text-[#1A6CF6] dark:border-[#1E2A45] dark:bg-[#0B1322] dark:text-[#CBD5E1]"
                      >
                        <Brain className="h-3.5 w-3.5" />
                        Memoria DB
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
