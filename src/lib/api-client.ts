import { authService } from '@/services/auth'

export async function apiFetch<T = any>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const token = await authService.getIdToken()
  const headers = new Headers(init.headers)
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  if (!headers.has('Content-Type') && init.method && init.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMessage = payload.error || 'An unexpected error occurred'
    throw new Error(errorMessage)
  }

  // Handle standardized envelope { success: true, data: T }
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T
  }

  // Backward compatibility: return payload directly
  return payload as T
}
