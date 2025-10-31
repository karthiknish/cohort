import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import type {
  FinanceCostEntry,
  FinanceInvoice,
  FinancePaymentSummary,
  FinanceRevenueRecord,
  FinanceSummaryResponse,
} from '@/types/finance'
import { resolveWorkspaceContext } from '@/lib/workspace'

const MAX_REVENUE_DOCS = 36
const MAX_INVOICES = 200
const MAX_COSTS = 200

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
  let totalInvoiced = 0
  let totalPaid = 0
  let totalOutstanding = 0
  let refundTotal = 0
  let overdueCount = 0
  let paidCount = 0
  let openCount = 0
  let nextDueAt: string | null = null
  let lastPaymentAt: string | null = null
  let currency = 'usd'

  invoices.forEach((invoice) => {
    totalInvoiced += invoice.amount

    if (invoice.currency) {
      currency = invoice.currency
    }

    if (invoice.status === 'paid') {
      paidCount += 1
    } else if (invoice.status === 'overdue') {
      overdueCount += 1
      openCount += 1
    } else if (invoice.status === 'sent') {
      openCount += 1
    }

    if (typeof invoice.amountPaid === 'number') {
      totalPaid += invoice.amountPaid
    }

    if (typeof invoice.amountRefunded === 'number') {
      refundTotal += invoice.amountRefunded
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
      totalOutstanding += outstanding
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

  return {
    totalInvoiced,
    totalPaid: Math.max(totalPaid - refundTotal, 0),
    totalOutstanding,
    overdueCount,
    paidCount,
    openCount,
    refundTotal,
    nextDueAt,
    lastPaymentAt,
    currency,
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
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const clientId = request.nextUrl.searchParams.get('clientId') ?? null

    const workspace = await resolveWorkspaceContext(auth)

    const [revenueSnapshot, invoiceSnapshot, costSnapshot] = await Promise.all([
      workspace.financeRevenueCollection
        .orderBy('period', 'asc')
        .limit(MAX_REVENUE_DOCS)
        .get(),
      workspace.financeInvoicesCollection
        .orderBy('issuedDate', 'desc')
        .limit(MAX_INVOICES)
        .get(),
      workspace.financeCostsCollection
        .orderBy('createdAt', 'desc')
        .limit(MAX_COSTS)
        .get(),
    ])

    const revenue = revenueSnapshot.docs
      .map((doc) => mapRevenueDoc(doc.id, doc.data() as StoredFinanceRevenue))
      .filter((entry) => !clientId || entry.clientId === clientId)

    const invoices = invoiceSnapshot.docs
      .map((doc) => mapInvoiceDoc(doc.id, doc.data() as StoredFinanceInvoice))
      .filter((invoice) => !clientId || invoice.clientId === clientId)

    const costs = costSnapshot.docs
      .map((doc) => mapCostDoc(doc.id, doc.data() as StoredFinanceCost))
      .filter((cost) => !clientId || cost.clientId === clientId || cost.clientId === null)

    const payments = computePaymentSummary(invoices)

    const payload: FinanceSummaryResponse = {
      revenue,
      invoices,
      costs,
      payments,
    }

    return NextResponse.json(payload)
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[finance] failed to load summary', error)
    return NextResponse.json({ error: 'Failed to load finance data' }, { status: 500 })
  }
}
