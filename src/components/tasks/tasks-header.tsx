'use client'

import { Plus, LoaderCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { RETRY_CONFIG } from './task-types'

export type TasksHeaderProps = {
  loading: boolean
  retryCount: number
  onRefresh: () => void
  onNewTaskClick: () => void
  scopeLabel?: string | null
  scopeHelper?: string | null
}

export function TasksHeader({
  loading,
  retryCount,
  onRefresh,
  onNewTaskClick,
  scopeLabel,
  scopeHelper,
}: TasksHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
        <p className="text-base text-muted-foreground max-w-2xl">
          Manage and track assignments across teams and clients.
          {retryCount > 0 && (
            <span className="ml-2 text-amber-600">
              (Retrying… {retryCount}/{RETRY_CONFIG.maxRetries})
            </span>
          )}
        </p>
        {scopeLabel ? (
          <p className="text-xs text-muted-foreground">
            Viewing: <span className="font-medium text-foreground">{scopeLabel}</span>
            {scopeHelper ? <span className="text-muted-foreground"> · {scopeHelper}</span> : null}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh tasks</TooltipContent>
          </Tooltip>
          <Button onClick={onNewTaskClick} className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New task
          </Button>
        </div>
      </div>
    </div>
  )
}
