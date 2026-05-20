'use client'

import { useState, type ReactNode } from 'react'
import { BarChart3, Layers, Settings2 } from 'lucide-react'

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
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-5', className)}>
      <div className="space-y-1 border-b border-muted/40 pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground text-pretty">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function CampaignAdvancedCollapsible({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border border-border/60 bg-card/40">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Advanced analytics</p>
          <p className="text-xs text-muted-foreground">
            Custom formulas and algorithmic recommendations for this campaign.
          </p>
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
      <div className="sticky top-0 z-10 -mx-6 border-b border-muted/40 bg-background/90 px-6 py-3 backdrop-blur-md supports-backdrop-filter:bg-background/75">
        <TabsList className="grid h-auto w-full max-w-xl grid-cols-3 gap-1 p-1">
          <TabsTrigger value="performance" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3.5 w-3.5 shrink-0" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="controls" className="gap-1.5 text-xs sm:text-sm">
            <Settings2 className="h-3.5 w-3.5 shrink-0" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="creatives" className="gap-1.5 text-xs sm:text-sm">
            <Layers className="h-3.5 w-3.5 shrink-0" />
            Creatives
            {typeof creativesCount === 'number' && creativesCount > 0 ? (
              <span className="rounded-full bg-muted px-1.5 py-0 text-[10px] font-medium tabular-nums">
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
