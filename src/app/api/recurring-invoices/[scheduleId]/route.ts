import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import type { RecurringInvoiceSchedule, RecurringFrequency } from '@/types/recurring-invoices'
import { toISO } from '@/lib/utils'
import { NotFoundError, ValidationError } from '@/lib/api-errors'

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

export const GET = createApiHandler(
  { workspace: 'required', rateLimit: 'standard' },
  async (req, { workspace, params }) => {
    const { scheduleId } = params
    if (!scheduleId) {
      throw new ValidationError('Schedule ID required')
    }

    const docRef = workspace!.workspaceRef.collection('recurringInvoices').doc(scheduleId as string)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new NotFoundError('Schedule not found')
    }

    const schedule = mapScheduleDoc(doc.id, doc.data() as StoredSchedule)
    return { schedule }
  }
)

export const PATCH = createApiHandler(
  { 
    workspace: 'required',
    bodySchema: updateScheduleSchema,
    rateLimit: 'sensitive'
  },
  async (req, { workspace, body: input, params }) => {
    const { scheduleId } = params
    if (!scheduleId) {
      throw new ValidationError('Schedule ID required')
    }

    const docRef = workspace!.workspaceRef.collection('recurringInvoices').doc(scheduleId as string)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new NotFoundError('Schedule not found')
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

    return { schedule }
  }
)

export const DELETE = createApiHandler(
  { workspace: 'required', rateLimit: 'sensitive' },
  async (req, { workspace, params }) => {
    const { scheduleId } = params
    if (!scheduleId) {
      throw new ValidationError('Schedule ID required')
    }

    const docRef = workspace!.workspaceRef.collection('recurringInvoices').doc(scheduleId as string)
    const doc = await docRef.get()

    if (!doc.exists) {
      throw new NotFoundError('Schedule not found')
    }

    await docRef.delete()

    return { success: true }
  }
)

// Manually trigger invoice generation for a schedule
export const POST = createApiHandler(
  { workspace: 'required', rateLimit: 'sensitive' },
  async (req, { workspace, params }) => {
    const { scheduleId } = params
    if (!scheduleId) {
      throw new ValidationError('Schedule ID required')
    }

    const scheduleRef = workspace!.workspaceRef.collection('recurringInvoices').doc(scheduleId as string)
    const scheduleDoc = await scheduleRef.get()

    if (!scheduleDoc.exists) {
      throw new NotFoundError('Schedule not found')
    }

    const scheduleData = scheduleDoc.data() as StoredSchedule
    
    if (scheduleData.isActive !== true) {
      throw new ValidationError('Schedule is not active')
    }

    // Check if end date has passed
    if (scheduleData.endDate) {
      const endDate = new Date(scheduleData.endDate as string)
      if (endDate < new Date()) {
        throw new ValidationError('Schedule has ended')
      }
    }

    const timestamp = Timestamp.now()
    const now = new Date()

    // Calculate due date (30 days from now)
    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 30)

    // Create the invoice
    const invoiceRef = await workspace!.financeInvoicesCollection.add({
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

    return {
      success: true,
      invoiceId: invoiceRef.id,
      nextRunDate,
    }
  }
)
