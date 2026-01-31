'use client'

import { useEffect, useMemo } from 'react'
import { AlertTriangle, RefreshCw, Home, Copy, Code2, FileJson } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DashboardErrorProps {
  error: Error & { digest?: string; componentStack?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error('[DashboardErrorBoundary]', error)
    console.error('[DashboardErrorBoundary] componentStack:', (error as any).componentStack)
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'
  const errorDigest = error.digest
  const componentName = 'DashboardError'
  const componentStack = (error as any).componentStack

  // Check for specific error types
  const isUserNotFoundError = error.message?.includes('USER_NOT_FOUND') || 
    error.message?.includes('account is being set up')
  const isAuthError = error.message?.includes('Authentication required') ||
    error.message?.includes('UNAUTHORIZED') ||
    error.message?.includes('Access denied') ||
    error.message?.includes('FORBIDDEN')

  // Extract React internal info from stack if available
  const reactErrorInfo = useMemo(() => {
    if (!error.stack) return null

    const stackLines = error.stack.split('\n')
    const renderPhaseError = stackLines.find(line =>
      line.includes('renderWithHooks') ||
      line.includes('updateFunctionComponent') ||
      line.includes('beginWork')
    )

    if (renderPhaseError) {
      return {
        type: 'Render Phase Error',
        location: renderPhaseError.trim(),
        hint: 'This usually means setState was called during render, or there\'s a circular dependency in useMemo/useCallback.'
      }
    }
    return null
  }, [error.stack])

  const copyErrorDetails = () => {
    const details = [
      `=== ERROR DETAILS ===`,
      `Component: ${componentName}`,
      `Error: ${error.message}`,
      `Digest: ${errorDigest || 'N/A'}`,
      ``,
      `=== DEBUG INFO ===`,
      reactErrorInfo ? `Type: ${reactErrorInfo.type}` : 'Type: Unknown',
      reactErrorInfo ? `Location: ${reactErrorInfo.location}` : '',
      reactErrorInfo ? `Hint: ${reactErrorInfo.hint}` : '',
      ``,
      `=== STACK TRACE ===`,
      error.stack || 'No stack available',
      ``,
      `=== COMPONENT STACK ===`,
      componentStack || 'No component stack available',
    ].filter(Boolean).join('\n')
    navigator.clipboard.writeText(details)
  }

  // Render specific UI for account setup error
  if (isUserNotFoundError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-muted/40 p-4">
        <Card className="max-w-lg border-muted/60">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
            <CardTitle className="text-xl">Setting up your account...</CardTitle>
            <CardDescription>
              Your account is being initialized. This usually takes just a few seconds.
              Please wait a moment and then try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to home
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render specific UI for auth errors
  if (isAuthError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-muted/40 p-4">
        <Card className="max-w-lg border-muted/60">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <CardTitle className="text-xl">Session expired</CardTitle>
            <CardDescription>
              Your session has expired or you don't have permission to access this page.
              Please sign in again to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="w-full">
                <a href="/auth/signin">
                  Sign in
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to home
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-lg border-muted/60">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Dashboard render error</CardTitle>
          <CardDescription>
            {isDev
              ? (error.message.includes('Too many re-renders') 
                  ? 'A re-render loop was detected. This is usually caused by unstable hook dependencies or setState in a render phase.'
                  : 'The dashboard encountered a render error. Check the console for details.')
              : 'We encountered an unexpected error while loading the dashboard. This has been logged.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Component info with copy button */}
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
              title="Copy full error details"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy All
            </Button>
          </div>

          {/* React error info */}
          {reactErrorInfo && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileJson className="h-3 w-3 text-amber-700 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-100">React Error Info</span>
              </div>
              <p className="text-xs text-muted-foreground">{reactErrorInfo.hint}</p>
            </div>
          )}

          {/* Show error digest in production */}
          {errorDigest && !isDev && (
            <div className="rounded-lg border border-muted/40 bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Error Reference</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {errorDigest}
                </Badge>
              </div>
            </div>
          )}

          {/* Show error message in development */}
          {isDev && (
            <>
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                <p className="text-xs font-mono text-destructive break-words">{error.message}</p>
              </div>

              {/* Show stack trace in development */}
              {error.stack && (
                <details className="rounded-lg border border-muted/40 bg-muted/20">
                  <summary className="cursor-pointer p-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                    View Stack Trace
                  </summary>
                  <pre className="max-h-48 overflow-auto p-3 text-xs font-mono text-muted-foreground">
                    {error.stack}
                  </pre>
                </details>
              )}

              {/* Show component stack if available */}
              {componentStack && (
                <details className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-3">
                  <summary className="cursor-pointer p-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                    View Component Stack
                  </summary>
                  <pre className="max-h-48 overflow-auto p-3 text-xs font-mono text-muted-foreground">
                    {componentStack}
                  </pre>
                </details>
              )}
              {/* Show render history in development if available */}
              {isDev && typeof window !== 'undefined' && (window as any).__RENDER_LOGS__ && (window as any).__RENDER_LOGS__.length > 0 && (
                <details className="rounded-lg border border-purple-500/40 bg-purple-500/10 p-3">
                  <summary className="cursor-pointer p-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                    View Render History (Last {(window as any).__RENDER_LOGS__.length} renders)
                  </summary>
                  <div className="max-h-64 overflow-auto space-y-2 mt-2">
                    {(window as any).__RENDER_LOGS__.slice(-20).reverse().map((log: any, i: number) => (
                      <div key={i} className="text-[10px] font-mono border-b border-purple-500/20 pb-1 last:border-0">
                        <div className="flex justify-between text-purple-700 dark:text-purple-300">
                          <span>{log.name} #{log.renderCount}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <pre className="text-muted-foreground overflow-auto">
                          {JSON.stringify(log.changedProps, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to home
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
