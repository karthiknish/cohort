'use client'

import { Plus, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { RETRY_CONFIG } from './task-types'

export type TasksHeaderProps = {
  loading: boolean
  retryCount: number
  onRefresh: () => void
  onNewTaskClick: () => void
}

export function TasksHeader({
  loading,
  retryCount,
  onRefresh,
  onNewTaskClick,
}: TasksHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Task management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and track assignments across teams and clients.
          {retryCount > 0 && (
            <span className="ml-2 text-amber-600">
              (Retrying... attempt {retryCount}/{RETRY_CONFIG.maxRetries})
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh tasks"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh tasks</TooltipContent>
        </Tooltip>
        <Button onClick={onNewTaskClick}>
          <Plus className="mr-2 h-4 w-4" /> New task
        </Button>
      </div>
    </div>
  )
}
