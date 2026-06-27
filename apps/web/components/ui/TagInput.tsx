'use client'

import { useState, useRef } from 'react'

const TAG_COLORS = ['#1A6CF6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']

export function getTagColor(tag: string): string {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = ((h << 5) - h + tag.charCodeAt(i)) | 0
  return TAG_COLORS[Math.abs(h) % TAG_COLORS.length]
}

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 rounded-lg min-h-[42px] cursor-text"
      style={{ backgroundColor: '#111827', border: '1px solid #1E2A45' }}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map(tag => (
        <span
          key={tag}
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: getTagColor(tag) + '33',
            color: getTagColor(tag),
            border: `1px solid ${getTagColor(tag)}44`,
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter(t => t !== tag))}
            className="opacity-60 hover:opacity-100 leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault()
            const tag = input.trim().replace(/,/g, '')
            if (tag && !value.includes(tag) && value.length < 8) {
              onChange([...value, tag])
            }
            setInput('')
          }
          if (e.key === 'Backspace' && !input && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        placeholder={value.length === 0 ? (placeholder ?? 'Añadir tag... (Enter o coma)') : ''}
        className="flex-1 min-w-[140px] bg-transparent text-sm text-white outline-none placeholder-[#4B5563]"
      />
    </div>
  )
}
