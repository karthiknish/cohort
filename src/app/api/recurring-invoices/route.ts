import { NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import type { RecurringInvoiceSchedule, RecurringFrequency } from '@/types/recurring-invoices'
import { apiSuccess, createApiHandler } from '@/lib/api-handler'
import { NotFoundError } from '@/lib/api-errors'
import { toISO } from '@/lib/utils'

const recurringInvoiceQuerySchema = z.object({
  activeOnly: z.string().optional(),
  clientId: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{1,100}$/)
    .optional(),
})

const createScheduleSchema = z.object({
  clientId: z.string().trim().min(1, 'Client ID is required'),
  clientName: z.string().trim().max(200).optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().trim().length(3).optional().default('USD'),
  description: z.string().trim().max(500).nullable().optional(),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'annually']),
  dayOfMonth: z.number().int().min(1).max(28).nullable().optional(),
  dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
  startDate: z.string().trim().min(1, 'Start date is required'),
  endDate: z.string().trim().nullable().optional(),
})

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
  startDate: string,
  dayOfMonth: number | null,
  dayOfWeek: number | null
): string {
  const start = new Date(startDate)
  const now = new Date()
  let next = new Date(start)

  // If start date is in the future, use it directly
  if (start > now) {
    return adjustToTargetDay(start, frequency, dayOfMonth, dayOfWeek).toISOString()
  }

  // Calculate from now if start is in the past
  next = new Date(now)
  return adjustToTargetDay(next, frequency, dayOfMonth, dayOfWeek).toISOString()
}

function adjustToTargetDay(
  date: Date,
  frequency: RecurringFrequency,
  dayOfMonth: number | null,
  dayOfWeek: number | null
): Date {
  const result = new Date(date)
  
  if (frequency === 'weekly' && dayOfWeek !== null) {
    const currentDay = result.getDay()
    const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7
    result.setDate(result.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget))
  } else if (dayOfMonth !== null) {
    result.setDate(dayOfMonth)
    if (result <= new Date()) {
      // Move to next period
      if (frequency === 'monthly') {
        result.setMonth(result.getMonth() + 1)
      } else if (frequency === 'quarterly') {
        result.setMonth(result.getMonth() + 3)
      } else if (frequency === 'annually') {
        result.setFullYear(result.getFullYear() + 1)
      }
    }
  } else {
    // Default to same day next period
    if (frequency === 'weekly') {
      result.setDate(result.getDate() + 7)
    } else if (frequency === 'monthly') {
      result.setMonth(result.getMonth() + 1)
    } else if (frequency === 'quarterly') {
      result.setMonth(result.getMonth() + 3)
    } else if (frequency === 'annually') {
      result.setFullYear(result.getFullYear() + 1)
    }
  }

  return result
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: recurringInvoiceQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const { activeOnly: activeOnlyParam, clientId } = query
    const activeOnly = activeOnlyParam === 'true'

    const schedulesRef = workspace.workspaceRef.collection('recurringInvoices')

    // Build query with filters at database level
    let schedulesQuery = schedulesRef.orderBy('nextRunDate', 'asc')

    if (activeOnly) {
      schedulesQuery = schedulesQuery.where('isActive', '==', true)
    }

    // Filter by clientId at query level when provided
    if (clientId) {
      schedulesQuery = schedulesRef.where('clientId', '==', clientId).orderBy('nextRunDate', 'asc')

      if (activeOnly) {
        schedulesQuery = schedulesRef
          .where('clientId', '==', clientId)
          .where('isActive', '==', true)
          .orderBy('nextRunDate', 'asc')
      }
    }

    const snapshot = await schedulesQuery.limit(100).get()

    const schedules: RecurringInvoiceSchedule[] = snapshot.docs.map((doc) =>
      mapScheduleDoc(doc.id, doc.data() as StoredSchedule)
    )

    return { schedules }
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: createScheduleSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body: input }) => {
    if (!workspace) throw new Error('Workspace context missing')
    // Verify client exists
    const clientRef = workspace.clientsCollection.doc(input.clientId)
    const clientSnap = await clientRef.get()

    if (!clientSnap.exists) {
      throw new NotFoundError('Client not found')
    }

    const clientData = clientSnap.data() ?? {}
    const clientName = input.clientName || (typeof clientData.name === 'string' ? clientData.name : 'Unknown Client')

    const nextRunDate = calculateNextRunDate(
      input.frequency,
      input.startDate,
      input.dayOfMonth ?? null,
      input.dayOfWeek ?? null
    )

    const timestamp = Timestamp.now()
    const schedulesRef = workspace.workspaceRef.collection('recurringInvoices')

    const docRef = await schedulesRef.add({
      clientId: input.clientId,
      clientName,
      amount: input.amount,
      currency: input.currency,
      description: input.description ?? null,
      frequency: input.frequency,
      dayOfMonth: input.dayOfMonth ?? null,
      dayOfWeek: input.dayOfWeek ?? null,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      nextRunDate,
      lastRunDate: null,
      lastInvoiceId: null,
      isActive: true,
      totalInvoicesGenerated: 0,
      createdBy: auth.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const createdDoc = await docRef.get()
    const schedule = mapScheduleDoc(createdDoc.id, createdDoc.data() as StoredSchedule)

    return NextResponse.json(apiSuccess({ schedule }), { status: 201 })
  }
)
