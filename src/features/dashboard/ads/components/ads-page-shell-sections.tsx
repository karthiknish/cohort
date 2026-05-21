'use client'

import { useState, type ReactNode } from 'react'
import { Link2, LineChart, Settings2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Button } from '@/shared/ui/button'

type AdsPageLayoutProps = {
  renderSetup: () => ReactNode
  renderAnalytics: () => ReactNode
  renderAdvancedAnalytics?: () => ReactNode
  showSetup: boolean
  connectedAccountCount: number
  hasPendingSetup?: boolean
  hasMetricData?: boolean
}

export function AdsPageLayout({
  renderSetup,
  renderAnalytics,
  renderAdvancedAnalytics,
  showSetup,
  connectedAccountCount,
  hasPendingSetup = false,
  hasMetricData = false,
}: AdsPageLayoutProps) {
  const defaultTab =
    connectedAccountCount > 0 && !hasPendingSetup ? 'performance' : 'setup'
  const [mobileTab, setMobileTab] = useState(defaultTab)

  if (!showSetup) {
    return (
      <div className="space-y-6">
        {renderAnalytics()}
        {renderAdvancedAnalytics ? (
          <AdsAdvancedAnalyticsCollapsible hasMetricData={hasMetricData}>
            {renderAdvancedAnalytics()}
          </AdsAdvancedAnalyticsCollapsible>
        ) : null}
      </div>
    )
  }

  const setupBlock = <AdsSetupSection>{renderSetup()}</AdsSetupSection>
  const analyticsBlock = (
    <>
      <AdsAnalyticsSection>{renderAnalytics()}</AdsAnalyticsSection>
      {renderAdvancedAnalytics ? (
        <AdsAdvancedAnalyticsCollapsible hasMetricData={hasMetricData}>
          {renderAdvancedAnalytics()}
        </AdsAdvancedAnalyticsCollapsible>
      ) : null}
    </>
  )

  return (
    <>
      <Tabs value={mobileTab} onValueChange={setMobileTab} className="w-full lg:hidden">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1">
          <TabsTrigger value="performance" className="gap-1.5 text-xs sm:text-sm">
            <LineChart className="h-3.5 w-3.5 shrink-0" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="setup" className="gap-1.5 text-xs sm:text-sm">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            Accounts
            {connectedAccountCount > 0 ? (
              <span className="rounded-full bg-muted px-1.5 py-0 text-[10px] font-medium tabular-nums">
                {connectedAccountCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="mt-4 space-y-6 focus-visible:outline-none">
          {renderAnalytics()}
          {renderAdvancedAnalytics ? (
            <AdsAdvancedAnalyticsCollapsible hasMetricData={hasMetricData}>
              {renderAdvancedAnalytics()}
            </AdsAdvancedAnalyticsCollapsible>
          ) : null}
        </TabsContent>
        <TabsContent value="setup" className="mt-4 focus-visible:outline-none">
          {setupBlock}
        </TabsContent>
      </Tabs>

      <div className="hidden space-y-8 lg:block">
        {setupBlock}
        {analyticsBlock}
      </div>
    </>
  )
}

export function AdsSetupSection({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Ad platform setup" className="space-y-6">
      <div className="space-y-1 border-b border-muted/40 pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Accounts & campaigns</h2>
        <p className="text-sm text-muted-foreground">
          Connect platforms, finish account setup, and manage campaigns for the selected date range.
        </p>
      </div>
      {children}
    </section>
  )
}

export function AdsAnalyticsSection({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Ad performance" className="space-y-6">
      <div className="space-y-1 border-b border-muted/40 pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Performance</h2>
        <p className="text-sm text-muted-foreground">Cross-channel metrics, insights, and trends.</p>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

function AdsAdvancedAnalyticsCollapsible({
  children,
  hasMetricData,
}: {
  children: ReactNode
  hasMetricData: boolean
}) {
  const [open, setOpen] = useState(hasMetricData)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border border-border/60 bg-card/40">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Advanced analytics</p>
          <p className="text-xs text-muted-foreground">Comparisons, custom KPIs, formulas, and raw metric rows.</p>
        </div>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            {open ? 'Hide' : 'Show'}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className={cn('space-y-6 border-t border-muted/40 px-4 py-5 sm:px-5')}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

/** @deprecated Use AdsSetupSection — kept for imports during migration */
export const AdsAccountsPanel = AdsSetupSection

/** @deprecated Use AdsAnalyticsSection */
export const AdsPerformancePanel = AdsAnalyticsSection

/** @deprecated Use AdsPageLayout */
export const AdsPageWorkspace = AdsPageLayout
