'use client'

import { LoaderCircle, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import type { PlanSummary } from './types'

interface PlanSelectionSectionProps {
  loading: boolean
  plans: PlanSummary[]
  currentPlanId: string | null
  actionState: string | null
  handleCheckout: (planId: string) => Promise<void>
}

export function PlanSelectionSection({
  loading,
  plans,
  currentPlanId,
  actionState,
  handleCheckout,
}: PlanSelectionSectionProps) {
  const loadingView = (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading billing details...
      </div>
    </div>
  )

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Choose your plan</h2>
          <p className="text-sm text-muted-foreground">
            Upgrade anytime. Changes take effect immediately and prorate automatically.
          </p>
        </div>
      </div>

      {loading && !plans.length ? (
        loadingView
      ) : plans.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlanId === plan.id
            const disabled = actionState !== null || isCurrentPlan || plan.unitAmount === null || !plan.currency

            return (
              <Card key={plan.id} className={cn('flex flex-col justify-between border border-border/60', isCurrentPlan ? 'ring-2 ring-primary/60' : '')}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm text-muted-foreground">
                        {plan.description}
                      </CardDescription>
                    </div>
                    {plan.badge ? (
                      <Badge variant="secondary" className="uppercase tracking-wide">
                        {plan.badge}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-semibold text-foreground">
                      {plan.unitAmount !== null ? formatCurrency(plan.unitAmount, plan.currency ?? undefined) : '—'}
                    </span>
                    {plan.interval ? (
                      <span className="ml-1 text-sm text-muted-foreground">/ {plan.interval}</span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-foreground">
                        <Check className="h-3.5 w-3.5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? 'secondary' : 'default'}
                    disabled={disabled}
                    onClick={() => void handleCheckout(plan.id)}
                  >
                    {isCurrentPlan ? 'Current plan' : 'Choose plan'}
                    {actionState === `checkout:${plan.id}` ? (
                      <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
                    ) : null}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
          No billing plans are currently configured. Add Stripe price IDs to enable plan selection.
        </div>
      )}
    </section>
  )
}
