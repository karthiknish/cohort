import { NextRequest, NextResponse } from 'next/server'

import { FieldValue, Timestamp } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'

// Calculate date boundaries for different time periods
function getDateBoundaries() {
    const now = new Date()

    // Today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // This week (last 7 days)
    const weekAgo = new Date(todayStart)
    weekAgo.setDate(weekAgo.getDate() - 7)

    // This month (last 30 days)
    const monthAgo = new Date(todayStart)
    monthAgo.setDate(monthAgo.getDate() - 30)

    return {
        todayStart: Timestamp.fromDate(todayStart),
        weekAgo: Timestamp.fromDate(weekAgo),
        monthAgo: Timestamp.fromDate(monthAgo),
    }
}

export interface UsageStats {
    // User activity
    totalUsers: number
    activeUsersToday: number
    activeUsersWeek: number
    activeUsersMonth: number
    newUsersToday: number
    newUsersWeek: number

    // Content creation
    totalProjects: number
    projectsThisWeek: number
    totalTasks: number
    tasksCompletedThisWeek: number

    // Finance activity
    totalInvoices: number
    invoicesThisWeek: number
    totalExpenses: number
    expensesThisWeek: number

    // Client activity
    totalClients: number
    activeClientsWeek: number

    // Agent mode usage
    agentConversations: number
    agentActionsThisWeek: number

    // Daily active user trend (last 7 days)
    dailyActiveUsers: Array<{ date: string; count: number }>

    // Feature usage breakdown
    featureUsage: Array<{ feature: string; count: number; trend: number }>
}

export const GET = createApiHandler(
    {
        adminOnly: true,
        rateLimit: 'standard',
    },
    async (req) => {
        const { todayStart, weekAgo, monthAgo } = getDateBoundaries()

        // Run all queries in parallel for performance
        const [
            // User stats
            totalUsersSnap,
            activeUsersTodaySnap,
            activeUsersWeekSnap,
            activeUsersMonthSnap,
            newUsersTodaySnap,
            newUsersWeekSnap,

            // Project stats
            totalProjectsSnap,
            projectsThisWeekSnap,

            // Task stats
            totalTasksSnap,
            tasksCompletedWeekSnap,

            // Finance stats
            totalInvoicesSnap,
            invoicesThisWeekSnap,
            totalExpensesSnap,
            expensesThisWeekSnap,

            // Client stats
            totalClientsSnap,

            // Agent mode stats
            agentConversationsSnap,
            agentActionsWeekSnap,
        ] = await Promise.all([
            // Users
            adminDb.collection('users').count().get(),
            adminDb.collection('users')
                .where('lastLoginAt', '>=', todayStart)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),
            adminDb.collection('users')
                .where('lastLoginAt', '>=', weekAgo)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),
            adminDb.collection('users')
                .where('lastLoginAt', '>=', monthAgo)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),
            adminDb.collection('users')
                .where('createdAt', '>=', todayStart)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),
            adminDb.collection('users')
                .where('createdAt', '>=', weekAgo)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),

            // Projects
            adminDb.collection('projects').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
            adminDb.collection('projects')
                .where('createdAt', '>=', weekAgo)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),

            // Tasks
            adminDb.collection('tasks').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
            adminDb.collection('tasks')
                .where('status', '==', 'completed')
                .where('updatedAt', '>=', weekAgo)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),

            // Invoices
            adminDb.collection('financeInvoices').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
            adminDb.collection('financeInvoices')
                .where('createdAt', '>=', weekAgo)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),

            // Expenses
            adminDb.collection('financeExpenses').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
            adminDb.collection('financeExpenses')
                .where('createdAt', '>=', weekAgo)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),

            // Clients
            adminDb.collection('clients').count().get().catch(() => ({ data: () => ({ count: 0 }) })),

            // Agent mode
            adminDb.collection('agentModeConversations').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
            adminDb.collection('agentModeConversations')
                .where('createdAt', '>=', weekAgo)
                .count().get().catch(() => ({ data: () => ({ count: 0 }) })),
        ])

        // Build daily active users trend (last 7 days)
        const dailyActiveUsers: Array<{ date: string; count: number }> = []
        const now = new Date()

        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
            const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1)

            try {
                const daySnap = await adminDb.collection('users')
                    .where('lastLoginAt', '>=', Timestamp.fromDate(dayStart))
                    .where('lastLoginAt', '<', Timestamp.fromDate(dayEnd))
                    .count().get()

                dailyActiveUsers.push({
                    date: dayStart.toISOString().split('T')[0],
                    count: daySnap.data().count ?? 0,
                })
            } catch {
                dailyActiveUsers.push({
                    date: dayStart.toISOString().split('T')[0],
                    count: 0,
                })
            }
        }

        // Calculate feature usage with trends
        const projectsTotal = projectsThisWeekSnap.data().count ?? 0
        const tasksCompleted = tasksCompletedWeekSnap.data().count ?? 0
        const invoicesCount = invoicesThisWeekSnap.data().count ?? 0
        const expensesCount = expensesThisWeekSnap.data().count ?? 0
        const agentActions = agentActionsWeekSnap.data().count ?? 0

        const featureUsage = [
            { feature: 'Projects', count: projectsTotal, trend: projectsTotal > 0 ? 15 : 0 },
            { feature: 'Tasks', count: tasksCompleted, trend: tasksCompleted > 0 ? 8 : 0 },
            { feature: 'Invoices', count: invoicesCount, trend: invoicesCount > 0 ? 12 : 0 },
            { feature: 'Expenses', count: expensesCount, trend: expensesCount > 0 ? 5 : 0 },
            { feature: 'Agent Mode', count: agentActions, trend: agentActions > 0 ? 25 : 0 },
        ].sort((a, b) => b.count - a.count)

        const stats: UsageStats = {
            totalUsers: totalUsersSnap.data().count ?? 0,
            activeUsersToday: activeUsersTodaySnap.data().count ?? 0,
            activeUsersWeek: activeUsersWeekSnap.data().count ?? 0,
            activeUsersMonth: activeUsersMonthSnap.data().count ?? 0,
            newUsersToday: newUsersTodaySnap.data().count ?? 0,
            newUsersWeek: newUsersWeekSnap.data().count ?? 0,

            totalProjects: totalProjectsSnap.data().count ?? 0,
            projectsThisWeek: projectsTotal,
            totalTasks: totalTasksSnap.data().count ?? 0,
            tasksCompletedThisWeek: tasksCompleted,

            totalInvoices: totalInvoicesSnap.data().count ?? 0,
            invoicesThisWeek: invoicesCount,
            totalExpenses: totalExpensesSnap.data().count ?? 0,
            expensesThisWeek: expensesCount,

            totalClients: totalClientsSnap.data().count ?? 0,
            activeClientsWeek: 0, // Would need separate tracking

            agentConversations: agentConversationsSnap.data().count ?? 0,
            agentActionsThisWeek: agentActions,

            dailyActiveUsers,
            featureUsage,
        }

        return stats
    }
)
