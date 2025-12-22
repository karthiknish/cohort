import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { AuthenticationError } from '@/lib/server-auth'
import type {
  FinanceCostEntry,
  FinanceInvoice,
  FinancePaymentSummary,
  FinanceRevenueRecord,
  FinanceSummaryResponse,
} from '@/types/finance'
import { resolveWorkspaceContext } from '@/lib/workspace'
import { createApiHandler } from '@/lib/api-handler'

const MAX_REVENUE_DOCS = 36
const MAX_INVOICES = 200
const MAX_COSTS = 200

const financeQuerySchema = z.object({
  clientId: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{1,100}$/)
    .optional(),
  invoiceAfter: z.string().optional(),
  costAfter: z.string().optional(),
  invoicePageSize: z.string().optional(),
  costPageSize: z.string().optional(),
})

type StoredFinanceRevenue = {
  clientId?: unknown
  period?: unknown
  label?: unknown
  revenue?: unknown
  operatingExpenses?: unknown
  currency?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

type StoredFinanceInvoice = {
  clientId?: unknown
  clientName?: unknown
  amount?: unknown
  status?: unknown
  stripeStatus?: unknown
  issuedDate?: unknown
  dueDate?: unknown
  description?: unknown
  hostedInvoiceUrl?: unknown
  number?: unknown
  amountPaid?: unknown
  amountRemaining?: unknown
  amountRefunded?: unknown
  currency?: unknown
  paidDate?: unknown
  paymentIntentId?: unknown
  collectionMethod?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

type StoredFinanceCost = {
  clientId?: unknown
  category?: unknown
  amount?: unknown
  cadence?: unknown
  currency?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

function toISO(value: unknown): string | null {
  if (!value && value !== 0) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as Timestamp).toDate().toISOString()
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
    return value
  }
  return null
}

function coerceNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return 0
}

function mapRevenueDoc(docId: string, data: StoredFinanceRevenue): FinanceRevenueRecord {
  const period = typeof data.period === 'string' ? data.period : ''
  return {
    id: docId,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    period,
    label: typeof data.label === 'string' ? data.label : null,
    revenue: coerceNumber(data.revenue),
    operatingExpenses: coerceNumber(data.operatingExpenses),
    currency: typeof data.currency === 'string' ? data.currency : null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

function mapInvoiceDoc(docId: string, data: StoredFinanceInvoice): FinanceInvoice {
  const amount = coerceNumber(data.amount)
  const amountPaid = coerceNullableNumber(data.amountPaid)
  const amountRefunded = coerceNullableNumber(data.amountRefunded)
  const amountRemaining = coerceNullableNumber(data.amountRemaining)
  return {
    id: docId,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    clientName: typeof data.clientName === 'string' && data.clientName.trim().length > 0 ? data.clientName : 'Unknown client',
    amount,
    status: (typeof data.status === 'string' ? data.status : 'draft') as FinanceInvoice['status'],
    stripeStatus: typeof data.stripeStatus === 'string' ? data.stripeStatus : null,
    issuedDate: toISO(data.issuedDate),
    dueDate: toISO(data.dueDate),
    paidDate: toISO(data.paidDate),
    amountPaid: amountPaid,
    amountRemaining: amountRemaining !== null ? amountRemaining : amountPaid !== null ? Math.max(amount - amountPaid, 0) : null,
    amountRefunded: amountRefunded,
    currency: typeof data.currency === 'string' ? data.currency : null,
    description: typeof data.description === 'string' ? data.description : null,
    hostedInvoiceUrl: typeof data.hostedInvoiceUrl === 'string' ? data.hostedInvoiceUrl : null,
    number: typeof data.number === 'string' ? data.number : null,
    paymentIntentId: typeof data.paymentIntentId === 'string' ? data.paymentIntentId : null,
    collectionMethod: typeof data.collectionMethod === 'string' ? data.collectionMethod : null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

function coerceNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

function computePaymentSummary(invoices: FinanceInvoice[]): FinancePaymentSummary {
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

function mapCostDoc(docId: string, data: StoredFinanceCost): FinanceCostEntry {
  const cadence = (typeof data.cadence === 'string' ? data.cadence : 'monthly') as FinanceCostEntry['cadence']
  return {
    id: docId,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    category: typeof data.category === 'string' ? data.category : 'Uncategorized',
    amount: coerceNumber(data.amount),
    cadence: cadence === 'monthly' || cadence === 'quarterly' || cadence === 'annual' ? cadence : 'monthly',
    currency: typeof data.currency === 'string' ? data.currency : null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: financeQuerySchema,
  },
  async (req, { auth, workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const {
      clientId = null,
      invoiceAfter: invoiceAfterParam,
      costAfter: costAfterParam,
      invoicePageSize: invoicePageSizeParam,
      costPageSize: costPageSizeParam,
    } = query

    const invoicePageSize = Math.min(Math.max(Number(invoicePageSizeParam) || MAX_INVOICES, 1), MAX_INVOICES)
    const costPageSize = Math.min(Math.max(Number(costPageSizeParam) || MAX_COSTS, 1), MAX_COSTS)

    // Build queries with clientId filter at the database level when provided
    let revenueQuery = workspace.financeRevenueCollection.orderBy('period', 'asc').limit(MAX_REVENUE_DOCS)

    if (clientId) {
      revenueQuery = workspace.financeRevenueCollection
        .where('clientId', '==', clientId)
        .orderBy('period', 'asc')
        .limit(MAX_REVENUE_DOCS)
    }

    let invoiceQuery = clientId
      ? workspace.financeInvoicesCollection
          .where('clientId', '==', clientId)
          .orderBy('createdAt', 'desc')
          .orderBy(FieldPath.documentId(), 'desc')
          .limit(invoicePageSize + 1)
      : workspace.financeInvoicesCollection
          .orderBy('createdAt', 'desc')
          .orderBy(FieldPath.documentId(), 'desc')
          .limit(invoicePageSize + 1)

    if (invoiceAfterParam) {
      const [timestamp, docId] = invoiceAfterParam.split('|')
      if (timestamp && docId) {
        const afterDate = new Date(timestamp)
        if (!Number.isNaN(afterDate.getTime())) {
          invoiceQuery = invoiceQuery.startAfter(Timestamp.fromDate(afterDate), docId)
        }
      }
    }

    let costQuery = clientId
      ? workspace.financeCostsCollection
          .where('clientId', 'in', [clientId, null])
          .orderBy('createdAt', 'desc')
          .orderBy(FieldPath.documentId(), 'desc')
          .limit(costPageSize + 1)
      : workspace.financeCostsCollection
          .orderBy('createdAt', 'desc')
          .orderBy(FieldPath.documentId(), 'desc')
          .limit(costPageSize + 1)

    if (costAfterParam) {
      const [timestamp, docId] = costAfterParam.split('|')
      if (timestamp && docId) {
        const afterDate = new Date(timestamp)
        if (!Number.isNaN(afterDate.getTime())) {
          costQuery = costQuery.startAfter(Timestamp.fromDate(afterDate), docId)
        }
      }
    }

    const [revenueSnapshot, invoiceSnapshot, costSnapshot] = await Promise.all([
      revenueQuery.get(),
      invoiceQuery.get(),
      costQuery.get(),
    ])

    const revenue = revenueSnapshot.docs.map((doc) => mapRevenueDoc(doc.id, doc.data() as StoredFinanceRevenue))

    const invoiceDocs = invoiceSnapshot.docs
    const invoices = invoiceDocs
      .slice(0, invoicePageSize)
      .map((doc) => mapInvoiceDoc(doc.id, doc.data() as StoredFinanceInvoice))

    const costDocs = costSnapshot.docs
    const costs = costDocs.slice(0, costPageSize).map((doc) => mapCostDoc(doc.id, doc.data() as StoredFinanceCost))

    const payments = computePaymentSummary(invoices)

    const invoiceNextCursorDoc = invoiceDocs.length > invoicePageSize ? invoiceDocs[invoicePageSize] : null
    const invoiceNextCursor = invoiceNextCursorDoc
      ? (() => {
          const createdAt = toISO(invoiceNextCursorDoc.get('createdAt'))
          return createdAt ? `${createdAt}|${invoiceNextCursorDoc.id}` : null
        })()
      : null

    const costNextCursorDoc = costDocs.length > costPageSize ? costDocs[costPageSize] : null
    const costNextCursor = costNextCursorDoc
      ? (() => {
          const createdAt = toISO(costNextCursorDoc.get('createdAt'))
          return createdAt ? `${createdAt}|${costNextCursorDoc.id}` : null
        })()
      : null

    const payload: FinanceSummaryResponse = {
      revenue,
      invoices,
      costs,
      payments,
      invoiceNextCursor,
      costNextCursor,
    }

    return payload
  }
)
