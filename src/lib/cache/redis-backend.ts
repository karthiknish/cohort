import type { CacheBackend } from './cache-manager'

// Intentionally dependency-free. Provide a minimal interface compatible with popular Redis clients.
export type RedisLikeClient = {
  get(key: string): Promise<string | null>
  set(key: string, value: string, opts?: { PX?: number }): Promise<unknown>
  del(key: string): Promise<unknown>
  // Optional scan API for prefix invalidation
  scan?(cursor: string, opts: { MATCH: string; COUNT?: number }): Promise<[string, string[]]>
  keys?(pattern: string): Promise<string[]>
}

export class RedisCacheBackend implements CacheBackend {
  constructor(private readonly client: RedisLikeClient) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlMs: number): Promise<void> {
    const ttl = Number(ttlMs)
    if (!Number.isFinite(ttl) || ttl <= 0) {
      await this.invalidate(key)
      return
    }

    await this.client.set(key, value, { PX: Math.floor(ttl) })
  }

  async invalidate(pattern: string): Promise<void> {
    if (!pattern || pattern === '*') {
      // Not safe to flush DB here without explicit opt-in.
      // Use a prefix-based keyspace or call client.flushDb() externally if desired.
      return
    }

    if (pattern.endsWith('*')) {
      const match = pattern

      if (this.client.scan) {
        let cursor = '0'
        do {
          const [nextCursor, keys] = await this.client.scan(cursor, { MATCH: match, COUNT: 200 })
          cursor = nextCursor
          if (keys.length > 0) {
            await Promise.all(keys.map((key) => this.client.del(key)))
          }
        } while (cursor !== '0')
        return
      }

      if (this.client.keys) {
        const keys = await this.client.keys(match)
        if (keys.length > 0) {
          await Promise.all(keys.map((key) => this.client.del(key)))
        }
        return
      }

      return
    }

    await this.client.del(pattern)
  }
}
