import { query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

import { api } from './_generated/api'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

type FinanceInvoiceRow = {
  amount: number
  status: string
  currency: string | null
  dueDate: string | null
  paidDate: string | null
  amountPaid: number | null
  amountRemaining: number | null
  amountRefunded: number | null
}

export const get: any = query({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    invoiceLimit: v.optional(v.number()),
    costLimit: v.optional(v.number()),
    revenueLimit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw Errors.auth.unauthorized()

    const invoiceLimit = Math.min(Math.max(args.invoiceLimit ?? 200, 1), 200)
    const costLimit = Math.min(Math.max(args.costLimit ?? 200, 1), 200)
    const revenueLimit = Math.min(Math.max(args.revenueLimit ?? 36, 1), 100)

    const [revenueResponse, invoiceResponse, costResponse]: any[] = await Promise.all([
      ctx.runQuery(api.financeRevenue.list, {
        workspaceId: args.workspaceId,
        clientId: args.clientId ?? null,
        limit: revenueLimit,
      }),
      ctx.runQuery(api.financeInvoices.list, {
        workspaceId: args.workspaceId,
        clientId: args.clientId ?? null,
        limit: invoiceLimit,
      }),
      ctx.runQuery(api.financeCosts.list, {
        workspaceId: args.workspaceId,
        clientId: args.clientId ?? null,
        limit: costLimit,
      }),
    ])

    const revenueRows: any[] = revenueResponse?.revenue ?? []
    const invoiceRows: any[] = invoiceResponse?.invoices ?? []
    const costRows: any[] = costResponse?.costs ?? []

    const invoicesForSummary: FinanceInvoiceRow[] = invoiceRows.map((row: any) => ({
      amount: row.amount,
      status: row.status,
      currency: row.currency ?? null,
      dueDate: row.dueDate ?? null,
      paidDate: row.paidDate ?? null,
      amountPaid: row.amountPaid ?? null,
      amountRemaining: row.amountRemaining ?? null,
      amountRefunded: row.amountRefunded ?? null,
    }))

    const payments = computePaymentSummary(invoicesForSummary)

    return {
      revenue: revenueRows.map((row: any) => ({
        id: String(row.legacyId),
        clientId: row.clientId ?? null,
        period: String(row.period ?? ''),
        label: row.label ?? null,
        revenue: row.revenue ?? 0,
        operatingExpenses: row.operatingExpenses ?? 0,
        currency: row.currency ?? null,
        createdAt: typeof row.createdAt === 'number' ? new Date(row.createdAt).toISOString() : null,
        updatedAt: typeof row.updatedAt === 'number' ? new Date(row.updatedAt).toISOString() : null,
      })),
      invoices: invoiceRows.map((row: any) => ({
        id: String(row.legacyId),
        clientId: row.clientId ?? null,
        clientName: String(row.clientName ?? 'Unknown client'),
        amount: row.amount ?? 0,
        status: row.status,
        stripeStatus: row.stripeStatus ?? null,
        issuedDate: row.issuedDate ?? null,
        dueDate: row.dueDate ?? null,
        paidDate: row.paidDate ?? null,
        amountPaid: row.amountPaid ?? null,
        amountRemaining: row.amountRemaining ?? null,
        amountRefunded: row.amountRefunded ?? null,
        currency: row.currency ?? null,
        description: row.description ?? null,
        hostedInvoiceUrl: row.hostedInvoiceUrl ?? null,
        number: row.number ?? null,
        paymentIntentId: row.paymentIntentId ?? null,
        collectionMethod: row.collectionMethod ?? null,
        createdAt: typeof row.createdAt === 'number' ? new Date(row.createdAt).toISOString() : null,
        updatedAt: typeof row.updatedAt === 'number' ? new Date(row.updatedAt).toISOString() : null,
      })),
      costs: costRows.map((row: any) => ({
        id: String(row.legacyId),
        clientId: row.clientId ?? null,
        category: String(row.category ?? 'Uncategorized'),
        amount: row.amount ?? 0,
        cadence: row.cadence,
        currency: row.currency ?? null,
        createdAt: typeof row.createdAt === 'number' ? new Date(row.createdAt).toISOString() : null,
        updatedAt: typeof row.updatedAt === 'number' ? new Date(row.updatedAt).toISOString() : null,
      })),
      payments,
      invoiceNextCursor: null,
      costNextCursor: null,
    }
  },
})

function computePaymentSummary(invoices: FinanceInvoiceRow[]) {
  type CurrencyAccumulator = {
    currency: string
    totalInvoiced: number
    paidGross: number
    refundTotal: number
    totalOutstanding: number
  }

  const currencyMap = new Map<string, CurrencyAccumulator>()
  let overdueCount = 0
  let paidCount = 0
  let openCount = 0
  let nextDueAt: string | null = null
  let lastPaymentAt: string | null = null

  invoices.forEach((invoice) => {
    const normalizedCurrency = (invoice.currency ?? 'USD').toUpperCase()
    let accumulator = currencyMap.get(normalizedCurrency)
    if (!accumulator) {
      accumulator = {
        currency: normalizedCurrency,
        totalInvoiced: 0,
        paidGross: 0,
        refundTotal: 0,
        totalOutstanding: 0,
      }
      currencyMap.set(normalizedCurrency, accumulator)
    }

    accumulator.totalInvoiced += invoice.amount

    if (invoice.status === 'paid') {
      paidCount += 1
    } else if (invoice.status === 'overdue') {
      overdueCount += 1
      openCount += 1
    } else if (invoice.status === 'sent') {
      openCount += 1
    }

    if (typeof invoice.amountPaid === 'number') {
      accumulator.paidGross += invoice.amountPaid
    }

    if (typeof invoice.amountRefunded === 'number') {
      accumulator.refundTotal += invoice.amountRefunded
    }

    const outstanding =
      typeof invoice.amountRemaining === 'number'
        ? invoice.amountRemaining
        : typeof invoice.amountPaid === 'number'
          ? Math.max(invoice.amount - invoice.amountPaid, 0)
          : invoice.status === 'paid'
            ? 0
            : invoice.amount

    if (outstanding > 0) {
      accumulator.totalOutstanding += outstanding
      if (invoice.dueDate) {
        const dueMillis = new Date(invoice.dueDate).getTime()
        if (!Number.isNaN(dueMillis)) {
          if (nextDueAt === null || dueMillis < new Date(nextDueAt).getTime()) {
            nextDueAt = new Date(dueMillis).toISOString()
          }
        }
      }
    }

    if (invoice.paidDate) {
      if (!lastPaymentAt || new Date(invoice.paidDate).getTime() > new Date(lastPaymentAt).getTime()) {
        lastPaymentAt = new Date(invoice.paidDate).toISOString()
      }
    }
  })

  const totals = Array.from(currencyMap.values()).map((entry) => ({
    currency: entry.currency,
    totalInvoiced: entry.totalInvoiced,
    totalOutstanding: entry.totalOutstanding,
    refundTotal: entry.refundTotal,
    totalPaid: Math.max(entry.paidGross - entry.refundTotal, 0),
  }))

  return {
    totals,
    overdueCount,
    paidCount,
    openCount,
    nextDueAt,
    lastPaymentAt,
  }
}
