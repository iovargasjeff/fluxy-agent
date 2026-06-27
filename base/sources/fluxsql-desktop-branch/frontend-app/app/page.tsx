'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0A0F1E] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <div className="text-center">
          <p className="text-sm font-semibold text-blue-400">Iniciando FluxSQL Local</p>
          <p className="mt-1 text-xs text-[#94A3B8]">Preparando el entorno de escritorio...</p>
        </div>
      </div>
    </main>
  );
}
