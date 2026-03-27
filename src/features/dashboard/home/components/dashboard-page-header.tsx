'use client'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME, PAGE_TITLES, getIconContainerClasses, getStatCardClasses } from '@/lib/dashboard-theme'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import type { ReactNode } from 'react'

interface DashboardPageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconSize?: 'small' | 'medium' | 'large'
  badge?: {
    label: string
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  }
  actions?: ReactNode
  className?: string
}

export function DashboardPageHeader({
  title,
  description,
  icon: Icon,
  iconSize = 'medium',
  badge,
  actions,
  className,
}: DashboardPageHeaderProps) {
  return (
    <div className={cn(DASHBOARD_THEME.layout.header, className)}>
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={getIconContainerClasses(iconSize)}>
            <Icon className={cn(
              iconSize === 'small' && 'h-4 w-4',
              iconSize === 'medium' && 'h-6 w-6',
              iconSize === 'large' && 'h-8 w-8'
            )} />
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className={DASHBOARD_THEME.layout.title}>{title}</h1>
            {badge && (
              <Badge 
                variant="outline" 
                className={cn(
                  DASHBOARD_THEME.badges.base,
                  badge.variant === 'primary' && DASHBOARD_THEME.badges.primary,
                  badge.variant === 'success' && DASHBOARD_THEME.badges.success,
                  badge.variant === 'warning' && DASHBOARD_THEME.badges.warning,
                  badge.variant === 'destructive' && DASHBOARD_THEME.badges.destructive,
                  (!badge.variant || badge.variant === 'secondary') && DASHBOARD_THEME.badges.secondary
                )}
              >
                {badge.label}
              </Badge>
            )}
          </div>
          {description && (
            <p className={DASHBOARD_THEME.layout.subtitle}>{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  description?: string
  icon?: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ label, value, description, icon: Icon, variant = 'default', trend }: StatCardProps) {
  return (
    <div className={getStatCardClasses(variant)}>
      <div className="flex items-center gap-5 p-5">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={DASHBOARD_THEME.stats.label}>{label}</p>
          <p className={DASHBOARD_THEME.stats.value}>{value}</p>
          {description && (
            <p className={DASHBOARD_THEME.stats.description}>{description}</p>
          )}
          {trend && (
            <div className={cn(
              'text-xs font-medium mt-1',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatsGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
}

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }
  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {children}
    </div>
  )
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
      <Icon className="mx-auto h-12 w-12 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

export function ErrorState({ icon: Icon, title, description, action }: ErrorStateProps) {
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
      {Icon && <Icon className="mx-auto h-10 w-10 text-destructive/60" />}
      <p className="mt-2 text-sm font-medium text-destructive">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export { DASHBOARD_THEME, PAGE_TITLES }
