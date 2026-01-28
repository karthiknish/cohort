type CacheEntry<T> = {
  value: T
  expiresAt: number
  touchedAt: number
}

export class TtlCache {
  private store = new Map<string, CacheEntry<unknown>>()
  private readonly maxEntries: number

  constructor(options?: { maxEntries?: number }) {
    const parsed = Number(options?.maxEntries)
    this.maxEntries = Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), 5000) : 500
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) {
      return null
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return null
    }

    entry.touchedAt = Date.now()

    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const duration = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : 0
    const expiresAt = duration > 0 ? Date.now() + duration : Date.now()
    if (duration === 0) {
      this.store.delete(key)
      return
    }

    this.store.set(key, { value, expiresAt, touchedAt: Date.now() })
    this.evictIfNeeded()
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

  private evictIfNeeded(): void {
    if (this.store.size <= this.maxEntries) return

    const entries = Array.from(this.store.entries())
    entries.sort((a, b) => a[1].touchedAt - b[1].touchedAt)
    const excess = this.store.size - this.maxEntries
    for (let i = 0; i < excess; i += 1) {
      this.store.delete(entries[i]![0])
    }
  }
}

// =============================================================================
// Distributed cache manager (Convex-backed by default)
// =============================================================================

import { logger } from '@/lib/logger'
import { CacheManager, workspaceCacheKey, type CacheBackend } from '@/lib/cache/cache-manager'
import { MemoryCacheBackend } from '@/lib/cache/memory-backend'
import { ConvexCacheBackend } from '@/lib/cache/convex-backend'

function createServerCacheBackend(): { backend: CacheBackend; name: string } {
  const selection = (process.env.CACHE_BACKEND || 'convex').toLowerCase()

  if (selection === 'memory') {
    return { backend: new MemoryCacheBackend({ maxEntries: 1000 }), name: 'memory' }
  }

  // Default: Convex-backed cache for cross-instance consistency
  try {
    return { backend: new ConvexCacheBackend(), name: 'convex' }
  } catch (error) {
    logger.warn('[cache] Failed to initialize Convex cache backend, falling back to memory', { error })
    return { backend: new MemoryCacheBackend({ maxEntries: 1000 }), name: 'memory' }
  }
}

const { backend: serverBackend, name: serverBackendName } = createServerCacheBackend()

export const serverCache = new CacheManager(serverBackend, {
  backendName: serverBackendName,
  onEvent: (event) => {
    if (event.type === 'error') {
      logger.warn('[cache] backend error', { key: event.key, backend: event.backend })
    }
  },
})

export { CacheManager, workspaceCacheKey }
export type { CacheBackend }

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
