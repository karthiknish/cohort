export type RetryConfig = {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  jitterFactor: number
}

export type AbortSignalOptions = {
  signal?: AbortSignal
  timeoutMs?: number
  timeoutMessage?: string
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

export function createAbortError(message = 'Aborted'): Error {
  try {
    // DOMException exists in browsers and modern Node.
    return new DOMException(message, 'AbortError')
  } catch {
    const error = new Error(message)
    ;(error as { name: string }).name = 'AbortError'
    return error
  }
}

export function createTimeoutError(ms: number, message?: string): Error {
  const timeoutMessage = message ?? `Request timed out after ${Math.ceil(ms / 1000)}s.`

  try {
    return new DOMException(timeoutMessage, 'TimeoutError')
  } catch {
    const error = new Error(timeoutMessage)
    ;(error as { name: string }).name = 'TimeoutError'
    return error
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'TimeoutError'
}

export function composeAbortSignal(options: AbortSignalOptions = {}): {
  signal?: AbortSignal
  cleanup: () => void
} {
  const { signal, timeoutMs, timeoutMessage } = options
  const hasTimeout = Number.isFinite(timeoutMs) && typeof timeoutMs === 'number' && timeoutMs > 0

  if (!signal && !hasTimeout) {
    return {
      signal: undefined,
      cleanup: () => {},
    }
  }

  if (signal && !hasTimeout) {
    return {
      signal,
      cleanup: () => {},
    }
  }

  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const abortFromSource = () => {
    controller.abort(signal?.reason ?? createAbortError())
  }

  if (signal?.aborted) {
    abortFromSource()
  } else if (signal) {
    signal.addEventListener('abort', abortFromSource, { once: true })
  }

  if (hasTimeout && !controller.signal.aborted) {
    timeoutId = setTimeout(() => {
      controller.abort(createTimeoutError(timeoutMs, timeoutMessage))
    }, timeoutMs)
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (signal) {
        signal.removeEventListener('abort', abortFromSource)
      }
    },
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
