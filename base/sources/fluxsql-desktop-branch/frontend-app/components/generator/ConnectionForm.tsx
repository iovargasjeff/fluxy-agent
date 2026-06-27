'use client';

import { useState } from 'react';
import { Database, Play } from 'lucide-react';

interface ConnectionFormProps {
  onConnect: (config: any) => Promise<void>;
  isLoading: boolean;
}

export function ConnectionForm({ onConnect, isLoading }: ConnectionFormProps) {
  const [config, setConfig] = useState({
    engine: 'postgresql',
    host: 'localhost',
    port: '5432',
    username: 'postgres',
    password: '',
    database: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(config);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-white">Conexión a Base de Datos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Motor</label>
          <select 
            value={config.engine}
            onChange={(e) => setConfig({...config, engine: e.target.value})}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
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
          <label className="block text-sm font-medium text-gray-400 mb-1">Host</label>
          <input 
            type="text"
            value={config.host}
            onChange={(e) => setConfig({...config, host: e.target.value})}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="localhost"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Puerto</label>
          <input 
            type="text"
            value={config.port}
            onChange={(e) => setConfig({...config, port: e.target.value})}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="5432"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Base de Datos</label>
          <input 
            type="text"
            value={config.database}
            onChange={(e) => setConfig({...config, database: e.target.value})}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="mi_base_de_datos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Usuario</label>
          <input 
            type="text"
            value={config.username}
            onChange={(e) => setConfig({...config, username: e.target.value})}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="postgres"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
          <input 
            type="password"
            value={config.password}
            onChange={(e) => setConfig({...config, password: e.target.value})}
            className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Play className="w-4 h-4" />
          )}
          Probar Conexión y Obtener Esquema
        </button>
      </div>
    </form>
  );
}
