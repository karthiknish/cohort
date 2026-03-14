'use client'

import { useEffect } from 'react'
import { MessageSquare, RefreshCw, Copy } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'

export default function CollaborationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CollaborationError]', error)
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'

  const copyErrorDetails = () => {
    const details = [
      `Component: CollaborationError`,
      `Error: ${error.message}`,
      `Digest: ${error.digest ?? 'N/A'}`,
      error.stack ? `Stack:\n${error.stack}` : '',
    ].filter(Boolean).join('\n\n')
    void navigator.clipboard.writeText(details)
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-md border-muted/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <MessageSquare className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Collaboration unavailable</CardTitle>
          <CardDescription>
            {isDev
              ? 'The collaboration panel encountered an unexpected error. Check the console for details.'
              : 'Something went wrong loading the collaboration panel. The rest of the dashboard is unaffected.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.digest && !isDev && (
            <div className="rounded-lg border border-muted/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Error reference</span>
                <Badge variant="outline" className="font-mono text-xs">{error.digest}</Badge>
              </div>
            </div>
          )}

          {isDev && error.message && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="break-all font-mono text-xs text-destructive">{error.message}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" size="icon" onClick={copyErrorDetails} title="Copy error details">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
