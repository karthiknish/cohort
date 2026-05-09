'use client'

import Link from 'next/link'
import { Headphones, ShieldCheck, Sparkles, TimerReset } from 'lucide-react'

import { HOME_HERO_BRAND_ORDER, PlatformLogoStrip } from '@/features/marketing/home/components/platform-brand-logos'
import { FadeIn } from '@/shared/ui/animate-in'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/lib/utils'

const PROOF_POINTS = [
  {
    title: 'Guided onboarding',
    description: 'New modules ship with preview states first so teams can shape the workflow before persistence decisions get locked in.',
    icon: Sparkles,
    wellClass: 'bg-info/10 text-info',
  },
  {
    title: 'Operational support',
    description: 'Operations modules sit beside chat and delivery so teams keep context in one workspace.',
    icon: Headphones,
    wellClass: 'bg-muted/70 text-foreground',
  },
  {
    title: 'Audit visibility',
    description: 'Time, scheduling, and request flows are framed around reviewability, not just task completion.',
    icon: ShieldCheck,
    wellClass: 'bg-success/10 text-success',
  },
  {
    title: 'Fast rollout path',
    description: 'The new routes are intentionally scaffolded for a low-risk transition into live Convex-backed workflows.',
    icon: TimerReset,
    wellClass: 'bg-warning/10 text-warning',
  },
] as const

export function SupportProofSection() {
  return (
    <section className="relative overflow-hidden bg-muted/25 px-6 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(from_var(--foreground)_r_g_b_/_0.06),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <FadeIn className="mb-8 max-w-3xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Support and rollout</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The expansion is designed to be supportable, reviewable, and easy to phase in
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            This is not a cosmetic feature dump. The new layers are structured so teams can adopt them module by module and operationalize them without disrupting the agency core.
          </p>
        </FadeIn>

        <FadeIn className="mb-12">
          <div className="rounded-2xl border border-border/60 bg-background/80 px-5 py-5 shadow-sm backdrop-blur-sm sm:px-8 sm:py-6">
            <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-left">
              Same platform depth you expect
            </p>
            <PlatformLogoStrip brands={HOME_HERO_BRAND_ORDER} variant="plain" className="justify-center sm:justify-start" />
          </div>
        </FadeIn>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF_POINTS.map((point) => (
            <FadeIn key={point.title}>
              <Card
                className={cn(
                  'h-full border-border/60 bg-background/90 transition-all duration-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                  'hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/[0.06]',
                )}
              >
                <CardHeader className="space-y-4 pb-2">
                  <div className={cn('w-fit rounded-2xl p-3', point.wellClass)}>
                    <point.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg leading-snug sm:text-xl">{point.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-6 text-muted-foreground">{point.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-12">
          <div className="flex flex-col gap-6 rounded-[2rem] border border-border/60 bg-gradient-to-br from-muted/40 via-background to-muted/25 p-6 shadow-inner sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8">
            <div className="min-w-0 space-y-2">
              <p className="text-lg font-semibold leading-snug text-foreground sm:text-xl">
                Start with the operational layer, then wire the rest behind it.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Time, scheduling, and forms create the strongest foundation for everything that follows, including live ad accounts.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="rounded-xl shadow-md">
                <Link href="/dashboard/time">Open operations</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-border/80 bg-background/80">
                <Link href="/dashboard/ads">View Ads</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
