'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { ADS_WORKFLOW_STEPS } from './utils'

export function WorkflowCard() {
  return (
    <Card className="border-muted/70 bg-background shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base">Get your ads connected in minutes</CardTitle>
            <CardDescription>
              Follow these steps to start pulling media performance into Cohorts.
            </CardDescription>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/integrations">View integration checklist</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {ADS_WORKFLOW_STEPS.map((step, index) => (
          <div
            key={step.title}
            className="space-y-2 rounded-lg border border-muted/60 p-4"
          >
            <Badge variant="secondary">Step {index + 1}</Badge>
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
