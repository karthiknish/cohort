'use client'

import { useEffect, useState } from 'react'

import { convexErrorMessage } from '@/lib/handle-convex-error'

export type UseConvexQueryErrorOptions = {
  /** Convex useQuery result — undefined while loading */
  data: unknown
  /** When true, the query is skipped (no error) */
  skipped?: boolean
  /** When true, auth/workspace gates are still loading */
  loading?: boolean
  /** Fallback when the query fails or returns null after load */
  fallbackMessage?: string
}

/**
 * Surfaces Convex query failures as a stable error string for inline Alerts.
 * Convex queries that throw surface as `null` once loading completes.
 */
export function useConvexQueryError(options: UseConvexQueryErrorOptions): string | null {
  const {
    data,
    skipped = false,
    loading = false,
    fallbackMessage = 'Unable to load data. Please try again.',
  } = options

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (skipped) {
      setError(null)
      return
    }
    if (loading || data === undefined) {
      setError(null)
      return
    }
    if (data === null) {
      setError(fallbackMessage)
      return
    }
    setError(null)
  }, [data, skipped, loading, fallbackMessage])

  return error
}

/**
 * Merge shape-validation errors with Convex query transport errors.
 */
export function mergeQueryErrors(
  ...errors: Array<string | null | undefined>
): string | null {
  const first = errors.find((value) => typeof value === 'string' && value.trim().length > 0)
  return first ?? null
}

export function queryErrorFromUnknown(
  error: unknown,
  fallback = 'Unable to load data. Please try again.'
): string {
  return convexErrorMessage(error, fallback)
}
