'use client'

import Link from 'next/link'
import { Download, Info } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { FadeInItem, FadeInStagger } from '@/components/ui/animate-in'

import type { MetricRecord, SummaryCard } from './types'

interface CrossChannelOverviewCardProps {
  summaryCards: SummaryCard[]
  processedMetrics: MetricRecord[]
  hasMetricData: boolean
  initialMetricsLoading: boolean
  metricsLoading: boolean
  viewTimeframe: number
  onViewTimeframeChange: (value: number) => void
  onExport: () => void
}

export function CrossChannelOverviewCard({
  summaryCards,
  processedMetrics,
  hasMetricData,
  initialMetricsLoading,
  metricsLoading,
  viewTimeframe,
  onViewTimeframeChange,
  onExport,
}: CrossChannelOverviewCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Cross-channel overview</CardTitle>
            <CardDescription>
              Key performance indicators from the latest successful sync.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={String(viewTimeframe)}
              onValueChange={(val) => onViewTimeframeChange(Number(val))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={onExport}
              disabled={!hasMetricData}
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {initialMetricsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : !hasMetricData ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
            <p>Connect an ad platform and run a sync to view aggregate performance.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="#connect-ad-platforms">Connect an account</Link>
            </Button>
          </div>
        ) : (
          <>
            <FadeInStagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => (
                <FadeInItem key={card.id}>
                  <Card className="border-muted/70 bg-background shadow-sm">
                    <CardContent className="space-y-2 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          {card.label}
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-muted-foreground/70" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{card.helper}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.helper}</p>
                    </CardContent>
                  </Card>
                </FadeInItem>
              ))}
            </FadeInStagger>

            <div className="h-[350px] w-full">
              <PerformanceChart metrics={processedMetrics} loading={metricsLoading} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
