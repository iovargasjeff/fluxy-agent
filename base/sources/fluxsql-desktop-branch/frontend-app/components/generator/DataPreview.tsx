'use client';

import { Eye, FileJson } from 'lucide-react';

interface DataPreviewProps {
  previewData: any | null;
  isLoading: boolean;
  onGeneratePreview: () => void;
  disabled: boolean;
}

export function DataPreview({ previewData, isLoading, onGeneratePreview, disabled }: DataPreviewProps) {
  
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-white">Vista Previa (10 registros)</h2>
        </div>
        <button 
          onClick={onGeneratePreview}
          disabled={disabled || isLoading}
          className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FileJson className="w-4 h-4" />
          )}
          Generar Preview
        </button>
      </div>

      <div className="bg-gray-950 rounded-lg border border-gray-800 overflow-hidden h-64 flex flex-col relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/80 z-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : null}
        
        {!previewData ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-6 text-center">
            Selecciona tablas y genera una vista previa para ver cómo lucirán tus datos ficticios.
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-xs text-green-400 font-mono">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
