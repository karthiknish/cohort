'use client'

import Link from 'next/link'
import { BarChart3, Briefcase, FileText, LayoutGrid, ListChecks, Megaphone, Users } from 'lucide-react'

import type { AgentContextChip, AgentDashboardShortcut } from '@/lib/agent-context'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

const SHORTCUT_ICONS = {
  tasks: ListChecks,
  projects: Briefcase,
  analytics: BarChart3,
  ads: Megaphone,
  proposals: FileText,
  clients: Users,
  meetings: LayoutGrid,
} as const

type AgentContextBannerProps = {
  chips: AgentContextChip[]
  shortcuts: AgentDashboardShortcut[]
  disabled?: boolean
  onShortcutPrompt: (prompt: string) => void
}

export function AgentContextBanner({ chips, shortcuts, disabled, onShortcutPrompt }: AgentContextBannerProps) {
  if (chips.length === 0 && shortcuts.length === 0) {
    return null
  }

  return (
    <div className="shrink-0 space-y-2 border-b bg-muted/20 px-4 py-2.5">
      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">Context</span>
          {chips.map((chip) =>
            chip.href ? (
              <Badge key={chip.id} variant="secondary" className="rounded-full font-normal" asChild>
                <Link href={chip.href}>{chip.label}</Link>
              </Badge>
            ) : (
              <Badge key={chip.id} variant="secondary" className="rounded-full font-normal">
                {chip.label}
              </Badge>
            ),
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {shortcuts.map((shortcut) => {
          const Icon =
            shortcut.icon && shortcut.icon in SHORTCUT_ICONS
              ? SHORTCUT_ICONS[shortcut.icon]
              : null
          return (
            <Button
              key={shortcut.id}
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className={cn('h-7 gap-1.5 rounded-full px-2.5 text-xs')}
              onClick={() => onShortcutPrompt(shortcut.prompt)}
            >
              {Icon ? <Icon className="h-3 w-3" aria-hidden /> : null}
              {shortcut.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
