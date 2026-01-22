"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { ProposalDraft } from "@/types/proposals"

interface ProposalMetricsProps {
  proposals: ProposalDraft[]
  isLoading?: boolean
}

function getDefaultStats() {
  return [
    {
      label: "Total Proposals",
      value: "0",
      description: "Drafts and submitted",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Ready for Pitch",
      value: "0",
      description: "Generated decks",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Sent to Clients",
      value: "0",
      description: "Awaiting approval",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Pipeline Value",
      value: "$0",
      description: "Estimated total",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ]
}

export function ProposalMetrics({ proposals, isLoading = false }: ProposalMetricsProps) {
  const stats = useMemo(() => {
    // Early return if proposals is not a valid array
    if (!proposals || !Array.isArray(proposals)) {
      return getDefaultStats()
    }

    try {
      // Filter out any null/undefined proposals or those with missing formData
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
            const values = upperValueMatch.map(v => {
              const num = parseInt(v.replace(/[^0-9]/g, ""))
              if (v.toLowerCase().includes('m')) return num * 1000000
              if (v.toLowerCase().includes('k')) return num * 1000
              return num
            })
            totalValue += Math.max(...values)
          }
        } catch {
          // Skip this proposal if there's any issue
          continue
        }
      }

      const formatValue = (val: number) => {
        if (typeof val !== 'number' || isNaN(val)) return "$0"
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}m`
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`
        return `$${val}`
      }

      return [
        {
          label: "Total Proposals",
          value: total.toString(),
          description: "Drafts and submitted",
          color: "text-blue-500",
          bg: "bg-blue-500/10",
        },
        {
          label: "Ready for Pitch",
          value: ready.toString(),
          description: "Generated decks",
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        },
        {
          label: "Sent to Clients",
          value: sent.toString(),
          description: "Awaiting approval",
          color: "text-purple-500",
          bg: "bg-purple-500/10",
        },
        {
          label: "Pipeline Value",
          value: formatValue(totalValue),
          description: "Estimated total",
          color: "text-orange-500",
          bg: "bg-orange-500/10",
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
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse border-muted">
            <CardContent className="p-6">
              <div className="h-4 w-24 bg-muted rounded mb-2" />
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden border-muted/50 hover:border-primary/20 transition-colors duration-200">
          <CardContent className="p-6 relative">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
              </div>
              <p className="text-xs text-muted-foreground/80">{stat.description}</p>
            </div>

            {/* Subtle background glow */}
            <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-5 blur-2xl ${stat.bg}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
