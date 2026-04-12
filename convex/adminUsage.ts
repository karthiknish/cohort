import { v } from 'convex/values'

import type { MutationCtx, QueryCtx } from './_generated/server'
import { internalMutation } from './_generated/server'
import { Errors, asErrorMessage, isAppError } from './errors'
import { adminQuery } from './functions'

const dailyActiveUserValidator = v.object({
  date: v.string(),
  count: v.number(),
})

const featureUsageValidator = v.object({
  feature: v.string(),
  count: v.number(),
  trend: v.number(),
})

const adminUsageStatsValidator = v.object({
  totalUsers: v.number(),
  activeUsersToday: v.number(),
  activeUsersWeek: v.number(),
  activeUsersMonth: v.number(),
  newUsersToday: v.number(),
  newUsersWeek: v.number(),
  totalProjects: v.number(),
  projectsThisWeek: v.number(),
  totalTasks: v.number(),
  tasksCompletedThisWeek: v.number(),
  totalClients: v.number(),
  activeClientsWeek: v.number(),
  agentConversations: v.number(),
  agentActionsThisWeek: v.number(),
  dailyActiveUsers: v.array(dailyActiveUserValidator),
  featureUsage: v.array(featureUsageValidator),
})

const ADMIN_USAGE_CACHE_KEY = 'adminUsage:getStats:global'
const ADMIN_USAGE_CACHE_TTL_MS = 10 * 60 * 1000

type AdminUsageStats = {
  totalUsers: number
  activeUsersToday: number
  activeUsersWeek: number
  activeUsersMonth: number
  newUsersToday: number
  newUsersWeek: number
  totalProjects: number
  projectsThisWeek: number
  totalTasks: number
  tasksCompletedThisWeek: number
  totalClients: number
  activeClientsWeek: number
  agentConversations: number
  agentActionsThisWeek: number
  dailyActiveUsers: Array<{ date: string; count: number }>
  featureUsage: Array<{ feature: string; count: number; trend: number }>
}

type CachedAdminUsageStats = {
  stats: AdminUsageStats
  isFresh: boolean
}

type AdminUsageStatsDb = QueryCtx['db'] | MutationCtx['db']

function startOfDay(ts: Date) {
  return new Date(ts.getFullYear(), ts.getMonth(), ts.getDate())
}

function throwAdminUsageError(operation: string, error: unknown): never {
  console.error(`[adminUsage:${operation}]`, error)

  if (isAppError(error)) {
    throw error
  }

  throw Errors.base.internal(
    `Failed to load admin usage stats: ${asErrorMessage(error)}`,
  )
}

async function computeLiveUsageStats(ctx: { db: AdminUsageStatsDb }): Promise<AdminUsageStats> {
  const now = new Date()
  const todayStart = startOfDay(now)
  const weekAgo = new Date(todayStart)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(todayStart)
  monthAgo.setDate(monthAgo.getDate() - 30)

  const todayMs = todayStart.getTime()
  const weekAgoMs = weekAgo.getTime()
  const monthAgoMs = monthAgo.getTime()

  const [users, recentUsers] = await Promise.all([
    ctx.db.query('users').withIndex('by_createdAtMs', (q) => q).collect(),
    ctx.db
      .query('users')
      .withIndex('by_createdAtMs', (q) => q.gte('createdAtMs', weekAgoMs))
      .collect(),
  ])

  const totalUsers = users.length
  const activeUsersToday = users.filter((u) => (u.updatedAtMs ?? 0) >= todayMs).length
  const activeUsersWeek = users.filter((u) => (u.updatedAtMs ?? 0) >= weekAgoMs).length
  const activeUsersMonth = users.filter((u) => (u.updatedAtMs ?? 0) >= monthAgoMs).length
  const newUsersToday = recentUsers.filter((u) => (u.createdAtMs ?? 0) >= todayMs).length
  const newUsersWeek = recentUsers.length

  const [projectRows, taskRows, clientRows, conversations] = await Promise.all([
    ctx.db.query('projects').withIndex('by_createdAtMs', (q) => q).collect(),
    ctx.db.query('tasks').withIndex('by_createdAtMs', (q) => q).collect(),
    ctx.db.query('clients').withIndex('by_createdAtMs', (q) => q).collect(),
    ctx.db.query('agentConversations').withIndex('by_createdAt', (q) => q).collect(),
  ])

  const projects = projectRows.filter((p) => p.deletedAtMs == null)
  const tasks = taskRows.filter((t) => t.deletedAtMs == null)
  const clients = clientRows.filter((c) => c.deletedAtMs == null)

  const totalProjects = projects.length
  const projectsThisWeek = projects.filter((p) => (p.createdAtMs ?? 0) >= weekAgoMs).length
  const totalTasks = tasks.length
  const tasksCompletedThisWeek = tasks.filter(
    (t) => t.status === 'completed' && (t.updatedAtMs ?? 0) >= weekAgoMs,
  ).length
  const totalClients = clients.length
  const activeClientsWeek = clients.filter((c) => (c.updatedAtMs ?? 0) >= weekAgoMs).length
  const agentConversations = conversations.length
  const agentActionsThisWeek = conversations.filter((c) => (c.createdAt ?? 0) >= weekAgoMs).length

  const dailyActiveUsers: Array<{ date: string; count: number }> = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1)
    const dayStartMs = dayStart.getTime()
    const dayEndMs = dayEnd.getTime()

    const count = users.filter((u) => {
      const last = u.updatedAtMs ?? 0
      return last >= dayStartMs && last < dayEndMs
    }).length

    dailyActiveUsers.push({ date: dayStart.toISOString().split('T')[0] ?? '', count })
  }

  const featureUsage = [
    { feature: 'Projects', count: projectsThisWeek, trend: projectsThisWeek > 0 ? 15 : 0 },
    { feature: 'Tasks', count: tasksCompletedThisWeek, trend: tasksCompletedThisWeek > 0 ? 8 : 0 },
    { feature: 'Agent Mode', count: agentActionsThisWeek, trend: agentActionsThisWeek > 0 ? 25 : 0 },
  ].sort((a, b) => b.count - a.count)

  return {
    totalUsers,
    activeUsersToday,
    activeUsersWeek,
    activeUsersMonth,
    newUsersToday,
    newUsersWeek,
    totalProjects,
    projectsThisWeek,
    totalTasks,
    tasksCompletedThisWeek,
    totalClients,
    activeClientsWeek,
    agentConversations,
    agentActionsThisWeek,
    dailyActiveUsers,
    featureUsage,
  }
}

function parseCachedAdminUsageStats(value: string): AdminUsageStats | null {
  try {
    return JSON.parse(value) as AdminUsageStats
  } catch {
    return null
  }
}

async function readCachedAdminUsageStats(ctx: { db: AdminUsageStatsDb }): Promise<CachedAdminUsageStats | null> {
  const entry = await ctx.db
    .query('serverCache')
    .withIndex('by_keyHash', (q) => q.eq('keyHash', ADMIN_USAGE_CACHE_KEY))
    .unique()

  if (!entry) {
    return null
  }

  const stats = parseCachedAdminUsageStats(entry.value)
  if (!stats) {
    return null
  }

  return {
    stats,
    isFresh: entry.expiresAtMs > Date.now(),
  }
}

export const refreshStatsCache = internalMutation({
  args: {},
  returns: v.object({ ok: v.literal(true), refreshedAtMs: v.number() }),
  handler: async (ctx) => {
    try {
      const stats = await computeLiveUsageStats(ctx)
      const refreshedAtMs = Date.now()
      const existing = await ctx.db
        .query('serverCache')
        .withIndex('by_keyHash', (q) => q.eq('keyHash', ADMIN_USAGE_CACHE_KEY))
        .unique()

      const payload = {
        keyHash: ADMIN_USAGE_CACHE_KEY,
        key: ADMIN_USAGE_CACHE_KEY,
        value: JSON.stringify(stats),
        expiresAtMs: refreshedAtMs + ADMIN_USAGE_CACHE_TTL_MS,
        updatedAtMs: refreshedAtMs,
      }

      if (existing) {
        await ctx.db.patch(existing._id, payload)
      } else {
        await ctx.db.insert('serverCache', {
          ...payload,
          createdAtMs: refreshedAtMs,
        })
      }

      return { ok: true as const, refreshedAtMs }
    } catch (error) {
      throwAdminUsageError('refreshStatsCache', error)
    }
  },
})

export const getStats = adminQuery({
  args: {},
  returns: adminUsageStatsValidator,
  handler: async (ctx) => {
    try {
      const cached = await readCachedAdminUsageStats(ctx)
      if (cached?.isFresh) {
        return cached.stats
      }

      if (cached) {
        return cached.stats
      }

      return await computeLiveUsageStats(ctx)
    } catch (error) {
      throwAdminUsageError('getStats', error)
    }
  },
})
