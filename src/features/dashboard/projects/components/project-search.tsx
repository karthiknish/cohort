'use client'

import { useCallback, type ChangeEvent } from 'react'
import { Search, X } from 'lucide-react'

import { Input } from '@/shared/ui/input'

interface ProjectSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ProjectSearch({ value, onChange }: ProjectSearchProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
    [onChange]
  )

  const handleClear = useCallback(() => {
    onChange('')
  }, [onChange])

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="project-search"
        placeholder="Search projects…"
        value={value}
        onChange={handleChange}
        className="pl-9 pr-9"
        aria-label="Search projects"
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
