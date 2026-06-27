'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { healthCheck, initApiClient } from '@/lib/api/client';
import { useConnectionStore } from '@/lib/store/useConnectionStore';

export function ClientInitProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [startupAttempt, setStartupAttempt] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { activeConnection } = useConnectionStore();

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
        setStartupError('El backend local no pudo iniciar. Revisa los logs de FluxSQL Desktop e intenta nuevamente.');
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [startupAttempt]);

  useEffect(() => {
    if (isReady) {
      if (!activeConnection && pathname !== '/connect') {
        router.push('/connect');
      } else if (activeConnection && pathname === '/connect') {
        router.push('/dashboard');
      }
    }
  }, [isReady, activeConnection, pathname, router]);

  if (startupError) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-6 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/25 bg-[#111827] p-6 text-center shadow-2xl">
          <h1 className="text-lg font-semibold">No se pudo iniciar FluxSQL Desktop</h1>
          <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{startupError}</p>
          <button
            type="button"
            onClick={() => setStartupAttempt((attempt) => attempt + 1)}
            className="mt-5 rounded-lg bg-[#1A6CF6] px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!isReady || (!activeConnection && pathname !== '/connect')) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-500 font-medium">Iniciando entorno local...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
