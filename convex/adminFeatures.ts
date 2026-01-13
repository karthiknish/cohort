import { v } from 'convex/values'
import { adminQuery, adminMutation } from './functions'
import { Errors } from './errors'

function nowMs() {
  return Date.now()
}

const referenceValidator = v.object({
  url: v.string(),
  label: v.string(),
})

export const listFeatures = adminQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('platformFeatures').order('desc').collect()

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
  handler: async (ctx, args) => {
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
  },
})

export const bulkUpsertFeatures = adminMutation({
  args: {
    features: v.array(
      v.object({
        legacyId: v.string(),
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
        createdAtMs: v.number(),
        updatedAtMs: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const feature of args.features) {
      const existing = await ctx.db
        .query('platformFeatures')
        .withIndex('by_legacyId', (q) => q.eq('legacyId', feature.legacyId))
        .unique()

      const payload = {
        legacyId: feature.legacyId,
        title: feature.title,
        description: feature.description,
        status: feature.status,
        priority: feature.priority,
        imageUrl: feature.imageUrl,
        references: feature.references,
        createdAtMs: feature.createdAtMs,
        updatedAtMs: feature.updatedAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('platformFeatures', payload)
      }
    }

    return { ok: true, upserted: args.features.length }
  },
})

export const getFeature = adminQuery({
  args: { id: v.id('platformFeatures') },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id)
    if (!row) return null

    return {
      id: row._id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      imageUrl: row.imageUrl,
      references: row.references,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
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
  handler: async (ctx, args) => {
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
  },
})

export const deleteFeature = adminMutation({
  args: { id: v.id('platformFeatures') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      throw Errors.resource.notFound('Feature')
    }

    await ctx.db.delete(args.id)
    return { ok: true }
  },
})
