type CacheEntry<T> = {
  value: T
  expiresAt: number
}

export class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) {
      return null
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return null
    }

    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const duration = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : 0
    const expiresAt = duration > 0 ? Date.now() + duration : Date.now()
    if (duration === 0) {
      this.store.delete(key)
      return
    }

    this.store.set(key, { value, expiresAt })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  invalidatePrefix(prefix: string): void {
    if (!prefix) {
      this.store.clear()
      return
    }

    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
      }
    }
  }

  clear(): void {
    this.store.clear()
  }
}

export const serverCache = new TtlCache()

export function buildCacheHeaders(options: {
  scope?: 'public' | 'private'
  maxAgeSeconds: number
  staleWhileRevalidateSeconds?: number
}): Record<string, string> {
  const scope = options.scope ?? 'private'
  const maxAge = Math.max(0, Math.floor(options.maxAgeSeconds))
  const stale = Math.max(0, Math.floor(options.staleWhileRevalidateSeconds ?? 0))

  const directives = [`${scope}`, `max-age=${maxAge}`]
  if (stale > 0) {
    directives.push(`stale-while-revalidate=${stale}`)
  }

  return {
    'Cache-Control': directives.join(', '),
  }
}
