/**
 * Generic Integration API Client
 * 
 * Provides shared retry logic, backoff calculation, and logging for all
 * integration platform clients (Meta, Google, TikTok, LinkedIn).
 */

import { parseResponseError, type IntegrationPlatform } from '@/lib/errors'
import { calculateBackoffDelay, sleep, isRetryableStatus, parseRetryAfterMs, DEFAULT_RETRY_CONFIG } from '@/lib/retry-utils'

// =============================================================================
// TYPES
// =============================================================================

export interface BaseRequestOptions {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers?: Record<string, string>
    body?: string | Record<string, unknown>
    operation: string
    maxRetries?: number
    onAuthError?: () => Promise<{ retry: boolean; newToken?: string }>
    onRateLimitHit?: (retryAfterMs: number) => void
}

export interface RequestResult<T> {
    response: Response
    payload: T
}

export interface ClientConfig {
    platform: IntegrationPlatform
    baseUrl?: string
    defaultHeaders?: Record<string, string>
    maxRetries?: number
    /** Custom success check - return true if response is successful */
    isSuccess?: (response: Response, payload: unknown) => boolean
}

interface RequestLogContext {
    platform: IntegrationPlatform
    operation: string
    url: string
    attempt: number
    maxRetries: number
    duration?: number
    statusCode?: number
    error?: Error
    extra?: Record<string, unknown>
}

// =============================================================================
// LOGGING
// =============================================================================

function logRequest(context: RequestLogContext): void {
    const { platform, operation, url, attempt, maxRetries, duration, statusCode, error, extra } = context

    // Sanitize URL to hide tokens
    const sanitizedUrl = url.replace(/access_token=[^&]+/, 'access_token=***')
        .replace(/token=[^&]+/, 'token=***')
    const urlObj = new URL(sanitizedUrl)
    const path = `${urlObj.origin}${urlObj.pathname}`

    const logData = {
        url: path,
        attempt: `${attempt + 1}/${maxRetries}`,
        statusCode,
        duration: duration ? `${duration}ms` : undefined,
        ...extra,
    }

    if (error) {
        console.error(`[${platform.toUpperCase()} API] ${operation} failed`, {
            ...logData,
            error: 'toJSON' in error && typeof error.toJSON === 'function'
                ? error.toJSON()
                : { message: error.message },
        })
    } else {
        console.log(`[${platform.toUpperCase()} API] ${operation} completed`, logData)
    }
}

// =============================================================================
// INTEGRATION API CLIENT CLASS
// =============================================================================

export class IntegrationApiClient {
    private readonly platform: IntegrationPlatform
    private readonly baseUrl: string
    private readonly defaultHeaders: Record<string, string>
    private readonly maxRetries: number
    private readonly isSuccess: (response: Response, payload: unknown) => boolean

    constructor(config: ClientConfig) {
        this.platform = config.platform
        this.baseUrl = config.baseUrl ?? ''
        this.defaultHeaders = config.defaultHeaders ?? {}
        this.maxRetries = config.maxRetries ?? DEFAULT_RETRY_CONFIG.maxRetries
        this.isSuccess = config.isSuccess ?? ((response) => response.ok)
    }

    /**
     * Execute a request with automatic retry, backoff, and error handling
     */
    async executeRequest<T>(options: BaseRequestOptions): Promise<RequestResult<T>> {
        const {
            url,
            method = 'GET',
            headers: requestHeaders = {},
            body,
            operation,
            maxRetries = this.maxRetries,
            onAuthError,
            onRateLimitHit,
        } = options

        let currentUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`
        let currentHeaders = { ...this.defaultHeaders, ...requestHeaders }
        let lastError: Error | null = null

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const startTime = Date.now()
            let response: Response

            try {
                response = await fetch(currentUrl, {
                    method,
                    headers: currentHeaders,
                    ...(body && {
                        body: typeof body === 'string' ? body : JSON.stringify(body)
                    }),
                })
            } catch (networkError) {
                lastError = networkError instanceof Error
                    ? networkError
                    : new Error('Network request failed')

                logRequest({
                    platform: this.platform,
                    operation,
                    url: currentUrl,
                    attempt,
                    maxRetries,
                    duration: Date.now() - startTime,
                    error: lastError,
                })

                if (attempt < maxRetries - 1) {
                    await sleep(calculateBackoffDelay(attempt))
                    continue
                }
                throw lastError
            }

            const duration = Date.now() - startTime

            // Parse response
            let payload: T
            try {
                const contentType = response.headers.get('content-type') || ''
                if (contentType.includes('application/json')) {
                    payload = await response.json() as T
                } else {
                    payload = await response.text() as unknown as T
                }
            } catch {
                payload = { error: 'Failed to parse response' } as unknown as T
            }

            // Check success
            if (this.isSuccess(response, payload)) {
                logRequest({
                    platform: this.platform,
                    operation,
                    url: currentUrl,
                    attempt,
                    maxRetries,
                    duration,
                    statusCode: response.status,
                })
                return { response, payload }
            }

            // Parse error
            const error = await parseResponseError(response, this.platform)
            lastError = error

            logRequest({
                platform: this.platform,
                operation,
                url: currentUrl,
                attempt,
                maxRetries,
                duration,
                statusCode: response.status,
                error,
            })

            // Handle auth errors
            if (error.isAuthError && onAuthError) {
                const result = await onAuthError()
                if (result.retry && result.newToken) {
                    // Update auth header - platform specific
                    currentHeaders = this.updateAuthHeader(currentHeaders, result.newToken)
                    // Also update URL token params where applicable (e.g. Meta access_token)
                    currentUrl = this.updateAuthInUrl(currentUrl, result.newToken)
                    attempt = -1 // Reset to retry with new token
                    continue
                }
                throw error
            }

            // Handle rate limits
            if (response.status === 429) {
                const retryAfterMs = error.retryAfterMs
                    ?? parseRetryAfterMs(response.headers)
                    ?? calculateBackoffDelay(attempt) * 2

                onRateLimitHit?.(retryAfterMs)

                if (attempt < maxRetries - 1) {
                    console.warn(`[${this.platform.toUpperCase()} API] Rate limited, waiting ${retryAfterMs}ms`)
                    await sleep(retryAfterMs)
                    continue
                }
                throw error
            }

            // Handle retryable errors
            if ((error.isRetryable || isRetryableStatus(response.status)) && attempt < maxRetries - 1) {
                await sleep(calculateBackoffDelay(attempt))
                continue
            }

            throw error
        }

        throw lastError ?? new Error(`${this.platform} API request failed after all retries`)
    }

    /**
     * Update auth header based on platform conventions
     */
    private updateAuthHeader(headers: Record<string, string>, newToken: string): Record<string, string> {
        const updated = { ...headers }

        switch (this.platform) {
            case 'meta':
            case 'google':
                updated['Authorization'] = `Bearer ${newToken}`
                break
            case 'tiktok':
                updated['Access-Token'] = newToken
                break
            case 'linkedin':
                updated['Authorization'] = `Bearer ${newToken}`
                break
        }

        return updated
    }

    /**
     * Update auth token embedded in URLs for platforms that use query param auth.
     */
    private updateAuthInUrl(url: string, newToken: string): string {
        try {
            const urlObj = new URL(url)

            if (urlObj.searchParams.has('access_token')) {
                urlObj.searchParams.set('access_token', newToken)
            }

            if (urlObj.searchParams.has('token')) {
                urlObj.searchParams.set('token', newToken)
            }

            return urlObj.toString()
        } catch {
            return url
        }
    }

    /**
     * Helper for GET requests
     */
    async get<T>(url: string, options: Omit<BaseRequestOptions, 'url' | 'method'>): Promise<RequestResult<T>> {
        return this.executeRequest<T>({ ...options, url, method: 'GET' })
    }

    /**
     * Helper for POST requests
     */
    async post<T>(url: string, options: Omit<BaseRequestOptions, 'url' | 'method'>): Promise<RequestResult<T>> {
        return this.executeRequest<T>({ ...options, url, method: 'POST' })
    }
}

// =============================================================================
// PRE-CONFIGURED CLIENTS
// =============================================================================

export const metaAdsClient = new IntegrationApiClient({
    platform: 'meta',
    baseUrl: 'https://graph.facebook.com/v18.0',
})

export const googleAdsClient = new IntegrationApiClient({
    platform: 'google',
    baseUrl: 'https://googleads.googleapis.com/v15',
})

export const tiktokAdsClient = new IntegrationApiClient({
    platform: 'tiktok',
    baseUrl: 'https://business-api.tiktok.com/open_api/v1.3',
    isSuccess: (response, payload) => {
        // TikTok uses code: 0 for success
        const data = payload as { code?: number }
        return response.ok && (!data.code || data.code === 0)
    },
})

export const linkedinAdsClient = new IntegrationApiClient({
    platform: 'linkedin',
    baseUrl: 'https://api.linkedin.com/v2',
})

// Re-export utilities
export { calculateBackoffDelay, sleep, isRetryableStatus, parseRetryAfterMs, DEFAULT_RETRY_CONFIG }
