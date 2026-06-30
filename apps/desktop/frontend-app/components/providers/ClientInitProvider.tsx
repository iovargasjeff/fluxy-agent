'use client';

import { useEffect, useState } from 'react';
import { healthCheck, initApiClient } from '@/lib/api/client';

export function ClientInitProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [startupAttempt, setStartupAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      setIsReady(false);
      setStartupError(null);
      await initApiClient();

      const deadline = Date.now() + 20_000;
      while (!cancelled && Date.now() < deadline) {
        try {
          await healthCheck();
          if (!cancelled) setIsReady(true);
          return;
        } catch {
          await new Promise((resolve) => window.setTimeout(resolve, 350));
        }
      }

      if (!cancelled) {
        setStartupError('El backend local no pudo iniciar. Revisa los logs de Fluxy Desktop e intenta nuevamente.');
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [startupAttempt]);

  if (startupError) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0F1E] flex items-center justify-center px-6 text-slate-950 dark:text-white">
        <div className="max-w-md rounded-lg border border-red-500/25 bg-white p-6 text-center shadow-2xl dark:bg-[#111827]">
          <h1 className="text-lg font-semibold">No se pudo iniciar Fluxy Desktop</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-[#94A3B8]">{startupError}</p>
          <button
            type="button"
            onClick={() => setStartupAttempt((attempt) => attempt + 1)}
            className="mt-5 rounded-lg bg-[#1A6CF6] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0F1E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-500 font-medium">Iniciando entorno local...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
