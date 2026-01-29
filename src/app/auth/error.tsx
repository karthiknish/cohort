'use client'

import { useEffect } from 'react'
import { Lock, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AuthErrorBoundary]', error)
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md border-muted/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Authentication error</CardTitle>
          <CardDescription>
            {isDev
              ? 'An authentication error occurred. Check the console for details.'
              : 'There was a problem with authentication. Please try signing in again.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show error message in development */}
          {isDev && error.message && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
              <p className="text-xs font-mono text-destructive">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">Go to sign in</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
