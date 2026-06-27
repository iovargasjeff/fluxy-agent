'use client';

import { Download, DatabaseZap, FileText, FileCode2 } from 'lucide-react';

interface ExportPanelProps {
  onExport: (format: 'sql' | 'csv' | 'json') => void;
  onInsertDirectly: () => void;
  isExporting: boolean;
  isInserting: boolean;
  disabled: boolean;
}

export function ExportPanel({ onExport, onInsertDirectly, isExporting, isInserting, disabled }: ExportPanelProps) {
  
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Download className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-white">Exportar e Insertar</h2>
      </div>

      <p className="text-sm text-gray-400 mb-2">
        Genera los datos ficticios y expórtalos a tu computadora, o insértalos directamente en la base de datos conectada.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Options */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descargar Archivos</h3>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => onExport('sql')}
              disabled={disabled || isExporting || isInserting}
              className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileCode2 className="w-6 h-6 text-blue-400" />
              <span className="text-xs font-medium">SQL</span>
            </button>
            <button 
              onClick={() => onExport('json')}
              disabled={disabled || isExporting || isInserting}
              className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileJsonIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-xs font-medium">JSON</span>
            </button>
            <button 
              onClick={() => onExport('csv')}
              disabled={disabled || isExporting || isInserting}
              className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-6 h-6 text-green-400" />
              <span className="text-xs font-medium">CSV</span>
            </button>
          </div>
        </div>

        {/* Direct Insert */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Base de Datos</h3>
          <button 
            onClick={onInsertDirectly}
            disabled={disabled || isExporting || isInserting}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white p-4 rounded-lg flex items-center justify-center gap-3 transition-all h-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/20"
          >
            {isInserting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <DatabaseZap className="w-5 h-5" />
            )}
            <span className="font-semibold">Insertar Directamente</span>
          </button>
        </div>

      </div>
    </div>
  );
}

function FileJsonIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M15 18a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2" />
      <path d="M15 14a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2" />
      <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
    </svg>
  );
}
