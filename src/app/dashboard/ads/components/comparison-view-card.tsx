'use client'

import { useMemo } from 'react'

import { usePersistedTab } from '@/hooks/use-persisted-tab'

import {
    ComparisonViewCardShell,
    ComparisonViewLoadingCard,
} from './comparison-view-card-sections'

import type { PeriodComparison, ProviderComparison } from '../hooks/use-metrics-comparison'

interface ComparisonViewCardProps {
    periodComparison: PeriodComparison | null
    providerComparison: ProviderComparison[]
    loading?: boolean
}

export function ComparisonViewCard({
    periodComparison,
    providerComparison,
    loading,
}: ComparisonViewCardProps) {
    const viewTabs = usePersistedTab({
        defaultValue: 'period',
        allowedValues: useMemo(() => ['period', 'platform'] as const, []),
        storageNamespace: 'dashboard:ads:comparison',
        syncToUrl: false,
    })

    return loading
        ? <ComparisonViewLoadingCard />
        : <ComparisonViewCardShell onTabChange={viewTabs.setValue} periodComparison={periodComparison} providerComparison={providerComparison} selectedTab={viewTabs.value} />
}
