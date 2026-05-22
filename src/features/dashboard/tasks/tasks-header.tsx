'use client'

import { ListTodo, LoaderCircle, Plus, RefreshCw } from 'lucide-react'

import {
  DASHBOARD_THEME,
  PAGE_TITLES,
  getButtonClasses,
  getIconContainerClasses,
} from '@/lib/dashboard-theme'
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
  const title = PAGE_TITLES.tasks?.title ?? 'Tasks'
  const description = PAGE_TITLES.tasks?.description ?? 'Track and manage work items across projects.'

  return (
    <header className={DASHBOARD_THEME.layout.header}>
      <div className="min-w-0 space-y-2">
        <div className="flex items-center gap-3">
          <div className={getIconContainerClasses('medium')}>
            <ListTodo className="size-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h1 className={DASHBOARD_THEME.layout.title}>{title}</h1>
              {scopeLabel ? (
                <span className="truncate text-sm font-medium text-muted-foreground">/ {scopeLabel}</span>
              ) : null}
            </div>
            <p className={cn(DASHBOARD_THEME.layout.subtitle, 'mt-1 max-w-2xl text-sm')}>
              {scopeHelper ?? description}
            </p>
          </div>
        </div>
        {retryCount > 0 ? (
          <p className="text-xs font-medium text-warning">
            Retrying… {retryCount}/{RETRY_CONFIG.maxRetries}
          </p>
        ) : null}
        {newTaskDisabledReason ? (
          <p className="max-w-2xl text-xs text-warning" role="status">
            {newTaskDisabledReason}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(getButtonClasses('outline'), 'h-9 gap-1.5')}
          onClick={onRefresh}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="size-4" aria-hidden />
          )}
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              className={cn(getButtonClasses('primary'), 'h-9 gap-1.5 shadow-none')}
              onClick={onNewTaskClick}
              disabled={Boolean(newTaskDisabledReason)}
            >
              <Plus className="size-4" aria-hidden />
              New task
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-balance">
            {newTaskDisabledReason ? (
              newTaskDisabledReason
            ) : (
              <span className="flex flex-wrap items-center gap-2">
                Create a task
                <KeyboardShortcutBadge combo="mod+n" className="scale-90" />
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
