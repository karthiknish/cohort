'use client'

import { useCallback } from 'react'
import { ChartGantt, Columns3, LayoutGrid, List } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import type { ViewMode } from './utils'
import { PROJECTS_THEME } from './projects-theme'

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: typeof List }[] = [
  { mode: 'list', label: 'List', icon: List },
  { mode: 'grid', label: 'Grid', icon: LayoutGrid },
  { mode: 'board', label: 'Board', icon: Columns3 },
  { mode: 'gantt', label: 'Timeline', icon: ChartGantt },
]

interface ViewModeSelectorProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeSelector({ viewMode, onChange }: ViewModeSelectorProps) {
  return (
    <fieldset className={cn(PROJECTS_THEME.segmented, 'm-0 min-w-0 border-0 p-0')} aria-label="Project view mode">
      {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
        <ViewModeButton
          key={mode}
          mode={mode}
          active={viewMode === mode}
          label={label}
          icon={Icon}
          onChange={onChange}
        />
      ))}
    </fieldset>
  )
}

function ViewModeButton({
  mode,
  active,
  label,
  icon: Icon,
  onChange,
}: {
  mode: ViewMode
  active: boolean
  label: string
  icon: typeof List
  onChange: (mode: ViewMode) => void
}) {
  const onSelectViewMode = useCallback(() => onChange(mode), [mode, onChange])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={PROJECTS_THEME.segmentedItem(active)}
          onClick={onSelectViewMode}
          aria-label={label}
          aria-pressed={active}
        >
          <Icon className="size-3.5" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label} view</TooltipContent>
    </Tooltip>
  )
}
