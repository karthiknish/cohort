'use client'

import { useCallback } from 'react'
import { ChartGantt, Columns3, LayoutGrid, List } from 'lucide-react'

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
    <div className={PROJECTS_THEME.segmented} role="group" aria-label="Project view mode">
      {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
        <ViewModeButton
          key={mode}
          active={viewMode === mode}
          label={label}
          icon={Icon}
          onClick={() => onChange(mode)}
        />
      ))}
    </div>
  )
}

function ViewModeButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: typeof List
  onClick: () => void
}) {
  const handleClick = useCallback(() => onClick(), [onClick])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={PROJECTS_THEME.segmentedItem(active)}
          onClick={handleClick}
          aria-label={label}
          aria-pressed={active}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{label} view</TooltipContent>
    </Tooltip>
  )
}
