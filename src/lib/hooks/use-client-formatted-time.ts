'use client'

import { format } from 'date-fns'
import { useSyncExternalStore } from 'react'

import { parseDate } from '@/lib/dates'

function subscribeClientMounted(onStoreChange: () => void) {
  onStoreChange()
  return () => undefined
}

function getClientMountedSnapshot() {
  return true
}

function getServerMountedSnapshot() {
  return false
}

function formatClientTime(
  value: string | number | Date | null | undefined,
  formatStr: string,
): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const parsed =
    typeof value === 'string'
      ? parseDate(value) ?? new Date(value)
      : new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return format(parsed, formatStr)
}

/**
 * Formatted time string safe for SSR — empty until after mount.
 */
export function useClientFormattedTime(
  value: string | number | Date | null | undefined,
  formatStr: string,
): string | null {
  const isMounted = useSyncExternalStore(
    subscribeClientMounted,
    getClientMountedSnapshot,
    getServerMountedSnapshot,
  )

  if (!isMounted) {
    return null
  }

  return formatClientTime(value, formatStr)
}
