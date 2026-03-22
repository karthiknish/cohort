'use client'

import { useMemo, useSyncExternalStore } from 'react'

const LOCATION_CHANGE_EVENT = 'cohort:locationchange'

let historyPatched = false

function dispatchLocationChange() {
  if (typeof window === 'undefined') {
    return
  }

  // Defer via queueMicrotask so this never fires synchronously inside a React
  // render/insertion-effect phase, which would violate the rule that
  // useInsertionEffect must not schedule updates.
  queueMicrotask(() => {
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
  })
}

function ensureHistoryPatched() {
  if (historyPatched || typeof window === 'undefined') {
    return
  }

  historyPatched = true

  for (const method of ['pushState', 'replaceState'] as const) {
    const originalMethod = window.history[method]

    window.history[method] = ((...args) => {
      const result = originalMethod.apply(window.history, args)
      dispatchLocationChange()
      return result
    }) as History[typeof method]
  }

  window.addEventListener('popstate', dispatchLocationChange)
}

function subscribeToSearchParams(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  ensureHistoryPatched()
  window.addEventListener(LOCATION_CHANGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener(LOCATION_CHANGE_EVENT, onStoreChange)
  }
}

function getSearchSnapshot() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.search
}

export function useUrlSearchParams() {
  const search = useSyncExternalStore(subscribeToSearchParams, getSearchSnapshot, () => '')

  return useMemo(() => new URLSearchParams(search), [search])
}