'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Badge } from '@/shared/ui/badge'

export type AdminPageShellProps = {
  title: string
  description?: ReactNode
  /** Toolbar on the right (buttons, dialogs triggers, etc.) */
  actions?: ReactNode
  children: ReactNode
  className?: string
  /** Extra classes on the page header block */
  headerClassName?: string
  isPreviewMode?: boolean
}

/**
 * Shared admin page chrome: eyebrow, title, optional preview badge, description, actions, then main content.
 */
export function AdminPageShell({
  title,
  description,
  actions,
  children,
  className,
  headerClassName,
  isPreviewMode,
}: AdminPageShellProps) {
  return (
    <div className={cn('w-full space-y-8', className)}>
      <header
        className={cn(
          'flex flex-col gap-4 border-b border-border/60 pb-8 sm:flex-row sm:items-start sm:justify-between',
          headerClassName,
        )}
      >
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Administration
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {isPreviewMode ? (
              <Badge
                variant="secondary"
                className="shrink-0 text-[10px] font-semibold uppercase tracking-wider"
              >
                Preview
              </Badge>
            ) : null}
          </div>
          {description ? (
            <div className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-relaxed">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
        ) : null}
      </header>
      <div className="space-y-8">{children}</div>
    </div>
  )
}
