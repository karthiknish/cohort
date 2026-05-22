"use client"

import { useEffect } from 'react'

import { registerServiceWorkerWhenAvailable } from './register-service-worker'

async function cleanupDevServiceWorkers(): Promise<void> {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((reg) => reg.unregister()))

    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
  } catch (error) {
    console.warn('[pwa] dev cleanup failed', error)
  }
}

export function PWAProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const signal = { cancelled: false }

    // Service workers + cache-first strategies are great in prod but can easily
    // serve stale bundles in `next dev` (HMR/Turbopack), leading to confusing
    // mismatches like old fetch logic still running.
    if (process.env.NODE_ENV !== 'production') {
      void cleanupDevServiceWorkers()
      return
    }

    void registerServiceWorkerWhenAvailable(signal).catch((error) => {
      console.warn('[pwa] service worker registration failed', error)
    })

    return () => {
      signal.cancelled = true
    }
  }, [])

  return null
}
