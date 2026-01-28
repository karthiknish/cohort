import { adminQuery } from './functions'
import { v } from 'convex/values'

const dailyActiveUserValidator = v.object({
  date: v.string(),
  count: v.number(),
})

const featureUsageValidator = v.object({
  feature: v.string(),
  count: v.number(),
  trend: v.number(),
})

function startOfDay(ts: Date) {
  return new Date(ts.getFullYear(), ts.getMonth(), ts.getDate())
}

export const getStats = adminQuery({
  args: {},
  returns: v.object({
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
    totalInvoices: v.number(),
    invoicesThisWeek: v.number(),
    totalExpenses: v.number(),
    expensesThisWeek: v.number(),
    totalClients: v.number(),
    activeClientsWeek: v.number(),
    agentConversations: v.number(),
    agentActionsThisWeek: v.number(),
    dailyActiveUsers: v.array(dailyActiveUserValidator),
    featureUsage: v.array(featureUsageValidator),
  }),
  handler: async (ctx) => {
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

    // Fetch each collection once and reuse for filtering
    const [projects, tasks, invoices, expenses, clients, conversations] = await Promise.all([
      ctx.db.query('projects').collect(),
      ctx.db.query('tasks').collect(),
      ctx.db.query('financeInvoices').collect(),
      ctx.db.query('financeExpenses').collect(),
      ctx.db.query('clients').collect(),
      ctx.db.query('agentConversations').collect(),
    ])

    const totalProjects = projects.length
    const projectsThisWeek = projects.filter((p: any) => (p.createdAtMs ?? 0) >= weekAgoMs).length

    const totalTasks = tasks.length
    const tasksCompletedThisWeek = tasks.filter((t: any) => t.status === 'completed' && (t.updatedAtMs ?? 0) >= weekAgoMs).length

    const totalInvoices = invoices.length
    const invoicesThisWeek = invoices.filter((i: any) => (i.createdAtMs ?? 0) >= weekAgoMs).length

    const totalExpenses = expenses.length
    const expensesThisWeek = expenses.filter((e: any) => (e.createdAtMs ?? 0) >= weekAgoMs).length

    const totalClients = clients.length

    const agentConversations = conversations.length
    const agentActionsThisWeek = conversations.filter((c: any) => (c.createdAtMs ?? 0) >= weekAgoMs).length

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

      dailyActiveUsers.push({ date: dayStart.toISOString().split('T')[0]!, count })
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
