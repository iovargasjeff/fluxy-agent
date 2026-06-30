'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { healthCheck, initApiClient } from '@/lib/api/client';
import { useConnectionStore } from '@/lib/store/useConnectionStore';
import { Cloud, Monitor, Sparkles } from 'lucide-react';

export function ClientInitProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [startupAttempt, setStartupAttempt] = useState(0);
  const [desktopMode, setDesktopMode] = useState<'local' | 'cloud' | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { activeConnection } = useConnectionStore();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedMode = window.localStorage.getItem('fluxy-desktop-mode');
      if (savedMode === 'local' || savedMode === 'cloud') {
        setDesktopMode(savedMode);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    if (isReady && desktopMode === 'cloud' && !activeConnection && pathname !== '/connect') {
      router.push('/connect');
    }
  }, [isReady, activeConnection, desktopMode, pathname, router]);

  function chooseMode(mode: 'local' | 'cloud') {
    window.localStorage.setItem('fluxy-desktop-mode', mode);
    setDesktopMode(mode);
    if (mode === 'cloud') {
      window.open('http://localhost:3000/login', '_blank', 'noopener,noreferrer');
      router.push('/connect');
    } else {
      router.push('/dashboard');
    }
  }

  if (startupError) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-6 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/25 bg-[#111827] p-6 text-center shadow-2xl">
          <h1 className="text-lg font-semibold">No se pudo iniciar Fluxy Desktop</h1>
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

  if (!desktopMode) {
    return (
      <div className="min-h-screen bg-white px-6 py-10 text-slate-950 dark:bg-[#0A0F1E] dark:text-white">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col justify-center">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1A6CF6] text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Fluxy Desktop</h1>
              <p className="text-sm text-slate-500 dark:text-[#94A3B8]">Elige como quieres trabajar en este equipo.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => chooseMode('local')}
              className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#1A6CF6] hover:shadow-md dark:border-[#1E2A45] dark:bg-[#111827]"
            >
              <Monitor className="mb-4 h-7 w-7 text-[#1A6CF6]" />
              <h2 className="text-lg font-semibold">Usar sin iniciar sesion</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-[#94A3B8]">
                Mantiene conexiones y credenciales solo en local. Puedes usar skills, analisis y generacion agentica sin sincronizar.
              </p>
            </button>

            <button
              type="button"
              onClick={() => chooseMode('cloud')}
              className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#1A6CF6] hover:shadow-md dark:border-[#1E2A45] dark:bg-[#111827]"
            >
              <Cloud className="mb-4 h-7 w-7 text-[#1A6CF6]" />
              <h2 className="text-lg font-semibold">Iniciar sesion y sincronizar</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-[#94A3B8]">
                Abre Fluxy Web para autenticarte. Este modo queda reservado para sincronizar diagramas, presencia y colaboracion en tiempo real.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
