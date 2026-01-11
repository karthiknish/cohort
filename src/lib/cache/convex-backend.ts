import { createHash } from 'crypto'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../../convex/_generated/api'
import type { CacheBackend } from './cache-manager'

export type ConvexCacheBackendOptions = {
  /** Optional Convex URL override (defaults to env vars) */
  convexUrl?: string
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

// Lazy-init Convex client
let _convexClient: ConvexHttpClient | null = null
function getConvexClient(url?: string): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const resolvedUrl = url ?? process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!resolvedUrl) return null
  _convexClient = new ConvexHttpClient(resolvedUrl)
  return _convexClient
}

export class ConvexCacheBackend implements CacheBackend {
  private readonly client: ConvexHttpClient | null

  constructor(opts: ConvexCacheBackendOptions = {}) {
    this.client = getConvexClient(opts.convexUrl)
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null

    try {
      const keyHash = hashKey(key)
      const result = await this.client.query(api.serverCache.get, { keyHash })
      return result?.value ?? null
    } catch {
      return null
    }
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    if (!this.client) return

    const ttl = Number(ttlMs)
    if (!Number.isFinite(ttl) || ttl <= 0) {
      await this.invalidate(key)
      return
    }

    try {
      const keyHash = hashKey(key)
      await this.client.mutation(api.serverCache.set, {
        keyHash,
        key,
        value,
        ttlMs: ttl,
      })
    } catch {
      // Silently fail - cache is best-effort
    }
  }

  async invalidate(pattern: string): Promise<void> {
    if (!this.client) return

    try {
      const keyHash = pattern && !pattern.endsWith('*') ? hashKey(pattern) : undefined
      await this.client.mutation(api.serverCache.invalidate, {
        pattern,
        keyHash,
      })
    } catch {
      // Silently fail - cache is best-effort
    }
  }
}
