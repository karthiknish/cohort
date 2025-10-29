'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Check, CreditCard } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PlanSummary {
  id: string
  name: string
  description: string
  priceId: string
  unitAmount: number | null
  currency: string | null
  interval: string | null
  badge?: string
  features: string[]
  productName: string | null
}

interface SubscriptionSummary {
  id: string
  status: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  currentPeriodStart: string | null
  price: {
    id: string
    currency: string | null
    unitAmount: number | null
    interval: string | null
    nickname: string | null
  } | null
  plan: {
    id: string
    name: string
  } | null
  isManagedByApp: boolean
}

interface InvoiceSummary {
  id: string
  number: string | null
  status: string | null
  amountPaid: number
  total: number
  currency: string | null
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
  createdAt: string | null
}

interface UpcomingInvoiceSummary {
  amountDue: number
  currency: string | null
  nextPaymentAttempt: string | null
  dueDate: string | null
  status: string | null
}

interface BillingStatusResponse {
  plans: PlanSummary[]
  subscription: SubscriptionSummary | null
  invoices: InvoiceSummary[]
  upcomingInvoice: UpcomingInvoiceSummary | null
}

const subscriptionStatusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  trialing: 'bg-blue-100 text-blue-700',
  past_due: 'bg-amber-100 text-amber-700',
  canceled: 'bg-muted text-muted-foreground border border-border/50',
  unpaid: 'bg-red-100 text-red-700',
  incomplete: 'bg-amber-100 text-amber-700',
  incomplete_expired: 'bg-gray-200 text-gray-600',
  paused: 'bg-slate-200 text-slate-700',
}

export default function SettingsPage() {
  const { user, getIdToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<PlanSummary[]>([])
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null)
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoiceSummary | null>(null)
  const [actionState, setActionState] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const currentPlanId = subscription?.plan?.id ?? null
  const statusBadgeClass = subscription ? subscriptionStatusStyles[subscription.status] ?? 'bg-muted text-muted-foreground' : ''

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0
      return bTime - aTime
    })
  }, [invoices])

  const refreshBilling = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/billing/status', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error ?? 'Failed to load billing data')
      }

      const payload = (await response.json()) as BillingStatusResponse

      if (isMountedRef.current) {
        setPlans(payload.plans ?? [])
        setSubscription(payload.subscription ?? null)
        setInvoices(payload.invoices ?? [])
        setUpcomingInvoice(payload.upcomingInvoice ?? null)
      }
    } catch (fetchError) {
      if (isMountedRef.current) {
        console.error('[settings/billing] Failed to fetch billing overview', fetchError)
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load billing data')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [getIdToken, user])

  useEffect(() => {
    void refreshBilling()
  }, [refreshBilling])

  const handleCheckout = useCallback(
    async (planId: string) => {
      if (!user) return

      setActionState(`checkout:${planId}`)
      setError(null)

      try {
        const token = await getIdToken()
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planId }),
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string }
          throw new Error(payload.error ?? 'Unable to start checkout session')
        }

        const payload = (await response.json()) as { url?: string }
        if (!payload.url) {
          throw new Error('Checkout session did not return a redirect URL')
        }

        window.location.href = payload.url
      } catch (checkoutError) {
        console.error('[settings/billing] Checkout error', checkoutError)
        setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start checkout')
      } finally {
        setActionState(null)
      }
    },
    [getIdToken, user],
  )

  const handleBillingPortal = useCallback(async () => {
    if (!user) return

    setActionState('portal')
    setError(null)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ returnUrl: '/settings?portal=return' }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error ?? 'Unable to open billing portal')
      }

      const payload = (await response.json()) as { url?: string }
      if (!payload.url) {
        throw new Error('Billing portal session missing redirect URL')
      }

      window.location.href = payload.url
    } catch (portalError) {
      console.error('[settings/billing] Portal error', portalError)
      setError(portalError instanceof Error ? portalError.message : 'Unable to open billing portal')
    } finally {
      setActionState(null)
    }
  }, [getIdToken, user])

  const loadingView = (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            {formatCurrency(upcomingInvoice.amountDue, upcomingInvoice.currency)} scheduled for {formatDate(upcomingInvoice.nextPaymentAttempt ?? upcomingInvoice.dueDate)}
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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Billing &amp; Payments</h1>
        <p className="text-sm text-muted-foreground">
          Manage your Cohorts subscription, invoices, and payment methods from one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription overview</CardTitle>
          <CardDescription>Track your current plan, renewal date, and upcoming invoices.</CardDescription>
        </CardHeader>
        <CardContent>{loading ? loadingView : subscriptionView}</CardContent>
      </Card>

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
                        {formatCurrency(plan.unitAmount, plan.currency)}
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
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
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

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Invoice history</h2>
          <p className="text-sm text-muted-foreground">Download receipts for bookkeeping or click through to Stripe-hosted invoices.</p>
        </div>

        {loading && !sortedInvoices.length ? (
          loadingView
        ) : sortedInvoices.length ? (
          <div className="divide-y divide-border/60 rounded-lg border border-border/60">
            {sortedInvoices.map((invoice) => (
              <div key={invoice.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {invoice.number ?? invoice.id}
                    </span>
                    {invoice.status ? (
                      <Badge variant="outline" className="capitalize">
                        {invoice.status.replace(/_/g, ' ')}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {invoice.createdAt ? formatDate(invoice.createdAt) : 'Date unavailable'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-sm text-foreground md:flex-row md:items-center md:gap-4">
                  <span className="font-medium">
                    {formatCurrency(invoice.total || invoice.amountPaid, invoice.currency)}
                  </span>
                  <div className="flex gap-2">
                    {invoice.hostedInvoiceUrl ? (
                      <Button variant="outline" asChild size="sm">
                        <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                          View invoice
                        </a>
                      </Button>
                    ) : null}
                    {invoice.invoicePdf ? (
                      <Button variant="ghost" asChild size="sm">
                        <a href={invoice.invoicePdf} target="_blank" rel="noreferrer">
                          Download PDF
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
            No invoices to show yet. Once you subscribe you will see receipts and payment history here.
          </div>
        )}
      </section>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  )
}

function formatCurrency(amountInMinorUnits: number | null | undefined, currency: string | null): string {
  if (!currency || amountInMinorUnits === null || amountInMinorUnits === undefined) {
    return 'Configure pricing'
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  })

  return formatter.format(amountInMinorUnits / 100)
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
