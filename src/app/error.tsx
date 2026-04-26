'use client'

import { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

/**
 * Root segment error boundary (marketing and other top-level routes under `app/`).
 */
export default function RootAppError({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string }
  unstable_retry?: () => void
  reset?: () => void
}) {
  useEffect(() => {
    console.error('[RootAppError]', error)
  }, [error])

  const handleRetry = useCallback(() => {
    if (typeof unstable_retry === 'function') {
      unstable_retry()
      return
    }
    if (typeof reset === 'function') {
      reset()
    }
  }, [reset, unstable_retry])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-muted/20 p-4">
      <Card className="max-w-lg border-muted/60" role="alert" aria-live="assertive" aria-atomic="true">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            This page could not be displayed. You can try again or return home.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isDevelopment ? (
            <p className="wrap-break-word rounded-md border border-destructive/30 bg-destructive/5 p-2 text-left text-xs font-mono text-destructive">
              {error.message}
            </p>
          ) : null}
          <Button className="w-full" onClick={handleRetry} type="button">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to home
            </Link>
          </Button>
          {error.digest ? (
            <p className="pt-2 text-center text-xs text-muted-foreground">Error ID: {error.digest}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
