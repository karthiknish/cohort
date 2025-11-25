import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import type { RecurringInvoiceSchedule, RecurringFrequency } from '@/types/recurring-invoices'

const updateScheduleSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().trim().length(3).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'annually']).optional(),
  dayOfMonth: z.number().int().min(1).max(28).nullable().optional(),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  endDate: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
})

type RouteContext = {
  params: Promise<{ scheduleId: string }>
}

type StoredSchedule = {
  clientId?: unknown
  clientName?: unknown
  amount?: unknown
  currency?: unknown
  description?: unknown
  frequency?: unknown
  dayOfMonth?: unknown
  dayOfWeek?: unknown
  startDate?: unknown
  endDate?: unknown
  nextRunDate?: unknown
  lastRunDate?: unknown
  lastInvoiceId?: unknown
  isActive?: unknown
  totalInvoicesGenerated?: unknown
  createdBy?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

function toISO(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return null
}

function mapScheduleDoc(docId: string, data: StoredSchedule): RecurringInvoiceSchedule {
  const frequency = (typeof data.frequency === 'string' ? data.frequency : 'monthly') as RecurringFrequency
  
  return {
    id: docId,
    clientId: typeof data.clientId === 'string' ? data.clientId : '',
    clientName: typeof data.clientName === 'string' ? data.clientName : 'Unknown Client',
    amount: typeof data.amount === 'number' ? data.amount : 0,
    currency: typeof data.currency === 'string' ? data.currency : 'USD',
    description: typeof data.description === 'string' ? data.description : null,
    frequency,
    dayOfMonth: typeof data.dayOfMonth === 'number' ? data.dayOfMonth : null,
    dayOfWeek: typeof data.dayOfWeek === 'number' ? data.dayOfWeek : null,
    startDate: typeof data.startDate === 'string' ? data.startDate : toISO(data.startDate) ?? new Date().toISOString(),
    endDate: typeof data.endDate === 'string' ? data.endDate : null,
    nextRunDate: typeof data.nextRunDate === 'string' ? data.nextRunDate : toISO(data.nextRunDate) ?? '',
    lastRunDate: typeof data.lastRunDate === 'string' ? data.lastRunDate : toISO(data.lastRunDate),
    lastInvoiceId: typeof data.lastInvoiceId === 'string' ? data.lastInvoiceId : null,
    isActive: data.isActive === true,
    totalInvoicesGenerated: typeof data.totalInvoicesGenerated === 'number' ? data.totalInvoicesGenerated : 0,
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

function calculateNextRunDate(
  frequency: RecurringFrequency,
  currentNextRun: string,
  dayOfMonth: number | null,
  dayOfWeek: number | null
): string {
  const current = new Date(currentNextRun)
  let next = new Date(current)

  if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7)
  } else if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1)
    if (dayOfMonth !== null) {
      next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
    }
  } else if (frequency === 'quarterly') {
    next.setMonth(next.getMonth() + 3)
    if (dayOfMonth !== null) {
      next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
    }
  } else if (frequency === 'annually') {
    next.setFullYear(next.getFullYear() + 1)
    if (dayOfMonth !== null) {
      next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
    }
  }

  return next.toISOString()
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { scheduleId } = await context.params
    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
    }

    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const docRef = workspace.workspaceRef.collection('recurringInvoices').doc(scheduleId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    const schedule = mapScheduleDoc(doc.id, doc.data() as StoredSchedule)
    return NextResponse.json({ schedule })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[recurring-invoices/[id]] GET error', error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { scheduleId } = await context.params
    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
    }

    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const json = await request.json().catch(() => null)
    const input = updateScheduleSchema.parse(json ?? {})

    const workspace = await resolveWorkspaceContext(auth)
    const docRef = workspace.workspaceRef.collection('recurringInvoices').doc(scheduleId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    const timestamp = Timestamp.now()
    const updates: Record<string, unknown> = {
      updatedAt: timestamp,
    }

    if (input.amount !== undefined) updates.amount = input.amount
    if (input.currency !== undefined) updates.currency = input.currency
    if (input.description !== undefined) updates.description = input.description
    if (input.frequency !== undefined) updates.frequency = input.frequency
    if (input.dayOfMonth !== undefined) updates.dayOfMonth = input.dayOfMonth
    if (input.dayOfWeek !== undefined) updates.dayOfWeek = input.dayOfWeek
    if (input.endDate !== undefined) updates.endDate = input.endDate
    if (input.isActive !== undefined) updates.isActive = input.isActive

    await docRef.update(updates)

    const updatedDoc = await docRef.get()
    const schedule = mapScheduleDoc(updatedDoc.id, updatedDoc.data() as StoredSchedule)

    return NextResponse.json({ schedule })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().formErrors.join(', ') || 'Invalid input' }, { status: 400 })
    }
    console.error('[recurring-invoices/[id]] PATCH error', error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { scheduleId } = await context.params
    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
    }

    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const docRef = workspace.workspaceRef.collection('recurringInvoices').doc(scheduleId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    await docRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[recurring-invoices/[id]] DELETE error', error)
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 })
  }
}

// Manually trigger invoice generation for a schedule
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { scheduleId } = await context.params
    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
    }

    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const scheduleRef = workspace.workspaceRef.collection('recurringInvoices').doc(scheduleId)
    const scheduleDoc = await scheduleRef.get()

    if (!scheduleDoc.exists) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
    }

    const scheduleData = scheduleDoc.data() as StoredSchedule
    
    if (scheduleData.isActive !== true) {
      return NextResponse.json({ error: 'Schedule is not active' }, { status: 400 })
    }

    // Check if end date has passed
    if (scheduleData.endDate) {
      const endDate = new Date(scheduleData.endDate as string)
      if (endDate < new Date()) {
        return NextResponse.json({ error: 'Schedule has ended' }, { status: 400 })
      }
    }

    const timestamp = Timestamp.now()
    const now = new Date()

    // Calculate due date (30 days from now)
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 30)

    // Create the invoice
    const invoiceRef = await workspace.financeInvoicesCollection.add({
      clientId: scheduleData.clientId,
      clientName: scheduleData.clientName,
      amount: scheduleData.amount,
      currency: scheduleData.currency ?? 'USD',
      status: 'draft',
      description: scheduleData.description ?? `Recurring invoice (${scheduleData.frequency})`,
      issuedDate: now.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      recurringScheduleId: scheduleId,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const frequency = (typeof scheduleData.frequency === 'string' ? scheduleData.frequency : 'monthly') as RecurringFrequency
    const nextRunDate = calculateNextRunDate(
      frequency,
      typeof scheduleData.nextRunDate === 'string' ? scheduleData.nextRunDate : now.toISOString(),
      typeof scheduleData.dayOfMonth === 'number' ? scheduleData.dayOfMonth : null,
      typeof scheduleData.dayOfWeek === 'number' ? scheduleData.dayOfWeek : null
    )

    // Update schedule
    await scheduleRef.update({
      lastRunDate: now.toISOString(),
      lastInvoiceId: invoiceRef.id,
      nextRunDate,
      totalInvoicesGenerated: FieldValue.increment(1),
      updatedAt: timestamp,
    })

    return NextResponse.json({
      success: true,
      invoiceId: invoiceRef.id,
      nextRunDate,
    })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[recurring-invoices/[id]] POST (generate) error', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
