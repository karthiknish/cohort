import { v } from 'convex/values'
import { Errors } from './errors'
import { workspaceQuery, workspaceMutation } from './functions'

function nowMs() {
  return Date.now()
}

function generateId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

const formScalarValidator = v.union(v.null(), v.boolean(), v.number(), v.string())
const formLayer1Validator = v.union(
  formScalarValidator,
  v.array(formScalarValidator),
  v.record(v.string(), formScalarValidator),
)
const formLayer2Validator = v.union(
  formLayer1Validator,
  v.array(formLayer1Validator),
  v.record(v.string(), formLayer1Validator),
)
const formDataValidator = v.record(v.string(), formLayer2Validator)

type FormScalar = string | number | boolean | null
type FormLayer1 = FormScalar | FormScalar[] | Record<string, FormScalar>
type FormLayer2 = FormLayer1 | FormLayer1[] | Record<string, FormLayer1>
type FormData = Record<string, FormLayer2>

const versionRowValidator = v.object({
  legacyId: v.string(),
  proposalLegacyId: v.string(),
  versionNumber: v.number(),
  formData: formDataValidator,
  status: v.string(),
  stepProgress: v.number(),
  changeDescription: v.union(v.string(), v.null()),
  createdBy: v.string(),
  createdByName: v.union(v.string(), v.null()),
  createdAtMs: v.number(),
})

type VersionRow = {
  legacyId: string
  proposalLegacyId: string
  versionNumber: number
  formData: FormData
  status: string
  stepProgress: number
  changeDescription: string | null
  createdBy: string
  createdByName: string | null
  createdAtMs: number
}

function mapRow(row: unknown): VersionRow {
  const record = row && typeof row === 'object' ? (row as Record<string, unknown>) : null
  return {
    legacyId: String(record?.legacyId ?? ''),
    proposalLegacyId: String(record?.proposalLegacyId ?? ''),
    versionNumber: typeof record?.versionNumber === 'number' ? record.versionNumber : 1,
    formData:
      record?.formData && typeof record.formData === 'object' && !Array.isArray(record.formData)
        ? (record.formData as FormData)
        : {},
    status: typeof record?.status === 'string' ? record.status : 'draft',
    stepProgress: typeof record?.stepProgress === 'number' ? record.stepProgress : 0,
    changeDescription: typeof record?.changeDescription === 'string' ? record.changeDescription : null,
    createdBy: typeof record?.createdBy === 'string' ? record.createdBy : '',
    createdByName: typeof record?.createdByName === 'string' ? record.createdByName : null,
    createdAtMs: typeof record?.createdAtMs === 'number' ? record.createdAtMs : 0,
  }
}

export const list = workspaceQuery({
  args: {
    proposalLegacyId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(versionRowValidator),
  handler: async (ctx, args) => {
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

export const getByLegacyId = workspaceQuery({
  args: { proposalLegacyId: v.string(), legacyId: v.string() },
  returns: v.union(v.null(), versionRowValidator),
  handler: async (ctx, args) => {
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

export const countByWorkspace = workspaceQuery({
  args: {},
  returns: v.object({
    count: v.number(),
  }),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('proposalVersions')
      .withIndex('by_workspace', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    return { count: rows.length }
  },
})

export const createSnapshot = workspaceMutation({
  args: {
    proposalLegacyId: v.string(),
    changeDescription: v.optional(v.union(v.string(), v.null())),
    createdBy: v.string(),
    createdByName: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    version: versionRowValidator,
  }),
  handler: async (ctx, args) => {
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

    const latestNumber = latest.length > 0 && typeof latest[0]!.versionNumber === 'number' ? latest[0]!.versionNumber : 0
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

export const restoreToVersion = workspaceMutation({
  args: {
    proposalLegacyId: v.string(),
    versionLegacyId: v.string(),
    createdBy: v.string(),
    createdByName: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    success: v.literal(true),
    restoredFromVersion: v.number(),
    newVersion: v.number(),
  }),
  handler: async (ctx, args) => {
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

    const latestNumber = latest.length > 0 && typeof latest[0]!.versionNumber === 'number' ? latest[0]!.versionNumber : 0
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
      success: true as const,
      restoredFromVersion: typeof target.versionNumber === 'number' ? target.versionNumber : 1,
      newVersion: afterNumber,
    } as const
  },
})

export const bulkUpsert = workspaceMutation({
  args: {
    versions: v.array(
      v.object({
        workspaceId: v.string(),
        proposalLegacyId: v.string(),
        legacyId: v.string(),
        versionNumber: v.number(),
        formData: formDataValidator,
        status: v.string(),
        stepProgress: v.number(),
        changeDescription: v.union(v.string(), v.null()),
        createdBy: v.string(),
        createdByName: v.union(v.string(), v.null()),
        createdAtMs: v.number(),
      }),
    ),
  },
  returns: v.object({
    upserted: v.number(),
  }),
  handler: async (ctx, args) => {
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
