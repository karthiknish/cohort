'use client'

import { Suspense, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

import { DashboardSkeleton } from '@/features/dashboard/home/components/dashboard-skeleton'
import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { useClientContext } from '@/shared/contexts/client-context'

import { useProposalsPageContent } from './hooks/use-proposals-page-content'

function ProposalsPageContent() {
  const clientIdParam = useSearchParams().get('clientId')
  const { selectClient } = useClientContext()
  const syncedClientIdParamRef = useRef<string | null>(null)

  if (clientIdParam && syncedClientIdParamRef.current !== clientIdParam) {
    syncedClientIdParamRef.current = clientIdParam
    selectClient(clientIdParam)
  }

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
