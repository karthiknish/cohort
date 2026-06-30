"use node"

import { action, type ActionCtx } from '../../_generated/server'
import { api } from '../../_generated/api'
import { Errors, withErrorHandling } from '../../errors'
import { v } from 'convex/values'
import type { Doc } from '../../_generated/dataModel'

import { resolveDeepSeekApiKey } from '../../../src/services/deepseek'

async function requireAuthenticatedUser(ctx: ActionCtx): Promise<Doc<'users'>> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw Errors.auth.unauthorized()
  }

  const user = (await ctx.runQuery(api.users.getByLegacyId, {
    legacyId: identity.subject,
  })) as Doc<'users'> | null

  if (!user) {
    throw Errors.auth.userNotFound()
  }

  if (user.status !== 'active') {
    if (user.status === 'disabled' || user.status === 'suspended') {
      throw Errors.auth.userDisabled()
    }
    throw Errors.auth.forbidden('Your account is awaiting admin approval.')
  }

  return user
}

async function requireAdminUser(ctx: ActionCtx): Promise<Doc<'users'>> {
  const user = await requireAuthenticatedUser(ctx)
  if (user.role !== 'admin') {
    throw Errors.auth.adminRequired()
  }
  return user
}

/**
 * Presentation deck provider status (admin / diagnostics only).
 * With pptxgenjs, the "engine" is the local library + DeepSeek for AI content.
 */
export const getStatus = action({
  args: {},
  returns: v.object({
    configured: v.boolean(),
    valid: v.boolean(),
    error: v.optional(v.string()),
    engine: v.optional(v.string()),
    aiConfigured: v.optional(v.boolean()),
  }),
  handler: async (ctx) =>
    withErrorHandling(async () => {
      await requireAdminUser(ctx)

      const aiConfigured = Boolean(resolveDeepSeekApiKey())

      return {
        configured: true,
        valid: true,
        engine: 'pptxgenjs',
        aiConfigured,
        ...(!aiConfigured ? { error: 'DEEPSEEK_API_KEY is not configured — AI content generation will use fallbacks' } : {}),
      }
    }, 'presentationDeck:getStatus'),
})

export const listFolders = action({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
    after: v.optional(v.string()),
  },
  returns: v.object({
    data: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
      }),
    ),
    hasMore: v.boolean(),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) =>
    withErrorHandling(async () => {
      await requireAuthenticatedUser(ctx)

      // pptxgenjs is a local library — no folders concept.
      return {
        data: [],
        hasMore: false,
        nextCursor: null,
      }
    }, 'presentationDeck:listFolders'),
})

export const listThemes = action({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
    after: v.optional(v.string()),
  },
  returns: v.object({
    data: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        type: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
      }),
    ),
    hasMore: v.boolean(),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) =>
    withErrorHandling(async () => {
      await requireAuthenticatedUser(ctx)

      // pptxgenjs uses built-in styling — no external themes.
      return {
        data: [],
        hasMore: false,
        nextCursor: null,
      }
    }, 'presentationDeck:listThemes'),
})
