'use client'

export type EditorMode = 'postgresql' | 'mysql' | 'sqlserver' | 'json'

interface ModeSelectorProps {
  mode: EditorMode
  onChange: (mode: EditorMode) => void
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  const options: { value: EditorMode; label: string }[] = [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'sqlserver', label: 'SQL Server' },
    { value: 'json', label: 'JSON' },
  ]

  return (
    <div className="flex items-center gap-1 bg-[#1E2A45] rounded p-0.5 ml-auto">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            mode === opt.value
              ? 'bg-[#1A6CF6] text-white'
              : 'text-[#6B7280] hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
