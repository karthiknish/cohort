'use client'

import { useState, type ReactNode } from 'react'
import { BarChart3, Layers, Settings2 } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import { Button } from '@/shared/ui/button'

type CampaignPageLayoutProps = {
  renderPerformance: () => ReactNode
  renderControls: () => ReactNode
  renderCreatives: () => ReactNode
  renderAdvanced?: () => ReactNode
  creativesCount?: number
}

export function CampaignSection({
  title,
  description,
  eyebrow,
  children,
  className,
}: {
  title: string
  description?: string
  eyebrow?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn(ADS_PAGE_THEME.sectionBlock, className)}>
      <div className={ADS_PAGE_THEME.sectionHeader}>
        {eyebrow ? <p className={ADS_PAGE_THEME.sectionEyebrow}>{eyebrow}</p> : null}
        <h2 className={ADS_PAGE_THEME.sectionTitle}>{title}</h2>
        {description ? (
          <p className={cn(ADS_PAGE_THEME.sectionDescription, 'text-pretty')}>{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function CampaignAdvancedCollapsible({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={ADS_PAGE_THEME.advancedPanel}>
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold tracking-tight text-foreground">Advanced analytics</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Custom formulas and deeper recommendations for this campaign.
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5 rounded-xl">
            <Settings2 className="h-3.5 w-3.5" aria-hidden />
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

export function CampaignPageLayout({
  renderPerformance,
  renderControls,
  renderCreatives,
  renderAdvanced,
  creativesCount,
}: CampaignPageLayoutProps) {
  const [tab, setTab] = useState('performance')

  const performanceBlock = (
    <div className="space-y-8">
      {renderPerformance()}
      {renderAdvanced ? (
        <CampaignAdvancedCollapsible>{renderAdvanced()}</CampaignAdvancedCollapsible>
      ) : null}
    </div>
  )

  const controlsBlock = <div className="space-y-6">{renderControls()}</div>
  const creativesBlock = renderCreatives()

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className={ADS_PAGE_THEME.stickyTabBar}>
        <TabsList className={cn(ADS_PAGE_THEME.mobileTabs, 'max-w-2xl')}>
          <TabsTrigger value="performance" className={ADS_PAGE_THEME.mobileTabTrigger}>
            <BarChart3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Performance
          </TabsTrigger>
          <TabsTrigger value="controls" className={ADS_PAGE_THEME.mobileTabTrigger}>
            <Settings2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Settings
          </TabsTrigger>
          <TabsTrigger value="creatives" className={ADS_PAGE_THEME.mobileTabTrigger}>
            <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Creatives
            {typeof creativesCount === 'number' && creativesCount > 0 ? (
              <span className="rounded-full bg-background px-1.5 py-0 text-[10px] font-semibold tabular-nums text-foreground shadow-sm">
                {creativesCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="performance" className="mt-6 space-y-8 focus-visible:outline-none">
        {performanceBlock}
      </TabsContent>
      <TabsContent value="controls" className="mt-6 focus-visible:outline-none">
        {controlsBlock}
      </TabsContent>
      <TabsContent value="creatives" className="mt-6 focus-visible:outline-none">
        {creativesBlock}
      </TabsContent>
    </Tabs>
  )
}
