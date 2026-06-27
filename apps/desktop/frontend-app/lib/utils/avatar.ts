export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

export function getAvatarColor(name: string | null | undefined): string {
  const colors = ['#1A6CF6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']
  if (!name) {
    return colors[0]
  }
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
