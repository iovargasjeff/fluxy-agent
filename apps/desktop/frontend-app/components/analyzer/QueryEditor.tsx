'use client';

import { Play, Code2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface QueryEditorProps {
  query: string;
  onChange: (value: string | undefined) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

export function QueryEditor({ query, onChange, onAnalyze, isAnalyzing, disabled }: QueryEditorProps) {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Consulta SQL</h2>
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
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
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
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 text-slate-500 dark:bg-gray-950/80 dark:text-gray-500">
            Conéctate a una base de datos primero.
          </div>
        )}
      </div>
    </div>
  );
}
