import { authService } from '@/services/auth'
import { ApiClientError } from './user-friendly-error'

export async function apiFetch<T = any>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
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
    return payload.data as T
  }

  // Backward compatibility: return payload directly
  return payload as T
}

function defaultStatusMessage(status: number): string {
  if (status === 401) return 'Please sign in and try again.'
  if (status === 403) return "You don't have permission to do that."
  if (status === 404) return 'We could not find what you were looking for.'
  if (status === 429) return 'Too many requests. Please wait and try again.'
  if (status >= 500) return 'Something went wrong on our side. Please try again.'
  return 'Request failed. Please try again.'
}
