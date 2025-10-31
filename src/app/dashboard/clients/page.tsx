'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { AlertTriangle, Calendar, CreditCard, Mail, RefreshCcw, Users as UsersIcon } from 'lucide-react'

import { ClientAccessGate } from '@/components/dashboard/client-access-gate'
import { useClientContext } from '@/contexts/client-context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function ClientsDashboardPage() {
  return (
    <ClientAccessGate>
      <ClientsDashboardContent />
    </ClientAccessGate>
  )
}

function ClientsDashboardContent() {
  const { selectedClient, refreshClients, clients } = useClientContext()

  const teamMembers = selectedClient?.teamMembers ?? []
  const lastInvoiceStatus = selectedClient?.lastInvoiceStatus ?? null

  const invoiceSummary = useMemo(() => {
    if (!selectedClient) {
      return null
    }

    const status = selectedClient.lastInvoiceStatus ?? 'draft'
    const isOutstanding = status === 'open' || status === 'uncollectible' || status === 'overdue'

    return {
      status,
      isOutstanding,
      amount: selectedClient.lastInvoiceAmount ?? null,
      currency: selectedClient.lastInvoiceCurrency ?? 'usd',
      issuedAt: selectedClient.lastInvoiceIssuedAt ?? null,
      identifier: selectedClient.lastInvoiceNumber ?? null,
      url: selectedClient.lastInvoiceUrl ?? null,
    }
  }, [selectedClient])

  if (!selectedClient) {
    return (
      <Card className="mx-auto max-w-2xl border-muted/60 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-lg">Select a client workspace</CardTitle>
          <CardDescription>Use the selector above to choose a client and unlock their workspace overview.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const clientIndex = clients.findIndex((record) => record.id === selectedClient.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{selectedClient.name}</h1>
          <p className="text-muted-foreground">Workspace overview for {selectedClient.accountManager || 'your team'}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/clients">Manage clients</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void refreshClients()
            }}
            className="inline-flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account manager</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{selectedClient.accountManager || 'Unassigned'}</div>
            <p className="text-xs text-muted-foreground">Primary point of contact</p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team size</CardTitle>
            <UsersIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Collaborators assigned to this workspace</p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-foreground">{selectedClient.billingEmail ?? 'Not provided'}</div>
            <p className="text-xs text-muted-foreground">Invoices and reminders are sent here</p>
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workspace position</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{clientIndex >= 0 ? `Client ${clientIndex + 1} of ${clients.length}` : '—'}</div>
            <p className="text-xs text-muted-foreground">Based on alphabetical ordering</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle className="text-lg">Client collaborators</CardTitle>
            <CardDescription>Everyone with access to this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                No team members have been assigned yet. Add collaborators from the admin clients page.
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div key={`${member.name}-${index}`} className="flex items-center justify-between rounded-md border border-muted/40 bg-muted/10 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.role || 'Contributor'}</div>
                    </div>
                    <Badge variant="outline">Member</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/60 bg-background">
          <CardHeader>
            <CardTitle className="text-lg">Latest invoice</CardTitle>
            <CardDescription>Track recent billing activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {invoiceSummary ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Status</span>
                  <Badge variant={invoiceSummary.isOutstanding ? 'destructive' : 'secondary'} className="capitalize">
                    {invoiceSummary.status?.replace('_', ' ') || 'draft'}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Amount</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(invoiceSummary.amount, invoiceSummary.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Issued</span>
                    <span>{formatDate(invoiceSummary.issuedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reference</span>
                    <span>{invoiceSummary.identifier ?? '—'}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="inline-flex items-center gap-2"
                    asChild={Boolean(invoiceSummary.url)}
                    disabled={!invoiceSummary.url}
                  >
                    {invoiceSummary.url ? (
                      <a href={invoiceSummary.url} target="_blank" rel="noreferrer">
                        <CreditCard className="h-4 w-4" /> View invoice
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="h-4 w-4" /> No invoice URL
                      </span>
                    )}
                  </Button>
                  {invoiceSummary.isOutstanding && (
                    <div className="flex items-start gap-2 rounded-md border border-amber-400/60 bg-amber-100/60 p-3 text-xs text-amber-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <p>Balance is outstanding. Send a reminder or follow up with the client.</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-6 text-sm text-muted-foreground">
                No invoice history yet. Create invoices from the admin clients workspace.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatCurrency(amount: number | null, currency: string | null): string {
  if (amount === null || amount === undefined) {
    return '—'
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency ?? 'usd').toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
