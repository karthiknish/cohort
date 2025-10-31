// @ts-ignore -- vitest types resolve after dependency install
import { describe, expect, it } from 'vitest'

import { buildTasksCacheKey } from '@/app/api/tasks/route'
import { calculatePaymentSummary } from '@/app/dashboard/finance/hooks/use-finance-data'
import type { FinanceInvoice } from '@/types/finance'

describe('pagination helpers', () => {
  it('generates distinct task cache keys per cursor and page size', () => {
    const baseFilters = {
      statusFilter: null,
      assigneeFilter: null,
      queryFilter: null,
      clientIdFilter: null,
      pageSize: 50,
      after: null,
    }

    const keyA = buildTasksCacheKey('workspace-123', baseFilters)
    const keyB = buildTasksCacheKey('workspace-123', { ...baseFilters, after: '2025-10-01T00:00:00.000Z|abc' })
    const keyC = buildTasksCacheKey('workspace-123', { ...baseFilters, pageSize: 25 })

    expect(keyA).not.toEqual(keyB)
    expect(keyA).not.toEqual(keyC)
    expect(keyA.split('::')).toContain(encodeURIComponent(String(baseFilters.pageSize)))
  })

  it('summarises payments across mixed invoice states', () => {
    const invoices: FinanceInvoice[] = [
      {
        id: 'inv-1',
        clientId: null,
        clientName: 'Acme',
        amount: 1000,
        status: 'sent',
        stripeStatus: null,
        issuedDate: '2025-07-01T00:00:00.000Z',
        dueDate: '2025-10-01T00:00:00.000Z',
        paidDate: null,
        amountPaid: 200,
        amountRemaining: null,
        amountRefunded: null,
        currency: 'usd',
        description: null,
        hostedInvoiceUrl: null,
        number: 'INV-001',
        paymentIntentId: null,
        collectionMethod: null,
        createdAt: '2025-07-01T00:00:00.000Z',
        updatedAt: '2025-07-01T00:00:00.000Z',
      },
      {
        id: 'inv-2',
        clientId: null,
        clientName: 'Acme',
        amount: 500,
        status: 'paid',
        stripeStatus: null,
        issuedDate: '2025-07-10T00:00:00.000Z',
        dueDate: '2025-08-10T00:00:00.000Z',
        paidDate: '2025-09-10T00:00:00.000Z',
        amountPaid: 500,
        amountRemaining: null,
        amountRefunded: 100,
        currency: 'usd',
        description: null,
        hostedInvoiceUrl: null,
        number: 'INV-002',
        paymentIntentId: null,
        collectionMethod: null,
        createdAt: '2025-07-10T00:00:00.000Z',
        updatedAt: '2025-09-10T00:00:00.000Z',
      },
      {
        id: 'inv-3',
        clientId: null,
        clientName: 'Acme',
        amount: 300,
        status: 'overdue',
        stripeStatus: null,
        issuedDate: '2025-05-10T00:00:00.000Z',
        dueDate: '2025-08-01T00:00:00.000Z',
        paidDate: null,
        amountPaid: 0,
        amountRemaining: null,
        amountRefunded: null,
        currency: 'usd',
        description: null,
        hostedInvoiceUrl: null,
        number: 'INV-003',
        paymentIntentId: null,
        collectionMethod: null,
        createdAt: '2025-05-10T00:00:00.000Z',
        updatedAt: '2025-08-02T00:00:00.000Z',
      },
    ]

    const summary = calculatePaymentSummary(invoices)

    expect(summary.totals).toHaveLength(1)
    const usdSummary = summary.totals.find((entry) => entry.currency === 'USD')
    expect(usdSummary).toBeDefined()
    expect(usdSummary?.totalInvoiced).toBe(1800)
    expect(usdSummary?.totalPaid).toBe(600)
    expect(usdSummary?.totalOutstanding).toBe(1100)
    expect(usdSummary?.refundTotal).toBe(100)
    expect(summary.overdueCount).toBe(1)
    expect(summary.paidCount).toBe(1)
    expect(summary.openCount).toBe(2)
    expect(summary.nextDueAt).toBe('2025-08-01T00:00:00.000Z')
    expect(summary.lastPaymentAt).toBe('2025-09-10T00:00:00.000Z')
  })
})
