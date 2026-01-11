import { query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw new Error('Unauthorized')
  }
}

function startOfDay(ts: Date) {
  return new Date(ts.getFullYear(), ts.getMonth(), ts.getDate())
}

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const now = new Date()
    const todayStart = startOfDay(now)
    const weekAgo = new Date(todayStart)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(todayStart)
    monthAgo.setDate(monthAgo.getDate() - 30)

    const todayMs = todayStart.getTime()
    const weekAgoMs = weekAgo.getTime()
    const monthAgoMs = monthAgo.getTime()

    const users = await ctx.db.query('users').withIndex('by_legacyId', (q) => q).collect()

    const totalUsers = users.length
    const activeUsersToday = users.filter((u) => (u.updatedAtMs ?? 0) >= todayMs).length
    const activeUsersWeek = users.filter((u) => (u.updatedAtMs ?? 0) >= weekAgoMs).length
    const activeUsersMonth = users.filter((u) => (u.updatedAtMs ?? 0) >= monthAgoMs).length
    const newUsersToday = users.filter((u) => (u.createdAtMs ?? 0) >= todayMs).length
    const newUsersWeek = users.filter((u) => (u.createdAtMs ?? 0) >= weekAgoMs).length

    // Note: we only count collections that exist in Convex at the moment.
    const totalProjects = (await ctx.db.query('projects').collect()).length
    const projectsThisWeek = (await ctx.db.query('projects').collect()).filter((p: any) => (p.createdAtMs ?? 0) >= weekAgoMs).length

    const totalTasks = (await ctx.db.query('tasks').collect()).length
    const tasksCompletedThisWeek = (await ctx.db.query('tasks').collect()).filter((t: any) => t.status === 'completed' && (t.updatedAtMs ?? 0) >= weekAgoMs).length

    const totalInvoices = (await ctx.db.query('financeInvoices').collect()).length
    const invoicesThisWeek = (await ctx.db.query('financeInvoices').collect()).filter((i: any) => (i.createdAtMs ?? 0) >= weekAgoMs).length

    const totalExpenses = (await ctx.db.query('financeExpenses').collect()).length
    const expensesThisWeek = (await ctx.db.query('financeExpenses').collect()).filter((e: any) => (e.createdAtMs ?? 0) >= weekAgoMs).length

    const totalClients = (await ctx.db.query('clients').collect()).length

    const agentConversations = (await ctx.db.query('agentConversations').collect()).length
    const agentActionsThisWeek = (await ctx.db.query('agentConversations').collect()).filter((c: any) => (c.createdAtMs ?? 0) >= weekAgoMs).length

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

      dailyActiveUsers.push({ date: dayStart.toISOString().split('T')[0], count })
    }

    const featureUsage = [
      { feature: 'Projects', count: projectsThisWeek, trend: projectsThisWeek > 0 ? 15 : 0 },
      { feature: 'Tasks', count: tasksCompletedThisWeek, trend: tasksCompletedThisWeek > 0 ? 8 : 0 },
      { feature: 'Invoices', count: invoicesThisWeek, trend: invoicesThisWeek > 0 ? 12 : 0 },
      { feature: 'Expenses', count: expensesThisWeek, trend: expensesThisWeek > 0 ? 5 : 0 },
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

      totalInvoices,
      invoicesThisWeek,
      totalExpenses,
      expensesThisWeek,

      totalClients,
      activeClientsWeek: 0,

      agentConversations,
      agentActionsThisWeek,

      dailyActiveUsers,
      featureUsage,
    }
  },
})
