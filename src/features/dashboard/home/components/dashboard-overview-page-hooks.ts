import { useMemo } from 'react'

import type { SummaryStat } from '@/types/dashboard'

export function useDashboardDisplayStats(orderedStats: SummaryStat[]): SummaryStat[] {
  return useMemo(
    () =>
      orderedStats.map((stat) => ({
        ...stat,
        href: undefined,
        featureLabel: undefined,
      })),
    [orderedStats],
  )
}
