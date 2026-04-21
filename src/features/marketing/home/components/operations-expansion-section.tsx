'use client'

import Link from 'next/link'
import { ArrowUpRight, CalendarDays, Check, Clock3, MessageSquare } from 'lucide-react'

import { PlatformLogoStrip } from '@/features/marketing/home/components/platform-brand-logos'
import { FadeIn } from '@/shared/ui/animate-in'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/lib/utils'

const PAID_MEDIA_BRANDS = ['googleads', 'meta', 'linkedin', 'tiktok'] as const

const PILLARS = [
  {
    title: 'Operations layer',
    description: 'Add time tracking, scheduling, and checklists next to the delivery workflows your team already runs.',
    icon: Clock3,
    href: '/dashboard/time',
    badge: 'P0',
  },
  {
    title: 'Communication layer',
    description: 'Team chat and collaboration live next to delivery work.',
    icon: MessageSquare,
    href: '/dashboard/collaboration',
    badge: 'P1',
  },
  {
    title: 'People ops layer',
    description: 'Time off and availability alongside the rest of the workspace.',
    icon: CalendarDays,
    href: '/dashboard/time-off',
    badge: 'P2',
  },
] as const

const WHAT_CHANGED = [
  'Grouped dashboard navigation makes the new modules feel deliberate instead of bolted on.',
  'Every route ships with preview fixtures so the UX can be refined before backend wiring starts.',
  'Homepage messaging now acknowledges operations and people workflows without abandoning the agency thesis.',
] as const

const ROLLOUT_STEPS = [
  { step: '1', title: 'Time, scheduling, and forms', detail: 'Operational spine first' },
  { step: '2', title: 'Collaboration and messaging', detail: 'Team coordination' },
  { step: '3', title: 'Time off', detail: 'People workflows' },
] as const

export function OperationsExpansionSection() {
  return (
    <section className="relative border-y border-border/50 bg-gradient-to-b from-background via-muted/15 to-background px-6 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden />
      <div className="mx-auto max-w-6xl space-y-12">
        <FadeIn className="max-w-3xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/50">Expanded surface area</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cohorts now stretches beyond campaign delivery into day-to-day operations
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            The agency core stays intact. The new modules layer workforce operations, structured communication, and HR-lite workflows into the same workspace.
          </p>
        </FadeIn>

        <FadeIn>
          <div className="flex flex-col gap-5 rounded-[1.75rem] border border-border/60 bg-card/90 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
            <div className="min-w-0 space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/60">Campaign stack unchanged</p>
              <p className="text-sm font-medium leading-snug text-foreground sm:text-base">
                Same Google Ads, Meta, LinkedIn, and TikTok connectors — now sitting beside time, comms, and people ops.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:items-end">
              <PlatformLogoStrip brands={[...PAID_MEDIA_BRANDS]} variant="plain" className="justify-start sm:justify-end" />
              <Link
                href="/dashboard/ads"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Open Ads workspace
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </div>
          </div>
        </FadeIn>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <FadeIn>
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card p-6 text-foreground shadow-xl shadow-primary/[0.07] sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/6 blur-2xl" aria-hidden />
              <div className="relative space-y-5">
                <Badge className="border-primary/25 bg-primary/10 text-primary hover:bg-primary/10">New operating system layer</Badge>
                <h3 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
                  One navigation system for delivery, operations, and internal coordination
                </h3>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Time, scheduling, forms, updates, directory, knowledge, help desk, training, time off, and recognition are now scaffolded directly inside the dashboard.
                </p>
              </div>

              <div className="relative mt-8 grid gap-4 md:grid-cols-3">
                {PILLARS.map((pillar) => (
                  <Link
                    key={pillar.title}
                    href={pillar.href}
                    className={cn(
                      'group relative rounded-2xl border border-border/50 bg-muted/25 p-4 transition-all duration-200',
                      'hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted/40 hover:shadow-md',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background ring-1 ring-border/60">
                        <pillar.icon className="h-4 w-4 text-primary" aria-hidden />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{pillar.badge}</span>
                    </div>
                    <p className="mt-4 font-medium text-foreground">{pillar.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                    <ArrowUpRight
                      className="absolute right-3 top-3 h-4 w-4 text-primary/60 opacity-0 transition-all group-hover:opacity-100"
                      aria-hidden
                    />
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="grid h-full gap-5">
              <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/55">What changed</p>
                <ul className="mt-4 space-y-3">
                  {WHAT_CHANGED.map((line) => (
                    <li key={line} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-gradient-to-br from-card to-muted/25 p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/55">Suggested rollout</p>
                <ol className="mt-5 space-y-0">
                  {ROLLOUT_STEPS.map((item, i) => (
                    <li key={item.step} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < ROLLOUT_STEPS.length - 1 ? (
                        <span
                          className="absolute left-[15px] top-8 bottom-0 w-px bg-border/80"
                          aria-hidden
                        />
                      ) : null}
                      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xs font-bold text-primary">
                        {item.step}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
