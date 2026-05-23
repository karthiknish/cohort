'use client'

import type { ElementType, ReactNode } from 'react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

type DashboardPageHeroProps = {
  children: ReactNode
  className?: string
  innerClassName?: string
  glowClassName?: string
  as?: ElementType
}

export function DashboardPageHero({
  children,
  className,
  innerClassName,
  glowClassName,
  as: Component = 'header',
}: DashboardPageHeroProps) {
  return (
    <Component className={cn(DASHBOARD_THEME.pageHero, className)}>
      <div className={cn(DASHBOARD_THEME.pageHeroGlow, glowClassName)} aria-hidden />
      <div className={cn(DASHBOARD_THEME.pageHeroInner, innerClassName)}>{children}</div>
    </Component>
  )
}
