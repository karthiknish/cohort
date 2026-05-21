'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

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

type WorkflowCardProps = {
  connectedCount?: number
  hasSuccessfulSync?: boolean
  hasPendingSetup?: boolean
}

export function WorkflowCard({
  connectedCount = 0,
  hasSuccessfulSync = false,
  hasPendingSetup = false,
}: WorkflowCardProps) {
  const stepDone = [
    connectedCount > 0 && !hasPendingSetup,
    hasSuccessfulSync,
    hasSuccessfulSync,
  ]

  return (
    <Card className={cn(DASHBOARD_THEME.cards.base)}>
      <CardHeader className="flex flex-col gap-4 border-b border-muted/40 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base leading-tight">Get your ads connected in minutes</CardTitle>
          <CardDescription className="text-pretty">
            Connect Google, Meta, LinkedIn, and TikTok with OAuth — then finish any account selection
            steps in the setup panel below.
          </CardDescription>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0">
          <Link href="#connect-ad-platforms">Connect platforms</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
        {ADS_WORKFLOW_STEPS.map((step, index) => {
          const done = stepDone[index] ?? false
          return (
            <div
              key={step.title}
              className={cn(
                'space-y-2 rounded-xl border p-4 shadow-sm',
                done ? 'border-success/25 bg-success/5' : 'border-muted/50 bg-background/80',
              )}
            >
              <div className="flex items-center gap-2">
                <Badge variant={done ? 'default' : 'secondary'} className="font-medium">
                  {done ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      Done
                    </span>
                  ) : (
                    `Step ${index + 1}`
                  )}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
