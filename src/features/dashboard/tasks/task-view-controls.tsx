'use client'

import { useCallback } from 'react'
import { Columns3, Download, List, LayoutGrid } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
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
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-border/70 bg-background text-foreground shadow-sm hover:bg-muted/40"
            onClick={onExport}
            disabled={!canExport}
            aria-label="Export to CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export to CSV</TooltipContent>
      </Tooltip>
      <div className="flex items-center rounded-full border border-border/70 bg-muted/40 p-1 shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-full',
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm hover:bg-background'
                  : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
              )}
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
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-full',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm hover:bg-background'
                  : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
              )}
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
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 rounded-full gap-1.5 px-3',
                viewMode === 'board'
                  ? 'bg-background text-foreground shadow-sm hover:bg-background'
                  : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
              )}
              onClick={handleBoardView}
              aria-label="Kanban view"
            >
              <Columns3 className="h-4 w-4" />
              <span className="hidden lg:inline">Kanban</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Kanban view (drag and drop)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
