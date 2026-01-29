import { FinanceDashboardSkeleton } from './components/finance-dashboard-skeleton'

/**
 * Finance page loading skeleton for streaming SSR.
 * Uses the same skeleton as the client-side Suspense fallback to avoid hydration mismatch.
 */
export default function FinanceLoading() {
  return <FinanceDashboardSkeleton />
}
