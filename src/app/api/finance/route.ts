import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import type {
  FinanceCostEntry,
  FinanceInvoice,
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
  createdAt?: unknown
  updatedAt?: unknown
}

type StoredFinanceInvoice = {
  clientId?: unknown
  clientName?: unknown
  amount?: unknown
  status?: unknown
  issuedDate?: unknown
  dueDate?: unknown
  description?: unknown
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
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

function mapInvoiceDoc(docId: string, data: StoredFinanceInvoice): FinanceInvoice {
  return {
    id: docId,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    clientName: typeof data.clientName === 'string' && data.clientName.trim().length > 0 ? data.clientName : 'Unknown client',
    amount: coerceNumber(data.amount),
    status: (typeof data.status === 'string' ? data.status : 'draft') as FinanceInvoice['status'],
    issuedDate: toISO(data.issuedDate),
    dueDate: toISO(data.dueDate),
    description: typeof data.description === 'string' ? data.description : null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
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

    const payload: FinanceSummaryResponse = {
      revenue,
      invoices,
      costs,
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
