'use client';

import { Play, Code2 } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface QueryEditorProps {
  query: string;
  onChange: (value: string | undefined) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

export function QueryEditor({ query, onChange, onAnalyze, isAnalyzing, disabled }: QueryEditorProps) {
  
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-white">Consulta SQL</h2>
        </div>
        <button 
          onClick={onAnalyze}
          disabled={disabled || isAnalyzing || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Play className="w-4 h-4" />
          )}
          Analizar
        </button>
      </div>

      <div className="flex-1 relative">
        {!disabled && (
          <Editor
            height="100%"
            defaultLanguage="sql"
            theme="vs-dark"
            value={query}
            onChange={onChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbersMinChars: 3
            }}
          />
        )}
        {disabled && (
          <div className="absolute inset-0 bg-gray-950/80 flex items-center justify-center z-10 text-gray-500">
            Conéctate a una base de datos primero.
          </div>
        )}
      </div>
    </div>
  );
}
