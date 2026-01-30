// professional GlobalError component
'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <title>Something went wrong</title>
      </head>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        margin: 0,
        backgroundColor: '#f9fafb',
        color: '#111827'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>A critical error occurred. We have been notified and are looking into it.</p>
          <button 
            onClick={() => reset()}
            style={{
              backgroundColor: '#000',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
          {error.digest && (
            <div style={{ marginTop: '2rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#9ca3af' }}>
              Error ID: {error.digest}
            </div>
          )}
        </div>
      </body>
    </html>
  )
}
