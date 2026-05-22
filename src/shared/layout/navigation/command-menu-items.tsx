'use client'

import { useCallback } from 'react'

import { CommandItem } from '@/shared/ui/command'

export function CommandMenuRouteItem({
  description,
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  onNavigate: (href: string) => void
}) {
  const handleSelect = useCallback(() => {
    onNavigate(href)
  }, [href, onNavigate])

  return (
    <CommandItem onSelect={handleSelect} className="gap-2">
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="min-w-0 max-w-[45%] truncate text-xs text-muted-foreground">{description}</span>
    </CommandItem>
  )
}

export function CommandMenuActionItem({
  children,
  icon: Icon,
  label,
  onSelect,
}: {
  children?: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  label: string
  onSelect: () => void
}) {
  const handleSelect = useCallback(() => {
    onSelect()
  }, [onSelect])

  return (
    <CommandItem onSelect={handleSelect} className="gap-2">
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">{label}</span>
      {children}
    </CommandItem>
  )
}
