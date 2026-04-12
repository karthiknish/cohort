'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { useDashboardRoleAccent } from '@/shared/hooks/use-dashboard-role-accent'

type DashboardMainRoleFrameProps = {
  children: ReactNode
}

/**
 * Wraps dashboard main scroll content with a subtle role-colored top treatment
 * so pages feel visually anchored to the signed-in role (admin / team / client).
 */
export function DashboardMainRoleFrame({ children }: DashboardMainRoleFrameProps) {
  const accent = useDashboardRoleAccent()

  return (
    <div
      className={cn('space-y-6 px-6 py-6', accent.mainFrameClass)}
      data-dashboard-role={accent.key}
    >
      {children}
    </div>
  )
}
