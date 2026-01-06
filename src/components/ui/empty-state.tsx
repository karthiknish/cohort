'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { LucideIcon, Inbox, FileSearch, Users, FolderOpen, CircleAlert, Plus } from 'lucide-react'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'card' | 'inline'
}

const iconMap: Record<string, LucideIcon> = {
  inbox: Inbox,
  search: FileSearch,
  users: Users,
  folder: FolderOpen,
  alert: CircleAlert,
}

export function EmptyState({
  className,
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  ...props
}: EmptyStateProps) {
  const ActionIcon = action?.icon || Plus

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4',
          className
        )}
        {...props}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{description}</p>
          )}
        </div>
        {action && (
          <Button onClick={action.onClick} size="sm" variant="outline">
            <ActionIcon className="mr-1.5 h-3.5 w-3.5" />
            {action.label}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'card' && 'rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10',
        variant === 'default' ? 'py-12 px-4' : 'p-8',
        className
      )}
      {...props}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/80 ring-4 ring-muted/40 mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-5 flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick} size="sm">
              <ActionIcon className="mr-1.5 h-4 w-4" />
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} size="sm" variant="ghost">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Preset empty states for common use cases
export function NoDataEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={Inbox}
      title="No data available"
      description="Data will appear here once it's been added."
      {...props}
    />
  )
}

export function NoResultsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={FileSearch}
      title="No results found"
      description="Try adjusting your search or filter criteria."
      {...props}
    />
  )
}

export function NoAccessEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={CircleAlert}
      title="Access restricted"
      description="You don't have permission to view this content."
      {...props}
    />
  )
}

export { iconMap as emptyStateIcons }
