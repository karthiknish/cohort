import Link from 'next/link'
import { Sparkles, ArrowRight, CircleCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const onboardingSteps = [
  {
    title: 'Select a client workspace',
    description: 'Use the workspace selector in the header to focus on a specific client. This filters all data to that relationship.',
    href: null,
    actionLabel: null,
  },
  {
    title: 'Connect your ad platforms',
    description: 'Link Google Ads, Meta, LinkedIn, or TikTok to automatically sync campaign data and insights.',
    href: '/dashboard/ads',
    actionLabel: 'Go to Ads',
  },
  {
    title: 'Set up finance tracking',
    description: 'Log invoices, retainers, and operating costs to track profitability and cash flow.',
    href: '/dashboard/finance',
    actionLabel: 'Go to Finance',
  },
] as const

export function OnboardingCard() {
  return (
    <Card className="border-muted/70 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <CardTitle className="text-lg">Welcome to Cohorts</CardTitle>
            <CardDescription>Complete these steps to get the most from your dashboard.</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Getting started
          </Badge>
          <Button asChild size="sm" variant="outline">
            <Link href="/docs/background-sync-setup">
              View setup guide
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.title}
              className="group relative space-y-3 rounded-lg border border-muted/60 bg-background p-4 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="text-xs">
                  Step {index + 1}
                </Badge>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <span className="text-xs font-medium">{index + 1}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {step.href && step.actionLabel && (
                <Button asChild variant="ghost" size="sm" className="w-full justify-start px-0 text-primary">
                  <Link href={step.href}>
                    {step.actionLabel}
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <CircleCheck className="h-3.5 w-3.5" />
          <span>Tip: Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd> anytime to quickly navigate between pages</span>
        </div>
      </CardContent>
    </Card>
  )
}
