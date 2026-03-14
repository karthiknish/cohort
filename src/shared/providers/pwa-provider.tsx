"use client"

import { useEffect } from 'react'

export function PWAProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

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
        console.error('[pwa] service worker registration failed', error)
      }
    }

    register()

    return () => {
      // No cleanup needed
    }
  }, [])

  return null
}
