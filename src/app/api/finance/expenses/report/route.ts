import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import type { ExpenseReportResponse, ExpenseStatus } from '@/types/expenses'
import type { StoredFinanceExpense } from '@/types/stored-types'
import { coerceNumber, toISO } from '@/lib/utils'

const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
})

const STATUSES: ExpenseStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'paid']

export const GET = createApiHandler(
  {
    adminOnly: true,
    workspace: 'required',
    querySchema,
    rateLimit: 'sensitive',
  },
  async (_req, { workspace, query }) => {
    // NOTE: Firestore aggregation would be better long-term; this is a safe MVP.
    const snap = await workspace!.financeExpensesCollection.orderBy('createdAt', 'desc').limit(500).get()

    const from = query.from ? new Date(query.from) : null
    const to = query.to ? new Date(query.to) : null

    const rowsByEmployee = new Map<string, { total: number; count: number; currency: string; byStatus: Record<ExpenseStatus, { total: number; count: number }> }>()

    snap.docs.forEach((doc) => {
      const data = doc.data() as StoredFinanceExpense
      const employeeId = typeof data.employeeId === 'string' ? data.employeeId : 'unknown'
      const status = (typeof data.status === 'string' ? data.status : 'draft') as ExpenseStatus
      const currency = typeof data.currency === 'string' ? data.currency.toUpperCase() : 'USD'
      const amount = coerceNumber(data.amount) ?? 0

      const createdAtIso = toISO(data.createdAt)
      if (createdAtIso) {
        const createdAt = new Date(createdAtIso)
        if (from && createdAt < from) return
        if (to && createdAt > to) return
      }

      let row = rowsByEmployee.get(employeeId)
      if (!row) {
        const byStatus = STATUSES.reduce((acc, s) => {
          acc[s] = { total: 0, count: 0 }
          return acc
        }, {} as Record<ExpenseStatus, { total: number; count: number }>)

        row = { total: 0, count: 0, currency, byStatus }
        rowsByEmployee.set(employeeId, row)
      }

      row.total += amount
      row.count += 1

      const resolvedStatus = STATUSES.includes(status) ? status : 'draft'
      row.byStatus[resolvedStatus].total += amount
      row.byStatus[resolvedStatus].count += 1
    })

    const response: ExpenseReportResponse = {
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

    return response
  }
)
