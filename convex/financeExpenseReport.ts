import { query } from './_generated/server'
import { api } from './_generated/api'
import { Errors } from './errors'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

const STATUSES = ['draft', 'submitted', 'approved', 'rejected', 'paid'] as const

type Status = (typeof STATUSES)[number]

export const report = query({
  args: {
    workspaceId: v.string(),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const from = args.from ? new Date(args.from) : null
    const to = args.to ? new Date(args.to) : null

    const snap = await ctx.db
      .query('financeExpenses')
      .withIndex('by_workspaceId', (qIndex) => qIndex.eq('workspaceId', args.workspaceId))
      .order('desc')
      .take(500)

    const rowsByEmployee = new Map<
      string,
      {
        total: number
        count: number
        currency: string
        byStatus: Record<Status, { total: number; count: number }>
      }
    >()

    for (const row of snap) {
      if (from && row.createdAt < from.getTime()) continue
      if (to && row.createdAt > to.getTime()) continue

      const employeeId = typeof row.employeeId === 'string' && row.employeeId.trim() ? row.employeeId : 'unknown'
      const status = (STATUSES.includes(row.status as Status) ? (row.status as Status) : 'draft') as Status
      const currency = typeof row.currency === 'string' && row.currency.trim() ? row.currency.toUpperCase() : 'USD'
      const amount = typeof row.amount === 'number' && Number.isFinite(row.amount) ? row.amount : 0

      let reportRow = rowsByEmployee.get(employeeId)
      if (!reportRow) {
        const byStatus = STATUSES.reduce((acc, s) => {
          acc[s] = { total: 0, count: 0 }
          return acc
        }, {} as Record<Status, { total: number; count: number }>)

        reportRow = { total: 0, count: 0, currency, byStatus }
        rowsByEmployee.set(employeeId, reportRow)
      }

      reportRow.total += amount
      reportRow.count += 1
      reportRow.byStatus[status].total += amount
      reportRow.byStatus[status].count += 1
    }

    return {
      from: from ? from.toISOString() : null,
      to: to ? to.toISOString() : null,
      rows: Array.from(rowsByEmployee.entries()).map(([employeeId, row]) => ({
        employeeId,
        total: row.total,
        currency: row.currency,
        count: row.count,
        byStatus: row.byStatus,
      })),
    }
  },
})
