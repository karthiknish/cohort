"use client"

import { useCallback, useState, type PropsWithChildren } from 'react'
import Link from 'next/link'
import { Building2, LoaderCircle, RefreshCcw } from 'lucide-react'

import { useClientContext } from '@/shared/contexts/client-context'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { ClientWorkspaceSelector } from '@/shared/components/client-workspace-selector'
import { Skeleton } from '@/shared/ui/skeleton'

export function ClientAccessGate({ children }: PropsWithChildren) {
  const { user } = useAuth()
  const { loading, error, clients, selectedClientId, refreshClients, retryClients } = useClientContext()
  const { isPreviewMode } = usePreview()
  const [refreshing, setRefreshing] = useState(false)
  const canManageClients = user?.role === 'admin'

  const handleRetry = useCallback(() => {
    if (refreshing) return
    setRefreshing(true)

    retryClients()
    void Promise.resolve(refreshClients()).finally(() => {
      setRefreshing(false)
    })
  }, [refreshClients, refreshing, retryClients])

  // In preview mode, bypass all access gates and show children directly
  if (isPreviewMode) {
    return children
  }

  if (loading && clients.length === 0) {
    return (
      <div
        className="mx-auto w-full max-w-3xl space-y-4 py-10"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="rounded-lg border border-muted/60 bg-background p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-48 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
        <span className="sr-only">Loading client workspaces...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-lg border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg">Unable to load clients</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={handleRetry} disabled={refreshing} className="gap-2">
            {refreshing ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
            Try again
          </Button>
          {canManageClients ? (
            <Button asChild variant="outline" className="gap-2">
              <Link href="/admin/clients">
                <RefreshCcw className="h-4 w-4" />
                Manage clients
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  if (clients.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl overflow-hidden border-muted/60 bg-background shadow-sm">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" aria-hidden />
          </div>
          <CardTitle className="text-lg">{canManageClients ? 'Create your first client workspace' : 'No client workspace assigned'}</CardTitle>
          <CardDescription>
            {canManageClients
              ? 'Add a client before exploring the dashboard.'
              : 'Ask an admin to invite you to a client workspace before using the dashboard.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {canManageClients ? (
            <Button asChild>
              <Link href="/admin/clients">Add client</Link>
            </Button>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {canManageClients
              ? 'Client workspaces control analytics, tasks, projects, and collaboration access.'
              : 'This keeps client data scoped to assigned users.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!selectedClientId) {
    return (
      <Card className="mx-auto max-w-xl border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Select a client workspace</CardTitle>
          <CardDescription>Choose a client to unlock analytics, tasks, collaboration, and project tools.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClientWorkspaceSelector className="w-full" />
          <p className="text-xs text-muted-foreground">
            {canManageClients
              ? 'Need to add a new client? Head to the admin clients page.'
              : 'If no client appears here, ask an admin to add you to one.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return children
}
