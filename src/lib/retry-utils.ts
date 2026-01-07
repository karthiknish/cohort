export type RetryConfig = {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  jitterFactor: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.3,
}

export function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createAbortError(): Error {
  try {
    // DOMException exists in browsers and modern Node.
    return new DOMException('Aborted', 'AbortError')
  } catch {
    const error = new Error('Aborted')
    ;(error as { name: string }).name = 'AbortError'
    return error
  }
}

export function sleepWithSignal(ms: number, signal?: AbortSignal): Promise<void> {
  if (!signal) {
    return sleep(ms)
  }

  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError())
      return
    }

    const timeoutId = setTimeout(resolve, ms)

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId)
        reject(createAbortError())
      },
      { once: true }
    )
  })
}

export function parseRetryAfterMs(headers: Headers): number | undefined {
  const retryAfterHeader = headers.get('Retry-After')
  if (!retryAfterHeader) return undefined

  const seconds = parseInt(retryAfterHeader, 10)
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000
  }

  const dateMs = Date.parse(retryAfterHeader)
  if (Number.isFinite(dateMs)) {
    return Math.max(0, dateMs - Date.now())
  }

  return undefined
}

export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  rateLimitRetryAfter?: number
): number {
  if (rateLimitRetryAfter && rateLimitRetryAfter > 0) {
    return Math.min(rateLimitRetryAfter, config.maxDelayMs)
  }

  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt)
  const jitter = exponentialDelay * config.jitterFactor * Math.random()
  return Math.min(exponentialDelay + jitter, config.maxDelayMs)
}
