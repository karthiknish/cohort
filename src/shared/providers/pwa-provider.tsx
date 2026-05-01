"use client"

import { useEffect } from 'react'

export function PWAProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    let cancelled = false

    // Service workers + cache-first strategies are great in prod but can easily
    // serve stale bundles in `next dev` (HMR/Turbopack), leading to confusing
    // mismatches like old fetch logic still running.
    if (process.env.NODE_ENV !== 'production') {
      const cleanupDev = async () => {
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

      void cleanupDev()
      return
    }

    const register = async () => {
      try {
        const response = await fetch('/sw.js', {
          method: 'HEAD',
          cache: 'no-store',
        })

        if (!response.ok || cancelled) {
          return
        }

        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        // Immediately update if a new service worker is found
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[pwa] service worker registration failed', error)
        }
      }
    }

    void register()

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
