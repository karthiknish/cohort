import { v } from 'convex/values'

import { Errors, isAppError } from './errors'
import { adminMutation, adminQuery, type AuthenticatedMutationCtx, type AuthenticatedQueryCtx } from './functions'

function nowMs() {
  return Date.now()
}

function throwAdminFeaturesError(operation: string, error: unknown, context?: Record<string, unknown>): never {
  console.error(`[adminFeatures:${operation}]`, context ?? {}, error)

  if (isAppError(error)) {
    throw error
  }

  throw Errors.base.internal('Admin feature operation failed')
}

const referenceValidator = v.object({
  url: v.string(),
  label: v.string(),
})

export const listFeatures = adminQuery({
  args: {},
  handler: async (ctx: AuthenticatedQueryCtx) => {
    try {
      const rows = await ctx.db
        .query('platformFeatures')
        .withIndex('by_createdAtMs', (q) => q)
        .order('desc')
        .collect()

      return {
        features: rows.map((row) => ({
          id: row._id,
          title: row.title,
          description: row.description,
          status: row.status,
          priority: row.priority,
          imageUrl: row.imageUrl,
          references: row.references,
          createdAtMs: row.createdAtMs,
          updatedAtMs: row.updatedAtMs,
        })),
      }
    } catch (error) {
      throwAdminFeaturesError('listFeatures', error)
    }
  },
})

export const createFeature = adminMutation({
  args: {
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('backlog'),
      v.literal('planned'),
      v.literal('in_progress'),
      v.literal('completed')
    ),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    imageUrl: v.union(v.string(), v.null()),
    references: v.array(referenceValidator),
  },
  handler: async (ctx: AuthenticatedMutationCtx, args) => {
    try {
      const timestamp = nowMs()

      const id = await ctx.db.insert('platformFeatures', {
        legacyId: null,
        title: args.title,
        description: args.description,
        status: args.status,
        priority: args.priority,
        imageUrl: args.imageUrl,
        references: args.references,
        createdAtMs: timestamp,
        updatedAtMs: timestamp,
      })

      return { id }
    } catch (error) {
      throwAdminFeaturesError('createFeature', error, { title: args.title })
    }
  },
})

export const updateFeature = adminMutation({
  args: {
    id: v.id('platformFeatures'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('backlog'),
        v.literal('planned'),
        v.literal('in_progress'),
        v.literal('completed')
      )
    ),
    priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
    imageUrl: v.optional(v.union(v.string(), v.null())),
    references: v.optional(v.array(referenceValidator)),
  },
  handler: async (ctx: AuthenticatedMutationCtx, args) => {
    try {
      const existing = await ctx.db.get(args.id)
      if (!existing) {
        throw Errors.resource.notFound('Feature')
      }

      const patch: Record<string, unknown> = {
        updatedAtMs: nowMs(),
      }

      if (args.title !== undefined) patch.title = args.title
      if (args.description !== undefined) patch.description = args.description
      if (args.status !== undefined) patch.status = args.status
      if (args.priority !== undefined) patch.priority = args.priority
      if (args.imageUrl !== undefined) patch.imageUrl = args.imageUrl
      if (args.references !== undefined) patch.references = args.references

      await ctx.db.patch(args.id, patch)

      return { ok: true }
    } catch (error) {
      throwAdminFeaturesError('updateFeature', error, { id: args.id })
    }
  },
})

export const deleteFeature = adminMutation({
  args: { id: v.id('platformFeatures') },
  handler: async (ctx: AuthenticatedMutationCtx, args) => {
    try {
      const existing = await ctx.db.get(args.id)
      if (!existing) {
        throw Errors.resource.notFound('Feature')
      }

      await ctx.db.delete(args.id)
      return { ok: true }
    } catch (error) {
      throwAdminFeaturesError('deleteFeature', error, { id: args.id })
    }
  },
})
