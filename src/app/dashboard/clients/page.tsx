'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { AlertTriangle, Briefcase, Calendar, CheckSquare, CreditCard, FileText, Mail, RefreshCcw, Users as UsersIcon, UserPlus, Settings, Download } from 'lucide-react'

import { ClientAccessGate } from '@/components/dashboard/client-access-gate'
import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency, exportToCsv } from '@/lib/utils'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function ClientsDashboardPage() {
  return (
    <ClientAccessGate>
      <ClientsDashboardContent />
    </ClientAccessGate>
  )
}

function ClientsDashboardContent() {
  const searchParams = useSearchParams()
  const { selectedClient, refreshClients, clients, selectClient, selectedClientId } = useClientContext()
  const { toast } = useToast()

  useEffect(() => {
    const clientIdParam = searchParams.get('clientId')
    if (clientIdParam && clientIdParam !== selectedClientId) {
      selectClient(clientIdParam)
    }
  }, [searchParams, selectedClientId, selectClient])

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

  const handleExport = () => {
    if (!selectedClient) return
    
    const data = [{
      Name: selectedClient.name,
      'Account Manager': selectedClient.accountManager || 'Unassigned',
      'Billing Email': selectedClient.billingEmail || 'Not provided',
      'Team Size': teamMembers.length,
      'Last Invoice Status': lastInvoiceStatus || 'None',
      'Last Invoice Amount': selectedClient.lastInvoiceAmount ? formatCurrency(selectedClient.lastInvoiceAmount, selectedClient.lastInvoiceCurrency || 'USD') : '—',
      'Last Invoice Date': selectedClient.lastInvoiceIssuedAt ? formatDate(selectedClient.lastInvoiceIssuedAt) : '—'
    }]

    exportToCsv(data, `client-${selectedClient.name.toLowerCase().replace(/\s+/g, '-')}-overview.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{selectedClient.name}</h1>
          <p className="text-muted-foreground">Workspace overview for {selectedClient.accountManager || 'your team'}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/admin/clients">
              <Settings className="mr-2 h-4 w-4" />
              Manage settings
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            className="inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              try {
                await refreshClients()
                toast({
                  title: 'Clients refreshed',
                  description: 'Client data has been updated.',
                })
              } catch (error) {
                toast({
                  title: 'Refresh failed',
                  description: 'Unable to update client data.',
                  variant: 'destructive',
                })
              }
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
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(selectedClient.accountManager || 'U')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{selectedClient.accountManager || 'Unassigned'}</div>
                <p className="text-xs text-muted-foreground">Primary point of contact</p>
              </div>
            </div>
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
            <div className="text-sm font-medium text-foreground truncate" title={selectedClient.billingEmail ?? ''}>
              {selectedClient.billingEmail ?? 'Not provided'}
            </div>
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-muted/60 bg-background transition-colors hover:bg-muted/50">
          <Link href={`/dashboard/projects?clientId=${selectedClient.id}`} className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Manage active projects and timelines</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="border-muted/60 bg-background transition-colors hover:bg-muted/50">
          <Link href={`/dashboard/tasks?clientId=${selectedClient.id}`} className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Track open tasks and deliverables</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="border-muted/60 bg-background transition-colors hover:bg-muted/50">
          <Link href={`/dashboard/proposals?clientId=${selectedClient.id}`} className="block h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proposals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Review and manage client proposals</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-muted/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Client collaborators</CardTitle>
              <CardDescription>Everyone with access to this workspace.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/clients">
                <UserPlus className="mr-2 h-4 w-4" />
                Add member
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
                <UsersIcon className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">No team members assigned</p>
                <p className="mt-1 text-sm text-muted-foreground">Add collaborators from the admin clients page to start working together.</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/admin/clients">Manage Team</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {teamMembers.map((member, index) => (
                  <div key={`${member.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-muted/40 bg-card p-3 transition-colors hover:bg-muted/50">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="truncate text-sm font-medium text-foreground">{member.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{member.role || 'Contributor'}</div>
                    </div>
                    <Badge variant="secondary" className="ml-auto shrink-0">Member</Badge>
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
                      {invoiceSummary.amount !== null ? formatCurrency(invoiceSummary.amount, invoiceSummary.currency) : '—'}
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
