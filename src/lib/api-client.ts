import { authService } from '@/services/auth'
export class ApiClientError extends Error {
  readonly status?: number
  readonly code?: string
  readonly details?: unknown

  constructor(
    message: string,
    options: { status?: number; code?: string; details?: unknown; cause?: unknown } = {}
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.status = options.status
    this.code = options.code
    this.details = options.details
    if (options.cause) {
      this.cause = options.cause
    }
  }
}
import { CacheManager } from '@/lib/cache/cache-manager'
import { MemoryCacheBackend } from '@/lib/cache/memory-backend'
import {
  getPreviewClients,
  getPreviewActivity,
  getPreviewNotifications,
  isPreviewModeEnabled,
} from '@/lib/preview-data'

const inFlightRequests = new Map<string, Promise<unknown>>()

// Short-lived response cache to prevent identical rapid-fire requests
const RESPONSE_CACHE_TTL_MS = 2000 // 2 seconds
const responseCache = new CacheManager(new MemoryCacheBackend({ maxEntries: 300 }), {
  backendName: 'memory',
})

export async function apiFetch<T = unknown>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const method = init.method || 'GET'
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

  // Preview mode: short-circuit certain read endpoints with demo data.
  // This keeps preview mode fast and avoids requiring seeded Firestore data.
  if (method.toUpperCase() === 'GET' && typeof window !== 'undefined' && isPreviewModeEnabled()) {
    try {
      const resolved = new URL(url, window.location.origin)
      const path = resolved.pathname
      const clientId = resolved.searchParams.get('clientId')

      if (path === '/api/clients') {
        return { clients: getPreviewClients(), nextCursor: null } as T
      }

      // Legacy preview shortcut (REST activity route removed).
      // Keep temporarily in case other screens still call the old endpoint.
      if (path === '/api/activity') {
        const activities = getPreviewActivity(clientId)
        return { activities, hasMore: false, total: activities.length } as T
      }

      if (path === '/api/notifications') {
        return { notifications: getPreviewNotifications(), nextCursor: null } as T
      }

    } catch {
      // Fall through to live fetch.
    }
  }

  // Only deduplicate GET requests to avoid side-effect issues
  const isDeduplicatable = method.toUpperCase() === 'GET'
  // Include preview mode state in cache key to prevent stale data when mode changes
  const previewSuffix = typeof window !== 'undefined' && isPreviewModeEnabled() ? ':preview' : ''
  const cacheKey = `${method}:${url}${previewSuffix}`

  // Check response cache first (for rapid-fire identical requests)
  if (isDeduplicatable) {
    const cached = await responseCache.get<T>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  if (isDeduplicatable && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T>
  }

  const executeRequest = async (attempt = 0): Promise<T> => {
    try {
      if (typeof window !== 'undefined') {
        await authService.waitForInitialAuth().catch(() => {})
      }

      const headers = new Headers(init.headers)

      if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
        headers.set('Content-Type', 'application/json')
      }

      let response: Response
      try {
        response = await fetch(input, {
          ...init,
          headers,
          credentials: init.credentials ?? 'same-origin',
        })
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw error
        }

        if (attempt < 2 && isDeduplicatable) {
          await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000))
          return executeRequest(attempt + 1)
        }
        throw new ApiClientError('Network error', { code: 'NETWORK_ERROR', cause: error })
      }

      const payload = await response.json().catch(() => ({}))
      const status = response.status
      const isEnvelope = payload && typeof payload === 'object' && 'success' in payload

      const mapCodeFromStatus = (value: number) => {
        if (value === 401) return 'UNAUTHORIZED'
        if (value === 403) return 'FORBIDDEN'
        if (value === 404) return 'NOT_FOUND'
        if (value === 429) return 'RATE_LIMIT_EXCEEDED'
        if (value >= 500) return 'INTERNAL_ERROR'
        return undefined
      }

      if (!response.ok || (isEnvelope && payload.success === false)) {
        const code = payload?.code || mapCodeFromStatus(status)
        const message = payload?.error || defaultStatusMessage(status)
        throw new ApiClientError(message, { status, code, details: payload?.details })
      }

      // Handle standardized envelope { success: true, data: T }
      if (isEnvelope && 'data' in payload) {
        const result = payload.data as T
        if (isDeduplicatable) void responseCache.set(cacheKey, result, RESPONSE_CACHE_TTL_MS)
        return result
      }

      // Backward compatibility: return payload directly
      if (isDeduplicatable) void responseCache.set(cacheKey, payload as T, RESPONSE_CACHE_TTL_MS)
      return payload as T
    } catch (error) {
      if (attempt < 2 && (error as ApiClientError).code === 'NETWORK_ERROR' && isDeduplicatable) {
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000))
        return executeRequest(attempt + 1)
      }
      throw error
    }
  }

  const promise = executeRequest().finally(() => {
    if (isDeduplicatable) {
      inFlightRequests.delete(cacheKey)
    }
  })

  if (isDeduplicatable) {
    inFlightRequests.set(cacheKey, promise)
  }

  return promise
}

function defaultStatusMessage(status: number): string {
  if (status === 401) return 'Please sign in and try again.'
  if (status === 403) return "You don't have permission to do that."
  if (status === 404) return 'We could not find what you were looking for.'
  if (status === 429) return 'Too many requests. Please wait and try again.'
  if (status >= 500) return 'Something went wrong on our side. Please try again.'
  return 'Request failed. Please try again.'
}
