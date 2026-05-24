'use client'

import type { ReactNode } from 'react'

import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary'
import { MeetingsPageSkeleton } from './meetings-page-skeleton'
import { QueryErrorAlert } from '@/shared/ui/query-error-alert'

type MeetingsPageShellBoundaryProps = {
  loading: boolean
  queryError: string | null
  children: ReactNode
}

export function MeetingsPageShellBoundary({ loading, queryError, children }: MeetingsPageShellBoundaryProps) {
  return (
    <PageSkeletonBoundary loading={loading} loadingContent={<MeetingsPageSkeleton />}>
      {queryError ? <QueryErrorAlert error={queryError} title="Unable to load meetings" /> : null}
      {children}
    </PageSkeletonBoundary>
  )
}
