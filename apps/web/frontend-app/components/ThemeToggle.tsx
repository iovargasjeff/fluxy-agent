'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useMounted } from '@/hooks/useMounted'

export function ThemeToggle() {
  const mounted = useMounted()
  const { theme, setTheme } = useTheme()

  if (!mounted) return <div className="w-8 h-8" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg text-slate-500 hover:text-[#1A6CF6] hover:bg-blue-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#1E2A45] transition-colors"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
