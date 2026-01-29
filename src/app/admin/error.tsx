'use client'

import { useEffect } from 'react'
import { ShieldAlert, RefreshCw, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AdminErrorBoundary]', error)
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'
  const errorDigest = error.digest

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md border-muted/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Admin panel error</CardTitle>
          <CardDescription>
            {isDev
              ? 'The admin panel encountered an unexpected error. Check the console for details.'
              : 'We encountered an unexpected error while loading the admin panel. This has been logged.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show error digest in production for support reference */}
          {errorDigest && !isDev && (
            <div className="rounded-lg border border-muted/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Error Reference</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {errorDigest}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Please include this reference if you contact support.
              </p>
            </div>
          )}

          {/* Show error message in development */}
          {isDev && error.message && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
              <p className="text-xs font-mono text-destructive">{error.message}</p>
            </div>
          )}

          {/* Show stack trace in development */}
          {isDev && error.stack && (
            <details className="rounded-lg border border-muted/40 bg-muted/20">
              <summary className="cursor-pointer p-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                View Stack Trace
              </summary>
              <pre className="max-h-48 overflow-auto p-3 text-xs font-mono text-muted-foreground">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to dashboard
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
