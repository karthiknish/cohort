'use client'

import { useCallback } from 'react'
import { Columns3, Download, List, LayoutGrid } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'

export type TaskViewControlsProps = {
  viewMode: 'list' | 'grid' | 'board'
  onViewModeChange: (mode: 'list' | 'grid' | 'board') => void
  onExport: () => void
  canExport: boolean
}

export function TaskViewControls({
  viewMode,
  onViewModeChange,
  onExport,
  canExport,
}: TaskViewControlsProps) {
  const handleListView = useCallback(() => {
    onViewModeChange('list')
  }, [onViewModeChange])

  const handleGridView = useCallback(() => {
    onViewModeChange('grid')
  }, [onViewModeChange])

  const handleBoardView = useCallback(() => {
    onViewModeChange('board')
  }, [onViewModeChange])

  return (
    <div className="flex items-center gap-1">
      <ViewToggleButton
        active={viewMode === 'list'}
        label="List"
        onClick={handleListView}
        icon={List}
      />
      <ViewToggleButton
        active={viewMode === 'grid'}
        label="Grid"
        onClick={handleGridView}
        icon={LayoutGrid}
      />
      <ViewToggleButton
        active={viewMode === 'board'}
        label="Board"
        onClick={handleBoardView}
        icon={Columns3}
      />
      <span className="mx-1 h-4 w-px bg-border" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs text-muted-foreground"
        onClick={onExport}
        disabled={!canExport}
        aria-label="Export to CSV"
      >
        <Download className="h-3.5 w-3.5" />
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
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-7 gap-1 px-2 text-xs font-normal',
        active ? 'bg-muted text-foreground' : 'text-muted-foreground',
      )}
      onClick={onClick}
      aria-label={`${label} view`}
      aria-pressed={active}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
