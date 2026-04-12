'use client'

import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

import { ADS_WORKFLOW_STEPS } from './utils'

export function WorkflowCard() {
  return (
    <Card className={cn(DASHBOARD_THEME.cards.base)}>
      <CardHeader className="flex flex-col gap-4 border-b border-muted/40 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base leading-tight">Get your ads connected in minutes</CardTitle>
          <CardDescription className="text-pretty">
            Follow these steps to start pulling media performance into Cohorts.
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link href="/dashboard/ads#connect-ad-platforms">Go to connections</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
        {ADS_WORKFLOW_STEPS.map((step, index) => (
          <div
            key={step.title}
            className="space-y-2 rounded-xl border border-muted/50 bg-background/80 p-4 shadow-sm"
          >
            <Badge variant="secondary" className="font-medium">
              Step {index + 1}
            </Badge>
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
