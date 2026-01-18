'use client'

import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'

interface ProjectSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ProjectSearch({ value, onChange }: ProjectSearchProps) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="project-search"
        placeholder="Search projects..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
        aria-label="Search projects"
      />
    </div>
  )
}
