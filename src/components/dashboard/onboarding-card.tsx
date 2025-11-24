import Link from 'next/link'
import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const onboardingSteps = [
  {
    title: 'Pick a client',
    description: 'Use the client switcher to focus this dashboard on one relationship at a time.',
  },
  {
    title: 'Log revenue & costs',
    description: 'Add invoicing data so cash flow and margin stats stay up to date.',
  },
  {
    title: 'Connect ad platforms',
    description: 'Head to the Ads hub to sync Google, Meta, LinkedIn, or TikTok campaigns.',
  },
] as const

export function OnboardingCard() {
  return (
    <Card className="border-muted/70 bg-background shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base">Get the most from Cohorts</CardTitle>
            <CardDescription>Follow these quick steps to personalise this dashboard for your agency.</CardDescription>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/docs/background-sync-setup">View setup guide</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {onboardingSteps.map((step, index) => (
          <div key={step.title} className="space-y-2 rounded-lg border border-muted/60 p-4">
            <Badge variant="secondary">Step {index + 1}</Badge>
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
