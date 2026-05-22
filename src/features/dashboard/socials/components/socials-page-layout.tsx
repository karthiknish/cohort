'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Facebook, Instagram, LineChart, Settings2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import type { SocialsSurfaceStatus } from './socials-state'
import { SurfaceTabStatusBadge } from './socials-surface-status'

type SocialsPageLayoutProps = {
  showSetup: boolean
  setupComplete: boolean
  connected: boolean
  setup: ReactNode
  performance: ReactNode
}

export function SocialsPageLayout({
  showSetup,
  setupComplete,
  connected,
  setup,
  performance,
}: SocialsPageLayoutProps) {
  const defaultMobileTab = connected && setupComplete ? 'performance' : 'setup'
  const [mobileTab, setMobileTab] = useState(defaultMobileTab)

  const setupSection = <SocialsSetupSection>{setup}</SocialsSetupSection>
  const performanceSection = <SocialsPerformanceSection>{performance}</SocialsPerformanceSection>

  if (!showSetup) {
    return <div className="space-y-6">{performanceSection}</div>
  }

  return (
    <>
      <Tabs value={mobileTab} onValueChange={setMobileTab} className="w-full lg:hidden">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted/40 p-1">
          <TabsTrigger value="performance" className="gap-1.5 rounded-lg text-xs sm:text-sm">
            <LineChart className="size-3.5 shrink-0" aria-hidden />
            Performance
          </TabsTrigger>
          <TabsTrigger value="setup" className="gap-1.5 rounded-lg text-xs sm:text-sm">
            <Settings2 className="size-3.5 shrink-0" aria-hidden />
            Connection
          </TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="mt-5 space-y-6 focus-visible:outline-none">
          {performanceSection}
        </TabsContent>
        <TabsContent value="setup" className="mt-5 focus-visible:outline-none">
          {setupSection}
        </TabsContent>
      </Tabs>

      <div className="hidden space-y-10 lg:block">
        {setupSection}
        {performanceSection}
      </div>
    </>
  )
}

function SocialsSetupSection({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Meta connection and page setup" className="space-y-5">
      <div className="space-y-1 border-b border-muted/40 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Workspace setup</p>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Connect & configure Meta</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Authorize organic Pages and Instagram profiles. This path is separate from paid ads in Ad Manager.
        </p>
      </div>
      {children}
    </section>
  )
}

function SocialsPerformanceSection({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Organic social performance" className="space-y-5">
      <div className="space-y-1 border-b border-muted/40 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Organic metrics</p>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Facebook & Instagram</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Compare reach, engagement, and follower signals across surfaces for the selected date range.
        </p>
      </div>
      {children}
    </section>
  )
}

export function SocialsSurfaceTabsList({
  facebookStatus,
  instagramStatus,
}: {
  facebookStatus: SocialsSurfaceStatus
  instagramStatus: SocialsSurfaceStatus
}) {
  const tabClass = useMemo(() => cn(DASHBOARD_THEME.tabs.trigger, 'gap-2 px-4'), [])

  return (
    <TabsList className={cn(DASHBOARD_THEME.tabs.list, 'h-auto w-full justify-start gap-1 rounded-xl p-1 sm:w-auto')}>
      <TabsTrigger value="facebook" className={tabClass}>
        <Facebook className="size-4 shrink-0 text-info" aria-hidden />
        Facebook
        <SurfaceTabStatusBadge status={facebookStatus} />
      </TabsTrigger>
      <TabsTrigger value="instagram" className={tabClass}>
        <Instagram className="size-4 shrink-0 text-accent" aria-hidden />
        Instagram
        <SurfaceTabStatusBadge status={instagramStatus} />
      </TabsTrigger>
    </TabsList>
  )
}
