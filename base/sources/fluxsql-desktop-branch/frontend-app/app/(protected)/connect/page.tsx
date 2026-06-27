'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useConnectionStore } from '@/lib/store/useConnectionStore';
import { generatorAPI } from '@/lib/api/client';

export default function ConnectPage() {
  const router = useRouter();
  const { setActiveConnection } = useConnectionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [config, setConfig] = useState({
    engine: 'postgresql',
    host: 'localhost',
    port: '5432',
    username: 'postgres',
    password: '',
    database: ''
  });

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Intentar validar la conexión usando el sidecar
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
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] border border-[#1E2A45] rounded-2xl shadow-2xl p-8">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Conectar a Base de Datos</h1>
          <p className="text-sm text-gray-400">
            Ingresa tus credenciales para comenzar a usar las herramientas de FluxSQL.
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
