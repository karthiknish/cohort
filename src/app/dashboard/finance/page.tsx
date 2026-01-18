'use client'

import { Suspense } from 'react'
import { FinanceDashboard } from './components/finance-dashboard'
import { FinanceDashboardSkeleton } from './components/finance-dashboard-skeleton'

export default function FinancePage() {
  return (
    <Suspense fallback={<FinanceDashboardSkeleton />}>
      <FinanceDashboard />
    </Suspense>
  )
}
