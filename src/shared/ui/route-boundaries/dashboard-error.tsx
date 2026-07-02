import type { ErrorComponentProps } from '@tanstack/react-router'
import { RouteErrorLogger } from '@/shared/ui/log-route-error'
import { Link } from '@/shared/ui/link'
import { useRouter } from '@/shared/ui/navigation'
import { Button } from '@/shared/ui/button'
import { RefreshCw, Home } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

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
      <Card className="w-full max-w-xl border-muted/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <RefreshCw className="size-8 text-destructive" aria-hidden />
          </div>
          <CardTitle className="text-xl">Dashboard failed to load</CardTitle>
          <CardDescription>
            Try rendering the dashboard segment again. If the error persists,
            return home and reload the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isDevelopment ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left">
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
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Error reference: {String(error.digest)}
            </p>
          ) : null}

          <Button className="w-full" onClick={handleRetry}>
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">
              <Home className="mr-2 size-4" />
              Go to workspace home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardError
