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

/** Pure resolver used by useConvexQueryError (testable without React). */
export function resolveConvexQueryErrorMessage(
  data: unknown,
  options: Pick<UseConvexQueryErrorOptions, 'skipped' | 'loading' | 'fallbackMessage'> = {},
): string | null {
  const {
    skipped = false,
    loading = false,
    fallbackMessage = 'Unable to load data. Please try again.',
  } = options

  if (skipped) {
    return null
  }
  if (loading || data === undefined) {
    return null
  }
  if (data === null) {
    return fallbackMessage
  }
  return null
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
    setError(
      resolveConvexQueryErrorMessage(data, { skipped, loading, fallbackMessage }),
    )
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
