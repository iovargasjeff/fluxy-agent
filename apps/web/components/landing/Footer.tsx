import Link from 'next/link';
import { Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0A0F1C] pt-16 md:pt-20 overflow-hidden relative border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-y-10 gap-x-12 mb-10 md:mb-16 relative z-10">
        
        <div className="md:col-span-2 flex flex-col items-start">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-[#1A6CF6]/20 rounded-xl">
              <Database className="w-6 h-6 text-[#1A6CF6]" />
            </div>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-8">
            Fluxy, para una forma más intencional de trabajar en equipo y diseñar bases de datos.
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <span className="sr-only">X (Twitter)</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <span className="sr-only">YouTube</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M21.582 6.186a2.506 2.506 0 00-1.762-1.766C18.265 4 12 4 12 4s-6.265 0-7.82.42a2.506 2.506 0 00-1.762 1.766C2 7.74 2 12 2 12s0 4.26.418 5.814a2.506 2.506 0 001.762 1.766C5.735 20 12 20 12 20s6.265 0 7.82-.42a2.506 2.506 0 001.762-1.766C22 16.26 22 12 22 12s0-4.26-.418-5.814zm-11.83 8.78V8.922L16.223 12l-6.471 2.966z" />
              </svg>
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 text-[10px] tracking-wider uppercase mb-6">Producto</h4>
          <ul className="space-y-4 text-sm font-medium text-slate-400">
            <li><Link href="#caracteristicas" className="hover:text-white transition-colors">Características</Link></li>
            <li><Link href="#precios" className="hover:text-white transition-colors">Precios</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Integraciones</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 text-[10px] tracking-wider uppercase mb-6">Recursos</h4>
          <ul className="space-y-4 text-sm font-medium text-slate-400">
            <li><Link href="#docs" className="hover:text-white transition-colors">Documentación</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Centro de ayuda</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Guías</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Comunidad</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 text-[10px] tracking-wider uppercase mb-6">Empresa</h4>
          <ul className="space-y-4 text-sm font-medium text-slate-400">
            <li><Link href="#" className="hover:text-white transition-colors">Acerca de</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Prensa</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Contacto</Link></li>
            <li>
              <Link href="#" className="hover:text-white transition-colors flex items-center gap-2">
                Trabaja con nosotros
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#1A6CF6]/20 text-[#1A6CF6]">NEW</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Giant Typography at the bottom - Premium Watermark Style */}
      <div className="w-full flex justify-center mt-12 md:mt-20 relative pointer-events-none select-none">
        <h1 className="text-[28vw] md:text-[25vw] font-black leading-[0.75] bg-clip-text text-transparent bg-gradient-to-b from-white/[0.06] to-transparent tracking-tighter text-center whitespace-nowrap translate-y-[46%]">
          FLUXSQL
        </h1>
      </div>
    </footer>
  );
}
