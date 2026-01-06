"use client"

import { PropsWithChildren, useState } from 'react'
import Link from 'next/link'
import { LoaderCircle, RefreshCcw } from 'lucide-react'

import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClientWorkspaceSelector } from '@/components/client-workspace-selector'

export function ClientAccessGate({ children }: PropsWithChildren) {
  const { loading, error, clients, selectedClientId, refreshClients } = useClientContext()
  const { isPreviewMode } = usePreview()
  const [refreshing, setRefreshing] = useState(false)

  // In preview mode, bypass all access gates and show children directly
  if (isPreviewMode) {
    return <>{children}</>
  }

  if (loading && clients.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        <p>Loading client workspaces…</p>
      </div>
    )
  }

  if (error) {
    const handleRetry = async () => {
      if (refreshing) return
      setRefreshing(true)
      try {
        await refreshClients()
      } finally {
        setRefreshing(false)
      }
    }

    return (
      <Card className="mx-auto max-w-lg border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg">Unable to load clients</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={handleRetry} disabled={refreshing}>
            {refreshing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Try again
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/clients">
              <RefreshCcw className="h-4 w-4" />
              Manage clients
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (clients.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl border-muted/60 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-lg">Create your first client workspace</CardTitle>
          <CardDescription>
            Add a client before exploring the dashboard. Admins can create workspaces from the admin area.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild>
            <Link href="/admin/clients">Add client</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Only admins can create clients. Ask your admin to invite you to an existing workspace if you are not an admin.
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
          <CardDescription>Choose a client to unlock analytics, tasks, collaboration, and finance tools.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClientWorkspaceSelector className="w-full" />
          <p className="text-xs text-muted-foreground">
            Need to add a new client? Head to the admin clients page.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
