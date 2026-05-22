'use client'

import { Suspense, useMemo } from 'react'

import { DashboardSkeleton } from '@/features/dashboard/home/components/dashboard-skeleton'
import { PageMotionShell } from '@/shared/components/page-motion-shell'

import { useProposalsPageContent } from './hooks/use-proposals-page-content'

function ProposalsPageContent() {
  return useProposalsPageContent()
}

export default function ProposalsPage() {
  const dashboardSkeleton = useMemo(() => <DashboardSkeleton />, [])

  return (
    <PageMotionShell reveal={false}>
      <Suspense fallback={dashboardSkeleton}>
        <ProposalsPageContent />
      </Suspense>
    </PageMotionShell>
  )
}
