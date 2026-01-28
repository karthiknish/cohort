import { workspaceMutation, workspaceQuery } from './functions'
import { v } from 'convex/values'
import { Errors } from './errors'

type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'annually'

const scheduleValidator = v.object({
  id: v.string(),
  clientId: v.string(),
  clientName: v.string(),
  amount: v.number(),
  currency: v.string(),
  description: v.union(v.string(), v.null()),
  frequency: v.string(),
  dayOfMonth: v.union(v.number(), v.null()),
  dayOfWeek: v.union(v.number(), v.null()),
  startDate: v.string(),
  endDate: v.union(v.string(), v.null()),
  nextRunDate: v.string(),
  lastRunDate: v.union(v.string(), v.null()),
  lastInvoiceId: v.union(v.string(), v.null()),
  isActive: v.boolean(),
  totalInvoicesGenerated: v.number(),
  createdBy: v.union(v.string(), v.null()),
  createdAt: v.string(),
  updatedAt: v.string(),
})

function calculateNextRunDate(
  frequency: RecurringFrequency,
  startDate: string,
  dayOfMonth: number | null,
  dayOfWeek: number | null
): string {
  const start = new Date(startDate)
  const today = new Date()
  let next = new Date(start)

  // If start date is in the future, use it directly
  if (start > today) {
    return adjustToTargetDay(start, frequency, dayOfMonth, dayOfWeek).toISOString()
  }

  // Calculate from now if start is in the past
  next = new Date(today)
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

function calculateNextRunDateFromCurrent(
  frequency: RecurringFrequency,
  currentNextRun: string,
  dayOfMonth: number | null
): string {
  const current = new Date(currentNextRun)
  const next = new Date(current)

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

export const list = workspaceQuery({
  args: {
    activeOnly: v.optional(v.boolean()),
    clientId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    schedules: v.array(scheduleValidator),
  }),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 200)

    let rows = await ctx.db
      .query('recurringInvoices')
      .withIndex('by_workspaceId', (q) => q.eq('workspaceId', args.workspaceId))
      .collect()

    // Filter by active status if requested
    if (args.activeOnly) {
      rows = rows.filter((row) => row.isActive)
    }

    // Filter by clientId if provided
    if (args.clientId) {
      rows = rows.filter((row) => row.clientId === args.clientId)
    }

    // Sort by nextRunDate ascending
    rows.sort((a, b) => {
      const aDate = new Date(a.nextRunDate).getTime()
      const bDate = new Date(b.nextRunDate).getTime()
      return aDate - bDate
    })

    // Apply limit
    rows = rows.slice(0, limit)

    return {
      schedules: rows.map((row) => ({
        id: row.legacyId,
        clientId: row.clientId,
        clientName: row.clientName,
        amount: row.amount,
        currency: row.currency,
        description: row.description,
        frequency: row.frequency,
        dayOfMonth: row.dayOfMonth,
        dayOfWeek: row.dayOfWeek,
        startDate: row.startDate,
        endDate: row.endDate,
        nextRunDate: row.nextRunDate,
        lastRunDate: row.lastRunDate,
        lastInvoiceId: row.lastInvoiceId,
        isActive: row.isActive,
        totalInvoicesGenerated: row.totalInvoicesGenerated,
        createdBy: row.createdBy,
        createdAt: new Date(row.createdAt).toISOString(),
        updatedAt: new Date(row.updatedAt).toISOString(),
      })),
    }
  },
})

export const getById = workspaceQuery({
  args: {
    scheduleId: v.string(),
  },
  returns: scheduleValidator,
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('recurringInvoices')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.scheduleId)
      )
      .unique()

    if (!row) {
      throw Errors.resource.notFound('Schedule', args.scheduleId)
    }

    return {
      id: row.legacyId,
      clientId: row.clientId,
      clientName: row.clientName,
      amount: row.amount,
      currency: row.currency,
      description: row.description,
      frequency: row.frequency,
      dayOfMonth: row.dayOfMonth,
      dayOfWeek: row.dayOfWeek,
      startDate: row.startDate,
      endDate: row.endDate,
      nextRunDate: row.nextRunDate,
      lastRunDate: row.lastRunDate,
      lastInvoiceId: row.lastInvoiceId,
      isActive: row.isActive,
      totalInvoicesGenerated: row.totalInvoicesGenerated,
      createdBy: row.createdBy,
      createdAt: new Date(row.createdAt).toISOString(),
      updatedAt: new Date(row.updatedAt).toISOString(),
    }
  },
})

export const create = workspaceMutation({
  args: {
    clientId: v.string(),
    clientName: v.optional(v.string()),
    amount: v.number(),
    currency: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    frequency: v.string(),
    dayOfMonth: v.optional(v.union(v.number(), v.null())),
    dayOfWeek: v.optional(v.union(v.number(), v.null())),
    startDate: v.string(),
    endDate: v.optional(v.union(v.string(), v.null())),
  },
  returns: scheduleValidator,
  handler: async (ctx, args) => {
    const timestamp = ctx.now
    const legacyId = crypto.randomUUID()

    const frequency = args.frequency as RecurringFrequency
    const nextRunDate = calculateNextRunDate(
      frequency,
      args.startDate,
      args.dayOfMonth ?? null,
      args.dayOfWeek ?? null
    )

    await ctx.db.insert('recurringInvoices', {
      workspaceId: args.workspaceId,
      legacyId,
      clientId: args.clientId,
      clientName: args.clientName ?? 'Unknown Client',
      amount: args.amount,
      currency: args.currency ?? 'USD',
      description: args.description ?? null,
      frequency: args.frequency,
      dayOfMonth: args.dayOfMonth ?? null,
      dayOfWeek: args.dayOfWeek ?? null,
      startDate: args.startDate,
      endDate: args.endDate ?? null,
      nextRunDate,
      lastRunDate: null,
      lastInvoiceId: null,
      isActive: true,
      totalInvoicesGenerated: 0,
      createdBy: ctx.legacyId,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return {
      id: legacyId,
      clientId: args.clientId,
      clientName: args.clientName ?? 'Unknown Client',
      amount: args.amount,
      currency: args.currency ?? 'USD',
      description: args.description ?? null,
      frequency: args.frequency,
      dayOfMonth: args.dayOfMonth ?? null,
      dayOfWeek: args.dayOfWeek ?? null,
      startDate: args.startDate,
      endDate: args.endDate ?? null,
      nextRunDate,
      lastRunDate: null,
      lastInvoiceId: null,
      isActive: true,
      totalInvoicesGenerated: 0,
      createdBy: ctx.legacyId,
      createdAt: new Date(timestamp).toISOString(),
      updatedAt: new Date(timestamp).toISOString(),
    }
  },
})

export const update = workspaceMutation({
  args: {
    scheduleId: v.string(),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    frequency: v.optional(v.string()),
    dayOfMonth: v.optional(v.union(v.number(), v.null())),
    dayOfWeek: v.optional(v.union(v.number(), v.null())),
    endDate: v.optional(v.union(v.string(), v.null())),
    isActive: v.optional(v.boolean()),
  },
  returns: scheduleValidator,
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('recurringInvoices')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.scheduleId)
      )
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Schedule', args.scheduleId)
    }

    const timestamp = ctx.now
    const updates: Record<string, unknown> = {
      updatedAt: timestamp,
    }

    if (args.amount !== undefined) updates.amount = args.amount
    if (args.currency !== undefined) updates.currency = args.currency
    if (args.description !== undefined) updates.description = args.description
    if (args.frequency !== undefined) updates.frequency = args.frequency
    if (args.dayOfMonth !== undefined) updates.dayOfMonth = args.dayOfMonth
    if (args.dayOfWeek !== undefined) updates.dayOfWeek = args.dayOfWeek
    if (args.endDate !== undefined) updates.endDate = args.endDate
    if (args.isActive !== undefined) updates.isActive = args.isActive

    await ctx.db.patch(existing._id, updates)

    const updated = await ctx.db.get(existing._id)!

    return {
      id: updated!.legacyId,
      clientId: updated!.clientId,
      clientName: updated!.clientName,
      amount: updated!.amount,
      currency: updated!.currency,
      description: updated!.description,
      frequency: updated!.frequency,
      dayOfMonth: updated!.dayOfMonth,
      dayOfWeek: updated!.dayOfWeek,
      startDate: updated!.startDate,
      endDate: updated!.endDate,
      nextRunDate: updated!.nextRunDate,
      lastRunDate: updated!.lastRunDate,
      lastInvoiceId: updated!.lastInvoiceId,
      isActive: updated!.isActive,
      totalInvoicesGenerated: updated!.totalInvoicesGenerated,
      createdBy: updated!.createdBy,
      createdAt: new Date(updated!.createdAt).toISOString(),
      updatedAt: new Date(updated!.updatedAt).toISOString(),
    }
  },
})

export const remove = workspaceMutation({
  args: {
    scheduleId: v.string(),
  },
  returns: v.object({
    success: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('recurringInvoices')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.scheduleId)
      )
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Schedule', args.scheduleId)
    }

    await ctx.db.delete(existing._id)

    return { success: true as const }
  },
})

export const trigger = workspaceMutation({
  args: {
    scheduleId: v.string(),
  },
  returns: v.object({
    success: v.literal(true),
    invoiceId: v.string(),
    nextRunDate: v.string(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('recurringInvoices')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.scheduleId)
      )
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Schedule', args.scheduleId)
    }

    if (!existing.isActive) {
      throw Errors.validation.invalidState('Schedule is not active')
    }

    // Check if end date has passed
    if (existing.endDate) {
      const endDate = new Date(existing.endDate)
      if (endDate < new Date()) {
        throw Errors.validation.invalidState('Schedule has ended')
      }
    }

    const timestamp = ctx.now
    const today = new Date()

    // Calculate due date (30 days from now)
    const dueDate = new Date(today)
    dueDate.setDate(dueDate.getDate() + 30)

    // Create the invoice in the financeInvoices table
    const invoiceLegacyId = crypto.randomUUID()
    await ctx.db.insert('financeInvoices', {
      workspaceId: args.workspaceId,
      legacyId: invoiceLegacyId,
      clientId: existing.clientId,
      clientName: existing.clientName,
      amount: existing.amount,
      status: 'draft',
      stripeStatus: null,
      issuedDate: today.toISOString().split('T')[0]!,
      dueDate: dueDate.toISOString().split('T')[0]!,
      paidDate: null,
      amountPaid: null,
      amountRemaining: null,
      amountRefunded: null,
      currency: existing.currency,
      description: existing.description ?? `Recurring invoice (${existing.frequency})`,
      hostedInvoiceUrl: null,
      number: null,
      paymentIntentId: null,
      collectionMethod: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    // Calculate next run date
    const frequency = existing.frequency as RecurringFrequency
    const nextRunDate = calculateNextRunDateFromCurrent(
      frequency,
      existing.nextRunDate,
      existing.dayOfMonth
    )

    // Update schedule
    await ctx.db.patch(existing._id, {
      lastRunDate: today.toISOString(),
      lastInvoiceId: invoiceLegacyId,
      nextRunDate,
      totalInvoicesGenerated: existing.totalInvoicesGenerated + 1,
      updatedAt: timestamp,
    })

    return {
      success: true as const,
      invoiceId: invoiceLegacyId,
      nextRunDate,
    }
  },
})
