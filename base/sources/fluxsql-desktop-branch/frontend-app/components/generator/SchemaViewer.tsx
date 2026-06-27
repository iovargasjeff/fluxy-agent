'use client';

import { CheckSquare, Eye, Square, TableProperties } from 'lucide-react';

interface TableSchema {
  name: string;
  rowCount: number;
}

interface SchemaViewerProps {
  tables: TableSchema[];
  selectedTables: string[];
  onToggleTable: (tableName: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRowCountChange: (tableName: string, count: number) => void;
  onListRows?: (tableName: string) => void;
  listingTable?: string | null;
}

export function SchemaViewer({ 
  tables, 
  selectedTables, 
  onToggleTable, 
  onSelectAll, 
  onDeselectAll,
  onRowCountChange,
  onListRows,
  listingTable,
}: SchemaViewerProps) {
  
  if (tables.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col items-center justify-center text-gray-500 h-64">
        <TableProperties className="w-12 h-12 mb-4 opacity-20" />
        <p>Conéctate a una base de datos para ver el esquema.</p>
      </div>
    );
  }

  const allSelected = tables.length > 0 && selectedTables.length === tables.length;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TableProperties className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-white">Esquema Detectado</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            {allSelected ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
          </button>
        </div>
      </div>

      <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-3 w-12 text-center">
                <button onClick={allSelected ? onDeselectAll : onSelectAll}>
                  {allSelected ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Tabla</th>
              <th className="px-4 py-3 font-medium w-48">Filas a generar</th>
              {onListRows && <th className="px-4 py-3 font-medium w-36">Datos actuales</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {tables.map((table) => {
              const isSelected = selectedTables.includes(table.name);
              return (
                <tr key={table.name} className={`hover:bg-gray-800/50 transition-colors ${isSelected ? 'bg-blue-900/10' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => onToggleTable(table.name)}>
                      {isSelected ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-200">
                    {table.name}
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      min="0"
                      max="100000"
                      disabled={!isSelected}
                      value={table.rowCount}
                      onChange={(e) => onRowCountChange(table.name, parseInt(e.target.value) || 0)}
                      className={`w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white focus:border-blue-500 focus:outline-none ${!isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </td>
                  {onListRows && <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onListRows(table.name)}
                      disabled={listingTable === table.name}
                      className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/20 disabled:opacity-50"
                    >
                      {listingTable === table.name
                        ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
                        : <Eye className="h-3.5 w-3.5" />}
                      Listar datos
                    </button>
                  </td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
