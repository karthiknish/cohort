'use client';
import { Link } from '@/shared/ui/link';
import { useCallback } from 'react';
import { Sparkles, ArrowRight, CircleCheck } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { useOnboardingTour } from '@/shared/hooks/use-onboarding-tour';
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
        title: 'Create your first task',
        description: 'Capture your first deliverable and assign ownership so execution starts immediately.',
        href: '/dashboard/tasks?action=create',
        actionLabel: 'Go to Tasks',
    },
] as const;
export function OnboardingCard() {
    const { startTour } = useOnboardingTour();
    const handleStartTour = () => {
        void startTour({ ensureDashboard: true });
    };
    return (<Card className="border-muted/70 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-primary">
            <Sparkles className="size-5"/>
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
          <Button onClick={handleStartTour} size="sm" variant="default" className="bg-primary hover:bg-accent/90">
            Start Tour
            <Sparkles className="ml-1.5 size-3.5"/>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/docs/background-sync-setup">
              Setup guide
              <ArrowRight className="ml-1 size-3"/>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 sm:grid-cols-3">
          {onboardingSteps.map((step, index) => (<div key={step.title} className="group relative space-y-3 rounded-lg border border-muted/60 bg-background p-4 motion-chromatic hover:border-accent/40 hover:shadow-sm">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="text-xs">
                  Step {index + 1}
                </Badge>
                <div className="flex size-6 items-center justify-center rounded-full bg-muted text-foreground/70">
                  <span className="text-xs font-medium">{index + 1}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {step.href && step.actionLabel && (<Button asChild variant="ghost" size="sm" className="w-full justify-start px-0 text-primary">
                  <Link href={step.href}>
                    {step.actionLabel}
                    <ArrowRight className="ml-1 size-3 transition-transform group-hover:translate-x-0.5"/>
                  </Link>
                </Button>)}
            </div>))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <CircleCheck className="size-3.5"/>
          <span>Tip: Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd> anytime to quickly navigate between pages</span>
        </div>
      </CardContent>
    </Card>);
}
