import { authService } from '@/services/auth'
import { ApiClientError } from './user-friendly-error'
import {
  getPreviewClients,
  getPreviewFinanceSummary,
  getPreviewMetrics,
  getPreviewTasks,
  getPreviewProjects,
  getPreviewProposals,
  getPreviewActivity,
  getPreviewNotifications,
  getPreviewCollaborationMessages,
  isPreviewModeEnabled,
} from '@/lib/preview-data'

const inFlightRequests = new Map<string, Promise<any>>()

// Short-lived response cache to prevent identical rapid-fire requests
type CachedResponse = { data: any; expiresAt: number }
const responseCache = new Map<string, CachedResponse>()
const RESPONSE_CACHE_TTL_MS = 2000 // 2 seconds

function getCachedResponse<T>(key: string): T | null {
  const entry = responseCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key)
    return null
  }
  return entry.data as T
}

function setCachedResponse<T>(key: string, data: T): void {
  responseCache.set(key, { data, expiresAt: Date.now() + RESPONSE_CACHE_TTL_MS })
}

export async function apiFetch<T = any>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const method = init.method || 'GET'
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

  // Preview mode: short-circuit certain read endpoints with demo data.
  // This keeps preview mode fast and avoids requiring seeded Firestore data.
  if (method.toUpperCase() === 'GET' && typeof window !== 'undefined' && isPreviewModeEnabled()) {
    try {
      const resolved = new URL(url, window.location.origin)
      const path = resolved.pathname
      const clientId = resolved.searchParams.get('clientId')
      const clientIds = resolved.searchParams.get('clientIds')

      if (path === '/api/clients') {
        return { clients: getPreviewClients(), nextCursor: null } as T
      }

      if (path === '/api/finance') {
        return getPreviewFinanceSummary(clientId) as T
      }

      if (path === '/api/metrics') {
        // Support either single clientId or the server's clientIds CSV param.
        const resolvedClientId = clientId || (clientIds && clientIds.split(',').map((v) => v.trim()).filter(Boolean)[0]) || null
        return { metrics: getPreviewMetrics(resolvedClientId), nextCursor: null } as T
      }

      if (path === '/api/tasks') {
        return { tasks: getPreviewTasks(clientId), nextCursor: null } as T
      }

      if (path === '/api/projects') {
        return { projects: getPreviewProjects(clientId) } as T
      }

      if (path === '/api/proposals') {
        return { proposals: getPreviewProposals(clientId) } as T
      }

      if (path === '/api/activity') {
        const activities = getPreviewActivity(clientId)
        return { activities, hasMore: false, total: activities.length } as T
      }

      if (path === '/api/notifications') {
        return { notifications: getPreviewNotifications(), nextCursor: null } as T
      }

      if (path === '/api/collaboration/messages') {
        const projectId = resolved.searchParams.get('projectId')
        return { messages: getPreviewCollaborationMessages(clientId, projectId), nextCursor: null } as T
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
    const cached = getCachedResponse<T>(cacheKey)
    if (cached !== null) {
      return cached
    }
  }

  if (isDeduplicatable && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)
  }

  const executeRequest = async (attempt = 0): Promise<T> => {
    try {
      const token = await authService.getIdToken()
      const headers = new Headers(init.headers)

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
        headers.set('Content-Type', 'application/json')
      }

      let response: Response
      try {
        response = await fetch(input, {
          ...init,
          headers,
        })
      } catch (error) {
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
        if (isDeduplicatable) setCachedResponse(cacheKey, result)
        return result
      }

      // Backward compatibility: return payload directly
      if (isDeduplicatable) setCachedResponse(cacheKey, payload as T)
      return payload as T
    } catch (error) {
      if (attempt < 2 && (error as any).code === 'NETWORK_ERROR' && isDeduplicatable) {
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
