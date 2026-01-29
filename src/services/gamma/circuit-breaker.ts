/**
 * Circuit Breaker for Gamma API
 * Prevents cascading failures by temporarily disabling calls to Gamma
 * after a threshold of consecutive failures is reached.
 */

export interface CircuitBreakerConfig {
  /** Number of consecutive failures before opening the circuit */
  failureThreshold: number
  /** Time in milliseconds to wait before attempting to close the circuit */
  resetTimeoutMs: number
  /** Time in milliseconds for half-open state test period */
  halfOpenTimeoutMs: number
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open'
  failureCount: number
  lastFailureTime: number | null
  lastSuccessTime: number | null
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 60 * 1000, // 1 minute
  halfOpenTimeoutMs: 10 * 1000, // 10 seconds
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig
  private state: CircuitBreakerState
  private halfOpenStartTime: number | null = null

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.state = {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
    }
  }

  /**
   * Check if the circuit allows execution
   */
  canExecute(): boolean {
    const now = Date.now()

    // If circuit is open, check if we should attempt reset
    if (this.state.state === 'open') {
      if (
        this.state.lastFailureTime &&
        now - this.state.lastFailureTime >= this.config.resetTimeoutMs
      ) {
        // Transition to half-open
        this.state.state = 'half-open'
        this.halfOpenStartTime = now
        console.log('[CircuitBreaker] Circuit transitioned to half-open state')
        return true
      }
      return false
    }

    // If in half-open, check if test period has expired
    if (this.state.state === 'half-open') {
      if (
        this.halfOpenStartTime &&
        now - this.halfOpenStartTime >= this.config.halfOpenTimeoutMs
      ) {
        // Test period expired without success, stay open
        this.state.state = 'open'
        this.state.lastFailureTime = now
        this.halfOpenStartTime = null
        console.log('[CircuitBreaker] Half-open test period expired, circuit opened again')
        return false
      }
      return true
    }

    // Circuit is closed, allow execution
    return true
  }

  /**
   * Record a successful execution
   */
  recordSuccess(): void {
    this.state.failureCount = 0
    this.state.lastSuccessTime = Date.now()
    this.halfOpenStartTime = null

    if (this.state.state === 'half-open') {
      this.state.state = 'closed'
      console.log('[CircuitBreaker] Circuit closed after successful test')
    }
  }

  /**
   * Record a failed execution
   */
  recordFailure(): void {
    this.state.failureCount++
    this.state.lastFailureTime = Date.now()

    if (this.state.failureCount >= this.config.failureThreshold) {
      this.state.state = 'open'
      this.halfOpenStartTime = null
      console.error(
        `[CircuitBreaker] Circuit opened after ${this.state.failureCount} consecutive failures`
      )
    }
  }

  /**
   * Get the current state
   */
  getState(): CircuitBreakerState {
    return { ...this.state }
  }

  /**
   * Reset the circuit breaker to closed state
   */
  reset(): void {
    this.state = {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
    }
    this.halfOpenStartTime = null
    console.log('[CircuitBreaker] Circuit manually reset to closed')
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error(
        `Circuit breaker is ${this.state.state}. Too many recent failures. Please try again later.`
      )
    }

    try {
      const result = await fn()
      this.recordSuccess()
      return result
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }
}

// Singleton instance for Gamma API
let gammaCircuitBreaker: CircuitBreaker | null = null

export function getGammaCircuitBreaker(): CircuitBreaker {
  if (!gammaCircuitBreaker) {
    gammaCircuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeoutMs: 60 * 1000, // 1 minute
      halfOpenTimeoutMs: 10 * 1000, // 10 seconds
    })
  }
  return gammaCircuitBreaker
}

export function resetGammaCircuitBreaker(): void {
  if (gammaCircuitBreaker) {
    gammaCircuitBreaker.reset()
  }
}
