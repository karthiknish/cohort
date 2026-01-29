import type { FinanceSummaryResponse } from './types'
import { getPreviewClients } from './clients'
import { isoDaysAgo } from './utils'

export function getPreviewFinanceSummary(clientId: string | null): FinanceSummaryResponse {
    const clientNameFromId = new Map(getPreviewClients().map((c) => [c.id, c.name]))
    // During SSR, use a fixed date to prevent hydration mismatches
    const now = typeof window === 'undefined' ? new Date('2024-01-15T12:00:00.000Z') : new Date()
    const month = now.toISOString().slice(0, 7)

    const revenue = [
        {
            id: 'preview-rev-1',
            clientId,
            period: month,
            label: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'All clients',
            revenue: 24500,
            operatingExpenses: 8200,
            currency: 'USD',
            createdAt: isoDaysAgo(12),
            updatedAt: isoDaysAgo(2),
        },
        {
            id: 'preview-rev-2',
            clientId,
            period: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7),
            label: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'All clients',
            revenue: 21700,
            operatingExpenses: 7900,
            currency: 'USD',
            createdAt: isoDaysAgo(45),
            updatedAt: isoDaysAgo(40),
        },
    ]

    const invoices = [
        {
            id: 'preview-inv-1',
            clientId,
            clientName: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'Tech Corp',
            amount: 8000,
            status: 'sent' as const,
            stripeStatus: null,
            issuedDate: isoDaysAgo(10),
            dueDate: isoDaysAgo(-5),
            paidDate: null,
            amountPaid: null,
            amountRemaining: 8000,
            amountRefunded: null,
            currency: 'USD',
            description: 'Monthly retainer',
            hostedInvoiceUrl: null,
            number: 'INV-1001',
            createdAt: isoDaysAgo(10),
            updatedAt: isoDaysAgo(10),
        },
        {
            id: 'preview-inv-1-overdue',
            clientId,
            clientName: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'Retail Store',
            amount: 3100,
            status: 'overdue' as const,
            stripeStatus: null,
            issuedDate: isoDaysAgo(40),
            dueDate: isoDaysAgo(10),
            paidDate: null,
            amountPaid: 0,
            amountRemaining: 3100,
            amountRefunded: 0,
            currency: 'USD',
            description: 'Campaign support (overdue)',
            hostedInvoiceUrl: null,
            number: 'INV-0966',
            createdAt: isoDaysAgo(40),
            updatedAt: isoDaysAgo(10),
        },
        {
            id: 'preview-inv-2',
            clientId,
            clientName: clientId ? clientNameFromId.get(clientId) ?? 'Client' : 'StartupXYZ',
            amount: 5200,
            status: 'paid' as const,
            stripeStatus: null,
            issuedDate: isoDaysAgo(28),
            dueDate: isoDaysAgo(14),
            paidDate: isoDaysAgo(15),
            amountPaid: 5200,
            amountRemaining: 0,
            amountRefunded: 0,
            currency: 'USD',
            description: 'Implementation sprint',
            hostedInvoiceUrl: null,
            number: 'INV-0992',
            createdAt: isoDaysAgo(28),
            updatedAt: isoDaysAgo(15),
        },
    ]

    const costs = [
        {
            id: 'preview-cost-1',
            category: 'saas',
            amount: 499,
            cadence: 'monthly' as const,
            clientId,
            currency: 'USD',
            createdAt: isoDaysAgo(20),
            updatedAt: isoDaysAgo(10),
        },
        {
            id: 'preview-cost-2',
            category: 'people',
            amount: 4200,
            cadence: 'monthly' as const,
            clientId,
            currency: 'USD',
            createdAt: isoDaysAgo(20),
            updatedAt: isoDaysAgo(10),
        },
    ]

    return {
        revenue,
        invoices,
        costs,
        payments: {
            totals: [
                {
                    currency: 'USD',
                    totalInvoiced: invoices.reduce((sum, inv) => sum + inv.amount, 0),
                    totalPaid: invoices.reduce((sum, inv) => sum + (inv.amountPaid ?? 0), 0),
                    totalOutstanding: invoices.reduce((sum, inv) => sum + (inv.amountRemaining ?? 0), 0),
                    refundTotal: invoices.reduce((sum, inv) => sum + (inv.amountRefunded ?? 0), 0),
                },
            ],
            overdueCount: invoices.filter((i) => i.status === 'overdue').length,
            paidCount: invoices.filter((i) => i.status === 'paid').length,
            openCount: invoices.filter((i) => i.status === 'sent' || i.status === 'overdue').length,
            nextDueAt: isoDaysAgo(-5),
            lastPaymentAt: isoDaysAgo(15),
        },
        invoiceNextCursor: null,
        costNextCursor: null,
        budget: {
            totalMonthlyBudget: 12000,
            categoryBudgets: {
                people: 7000,
                saas: 1500,
                marketing: 1200,
                operations: 800,
                travel: 500,
                training: 300,
                other: 700,
            },
        },
    }
}
