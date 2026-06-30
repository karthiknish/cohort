import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link } from '@/shared/ui/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { RouteErrorLogger } from '@/shared/ui/log-route-error'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

export function SettingsError({ error, reset }: ErrorComponentProps) {
  const handleRetry = () => {
    if (typeof reset === 'function') {
      reset()
    }
  }
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-muted/20 p-4">
      <RouteErrorLogger error={error} segment="settings" />
      <Card className="max-w-lg border-muted/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Settings failed to load</CardTitle>
          <CardDescription>
            We could not render your settings right now. Try again to reload the
            segment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={handleRetry}>
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 size-4" />
              Go to home
            </Link>
          </Button>
          {'digest' in error && error.digest ? (
            <p className="pt-2 text-center text-xs text-muted-foreground">
              Error ID: {String(error.digest)}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsError
