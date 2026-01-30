'use client'

import { useEffect } from 'react'
import { Lock, RefreshCw, Copy, Code2 } from 'lucide-react'

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
  const errorDigest = error.digest
  const componentName = 'AuthError'

  const copyErrorDetails = () => {
    const details = [
      `Component: ${componentName}`,
      `Error: ${error.message}`,
      `Digest: ${errorDigest || 'N/A'}`,
      error.stack ? `Stack:\n${error.stack}` : '',
    ].filter(Boolean).join('\n\n')
    navigator.clipboard.writeText(details)
  }

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
          {/* Component info */}
          <div className="flex items-center justify-between rounded-lg border border-muted/40 bg-muted/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Code2 className="h-3 w-3" />
              <span>Component: {componentName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyErrorDetails}
              className="h-7 px-2"
              title="Copy error details"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>

          {/* Show error digest */}
          {errorDigest && (
            <div className="rounded-lg border border-muted/40 bg-muted/20 p-3">
              <div className="text-xs">
                <span className="text-muted-foreground">Error ID: </span>
                <span className="font-mono">{errorDigest}</span>
              </div>
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
              <a href="/">Go to sign in</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
