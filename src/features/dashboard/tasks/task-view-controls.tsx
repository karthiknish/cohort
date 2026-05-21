'use client'

import { useCallback } from 'react'
import { Columns3, Download, List, LayoutGrid } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { TASKS_THEME } from './tasks-theme'

export type TaskViewControlsProps = {
  viewMode: 'list' | 'grid' | 'board'
  onViewModeChange: (mode: 'list' | 'grid' | 'board') => void
  onExport: () => void
  canExport: boolean
}

const VIEW_OPTIONS = [
  { mode: 'list' as const, label: 'List', icon: List },
  { mode: 'grid' as const, label: 'Grid', icon: LayoutGrid },
  { mode: 'board' as const, label: 'Board', icon: Columns3 },
]

export function TaskViewControls({
  viewMode,
  onViewModeChange,
  onExport,
  canExport,
}: TaskViewControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className={TASKS_THEME.segmented} role="group" aria-label="View mode">
        {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
          <ViewToggleButton
            key={mode}
            active={viewMode === mode}
            label={label}
            icon={Icon}
            onClick={() => onViewModeChange(mode)}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 border-border/60 bg-background/80 text-xs shadow-sm"
        onClick={onExport}
        disabled={!canExport}
        aria-label="Export tasks to CSV"
      >
        <Download className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Export</span>
      </Button>
    </div>
  )
}

function ViewToggleButton({
  active,
  label,
  onClick,
  icon: Icon,
}: {
  active: boolean
  label: string
  onClick: () => void
  icon: typeof List
}) {
  const handleClick = useCallback(() => {
    onClick()
  }, [onClick])

  return (
    <button
      type="button"
      className={TASKS_THEME.segmentedButton(active)}
      onClick={handleClick}
      aria-label={`${label} view`}
      aria-pressed={active}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
