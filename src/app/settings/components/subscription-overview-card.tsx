'use client'

import { LoaderCircle, CreditCard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import { subscriptionStatusStyles, formatDate } from './utils'
import type { SubscriptionSummary, UpcomingInvoiceSummary } from './types'

interface SubscriptionOverviewCardProps {
  loading: boolean
  subscription: SubscriptionSummary | null
  upcomingInvoice: UpcomingInvoiceSummary | null
  actionState: string | null
  refreshBilling: () => Promise<void>
  handleBillingPortal: () => Promise<void>
}

export function SubscriptionOverviewCard({
  loading,
  subscription,
  upcomingInvoice,
  actionState,
  refreshBilling,
  handleBillingPortal,
}: SubscriptionOverviewCardProps) {
  const statusBadgeClass = subscription ? subscriptionStatusStyles[subscription.status] ?? 'bg-muted text-muted-foreground' : ''

  const loadingView = (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading billing details...
      </div>
    </div>
  )

  const subscriptionView = subscription ? (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge className={cn('capitalize', statusBadgeClass)}>{subscription.status.replace(/_/g, ' ')}</Badge>
            {subscription.plan ? (
              <span className="text-sm font-medium text-foreground">
                {subscription.plan.name}
              </span>
            ) : null}
          </div>
          {subscription.currentPeriodEnd ? (
            <p className="text-sm text-muted-foreground">
              Renews on {formatDate(subscription.currentPeriodEnd)}
              {subscription.cancelAtPeriodEnd ? ' • Cancellation scheduled' : ''}
            </p>
          ) : null}
          {!subscription.isManagedByApp ? (
            <p className="mt-2 text-sm text-muted-foreground">
              This subscription was created outside Cohorts. Manage changes directly in Stripe.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void refreshBilling()}>
            Refresh status
          </Button>
          <Button
            onClick={() => void handleBillingPortal()}
            disabled={actionState === 'portal'}
          >
            {actionState === 'portal' ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Manage billing
          </Button>
        </div>
      </div>

      {upcomingInvoice ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Upcoming invoice</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(upcomingInvoice.amountDue, upcomingInvoice.currency ?? undefined)} scheduled for {formatDate(upcomingInvoice.nextPaymentAttempt ?? upcomingInvoice.dueDate)}
          </p>
        </div>
      ) : null}
    </div>
  ) : (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          No active subscription
        </Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a plan below to unlock forecasting, automations, and premium reporting.
        </p>
      </div>
      <Button variant="outline" onClick={() => void refreshBilling()}>
        Refresh status
      </Button>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription overview</CardTitle>
        <CardDescription>Track your current plan, renewal date, and upcoming invoices.</CardDescription>
      </CardHeader>
      <CardContent>{loading ? loadingView : subscriptionView}</CardContent>
    </Card>
  )
}
