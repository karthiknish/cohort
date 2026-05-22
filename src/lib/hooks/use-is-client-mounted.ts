'use client'

import { useSyncExternalStore } from 'react'

function subscribe() {
  return () => {}
}

function getClientSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

/** True after hydration; false during SSR and the first server render. */
export function useIsClientMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
