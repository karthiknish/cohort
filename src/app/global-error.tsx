// professional GlobalError component
'use client'

import { type CSSProperties, useCallback, useEffect } from 'react'

const BODY_STYLE: CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  margin: 0,
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)',
}

const CONTAINER_STYLE: CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  maxWidth: '400px',
}

const TITLE_STYLE: CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  marginBottom: '0.5rem',
}

const MESSAGE_STYLE: CSSProperties = {
  color: 'var(--muted-foreground)',
  marginBottom: '2rem',
}

const ACTION_BUTTON_STYLE: CSSProperties = {
  backgroundColor: 'var(--foreground)',
  color: 'var(--background)',
  padding: '0.75rem 1.5rem',
  borderRadius: '0.375rem',
  border: 'none',
  fontWeight: 500,
  cursor: 'pointer',
}

const ERROR_ID_STYLE: CSSProperties = {
  marginTop: '2rem',
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  color: 'var(--muted-foreground)',
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const handleReset = useCallback(() => {
    reset()
  }, [reset])

  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <title>Something went wrong</title>
      </head>
      <body style={BODY_STYLE}>
        <div style={CONTAINER_STYLE} role="alert" aria-live="assertive" aria-atomic="true">
          <h1 style={TITLE_STYLE}>Something went wrong</h1>
          <p style={MESSAGE_STYLE}>A critical error occurred. We have been notified and are looking into it.</p>
          <button type="button" onClick={handleReset} style={ACTION_BUTTON_STYLE}>
            Try again
          </button>
          {error.digest && (
            <div style={ERROR_ID_STYLE}>
              Error ID: {error.digest}
            </div>
          )}
        </div>
      </body>
    </html>
  )
}
