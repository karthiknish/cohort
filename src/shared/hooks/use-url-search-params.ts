'use client'

import { useMemo, useSyncExternalStore } from 'react'

const LOCATION_CHANGE_EVENT = 'cohort:locationchange'

let historyPatched = false

function dispatchLocationChange() {
  if (typeof window === 'undefined') {
    return
  }

  // Defer via setTimeout (macrotask) so this never fires during an in-progress
  // React concurrent transition. queueMicrotask fires too early — it can land
  // while Next.js App Router's startTransition is still scheduled, causing
  // useSyncExternalStore.onStoreChange to preempt the render and throw
  // "Should not already be working." / "headCacheNode in null".
  // setTimeout(fn, 0) is a new macrotask that runs after React has committed.
  setTimeout(() => {
    window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
  }, 0)
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
      // Skip notification for Next.js's own internal navigations (flagged with
      // __NA or _N). Those transitions already re-render all consumers via the
      // router context; firing an extra useSyncExternalStore update mid-transition
      // is what corrupts the React fiber scheduler (headCacheNode / "Should not
      // already be working"). External callers (non-Next.js pushState) still get
      // the notification so popstate-style tracking continues to work.
      const data = args[0] as Record<string, unknown> | null | undefined
      if (!data?.__NA && !data?._N) {
        dispatchLocationChange()
      }
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