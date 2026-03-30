'use client'

import { useCallback, useEffect } from 'react'

type DashboardErrorProps = {
  error: Error & { digest?: string; componentStack?: string }
  unstable_retry?: () => void
  reset?: () => void
}

export default function DashboardError({ error, unstable_retry, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error('[DashboardErrorBoundary]', error)

    if (typeof error.componentStack === 'string' && error.componentStack.length > 0) {
      console.error('[DashboardErrorBoundary] componentStack:', error.componentStack)
    }
  }, [error])

  const handleRetry = useCallback(() => {
    if (typeof unstable_retry === 'function') {
      unstable_retry()
      return
    }

    if (typeof reset === 'function') {
      reset()
      return
    }

    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [reset, unstable_retry])

  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-xl rounded-2xl border border-border/60 bg-background p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold text-foreground">Dashboard failed to load</h2>
          <p className="text-sm text-muted-foreground">
            Try rendering the dashboard segment again. If the error persists, return home and reload the page.
          </p>
        </div>

        {isDevelopment ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left">
            <p className="break-words text-xs font-mono text-destructive">{error.message}</p>
            {error.stack ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-muted-foreground">View stack trace</summary>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                  {error.stack}
                </pre>
              </details>
            ) : null}
          </div>
        ) : null}

        {error.digest ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">Error reference: {error.digest}</p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex w-full items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Go to home
          </a>
        </div>
      </div>
    </div>
  )
}
