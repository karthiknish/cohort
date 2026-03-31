import { authService } from '@/services/auth'
import { ResponseBodyParseError, parseJsonBody } from './response-json'
import { composeAbortSignal, isAbortError, isTimeoutError, sleepWithSignal } from './retry-utils'
import { UnifiedError } from './errors/unified-error'

export class ApiClientError extends UnifiedError {
  constructor(
    message: string,
    options: { status?: number; code?: string; details?: unknown; cause?: unknown } = {}
  ) {
    super({
      message,
      status: options.status,
      code: options.code,
      details:
        options.details && typeof options.details === 'object' && !Array.isArray(options.details)
          ? (options.details as Record<string, string[]>)
          : undefined,
      cause: options.cause,
    })
    this.name = 'ApiClientError'
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

function mapCodeFromStatus(value: number) {
  if (value === 401) return 'UNAUTHORIZED'
  if (value === 403) return 'FORBIDDEN'
  if (value === 404) return 'NOT_FOUND'
  if (value === 429) return 'RATE_LIMIT_EXCEEDED'
  if (value >= 500) return 'INTERNAL_ERROR'
  return undefined
}

async function parseApiResponsePayload(response: Response, context: string): Promise<unknown | null> {
  const status = response.status

  try {
    return await parseJsonBody<unknown>(response, {
      context,
      allowEmpty: status === 204 || status === 205,
    })
  } catch (error) {
    if (error instanceof ResponseBodyParseError) {
      if (!response.ok) {
        throw new ApiClientError(defaultStatusMessage(status), {
          status,
          code: mapCodeFromStatus(status) ?? 'INVALID_RESPONSE',
          cause: error,
        })
      }

      throw new ApiClientError('The server returned an invalid response. Please try again.', {
        status,
        code: 'INVALID_RESPONSE',
        cause: error,
      })
    }

    throw error
  }
}

function createNetworkApiClientError(error: unknown, timeoutMs?: number): ApiClientError {
  if (isTimeoutError(error)) {
    const timeoutSuffix = typeof timeoutMs === 'number' && timeoutMs > 0
      ? ` after ${Math.ceil(timeoutMs / 1000)}s`
      : ''

    return new ApiClientError(`The request timed out${timeoutSuffix}. Please try again.`, {
      code: 'REQUEST_TIMEOUT',
      cause: error,
    })
  }

  return new ApiClientError('Network error. Please check your connection and try again.', {
    code: 'NETWORK_ERROR',
    cause: error,
  })
}

export type ApiFetchOptions = RequestInit & {
  timeoutMs?: number
}

export async function apiFetch<T = unknown>(input: RequestInfo | URL, init: ApiFetchOptions = {}): Promise<T> {
  const { timeoutMs, signal: requestSignal, ...requestInit } = init
  const callerSignal = requestSignal ?? undefined
  const method = requestInit.method || 'GET'
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
  const isDeduplicatable = method.toUpperCase() === 'GET' && !callerSignal && !timeoutMs
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

      const headers = new Headers(requestInit.headers)

      if (!headers.has('Content-Type') && method.toUpperCase() !== 'GET') {
        headers.set('Content-Type', 'application/json')
      }

      const { signal, cleanup } = composeAbortSignal({ signal: callerSignal, timeoutMs })

      let response: Response
      try {
        response = await fetch(input, {
          ...requestInit,
          headers,
          credentials: requestInit.credentials ?? 'same-origin',
          signal,
        })
      } finally {
        cleanup()
      }

      const status = response.status
      const payload = await parseApiResponsePayload(response, `apiFetch ${method.toUpperCase()} ${url}`)
      const payloadRecord = payload && typeof payload === 'object' && !Array.isArray(payload)
        ? payload as Record<string, unknown>
        : null
      const isEnvelope = payloadRecord !== null && 'success' in payloadRecord

      if (!response.ok || (isEnvelope && payloadRecord.success === false)) {
        const code = typeof payloadRecord?.code === 'string' ? payloadRecord.code : mapCodeFromStatus(status)
        const message = typeof payloadRecord?.error === 'string' ? payloadRecord.error : defaultStatusMessage(status)
        throw new ApiClientError(message, { status, code, details: payloadRecord?.details })
      }

      // Handle standardized envelope { success: true, data: T }
      if (isEnvelope && 'data' in payloadRecord) {
        const result = payloadRecord.data as T
        if (isDeduplicatable) void responseCache.set(cacheKey, result, RESPONSE_CACHE_TTL_MS)
        return result
      }

      // Backward compatibility: return payload directly
      if (isDeduplicatable) void responseCache.set(cacheKey, payload as T, RESPONSE_CACHE_TTL_MS)
      return payload as T
    } catch (error) {
      if (isAbortError(error)) {
        throw error
      }

      const normalizedError = error instanceof ApiClientError
        ? error
        : createNetworkApiClientError(error, timeoutMs)

      if (attempt < 2 && isDeduplicatable && (normalizedError.code === 'NETWORK_ERROR' || normalizedError.code === 'REQUEST_TIMEOUT')) {
        await sleepWithSignal((attempt + 1) * 1000, callerSignal)
        return executeRequest(attempt + 1)
      }

      throw normalizedError
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
