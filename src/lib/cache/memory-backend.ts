import type { CacheBackend } from './cache-manager'

type MemoryEntry = {
  value: string
  expiresAt: number
  touchedAt: number
}

export type MemoryBackendOptions = {
  maxEntries?: number
}

function safeMaxEntries(value: number | undefined): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return 500
  return Math.min(Math.floor(parsed), 5000)
}

export class MemoryCacheBackend implements CacheBackend {
  private readonly store = new Map<string, MemoryEntry>()
  private readonly maxEntries: number

  constructor(opts: MemoryBackendOptions = {}) {
    this.maxEntries = safeMaxEntries(opts.maxEntries)
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry) return null

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return null
    }

    entry.touchedAt = Date.now()
    return entry.value
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    const ttl = Number(ttlMs)
    if (!Number.isFinite(ttl) || ttl <= 0) {
      this.store.delete(key)
      return
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      touchedAt: Date.now(),
    })

    this.evictIfNeeded()
  }

  async invalidate(pattern: string): Promise<void> {
    if (!pattern || pattern === '*') {
      this.store.clear()
      return
    }

    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1)
      for (const key of this.store.keys()) {
        if (key.startsWith(prefix)) {
          this.store.delete(key)
        }
      }
      return
    }

    this.store.delete(pattern)
  }

  private evictIfNeeded(): void {
    if (this.store.size <= this.maxEntries) return

    // Evict least-recently-touched entries first.
    const entries = Array.from(this.store.entries())
    entries.sort((a, b) => a[1].touchedAt - b[1].touchedAt)

    const excess = this.store.size - this.maxEntries
    for (let i = 0; i < excess; i += 1) {
      this.store.delete(entries[i]![0])
    }
  }
}
