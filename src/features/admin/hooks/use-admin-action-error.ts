'use client'

import { useCallback, useState } from 'react'

import { asErrorMessage } from '@/lib/convex-errors'
import { reportConvexFailure } from '@/lib/handle-convex-error'

export function useAdminActionError() {
  const [actionError, setActionError] = useState<string | null>(null)

  const clearActionError = useCallback(() => {
    setActionError(null)
  }, [])

  const reportActionFailure = useCallback(
    (options: {
      error: unknown
      context: string
      title: string
      fallbackMessage?: string
    }) => {
      const message = asErrorMessage(options.error)
      setActionError(message)
      reportConvexFailure({
        error: options.error,
        context: options.context,
        title: options.title,
        fallbackMessage: options.fallbackMessage ?? message,
      })
    },
    []
  )

  return {
    actionError,
    clearActionError,
    reportActionFailure,
    setActionError,
  }
}
