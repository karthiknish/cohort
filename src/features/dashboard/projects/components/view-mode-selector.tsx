'use client'

import { useCallback } from 'react'
import { ChartGantt, Columns3, LayoutGrid, List } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import type { ViewMode } from './utils'

interface ViewModeSelectorProps {
  viewMode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeSelector({ viewMode, onChange }: ViewModeSelectorProps) {
  const handleListView = useCallback(() => onChange('list'), [onChange])
  const handleGridView = useCallback(() => onChange('grid'), [onChange])
  const handleBoardView = useCallback(() => onChange('board'), [onChange])
  const handleGanttView = useCallback(() => onChange('gantt'), [onChange])

  return (
    <div className="flex items-center rounded-md border bg-background p-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={handleListView}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>List view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={handleGridView}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Grid view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === 'board' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={handleBoardView}
            aria-label="Kanban view"
          >
            <Columns3 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Kanban view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === 'gantt' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={handleGanttView}
            aria-label="Gantt view"
          >
            <ChartGantt className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Gantt view</TooltipContent>
      </Tooltip>
    </div>
  )
}
