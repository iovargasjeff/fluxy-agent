export function getRelativeDate(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'ayer'
  if (diffDays < 7) return `hace ${diffDays} días`
  if (diffDays < 14) return 'hace 1 semana'
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`
  if (diffDays < 60) return 'hace 1 mes'
  return `hace ${Math.floor(diffDays / 30)} meses`
}
