'use client'

import Link from 'next/link'
import { Headphones, ShieldCheck, Sparkles, TimerReset } from 'lucide-react'

import { FadeIn } from '@/shared/ui/animate-in'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const PROOF_POINTS = [
  {
    title: 'Guided onboarding',
    description: 'New modules ship with preview states first so teams can shape the workflow before persistence decisions get locked in.',
    icon: Sparkles,
  },
  {
    title: 'Operational support',
    description: 'Help desk, updates, and knowledge base are now first-class surfaces instead of scattered process notes.',
    icon: Headphones,
  },
  {
    title: 'Audit visibility',
    description: 'Time, scheduling, and request flows are framed around reviewability, not just task completion.',
    icon: ShieldCheck,
  },
  {
    title: 'Fast rollout path',
    description: 'The new routes are intentionally scaffolded for a low-risk transition into live Convex-backed workflows.',
    icon: TimerReset,
  },
] as const

export function SupportProofSection() {
  return (
    <section className="bg-muted/20 px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-10 max-w-3xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/50">Support and rollout</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The expansion is designed to be supportable, reviewable, and easy to phase in
          </h2>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            This is not a cosmetic feature dump. The new layers are structured so teams can adopt them module by module and operationalize them without disrupting the agency core.
          </p>
        </FadeIn>

        <div className="grid gap-5 lg:grid-cols-4">
          {PROOF_POINTS.map((point) => (
            <FadeIn key={point.title}>
              <Card className="h-full border-border/60 bg-background">
                <CardHeader className="space-y-4">
                  <div className="w-fit rounded-2xl bg-primary/10 p-3 text-primary">
                    <point.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{point.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{point.description}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-10 flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">Start with the operational layer, then wire the rest behind it.</p>
            <p className="text-sm text-muted-foreground">Time, scheduling, and forms create the strongest foundation for everything that follows.</p>
          </div>
          <Button asChild className="rounded-xl">
            <Link href="/dashboard/time">Open the new operations layer</Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  )
}
