import type { MutationCtx } from '../../_generated/server'
import type { IdempotencyResponse, MutationHandler } from './types'

export function withIdempotencyReplay<Ctx extends { cachedResponse?: IdempotencyResponse }, Args, Out>(
  handler: MutationHandler<Ctx, Args, Out>,
): MutationHandler<Ctx, Args, Out> {
  return async (ctx, args) => {
    if (ctx.cachedResponse !== undefined) {
      return ctx.cachedResponse as Out
    }
    return handler(ctx, args)
  }
}

/**
 * Shared helper to check and update idempotency status.
 */
export async function checkIdempotency(
  ctx: MutationCtx,
  key: string | undefined
): Promise<{ cachedResponse?: IdempotencyResponse; commitIdempotency?: (response: IdempotencyResponse) => Promise<void> }> {
  if (!key) return {}

  const existing = await ctx.db
    .query('apiIdempotency')
    .withIndex('by_key', (q) => q.eq('key', key))
    .unique()

  if (existing) {
    if (existing.status === 'completed') {
      return { cachedResponse: existing.response }
    }
    // If pending, we let it through but you might want to handle it differently 
    // depending on your concurrency requirements.
  }

  // Record that we started
  const now = Date.now()
  const id = await ctx.db.insert('apiIdempotency', {
    key,
    status: 'pending',
    requestId: null,
    method: null,
    path: null,
    response: null,
    httpStatus: null,
    createdAtMs: now,
    updatedAtMs: now,
  })

  return {
    commitIdempotency: async (response: IdempotencyResponse) => {
      await ctx.db.patch(id, {
        status: 'completed',
        response,
        updatedAtMs: Date.now(),
      })
    },
  }
}
