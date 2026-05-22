'use client'

import type { ReactNode } from 'react'

import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { QueryErrorAlert } from '@/shared/ui/query-error-alert'

type MeetingsPageShellBoundaryProps = {
  loading: boolean
  queryError: string | null
  children: ReactNode
}

export function MeetingsPageShellBoundary({ loading, queryError, children }: MeetingsPageShellBoundaryProps) {
  return (
    <BoneyardSkeletonBoundary name="dashboard-meetings-page" loading={loading}>
      {queryError ? <QueryErrorAlert error={queryError} title="Unable to load meetings" /> : null}
      {children}
    </BoneyardSkeletonBoundary>
  )
}
