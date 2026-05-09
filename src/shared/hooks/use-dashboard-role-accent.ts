'use client'

import { useMemo } from 'react'

import type { AuthRole } from '@/services/auth/types'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'

export type DashboardRoleAccentKey = AuthRole | 'preview' | 'unknown'

export type DashboardRoleAccent = {
  key: DashboardRoleAccentKey
  /** Left edge of the sidebar (role signal at a glance). */
  sidebarClass: string
  /** Thin strip rendered under the dashboard header. */
  headerStripClass: string
  /** Top border + optional wash on the scrollable main column. */
  mainFrameClass: string
  /** Classes for the account role badge (header + menus). */
  accountBadgeClass: string
  /** Short line for mobile drawer / tooltips. */
  shellCaption: string
}

export function useDashboardRoleAccent(): DashboardRoleAccent {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()

  return useMemo(() => {
    if (isPreviewMode) {
      return {
        key: 'preview',
        sidebarClass: 'border-l-[3px] border-l-warning',
        headerStripClass:
          'h-[3px] w-full shrink-0 bg-linear-to-r from-warning via-warning/55 to-transparent',
        mainFrameClass: 'border-t-2 border-t-warning/30 bg-linear-to-b from-warning/8 to-transparent',
        accountBadgeClass:
          'border border-warning/40 bg-warning/12 text-warning-foreground font-semibold',
        shellCaption: 'Sample data · safe to explore · actions are read-only',
      }
    }

    const role = user?.role ?? null
    switch (role) {
      case 'admin':
        return {
          key: 'admin',
          sidebarClass: 'border-l-[3px] border-l-primary',
          headerStripClass:
            'h-[3px] w-full shrink-0 bg-linear-to-r from-primary via-primary/65 to-transparent',
          mainFrameClass: 'border-t-2 border-t-primary/25 bg-linear-to-b from-primary/5 to-transparent',
          accountBadgeClass:
            'border border-accent/35 bg-accent/12 text-primary font-semibold shadow-sm',
          shellCaption: 'Administrator · full workspace access',
        }
      case 'team':
        return {
          key: 'team',
          sidebarClass: 'border-l-[3px] border-l-info',
          headerStripClass:
            'h-[3px] w-full shrink-0 bg-linear-to-r from-info via-info/55 to-transparent',
          mainFrameClass: 'border-t-2 border-t-info/30 bg-linear-to-b from-info/6 to-transparent',
          accountBadgeClass:
            'border border-info/40 bg-info/10 text-info font-semibold',
          shellCaption: 'Agency team · delivery & collaboration view',
        }
      case 'client':
        return {
          key: 'client',
          sidebarClass: 'border-l-[3px] border-l-success',
          headerStripClass:
            'h-[3px] w-full shrink-0 bg-linear-to-r from-success via-success/55 to-transparent',
          mainFrameClass: 'border-t-2 border-t-success/25 bg-linear-to-b from-success/5 to-transparent',
          accountBadgeClass:
            'border border-success/40 bg-success/10 text-success font-semibold',
          shellCaption: 'Client workspace · your projects & approvals',
        }
      default:
        return {
          key: 'unknown',
          sidebarClass: 'border-l-[3px] border-l-muted-foreground/35',
          headerStripClass: 'h-[3px] w-full shrink-0 bg-muted-foreground/35',
          mainFrameClass: '',
          accountBadgeClass: 'border border-muted-foreground/25 bg-muted/40 font-medium',
          shellCaption: 'Workspace',
        }
    }
  }, [isPreviewMode, user?.role])
}
