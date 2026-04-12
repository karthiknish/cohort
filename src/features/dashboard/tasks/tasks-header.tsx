'use client'

import { LoaderCircle, Plus, RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts'
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
    <div className="flex flex-col gap-6 border-b border-border/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Tasks</h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Plan work, filter by status or assignee, and switch between list, grid, and Kanban.
          {retryCount > 0 ? (
            <span className="ml-2 font-medium text-warning">
              Retrying… {retryCount}/{RETRY_CONFIG.maxRetries}
            </span>
          ) : null}
        </p>
        {scopeLabel ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{scopeLabel}</span>
            {scopeHelper ? <span> · {scopeHelper}</span> : null}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex gap-2"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
              Refresh
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reload tasks from the server</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="sm" onClick={onNewTaskClick} className="inline-flex gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              New task
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            <span>Create a task</span>
            <KeyboardShortcutBadge combo="mod+n" className="scale-90" />
          </TooltipContent>
        </Tooltip>
        <p className={cn('hidden text-xs text-muted-foreground lg:flex lg:items-center lg:gap-1.5')}>
          <KeyboardShortcutBadge combo="mod+k" className="scale-90" />
          <span>search</span>
        </p>
      </div>
    </div>
  )
}
