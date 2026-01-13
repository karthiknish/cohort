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
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
        <button
          onClick={() => reset()}
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
