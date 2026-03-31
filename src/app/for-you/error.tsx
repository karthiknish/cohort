'use client'

import { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function ForYouError({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string }
  unstable_retry?: () => void
  reset?: () => void
}) {
  useEffect(() => {
    console.error('[ForYouErrorBoundary]', error)
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

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-muted/20 p-4">
      <Card className="max-w-lg border-muted/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">For You failed to load</CardTitle>
          <CardDescription>
            We could not render this workspace summary right now. Try again to reload the page segment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={handleRetry}>
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
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
