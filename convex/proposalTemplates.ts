import { v } from 'convex/values'
import { Errors } from './errors'
import { workspaceQuery, workspaceMutation } from './functions'

function generateId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

async function unsetOtherDefaults(ctx: any, workspaceId: string, excludeLegacyId?: string | null) {
  const defaults = await ctx.db
    .query('proposalTemplates')
    .withIndex('by_workspace_isDefault', (q: any) => q.eq('workspaceId', workspaceId).eq('isDefault', true))
    .collect()

  for (const row of defaults) {
    if (excludeLegacyId && row.legacyId === excludeLegacyId) continue
    await ctx.db.patch(row._id, { isDefault: false, updatedAtMs: Date.now() })
  }
}

export const list = workspaceQuery({
  args: { limit: v.number() },
  returns: v.array(
    v.object({
      legacyId: v.string(),
      name: v.string(),
      description: v.union(v.string(), v.null()),
      formData: v.record(v.string(), v.any()),
      industry: v.union(v.string(), v.null()),
      tags: v.array(v.string()),
      isDefault: v.boolean(),
      createdBy: v.union(v.string(), v.null()),
      createdAtMs: v.number(),
      updatedAtMs: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('proposalTemplates')
      .withIndex('by_workspace_createdAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .order('desc')
      .take(args.limit)

    return rows.map((row: any) => ({
      legacyId: row.legacyId,
      name: row.name,
      description: row.description,
      formData: row.formData,
      industry: row.industry,
      tags: row.tags,
      isDefault: row.isDefault,
      createdBy: row.createdBy,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
    }))
  },
})

export const count = workspaceQuery({
  args: {},
  returns: v.object({
    count: v.number(),
  }),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('proposalTemplates')
      .withIndex('by_workspace_createdAtMs_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId))
      .collect()

    return { count: rows.length }
  },
})

export const getByLegacyId = workspaceQuery({
  args: { legacyId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      legacyId: v.string(),
      name: v.string(),
      description: v.union(v.string(), v.null()),
      formData: v.record(v.string(), v.any()),
      industry: v.union(v.string(), v.null()),
      tags: v.array(v.string()),
      isDefault: v.boolean(),
      createdBy: v.union(v.string(), v.null()),
      createdAtMs: v.number(),
      updatedAtMs: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('proposalTemplates')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!row) return null
    return {
      legacyId: row.legacyId,
      name: row.name,
      description: row.description,
      formData: row.formData,
      industry: row.industry,
      tags: row.tags,
      isDefault: row.isDefault,
      createdBy: row.createdBy,
      createdAtMs: row.createdAtMs,
      updatedAtMs: row.updatedAtMs,
    }
  },
})

export const create = workspaceMutation({
  args: {
    name: v.string(),
    description: v.union(v.string(), v.null()),
    formData: v.record(v.string(), v.any()),
    industry: v.union(v.string(), v.null()),
    tags: v.array(v.string()),
    isDefault: v.boolean(),
    createdBy: v.union(v.string(), v.null()),
  },
  returns: v.object({
    legacyId: v.string(),
  }),
  handler: async (ctx, args) => {
    const timestamp = ctx.now
    let legacyId = generateId('proposal-template')
    let attempt = 0
    while (attempt < 5) {
      const existing = await ctx.db
        .query('proposalTemplates')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', legacyId))
        .unique()
      if (!existing) break
      legacyId = generateId('proposal-template')
      attempt += 1
    }

    if (args.isDefault) {
      await unsetOtherDefaults(ctx, args.workspaceId, null)
    }

    await ctx.db.insert('proposalTemplates', {
      workspaceId: args.workspaceId,
      legacyId,
      name: args.name,
      description: args.description,
      formData: args.formData,
      industry: args.industry,
      tags: args.tags,
      isDefault: args.isDefault,
      createdBy: args.createdBy,
      createdAtMs: timestamp,
      updatedAtMs: timestamp,
    })

    return { legacyId }
  },
})

export const update = workspaceMutation({
  args: {
    legacyId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    formData: v.optional(v.record(v.string(), v.any())),
    industry: v.optional(v.union(v.string(), v.null())),
    tags: v.optional(v.array(v.string())),
    isDefault: v.optional(v.boolean()),
    updatedAtMs: v.number(),
  },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('proposalTemplates')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Template')
    }

    if (args.isDefault === true) {
      await unsetOtherDefaults(ctx, args.workspaceId, args.legacyId)
    }

    const patch: Record<string, unknown> = { updatedAtMs: args.updatedAtMs }
    if (args.name !== undefined) patch.name = args.name
    if (args.description !== undefined) patch.description = args.description
    if (args.formData !== undefined) patch.formData = args.formData
    if (args.industry !== undefined) patch.industry = args.industry
    if (args.tags !== undefined) patch.tags = args.tags
    if (args.isDefault !== undefined) patch.isDefault = args.isDefault

    await ctx.db.patch(existing._id, patch)
    return { ok: true } as const
  },
})

export const remove = workspaceMutation({
  args: { legacyId: v.string() },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('proposalTemplates')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      return { ok: true } as const
    }

    await ctx.db.delete(existing._id)
    return { ok: true } as const
  },
})

export const bulkUpsert = workspaceMutation({
  args: {
    templates: v.array(
      v.object({
        workspaceId: v.string(),
        legacyId: v.string(),
        name: v.string(),
        description: v.union(v.string(), v.null()),
        formData: v.record(v.string(), v.any()),
        industry: v.union(v.string(), v.null()),
        tags: v.array(v.string()),
        isDefault: v.boolean(),
        createdBy: v.union(v.string(), v.null()),
        createdAtMs: v.number(),
        updatedAtMs: v.number(),
      }),
    ),
  },
  returns: v.object({
    upserted: v.number(),
  }),
  handler: async (ctx, args) => {
    let upserted = 0

    // First, if any incoming template isDefault=true, ensure uniqueness.
    const defaultByWorkspace = new Set<string>()
    for (const tpl of args.templates) {
      if (tpl.isDefault) defaultByWorkspace.add(tpl.workspaceId)
    }

    for (const wsId of defaultByWorkspace) {
      await unsetOtherDefaults(ctx, wsId, null)
    }

    for (const template of args.templates) {
      const existing = await ctx.db
        .query('proposalTemplates')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', template.workspaceId).eq('legacyId', template.legacyId))
        .unique()

      const payload = {
        workspaceId: template.workspaceId,
        legacyId: template.legacyId,
        name: template.name,
        description: template.description,
        formData: template.formData,
        industry: template.industry,
        tags: template.tags,
        isDefault: template.isDefault,
        createdBy: template.createdBy,
        createdAtMs: template.createdAtMs,
        updatedAtMs: template.updatedAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('proposalTemplates', payload)
      }

      upserted += 1
    }

    return { upserted }
  },
})
