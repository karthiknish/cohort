'use client'

import { Skeleton } from 'boneyard-js/react'

import { cn } from '@/lib/utils'

/** Registered bone names from `src/bones/*.bones.json` (see `boneyard:build`). */
export type BoneyardPageName =
  | 'dashboard-overview-page'
  | 'dashboard-analytics-page'
  | 'dashboard-meetings-page'
  | 'dashboard-tasks-page'
  | 'dashboard-collaboration-page'
  | 'dashboard-projects-page'
  | 'dashboard-proposals-page'
  | 'dashboard-clients-page'
  | 'dashboard-ads-page'
  | 'for-you-page'
  | 'marketing-home-page'
  | 'marketing-privacy-page'
  | 'marketing-terms-page'
  | 'auth-main-page'
  | 'auth-forgot-page'
  | 'auth-reset-page'

type BoneyardPageLoadingProps = {
  name: BoneyardPageName
  className?: string
  /** Stub height so ResizeObserver can resolve bones before content mounts. */
  minHeight?: string
}

/**
 * Next.js `loading.tsx` helper — shows pixel-matched boneyard bones for a route.
 * Import `@/bones/registry.js` in the root layout (already wired).
 */
export function BoneyardPageLoading({
  name,
  className,
  minHeight = 'min-h-[50vh]',
}: BoneyardPageLoadingProps) {
  return (
    <Skeleton name={name} loading animate className={cn('w-full', minHeight, className)}>
      <div className={cn('w-full', minHeight)} aria-hidden />
    </Skeleton>
  )
}
