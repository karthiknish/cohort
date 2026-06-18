import type { ErrorComponentProps } from '@tanstack/react-router'
import { RouteErrorLogger } from '@/shared/ui/log-route-error'
import { Link } from '@/shared/ui/link'
import { useRouter } from '@/shared/ui/navigation'

export function DashboardError({ error, reset }: ErrorComponentProps) {
  const { replace, refresh } = useRouter()
  const handleRetry = () => {
    if (typeof reset === 'function') {
      reset()
      return
    }
    replace('/dashboard')
    refresh()
  }
  const isDevelopment = process.env.NODE_ENV === 'development'
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-muted/30 p-6">
      <RouteErrorLogger error={error} segment="dashboard" />
      <div
        className="w-full max-w-xl rounded-2xl border border-border/60 bg-background p-6 shadow-sm"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Dashboard failed to load
          </h2>
          <p className="text-sm text-muted-foreground">
            Try rendering the dashboard segment again. If the error persists,
            return home and reload the page.
          </p>
        </div>

        {isDevelopment ? (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left">
            <p className="wrap-break-word text-xs font-mono text-destructive">
              {error.message}
            </p>
            {error.stack ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-muted-foreground">
                  View stack trace
                </summary>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                  {error.stack}
                </pre>
              </details>
            ) : null}
          </div>
        ) : null}

        {'digest' in error && error.digest ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Error reference: {String(error.digest)}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex w-full items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Go to workspace home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardError
