'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Link as LinkIcon, AlertCircle, Trash2, Plug, Server } from 'lucide-react';
import { useConnectionStore } from '@/lib/store/useConnectionStore';
import { generatorAPI, connectorAPI, type SavedConnection } from '@/lib/api/client';

export default function ConnectPage() {
  const router = useRouter();
  const { setActiveConnection } = useConnectionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  const [config, setConfig] = useState({
    engine: 'postgresql',
    host: 'localhost',
    port: '5432',
    username: 'postgres',
    password: '',
    database: ''
  });

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    setIsLoadingSaved(true);
    try {
      const saved = await connectorAPI.listSaved();
      setSavedConnections(saved);
    } catch (err) {
      console.error('Error fetching saved connections:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta conexión?')) return;
    try {
      await connectorAPI.deleteSaved(id);
      await fetchSaved();
    } catch (err) {
      console.error('Error deleting connection:', err);
      alert('Error eliminando la conexión');
    }
  };

  const handleConnectSaved = async (saved: SavedConnection) => {
    setIsLoading(true);
    setError(null);
    try {
      const savedConfig = {
        engine: saved.engine,
        host: saved.host,
        port: saved.port.toString(),
        username: saved.username || '',
        password: '', // El backend auto-resolverá la contraseña porque está vacío
        database: saved.database
      };
      
      await generatorAPI.testConnection(savedConfig);
      setActiveConnection(savedConfig);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar a la base de datos guardada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await generatorAPI.testConnection(config);
      setActiveConnection(config);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar a la base de datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col md:flex-row items-start justify-center p-4 md:p-8 gap-8">
      
      {/* Panel Izquierdo: Conexiones Guardadas */}
      <div className="w-full md:w-1/3 max-w-md flex flex-col gap-4">
        <div className="bg-[#111827] border border-[#1E2A45] rounded-2xl shadow-2xl p-6 flex flex-col h-full min-h-[400px]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1E2A45]">
            <Server className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-bold text-white">Conexiones Guardadas</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
            {isLoadingSaved ? (
              <div className="flex items-center justify-center flex-1 text-gray-400">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : savedConnections.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                <Plug className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-sm text-gray-500">No hay conexiones guardadas.</p>
                <p className="text-xs text-gray-600 mt-1">Las nuevas conexiones se guardarán automáticamente aquí.</p>
              </div>
            ) : (
              savedConnections.map((conn) => (
                <div key={conn.connection_id} className="bg-[#0A0F1E] border border-[#1E2A45] rounded-xl p-4 flex flex-col gap-3 hover:border-blue-500/50 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{conn.alias || conn.database}</h3>
                      <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{conn.engine} • {conn.host_masked}:{conn.port}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteSaved(conn.connection_id)}
                      className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar conexión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleConnectSaved(conn)}
                    disabled={isLoading}
                    className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-medium py-2 rounded-lg border border-blue-500/20 hover:border-blue-500/50 transition-all flex justify-center items-center gap-2"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Usar esta conexión
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel Derecho: Nueva Conexión */}
      <div className="w-full md:w-2/3 max-w-lg bg-[#111827] border border-[#1E2A45] rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Nueva Conexión</h1>
          <p className="text-sm text-gray-400">
            Ingresa tus credenciales para conectar una nueva base de datos a Fluxy.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleConnect} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Motor de BD</label>
              <select 
                value={config.engine}
                onChange={(e) => setConfig({...config, engine: e.target.value})}
                className="w-full bg-[#0A0F1E] border border-[#1E2A45] rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlserver">SQL Server</option>
                <option value="mongodb">MongoDB</option>
                <option value="cassandra">Cassandra</option>
                <option value="neo4j">Neo4j</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Host</label>
              <input 
                type="text"
                value={config.host}
                onChange={(e) => setConfig({...config, host: e.target.value})}
                className="w-full bg-[#0A0F1E] border border-[#1E2A45] rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="localhost"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Puerto</label>
              <input 
                type="text"
                value={config.port}
                onChange={(e) => setConfig({...config, port: e.target.value})}
                className="w-full bg-[#0A0F1E] border border-[#1E2A45] rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="5432"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Base de Datos</label>
              <input 
                type="text"
                value={config.database}
                onChange={(e) => setConfig({...config, database: e.target.value})}
                className="w-full bg-[#0A0F1E] border border-[#1E2A45] rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="mi_base_de_datos"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Usuario</label>
              <input 
                type="text"
                value={config.username}
                onChange={(e) => setConfig({...config, username: e.target.value})}
                className="w-full bg-[#0A0F1E] border border-[#1E2A45] rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="postgres"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Contraseña</label>
              <input 
                type="password"
                value={config.password}
                onChange={(e) => setConfig({...config, password: e.target.value})}
                className="w-full bg-[#0A0F1E] border border-[#1E2A45] rounded-lg px-4 py-2.5 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <LinkIcon className="w-5 h-5" />
            )}
            Establecer Conexión
          </button>
        </form>
      </div>
    </div>
  );
}
