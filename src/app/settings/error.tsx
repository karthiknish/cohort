'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[SettingsErrorBoundary]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-muted/20 p-4">
      <Card className="max-w-lg border-muted/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Settings failed to load</CardTitle>
          <CardDescription>
            We could not render your settings right now. Try again to reload the segment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={reset}>
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
