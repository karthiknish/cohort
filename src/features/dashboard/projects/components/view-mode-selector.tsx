'use client'

import { ChartGantt, Columns3, LayoutGrid, List } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import type { ViewMode } from './utils'

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: typeof List }[] = [
  { mode: 'list', label: 'List view', icon: List },
  { mode: 'grid', label: 'Grid view', icon: LayoutGrid },
  { mode: 'board', label: 'Board view', icon: Columns3 },
  { mode: 'gantt', label: 'Timeline view', icon: ChartGantt },
]

interface ViewModeSelectorProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeSelector({ viewMode, onChange }: ViewModeSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value) => {
        if (value === 'list' || value === 'grid' || value === 'board' || value === 'gantt') {
          onChange(value)
        }
      }}
      variant="outline"
      size="sm"
      className="rounded-lg border border-border/60 bg-background p-0.5"
      aria-label="Project view mode"
    >
      {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
        <Tooltip key={mode}>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value={mode}
              aria-label={label}
              className="h-8 w-8 rounded-md px-0 data-[state=on]:bg-accent/15 data-[state=on]:text-primary"
            >
              <Icon className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  )
}
