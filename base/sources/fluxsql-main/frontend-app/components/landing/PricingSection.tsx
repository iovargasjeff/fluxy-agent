import { Check, GitFork } from 'lucide-react'

const GITHUB_URL = 'https://github.com/UPT-FAING-EPIS/proyecto-si783-2026-i-u1-generador-de-diagramas-de-base'

const planFeatures = [
  'Proyectos ilimitados',
  'Colaboradores ilimitados',
  'Control de versiones (commits)',
  'Exportar a PNG, SVG y Mermaid',
  'Links públicos de solo lectura',
  'Monaco Editor integrado',
  'Soporte para PostgreSQL DDL',
  '100% código abierto',
]

export function PricingSection() {
  return (
    <section className="py-20 px-4 bg-[#0A0F1E]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <p className="text-[#1A6CF6] text-sm font-medium uppercase tracking-wider mb-3">Precios</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Gratis para siempre</h2>
        <p className="text-[#9CA3AF] text-lg mb-12 max-w-xl mx-auto">
          FluxSQL es un proyecto open source construido por estudiantes para estudiantes.
          Sin trials. Sin tarjeta de crédito.
        </p>

        {/* Pricing card */}
        <div
          className="max-w-md mx-auto bg-[#111827] rounded-2xl p-8 shadow-xl"
          style={{ border: '2px solid #1A6CF6' }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 text-[#1A6CF6] text-xs font-medium px-3 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: 'rgba(26,108,246,0.1)' }}
          >
            ✦ Plan Estudiante
          </div>

          {/* Price */}
          <div className="mb-8">
            <span className="text-6xl font-bold text-white">S/ 0</span>
            <span className="text-[#6B7280] text-lg ml-2">/ siempre</span>
          </div>

          {/* Features list */}
          <ul className="flex flex-col gap-3 mb-8 text-left">
            {planFeatures.map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-[#9CA3AF] text-sm">
                <Check size={16} className="text-[#10B981] flex-shrink-0" />
                {feat}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <a
              href="/register"
              className="w-full py-3 bg-[#1A6CF6] hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center block"
            >
              Crear cuenta gratis
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 text-[#9CA3AF] font-medium rounded-lg transition-colors text-center flex items-center justify-center gap-2 hover:text-white"
              style={{ border: '1px solid #1E2A45' }}
            >
              <GitFork size={16} />
              Contribuir en GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
