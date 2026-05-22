'use client'

import { useState, type ReactNode } from 'react'
import { Link2, LineChart, Settings2 } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
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
      <div className="space-y-8">
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
        <TabsList className={ADS_PAGE_THEME.mobileTabs}>
          <TabsTrigger value="performance" className={ADS_PAGE_THEME.mobileTabTrigger}>
            <LineChart className="size-3.5 shrink-0" aria-hidden />
            Performance
          </TabsTrigger>
          <TabsTrigger value="setup" className={ADS_PAGE_THEME.mobileTabTrigger}>
            <Link2 className="size-3.5 shrink-0" aria-hidden />
            Accounts
            {connectedAccountCount > 0 ? (
              <span className="rounded-full bg-background px-1.5 py-0 text-[10px] font-semibold tabular-nums text-foreground shadow-sm">
                {connectedAccountCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="mt-5 space-y-8 focus-visible:outline-none">
          {renderAnalytics()}
          {renderAdvancedAnalytics ? (
            <AdsAdvancedAnalyticsCollapsible hasMetricData={hasMetricData}>
              {renderAdvancedAnalytics()}
            </AdsAdvancedAnalyticsCollapsible>
          ) : null}
        </TabsContent>
        <TabsContent value="setup" className="mt-5 focus-visible:outline-none">
          {setupBlock}
        </TabsContent>
      </Tabs>

      <div className="hidden space-y-10 lg:block">
        {setupBlock}
        {analyticsBlock}
      </div>
    </>
  )
}

function AdsSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="space-y-1 border-b border-border/50 pb-4">
      <p className={ADS_PAGE_THEME.sectionEyebrow}>{eyebrow}</p>
      <h2 className={ADS_PAGE_THEME.sectionTitle}>{title}</h2>
      <p className={ADS_PAGE_THEME.sectionDescription}>{description}</p>
    </div>
  )
}

export function AdsSetupSection({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Ad platform setup" className="space-y-6">
      <AdsSectionHeader
        eyebrow="Workspace setup"
        title="Accounts & campaigns"
        description="Connect platforms, finish account selection, and manage per-provider campaigns for the date range in the header."
      />
      <div className="space-y-6">{children}</div>
    </section>
  )
}

export function AdsAnalyticsSection({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Ad performance" className="space-y-6">
      <AdsSectionHeader
        eyebrow="Reporting"
        title="Cross-channel performance"
        description="Aggregate KPIs, provider breakdowns, algorithmic insights, and trend charts from your latest successful sync."
      />
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
    <Collapsible open={open} onOpenChange={setOpen} className={ADS_PAGE_THEME.advancedPanel}>
      <div className="flex items-center justify-between gap-3 p-4 sm:px-5">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold tracking-tight text-foreground">Advanced analytics</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Period comparisons, custom KPIs, formula builder, and raw metric rows.
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5 rounded-xl">
            <Settings2 className="size-3.5" aria-hidden />
            {open ? 'Hide' : 'Show'}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className={cn('space-y-6 border-t border-border/50 px-4 py-5 sm:px-5')}>
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
