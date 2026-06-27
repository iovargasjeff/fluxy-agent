'use client'
import { useState, useEffect } from 'react'
import { X, ArrowRight } from 'lucide-react'

const STORAGE_KEY = 'dbcanvas_has_seen_tutorial'

const STEPS = [
  {
    title: '1. Pega tu SQL aquí',
    description: 'Escribe o pega cualquier CREATE TABLE en este editor. El diagrama ER se genera automáticamente al instante.',
  },
  {
    title: '2. Tu diagrama aparece aquí',
    description: 'Cada tabla SQL se convierte en un nodo visual. Las llaves foráneas crean conexiones entre tablas automáticamente.',
  },
  {
    title: '3. Usa la barra de herramientas',
    description: 'Guarda versiones con Commit, comparte con un link público o exporta el diagrama como PNG con un clic.',
  },
]

export function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) {
        const timer = setTimeout(() => setVisible(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage no disponible
    }
  }, [])

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  function handleClose() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // localStorage no disponible
    }
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(1px)' }}
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm rounded-xl p-6 shadow-2xl"
          style={{
            backgroundColor: '#111827',
            border: '1px solid rgba(26,108,246,0.4)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-white font-semibold text-base leading-snug pr-4">
              {current.title}
            </h3>
            <button
              onClick={handleClose}
              className="text-[#6B7280] hover:text-white transition-colors flex-shrink-0 mt-0.5"
              aria-label="Cerrar tutorial"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: '#9CA3AF' }}>
            {current.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{ backgroundColor: i === step ? '#1A6CF6' : '#1E2A45' }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: '#6B7280' }}
              >
                Saltar
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: '#1A6CF6' }}
              >
                {step < STEPS.length - 1 ? (
                  <>Siguiente <ArrowRight size={14} /></>
                ) : (
                  '¡Entendido!'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
