'use client'

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
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-slate-200/80 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={onExport}
            disabled={!canExport}
            aria-label="Export to CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export to CSV</TooltipContent>
      </Tooltip>
      <div className="flex items-center rounded-full border border-slate-200/80 bg-slate-100/85 p-1 shadow-sm">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-full',
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm hover:bg-white'
                  : 'text-slate-500 hover:bg-white/75 hover:text-slate-900'
              )}
              onClick={() => onViewModeChange('list')}
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
                  ? 'bg-white text-slate-900 shadow-sm hover:bg-white'
                  : 'text-slate-500 hover:bg-white/75 hover:text-slate-900'
              )}
              onClick={() => onViewModeChange('grid')}
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
                  ? 'bg-white text-slate-900 shadow-sm hover:bg-white'
                  : 'text-slate-500 hover:bg-white/75 hover:text-slate-900'
              )}
              onClick={() => onViewModeChange('board')}
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
