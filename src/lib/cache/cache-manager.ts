export interface CacheBackend {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlMs: number): Promise<void>
  invalidate(pattern: string): Promise<void>
}

export type CacheEvent = {
  type: 'hit' | 'miss' | 'set' | 'invalidate' | 'error'
  key?: string
  pattern?: string
  backend: string
}

export type CacheManagerOptions = {
  backendName?: string
  onEvent?: (event: CacheEvent) => void
}

function safeTtlMs(ttlMs: number): number {
  const ttl = Number(ttlMs)
  if (!Number.isFinite(ttl) || ttl <= 0) return 0
  return Math.floor(ttl)
}

export class CacheManager {
  private readonly inFlight = new Map<string, Promise<unknown>>()
  private readonly backendName: string
  private readonly counters = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0,
    errors: 0,
  }

  constructor(
    private readonly backend: CacheBackend,
    opts: CacheManagerOptions = {}
  ) {
    this.backendName = opts.backendName ?? 'unknown'
    this.onEvent = opts.onEvent
  }

  private readonly onEvent?: (event: CacheEvent) => void

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.backend.get(key)
      if (raw == null) {
        this.counters.misses += 1
        this.onEvent?.({ type: 'miss', key, backend: this.backendName })
        return null
      }
      this.counters.hits += 1
      this.onEvent?.({ type: 'hit', key, backend: this.backendName })
      return JSON.parse(raw) as T
    } catch (error) {
      this.counters.errors += 1
      this.onEvent?.({ type: 'error', key, backend: this.backendName })
      return null
    }
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const ttl = safeTtlMs(ttlMs)
    if (ttl <= 0) {
      await this.backend.invalidate(key)
      this.counters.invalidations += 1
      this.onEvent?.({ type: 'invalidate', pattern: key, backend: this.backendName })
      return
    }

    const payload = JSON.stringify(value)
    await this.backend.set(key, payload, ttl)
    this.counters.sets += 1
    this.onEvent?.({ type: 'set', key, backend: this.backendName })
  }

  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs: number): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const existing = this.inFlight.get(key)
    if (existing) {
      return existing as Promise<T>
    }

    const promise = (async () => {
      const value = await fetcher()
      await this.set(key, value, ttlMs)
      return value
    })().finally(() => {
      this.inFlight.delete(key)
    })

    this.inFlight.set(key, promise)
    return promise
  }

  async invalidate(pattern: string): Promise<void> {
    await this.backend.invalidate(pattern)
    this.counters.invalidations += 1
    this.onEvent?.({ type: 'invalidate', pattern, backend: this.backendName })
  }

  async invalidateWorkspace(workspaceId: string): Promise<void> {
    const prefix = `w:${encodeURIComponent(workspaceId)}:`
    await this.invalidate(`${prefix}*`)
  }

  async clearAll(): Promise<void> {
    await this.invalidate('*')
  }

  getStats(): Readonly<typeof this.counters> {
    return { ...this.counters }
  }
}

export function workspaceCacheKey(workspaceId: string, ...parts: Array<string | number | null | undefined>): string {
  const safeParts = parts
    .filter((part): part is string | number => part !== null && part !== undefined)
    .map((part) => encodeURIComponent(String(part)))
  return `w:${encodeURIComponent(workspaceId)}:${safeParts.join(':')}`
}
