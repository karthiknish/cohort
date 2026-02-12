import { z } from 'zod/v4'
import { Errors } from './errors'
import {
  zWorkspaceQuery,
  zWorkspaceQueryActive,
  zWorkspaceMutation,
} from './functions'

function generateLegacyId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export const assignConversation = zWorkspaceMutation({
  args: {
    resourceType: z.enum(['direct_conversation', 'channel', 'message']),
    resourceId: z.string(),
    assignedToId: z.string(),
    assignedToName: z.string(),
    routingReason: z.enum(['manual', 'auto-skill', 'auto-geography', 'escalation']).optional(),
    routingRuleId: z.string().optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    slaDeadlineMs: z.number().optional(),
  },
  handler: async (ctx: any, args: any) => {
    const currentUserId = ctx.user._id
    const currentUserName = ctx.user.name ?? 'Unknown'

    const existing = await ctx.db
      .query('conversationAssignments')
      .withIndex('by_workspace_resource', (q: any) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('resourceType', args.resourceType)
          .eq('resourceId', args.resourceId)
      )
      .filter((q: any) => q.eq(q.field('status'), 'active'))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: 'transferred',
        updatedAtMs: Date.now(),
      })
    }

    const legacyId = generateLegacyId()
    const now = Date.now()

    const assignmentId = await ctx.db.insert('conversationAssignments', {
      workspaceId: args.workspaceId,
      legacyId,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      assignedToId: args.assignedToId,
      assignedToName: args.assignedToName,
      assignedById: currentUserId,
      assignedByName: currentUserName,
      routingReason: args.routingReason ?? 'manual',
      routingRuleId: args.routingRuleId ?? null,
      priority: args.priority ?? 'normal',
      status: 'active',
      escalatedFromId: existing?._id ?? null,
      slaDeadlineMs: args.slaDeadlineMs ?? null,
      slaBreached: false,
      firstResponseAtMs: null,
      resolvedAtMs: null,
      createdAtMs: now,
      updatedAtMs: now,
    })

    return { _id: assignmentId, legacyId }
  },
})

export const transferAssignment = zWorkspaceMutation({
  args: {
    assignmentLegacyId: z.string(),
    newAssignedToId: z.string(),
    newAssignedToName: z.string(),
    reason: z.string().optional(),
  },
  handler: async (ctx: any, args: any) => {
    const assignment = await ctx.db
      .query('conversationAssignments')
      .withIndex('by_workspace_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.assignmentLegacyId)
      )
      .first()

    if (!assignment) {
      throw Errors.resource.notFound('Assignment')
    }

    const now = Date.now()
    await ctx.db.patch(assignment._id, {
      status: 'transferred',
      updatedAtMs: now,
    })

    const legacyId = generateLegacyId()
    const newAssignmentId = await ctx.db.insert('conversationAssignments', {
      workspaceId: args.workspaceId,
      legacyId,
      resourceType: assignment.resourceType,
      resourceId: assignment.resourceId,
      assignedToId: args.newAssignedToId,
      assignedToName: args.newAssignedToName,
      assignedById: ctx.user._id,
      assignedByName: ctx.user.name ?? 'Unknown',
      routingReason: 'manual',
      routingRuleId: null,
      priority: assignment.priority,
      status: 'active',
      escalatedFromId: assignment._id,
      slaDeadlineMs: assignment.slaDeadlineMs,
      slaBreached: false,
      firstResponseAtMs: null,
      resolvedAtMs: null,
      createdAtMs: now,
      updatedAtMs: now,
    })

    return { _id: newAssignmentId, legacyId }
  },
})

export const escalateAssignment = zWorkspaceMutation({
  args: {
    assignmentLegacyId: z.string(),
    escalatedToId: z.string(),
    escalatedToName: z.string(),
    reason: z.string(),
  },
  handler: async (ctx: any, args: any) => {
    const assignment = await ctx.db
      .query('conversationAssignments')
      .withIndex('by_workspace_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.assignmentLegacyId)
      )
      .first()

    if (!assignment) {
      throw Errors.resource.notFound('Assignment')
    }

    const now = Date.now()
    await ctx.db.patch(assignment._id, {
      status: 'escalated',
      updatedAtMs: now,
    })

    const legacyId = generateLegacyId()
    const newPriority = assignment.priority === 'low' ? 'normal' 
      : assignment.priority === 'normal' ? 'high' 
      : 'urgent'

    const newAssignmentId = await ctx.db.insert('conversationAssignments', {
      workspaceId: args.workspaceId,
      legacyId,
      resourceType: assignment.resourceType,
      resourceId: assignment.resourceId,
      assignedToId: args.escalatedToId,
      assignedToName: args.escalatedToName,
      assignedById: ctx.user._id,
      assignedByName: ctx.user.name ?? 'Unknown',
      routingReason: 'escalation',
      routingRuleId: null,
      priority: newPriority,
      status: 'active',
      escalatedFromId: assignment._id,
      slaDeadlineMs: assignment.slaDeadlineMs,
      slaBreached: false,
      firstResponseAtMs: null,
      resolvedAtMs: null,
      createdAtMs: now,
      updatedAtMs: now,
    })

    return { _id: newAssignmentId, legacyId }
  },
})

export const completeAssignment = zWorkspaceMutation({
  args: {
    assignmentLegacyId: z.string(),
  },
  handler: async (ctx: any, args: any) => {
    const assignment = await ctx.db
      .query('conversationAssignments')
      .withIndex('by_workspace_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.assignmentLegacyId)
      )
      .first()

    if (!assignment) {
      throw Errors.resource.notFound('Assignment')
    }

    const now = Date.now()
    await ctx.db.patch(assignment._id, {
      status: 'completed',
      resolvedAtMs: now,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const getAssignmentsForUser = zWorkspaceQueryActive({
  args: {
    status: z.enum(['active', 'completed', 'escalated', 'transferred']).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  },
  handler: async (ctx: any, args: any) => {
    const currentUserId = ctx.user._id

    let q = ctx.db
      .query('conversationAssignments')
      .withIndex('by_workspace_assignedTo_status', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('assignedToId', currentUserId)
      )

    const rows = await q.order('desc').collect()

    return rows
      .filter((a: any) => {
        if (args.status && a.status !== args.status) return false
        if (args.priority && a.priority !== args.priority) return false
        return true
      })
      .map((a: any) => ({
        _id: a._id,
        legacyId: a.legacyId,
        resourceType: a.resourceType,
        resourceId: a.resourceId,
        assignedToId: a.assignedToId,
        assignedToName: a.assignedToName,
        assignedById: a.assignedById,
        assignedByName: a.assignedByName,
        routingReason: a.routingReason,
        priority: a.priority,
        status: a.status,
        slaDeadlineMs: a.slaDeadlineMs,
        slaBreached: a.slaBreached,
        firstResponseAtMs: a.firstResponseAtMs,
        resolvedAtMs: a.resolvedAtMs,
        createdAtMs: a.createdAtMs,
        updatedAtMs: a.updatedAtMs,
      }))
  },
})

export const getOverdueAssignments = zWorkspaceQueryActive({
  args: {},
  handler: async (ctx: any, args: any) => {
    const now = Date.now()

    const overdue = await ctx.db
      .query('conversationAssignments')
      .withIndex('by_workspace_slaDeadline', (q: any) =>
        q.eq('workspaceId', args.workspaceId).lt('slaDeadlineMs', now)
      )
      .filter((q: any) => 
        q.eq(q.field('status'), 'active').and(q.eq(q.field('slaBreached'), false))
      )
      .collect()

    for (const assignment of overdue) {
      await ctx.db.patch(assignment._id, {
        slaBreached: true,
        updatedAtMs: now,
      })
    }

    return overdue.map((a: any) => ({
      _id: a._id,
      legacyId: a.legacyId,
      resourceType: a.resourceType,
      resourceId: a.resourceId,
      assignedToId: a.assignedToId,
      assignedToName: a.assignedToName,
      priority: a.priority,
      slaDeadlineMs: a.slaDeadlineMs,
      createdAtMs: a.createdAtMs,
    }))
  },
})

export const recordFirstResponse = zWorkspaceMutation({
  args: {
    assignmentLegacyId: z.string(),
  },
  handler: async (ctx: any, args: any) => {
    const assignment = await ctx.db
      .query('conversationAssignments')
      .withIndex('by_workspace_legacyId', (q: any) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.assignmentLegacyId)
      )
      .first()

    if (!assignment) return { success: false }
    if (assignment.firstResponseAtMs) return { success: true }

    const now = Date.now()
    await ctx.db.patch(assignment._id, {
      firstResponseAtMs: now,
      updatedAtMs: now,
    })

    return { success: true }
  },
})

export const getRoutingStats = zWorkspaceQuery({
  args: {},
  handler: async (ctx: any, args: any) => {
    const assignments = await ctx.db
      .query('conversationAssignments')
      .withIndex('by_workspace_status_priority', (q: any) =>
        q.eq('workspaceId', args.workspaceId)
      )
      .collect()

    const stats = {
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byAssignee: {} as Record<string, { name: string; count: number }>,
      avgResponseTimeMs: 0,
      totalAssignments: assignments.length,
      breachedSLAs: 0,
    }

    let totalResponseTime = 0
    let responseCount = 0

    for (const a of assignments) {
      stats.byStatus[a.status] = (stats.byStatus[a.status] ?? 0) + 1
      stats.byPriority[a.priority] = (stats.byPriority[a.priority] ?? 0) + 1

      if (!stats.byAssignee[a.assignedToId]) {
        stats.byAssignee[a.assignedToId] = { name: a.assignedToName, count: 1 }
      } else {
        stats.byAssignee[a.assignedToId]!.count++
      }

      if (a.firstResponseAtMs && a.createdAtMs) {
        totalResponseTime += a.firstResponseAtMs - a.createdAtMs
        responseCount++
      }

      if (a.slaBreached) stats.breachedSLAs++
    }

    stats.avgResponseTimeMs = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0

    return stats
  },
})
