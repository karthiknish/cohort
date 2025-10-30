import type { Analytics } from 'firebase/analytics'

import { app } from './firebase'

let analyticsInstance: Analytics | null = null
let initializing: Promise<Analytics | null> | null = null

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>

async function initializeAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return null
  }

  if (analyticsInstance) {
    return analyticsInstance
  }

  if (initializing) {
    return initializing
  }

  initializing = (async () => {
    try {
      const { isSupported, getAnalytics } = await import('firebase/analytics')
      const supported = await isSupported().catch(() => false)
      if (!supported) {
        return null
      }

      analyticsInstance = getAnalytics(app)
      return analyticsInstance
    } catch (error) {
      console.warn('[analytics] failed to initialize Firebase Analytics', error)
      return null
    } finally {
      initializing = null
    }
  })()

  return initializing
}

export async function getAnalyticsInstance(): Promise<Analytics | null> {
  return await initializeAnalytics()
}

export async function logAnalyticsEvent(eventName: string, parameters?: AnalyticsParams): Promise<void> {
  const instance = await initializeAnalytics()
  if (!instance) {
    return
  }

  const { logEvent } = await import('firebase/analytics')
  logEvent(instance, eventName, parameters)
}

export async function logPageView(path: string, parameters?: AnalyticsParams): Promise<void> {
  const instance = await initializeAnalytics()
  if (!instance) {
    return
  }

  const location = typeof window !== 'undefined' ? window.location.href : path
  const defaultParams: AnalyticsParams = {
    page_path: path,
    page_location: location,
  }

  const { logEvent } = await import('firebase/analytics')
  logEvent(instance, 'page_view', {
    ...defaultParams,
    ...parameters,
  })
}

export async function setAnalyticsUserId(userId: string | null): Promise<void> {
  const instance = await initializeAnalytics()
  if (!instance) {
    return
  }

  const { setUserId } = await import('firebase/analytics')
  setUserId(instance, userId ?? null)
}

export async function setAnalyticsUserProperties(properties: Record<string, string | number | null | undefined>): Promise<void> {
  const instance = await initializeAnalytics()
  if (!instance) {
    return
  }

  const filteredEntries = Object.entries(properties).reduce<Record<string, string | number>>((accumulator, [key, value]) => {
    if (value === undefined || value === null) {
      return accumulator
    }
    accumulator[key] = value
    return accumulator
  }, {})

  if (Object.keys(filteredEntries).length === 0) {
    return
  }

  const { setUserProperties } = await import('firebase/analytics')
  setUserProperties(instance, filteredEntries)
}
