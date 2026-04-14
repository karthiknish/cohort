import { v } from 'convex/values'
import { internalMutation, mutation } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { Errors } from './errors'

/**
 * API Idempotency - prevents duplicate request processing
 *
 * Flow:
 * 1. checkAndClaim - Atomically check if key exists, claim if new
 * 2. complete - Mark as completed with response data
 * 3. release - Delete pending record on error
 *
 * Convex actions use `internal.apiIdempotency.*` (no secret).
 * Next.js API proxy passes `serverSecret` matching env `COHORTS_API_IDEMPOTENCY_SECRET`.
 */

const idempotencyScalarValidator = v.union(v.null(), v.boolean(), v.number(), v.string())
const idempotencyLayer1Validator = v.union(
  idempotencyScalarValidator,
  v.array(idempotencyScalarValidator),
  v.record(v.string(), idempotencyScalarValidator),
)
const idempotencyLayer2Validator = v.union(
  idempotencyLayer1Validator,
  v.array(idempotencyLayer1Validator),
  v.record(v.string(), idempotencyLayer1Validator),
)
const idempotencyLayer3Validator = v.union(
  idempotencyLayer2Validator,
  v.array(idempotencyLayer2Validator),
  v.record(v.string(), idempotencyLayer2Validator),
)

const responseArg = v.union(
  v.null(),
  v.boolean(),
  v.number(),
  v.string(),
  v.array(idempotencyLayer3Validator),
  v.record(v.string(), idempotencyLayer3Validator),
)

function assertIdempotencyProxySecret(provided: string): void {
  const expected = process.env.COHORTS_API_IDEMPOTENCY_SECRET
  if (!expected || provided !== expected) {
    throw Errors.auth.unauthorized('Invalid idempotency proxy secret')
  }
}

type ClaimResult =
  | { type: 'new' }
  | { type: 'pending' }
  | { type: 'completed'; response: unknown; httpStatus: unknown }

async function performCheckAndClaim(
  ctx: MutationCtx,
  args: { key: string; requestId: string; method: string; path: string },
): Promise<ClaimResult> {
  const existing = await ctx.db
    .query('apiIdempotency')
    .withIndex('by_key', (q) => q.eq('key', args.key))
    .unique()

  if (existing) {
    if (existing.status === 'pending') {
      const staleThreshold = Date.now() - 5 * 60 * 1000
      if (existing.createdAtMs < staleThreshold) {
        await ctx.db.delete(existing._id)
      } else {
        return { type: 'pending' as const }
      }
    } else if (existing.status === 'completed') {
      return {
        type: 'completed' as const,
        response: existing.response,
        httpStatus: existing.httpStatus,
      }
    }
  }

  await ctx.db.insert('apiIdempotency', {
    key: args.key,
    status: 'pending',
    requestId: args.requestId,
    method: args.method,
    path: args.path,
    response: null,
    httpStatus: null,
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
  })

  return { type: 'new' as const }
}

async function performComplete(
  ctx: MutationCtx,
  args: { key: string; response: unknown; httpStatus: number },
): Promise<{ ok: true }> {
  const existing = await ctx.db
    .query('apiIdempotency')
    .withIndex('by_key', (q) => q.eq('key', args.key))
    .unique()

  if (!existing) {
    await ctx.db.insert('apiIdempotency', {
      key: args.key,
      status: 'completed',
      requestId: null,
      method: null,
      path: null,
      response: args.response as never,
      httpStatus: args.httpStatus,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    })
    return { ok: true as const }
  }

  await ctx.db.patch(existing._id, {
    status: 'completed',
    response: args.response as never,
    httpStatus: args.httpStatus,
    updatedAtMs: Date.now(),
  })

  return { ok: true as const }
}

async function performRelease(ctx: MutationCtx, args: { key: string }): Promise<{ ok: true }> {
  const existing = await ctx.db
    .query('apiIdempotency')
    .withIndex('by_key', (q) => q.eq('key', args.key))
    .unique()

  if (existing) {
    await ctx.db.delete(existing._id)
  }

  return { ok: true as const }
}

// ── Internal (Convex server only) ──────────────────────────────────────────

export const checkAndClaimInternal = internalMutation({
  args: {
    key: v.string(),
    requestId: v.string(),
    method: v.string(),
    path: v.string(),
  },
  handler: async (ctx, args) => performCheckAndClaim(ctx, args),
})

export const completeInternal = internalMutation({
  args: {
    key: v.string(),
    response: responseArg,
    httpStatus: v.number(),
  },
  handler: async (ctx, args) =>
    performComplete(ctx, { key: args.key, response: args.response, httpStatus: args.httpStatus }),
})

export const releaseInternal = internalMutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => performRelease(ctx, args),
})

// ── Public (Next.js API routes only — requires shared secret) ──────────────

export const checkAndClaim = mutation({
  args: {
    serverSecret: v.string(),
    key: v.string(),
    requestId: v.string(),
    method: v.string(),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    assertIdempotencyProxySecret(args.serverSecret)
    const { serverSecret: _s, ...rest } = args
    return performCheckAndClaim(ctx, rest)
  },
})

export const complete = mutation({
  args: {
    serverSecret: v.string(),
    key: v.string(),
    response: responseArg,
    httpStatus: v.number(),
  },
  handler: async (ctx, args) => {
    assertIdempotencyProxySecret(args.serverSecret)
    const { serverSecret: _s, key, response, httpStatus } = args
    return performComplete(ctx, { key, response, httpStatus })
  },
})

export const release = mutation({
  args: {
    serverSecret: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    assertIdempotencyProxySecret(args.serverSecret)
    const { serverSecret: _s, key } = args
    return performRelease(ctx, { key })
  },
})
