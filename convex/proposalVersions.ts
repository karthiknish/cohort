import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw Errors.auth.unauthorized()
}

function nowMs() {
  return Date.now()
}

function generateId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

type VersionRow = {
  legacyId: string
  proposalLegacyId: string
  versionNumber: number
  formData: any
  status: string
  stepProgress: number
  changeDescription: string | null
  createdBy: string
  createdByName: string | null
  createdAtMs: number
}

function mapRow(row: any): VersionRow {
  return {
    legacyId: String(row.legacyId),
    proposalLegacyId: String(row.proposalLegacyId),
    versionNumber: typeof row.versionNumber === 'number' ? row.versionNumber : 1,
    formData: row.formData ?? {},
    status: typeof row.status === 'string' ? row.status : 'draft',
    stepProgress: typeof row.stepProgress === 'number' ? row.stepProgress : 0,
    changeDescription: typeof row.changeDescription === 'string' ? row.changeDescription : null,
    createdBy: typeof row.createdBy === 'string' ? row.createdBy : '',
    createdByName: typeof row.createdByName === 'string' ? row.createdByName : null,
    createdAtMs: typeof row.createdAtMs === 'number' ? row.createdAtMs : 0,
  }
}

export const list = query({
  args: {
    workspaceId: v.string(),
    proposalLegacyId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = typeof args.limit === 'number' && Number.isFinite(args.limit) ? Math.min(Math.max(args.limit, 1), 200) : 50

    const rows = await ctx.db
      .query('proposalVersions')
      .withIndex('by_workspace_proposal_versionNumber_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('proposalLegacyId', args.proposalLegacyId),
      )
      .order('desc')
      .take(limit)

    return rows.map(mapRow)
  },
})

export const getByLegacyId = query({
  args: { workspaceId: v.string(), proposalLegacyId: v.string(), legacyId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('proposalVersions')
      .withIndex('by_workspace_proposal_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('proposalLegacyId', args.proposalLegacyId).eq('legacyId', args.legacyId),
      )
      .unique()

    if (!row) return null
    return mapRow(row)
  },
})

export const countByWorkspace = query({
  args: { workspaceId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const rows = await ctx.db
      .query('proposalVersions')
      .withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    return { count: rows.length }
  },
})

export const createSnapshot = mutation({
  args: {
    workspaceId: v.string(),
    proposalLegacyId: v.string(),
    changeDescription: v.optional(v.union(v.string(), v.null())),
    createdBy: v.string(),
    createdByName: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const proposal = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.proposalLegacyId))
      .unique()

    if (!proposal) {
      throw Errors.resource.notFound('Proposal')
    }

    const latest = await ctx.db
      .query('proposalVersions')
      .withIndex('by_workspace_proposal_versionNumber_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('proposalLegacyId', args.proposalLegacyId),
      )
      .order('desc')
      .take(1)

    const latestNumber = latest.length > 0 && typeof latest[0].versionNumber === 'number' ? latest[0].versionNumber : 0
    const versionNumber = latestNumber + 1

    const createdAtMs = nowMs()
    const legacyId = generateId('proposalVersion')

    await ctx.db.insert('proposalVersions', {
      workspaceId: args.workspaceId,
      proposalLegacyId: args.proposalLegacyId,
      legacyId,
      versionNumber,
      formData: proposal.formData ?? {},
      status: typeof proposal.status === 'string' ? proposal.status : 'draft',
      stepProgress: typeof proposal.stepProgress === 'number' ? proposal.stepProgress : 0,
      changeDescription: typeof args.changeDescription === 'string' ? args.changeDescription : null,
      createdBy: args.createdBy,
      createdByName: typeof args.createdByName === 'string' ? args.createdByName : null,
      createdAtMs,
    })

    return {
      version: {
        legacyId,
        proposalLegacyId: args.proposalLegacyId,
        versionNumber,
        formData: proposal.formData ?? {},
        status: typeof proposal.status === 'string' ? proposal.status : 'draft',
        stepProgress: typeof proposal.stepProgress === 'number' ? proposal.stepProgress : 0,
        changeDescription: typeof args.changeDescription === 'string' ? args.changeDescription : null,
        createdBy: args.createdBy,
        createdByName: typeof args.createdByName === 'string' ? args.createdByName : null,
        createdAtMs,
      },
    }
  },
})

export const restoreToVersion = mutation({
  args: {
    workspaceId: v.string(),
    proposalLegacyId: v.string(),
    versionLegacyId: v.string(),
    createdBy: v.string(),
    createdByName: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const proposal = await ctx.db
      .query('proposals')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.proposalLegacyId))
      .unique()

    if (!proposal) {
      throw Errors.resource.notFound('Proposal')
    }

    const target = await ctx.db
      .query('proposalVersions')
      .withIndex('by_workspace_proposal_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('proposalLegacyId', args.proposalLegacyId).eq('legacyId', args.versionLegacyId),
      )
      .unique()

    if (!target) {
      throw Errors.resource.notFound('Version')
    }

    const latest = await ctx.db
      .query('proposalVersions')
      .withIndex('by_workspace_proposal_versionNumber_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('proposalLegacyId', args.proposalLegacyId),
      )
      .order('desc')
      .take(1)

    const latestNumber = latest.length > 0 && typeof latest[0].versionNumber === 'number' ? latest[0].versionNumber : 0
    const beforeNumber = latestNumber + 1
    const afterNumber = latestNumber + 2

    const createdAtMs = nowMs()
    const createdByName = typeof args.createdByName === 'string' ? args.createdByName : null

    // Snapshot current state before restore
    await ctx.db.insert('proposalVersions', {
      workspaceId: args.workspaceId,
      proposalLegacyId: args.proposalLegacyId,
      legacyId: generateId('proposalVersion'),
      versionNumber: beforeNumber,
      formData: proposal.formData ?? {},
      status: typeof proposal.status === 'string' ? proposal.status : 'draft',
      stepProgress: typeof proposal.stepProgress === 'number' ? proposal.stepProgress : 0,
      changeDescription: `Auto-saved before restoring to version ${target.versionNumber}`,
      createdBy: args.createdBy,
      createdByName,
      createdAtMs,
    })

    // Restore proposal
    const timestamp = nowMs()
    await ctx.db.patch(proposal._id, {
      formData: target.formData ?? {},
      status: typeof target.status === 'string' ? target.status : 'draft',
      stepProgress: typeof target.stepProgress === 'number' ? target.stepProgress : 0,
      updatedAtMs: timestamp,
      lastAutosaveAtMs: timestamp,
    })

    // Snapshot restored state
    await ctx.db.insert('proposalVersions', {
      workspaceId: args.workspaceId,
      proposalLegacyId: args.proposalLegacyId,
      legacyId: generateId('proposalVersion'),
      versionNumber: afterNumber,
      formData: target.formData ?? {},
      status: typeof target.status === 'string' ? target.status : 'draft',
      stepProgress: typeof target.stepProgress === 'number' ? target.stepProgress : 0,
      changeDescription: `Restored from version ${target.versionNumber}`,
      createdBy: args.createdBy,
      createdByName,
      createdAtMs: nowMs(),
    })

    return {
      success: true,
      restoredFromVersion: typeof target.versionNumber === 'number' ? target.versionNumber : 1,
      newVersion: afterNumber,
    }
  },
})

export const bulkUpsert = mutation({
  args: {
    versions: v.array(
      v.object({
        workspaceId: v.string(),
        proposalLegacyId: v.string(),
        legacyId: v.string(),
        versionNumber: v.number(),
        formData: v.any(),
        status: v.string(),
        stepProgress: v.number(),
        changeDescription: v.union(v.string(), v.null()),
        createdBy: v.string(),
        createdByName: v.union(v.string(), v.null()),
        createdAtMs: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    let upserted = 0

    for (const version of args.versions) {
      const existing = await ctx.db
        .query('proposalVersions')
        .withIndex('by_workspace_proposal_legacyId', (q) =>
          q
            .eq('workspaceId', version.workspaceId)
            .eq('proposalLegacyId', version.proposalLegacyId)
            .eq('legacyId', version.legacyId),
        )
        .unique()

      const payload = {
        workspaceId: version.workspaceId,
        proposalLegacyId: version.proposalLegacyId,
        legacyId: version.legacyId,
        versionNumber: version.versionNumber,
        formData: version.formData,
        status: version.status,
        stepProgress: version.stepProgress,
        changeDescription: version.changeDescription,
        createdBy: version.createdBy,
        createdByName: version.createdByName,
        createdAtMs: version.createdAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('proposalVersions', payload)
      }

      upserted += 1
    }

    return { upserted }
  },
})
