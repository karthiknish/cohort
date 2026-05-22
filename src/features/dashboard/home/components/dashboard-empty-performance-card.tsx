'use client'

import Link from 'next/link'
import { BarChart3, Megaphone, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

export function DashboardEmptyPerformanceCard() {
  return (
    <Card className="overflow-hidden border-dashed border-muted/50 bg-linear-to-br from-muted/10 via-background to-primary/[0.03] shadow-sm">
      <CardContent className="flex flex-col items-center gap-6 px-6 py-14 text-center sm:px-10">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Sparkles className="size-7" aria-hidden />
        </span>
        <div className="max-w-md space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">No performance data yet</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Connect ad platforms or Google Analytics to unlock spend trends, channel KPIs, and comparison charts for
            this view.
          </p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" asChild className="gap-2 shadow-sm">
            <Link href="/dashboard/ads">
              <Megaphone className="size-4" aria-hidden />
              Connect ads
            </Link>
          </Button>
          <Button type="button" variant="outline" asChild className="gap-2">
            <Link href="/dashboard/analytics">
              <BarChart3 className="size-4" aria-hidden />
              Open analytics
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

type DashboardSectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  className?: string
}

export function DashboardSectionHeading({
  eyebrow = 'Overview',
  title,
  description,
  className,
}: DashboardSectionHeadingProps) {
  return (
    <div className={cn('space-y-1 border-b border-muted/40 pb-3', className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">{eyebrow}</p>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
