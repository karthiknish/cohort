'use client'

import { useMemo } from 'react'
import {
  ProposalMetricsGrid,
  ProposalMetricsLoadingGrid,
} from './proposal-metrics-sections'
import type { ProposalDraft } from '@/types/proposals'
import type { ProposalMetricStat } from './proposal-metrics-sections'

interface ProposalMetricsProps {
  proposals: ProposalDraft[]
  isLoading?: boolean
}

function getDefaultStats() {
  return [
    {
      label: 'Total Proposals',
      value: '0',
      description: 'Drafts and submitted',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Ready for Pitch',
      value: '0',
      description: 'Generated decks',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Sent to Clients',
      value: '0',
      description: 'Awaiting approval',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Pipeline Value',
      value: '$0',
      description: 'Estimated total',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
  ] satisfies ProposalMetricStat[]
}

export function ProposalMetrics({ proposals, isLoading = false }: ProposalMetricsProps) {
  const stats = useMemo<ProposalMetricStat[]>(() => {
    // Early return if proposals is not a valid array
    if (!proposals || !Array.isArray(proposals)) {
      return getDefaultStats()
    }

    try {
      // Filter out null/undefined proposals or those with missing formData
      const validProposals = proposals.filter(
        (p): p is ProposalDraft => p != null && typeof p === 'object'
      )
      
      const total = validProposals.length
      const ready = validProposals.filter((p) => p.status === 'ready').length
      const sent = validProposals.filter((p) => p.status === 'sent').length
      
      // Estimate total value from proposalSize strings (e.g., "$10k - $25k")
      let totalValue = 0
      for (const p of validProposals) {
        try {
          const sizeStr = p?.formData?.value?.proposalSize
          if (typeof sizeStr !== 'string' || !sizeStr) continue

          const upperValueMatch = sizeStr.match(/\$(\d+)(?:k|m)?/g)
          if (upperValueMatch && upperValueMatch.length > 0) {
            const values = upperValueMatch.map((v) => {
              const num = parseInt(v.replace(/[^0-9]/g, ''), 10)
              if (v.toLowerCase().includes('m')) return num * 1000000
              if (v.toLowerCase().includes('k')) return num * 1000
              return num
            })
            totalValue += Math.max(...values)
          }
        } catch {
          // Skip this proposal if there is an issue
        }
      }

      const formatValue = (val: number) => {
        if (typeof val !== 'number' || Number.isNaN(val)) return '$0'
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}m`
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`
        return `$${val}`
      }

      return [
        {
          label: 'Total Proposals',
          value: total.toString(),
          description: 'Drafts and submitted',
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
        },
        {
          label: 'Ready for Pitch',
          value: ready.toString(),
          description: 'Generated decks',
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
        },
        {
          label: 'Sent to Clients',
          value: sent.toString(),
          description: 'Awaiting approval',
          color: 'text-purple-500',
          bg: 'bg-purple-500/10',
        },
        {
          label: 'Pipeline Value',
          value: formatValue(totalValue),
          description: 'Estimated total',
          color: 'text-orange-500',
          bg: 'bg-orange-500/10',
        },
      ]
    } catch (error) {
      console.error('[ProposalMetrics] Error calculating stats:', error)
      return getDefaultStats()
    }
  }, [proposals])

  // Safe length check
  const proposalCount = Array.isArray(proposals) ? proposals.length : 0

  if (isLoading && proposalCount === 0) {
    return <ProposalMetricsLoadingGrid />
  }

  return <ProposalMetricsGrid stats={stats} />
}
