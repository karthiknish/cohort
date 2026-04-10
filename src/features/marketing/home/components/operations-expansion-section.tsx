'use client'

import Link from 'next/link'
import { BookOpen, Clock3, GraduationCap, Megaphone } from 'lucide-react'

import { FadeIn } from '@/shared/ui/animate-in'
import { Badge } from '@/shared/ui/badge'

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
    description: 'Give updates, directories, knowledge, and request routing a home outside of chat threads.',
    icon: Megaphone,
    href: '/dashboard/collaboration?panel=updates',
    badge: 'P1',
  },
  {
    title: 'People ops layer',
    description: 'Model training, leave, and recognition without pretending the product has pivoted away from agencies.',
    icon: GraduationCap,
    href: '/dashboard/collaboration?panel=training',
    badge: 'P2',
  },
] as const

export function OperationsExpansionSection() {
  return (
    <section className="bg-background px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <FadeIn className="max-w-3xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/50">Expanded surface area</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cohorts now stretches beyond campaign delivery into day-to-day operations
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            The agency core stays intact. The new modules layer workforce operations, structured communication, and HR-lite workflows into the same workspace.
          </p>
        </FadeIn>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <FadeIn>
            <div className="rounded-[2rem] border border-border/60 bg-card p-8 text-foreground shadow-2xl shadow-primary/10">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/10">New operating system layer</Badge>
                  <h3 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
                    One navigation system for delivery, operations, and internal coordination
                  </h3>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Time, scheduling, forms, updates, directory, knowledge, help desk, training, time off, and recognition are now scaffolded directly inside the dashboard.
                  </p>
                </div>
                <div className="hidden rounded-3xl border border-primary/20 bg-primary/5 p-4 lg:block">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {PILLARS.map((pillar) => (
                  <Link
                    key={pillar.title}
                    href={pillar.href}
                    className="rounded-2xl border border-muted/40 bg-muted/20 p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <pillar.icon className="h-5 w-5 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{pillar.badge}</span>
                    </div>
                    <p className="mt-4 font-medium text-foreground">{pillar.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="grid h-full gap-5">
              <div className="rounded-[1.75rem] border border-border/60 bg-muted/20 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/55">What changed</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                  <li>Grouped dashboard navigation makes the new modules feel deliberate instead of bolted on.</li>
                  <li>Every route ships with preview fixtures so the UX can be refined before backend wiring starts.</li>
                  <li>Homepage messaging now acknowledges operations and people workflows without abandoning the agency thesis.</li>
                </ul>
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-card p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/55">Suggested rollout</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">1.</span> Time, scheduling, and forms</p>
                  <p><span className="font-medium text-foreground">2.</span> Updates, directory, knowledge, and help desk</p>
                  <p><span className="font-medium text-foreground">3.</span> Training, leave, and recognition</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
