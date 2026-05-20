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
  newTaskDisabledReason?: string | null
}

export function TasksHeader({
  loading,
  retryCount,
  onRefresh,
  onNewTaskClick,
  scopeLabel,
  scopeHelper,
  newTaskDisabledReason = null,
}: TasksHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks</h1>
          {scopeLabel ? (
            <span className="text-sm text-muted-foreground">/ {scopeLabel}</span>
          ) : null}
        </div>
        {scopeHelper ? (
          <p className="max-w-xl text-sm text-muted-foreground">{scopeHelper}</p>
        ) : null}
        {retryCount > 0 ? (
          <p className="text-xs font-medium text-warning">
            Retrying… {retryCount}/{RETRY_CONFIG.maxRetries}
          </p>
        ) : null}
        {newTaskDisabledReason ? (
          <p className="text-xs text-warning" role="status">
            {newTaskDisabledReason}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={onRefresh}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden />
          )}
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              className={cn('h-8 gap-1.5 shadow-none')}
              onClick={onNewTaskClick}
              disabled={Boolean(newTaskDisabledReason)}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-balance">
            {newTaskDisabledReason ? (
              newTaskDisabledReason
            ) : (
              <span className="flex flex-wrap items-center gap-2">
                New task
                <KeyboardShortcutBadge combo="mod+n" className="scale-90" />
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
