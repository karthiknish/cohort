import { z } from 'zod/v4'

import { Errors } from './errors'
import {
  type AuthenticatedQueryCtx,
  zAuthenticatedMutation,
  zWorkspaceMutation,
  zWorkspaceQuery,
} from './functions'

const formFieldZ = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['text', 'select', 'photo', 'checklist', 'number']),
  required: z.boolean(),
})

const timeSessionZ = z.object({
  id: z.string(),
  personName: z.string(),
  role: z.string(),
  project: z.string(),
  status: z.enum(['clocked-in', 'on-break', 'clocked-out', 'needs-review']),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  durationLabel: z.string(),
  locationLabel: z.string(),
  flaggedReason: z.string().optional(),
  managerReview: z.enum(['none', 'pending', 'approved', 'rejected']),
  approvedByName: z.string().nullable().optional(),
  managerNote: z.string().nullable().optional(),
})

const coverageAlertZ = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
})

const shiftZ = z.object({
  id: z.string(),
  title: z.string(),
  assignee: z.string(),
  team: z.string(),
  dayLabel: z.string(),
  timeLabel: z.string(),
  coverageLabel: z.string(),
  status: z.enum(['scheduled', 'open', 'swap-requested']),
  locationLabel: z.string().optional(),
  notes: z.string().optional(),
  conflictWithTimeOff: z.string().optional(),
  conflictWithAvailability: z.string().optional(),
  canClaim: z.boolean().optional(),
})

const shiftSwapZ = z.object({
  id: z.string(),
  shiftTitle: z.string(),
  requestedBy: z.string(),
  requestedTo: z.string(),
  windowLabel: z.string(),
  status: z.enum(['pending', 'approved', 'blocked']),
})

const templateZ = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  completionRate: z.string(),
  fieldsCount: z.number(),
  frequency: z.string(),
})

const submissionZ = z.object({
  id: z.string(),
  templateTitle: z.string(),
  submittedBy: z.string(),
  submittedAt: z.string(),
  status: z.enum(['ready', 'needs-follow-up', 'in-review']),
  scoreLabel: z.string(),
})

const timeOffBalanceZ = z.object({
  id: z.string(),
  label: z.string(),
  used: z.string(),
  remaining: z.string(),
})

const timeOffRequestZ = z.object({
  id: z.string(),
  personName: z.string(),
  type: z.string(),
  windowLabel: z.string(),
  status: z.enum(['pending', 'approved', 'declined']),
  approver: z.string(),
})

function generateLegacyId(prefix: string, now: number) {
  return `${prefix}_${now}_${Math.random().toString(16).slice(2, 8)}`
}

function formatTime(valueMs: number) {
  return new Date(valueMs).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safeMinutes / 60)
  const remainder = safeMinutes % 60
  return `${hours}h ${remainder}m`
}

function startOfCurrentWeek(now: number) {
  const date = new Date(now)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + diff)
  return date.getTime()
}

function getCurrentDayLabel(offsetDays: number) {
  const base = new Date()
  base.setDate(base.getDate() + offsetDays)
  return base.toLocaleDateString('en-US', { weekday: 'short' })
}

function defaultTemplateFields() {
  return [
    { id: 'field-owner', label: 'Campaign owner', type: 'select' as const, required: true },
    { id: 'field-links', label: 'Tracking links verified', type: 'checklist' as const, required: true },
    { id: 'field-proof', label: 'Screenshot proof', type: 'photo' as const, required: false },
    { id: 'field-budget', label: 'Budget confirmation', type: 'number' as const, required: true },
  ]
}

async function listTimeRows(ctx: AuthenticatedQueryCtx, workspaceId: string) {
  return ctx.db
    .query('workforceTimeSessions')
    .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', workspaceId))
    .order('desc')
    .take(50)
}

function parseHoursFromTimeLabel(timeLabel: string) {
  const match = timeLabel.match(/(\d{2}):(\d{2})\s-\s(\d{2}):(\d{2})/)
  if (!match) {
    return 4
  }

  const startMinutes = Number(match[1]) * 60 + Number(match[2])
  const endMinutes = Number(match[3]) * 60 + Number(match[4])
  return Math.max(1, (endMinutes - startMinutes) / 60)
}

function mapTimeSession(row: Awaited<ReturnType<typeof listTimeRows>>[number]) {
  const review = row.managerReview ?? 'none'
  return {
    id: row.legacyId,
    personName: row.personName,
    role: row.role,
    project: row.project,
    status: row.status,
    startedAt: formatTime(row.startedAtMs),
    endedAt: row.endedAtMs ? formatTime(row.endedAtMs) : null,
    durationLabel: formatDuration(row.durationMinutes),
    locationLabel: row.locationLabel,
    managerReview: review,
    approvedByName: row.approvedByName ?? null,
    managerNote: row.managerNote ?? null,
    ...(row.flaggedReason ? { flaggedReason: row.flaggedReason } : {}),
  }
}

function assertTeamOrAdmin(ctx: { user: { role: string | null } }) {
  const role = ctx.user.role
  if (role !== 'admin' && role !== 'team') {
    throw Errors.auth.forbidden('Only workspace team members can perform this review action.')
  }
}

export const getTimeDashboard = zWorkspaceQuery({
  args: { workspaceId: z.string() },
  returns: z.object({
    summary: z.object({
      clockedInNow: z.string(),
      hoursThisWeek: z.string(),
      pendingApprovals: z.string(),
      flaggedSessions: z.string(),
    }),
    sessions: z.array(timeSessionZ),
    alerts: z.array(coverageAlertZ),
    activeSession: timeSessionZ.nullable(),
  }),
  handler: async (ctx, args) => {
    const rows = await listTimeRows(ctx, args.workspaceId)
    const weekStart = startOfCurrentWeek(Date.now())
    const hoursThisWeek = rows
      .filter((row) => row.startedAtMs >= weekStart)
      .reduce((sum, row) => sum + row.durationMinutes, 0)

    const pendingApprovals = rows.filter((row) => {
      const review = row.managerReview ?? 'none'
      return row.status === 'needs-review' || review === 'pending'
    }).length
    const flaggedSessions = rows.filter((row) => row.flaggedReason !== null).length
    const clockedInNow = rows.filter((row) => row.status === 'clocked-in' || row.status === 'on-break').length

    const alerts = [
      pendingApprovals > 0
        ? {
            id: 'alert-approvals',
            title: 'Timecard review needed',
            message: `${pendingApprovals} session${pendingApprovals === 1 ? '' : 's'} still need manager approval before payroll export.`,
            severity: pendingApprovals > 2 ? 'critical' as const : 'warning' as const,
          }
        : {
            id: 'alert-coverage',
            title: 'Review queue is clear',
            message: 'No sessions are currently waiting on manager approval.',
            severity: 'info' as const,
          },
      flaggedSessions > 0
        ? {
            id: 'alert-flags',
            title: 'Location or duration exceptions detected',
            message: `${flaggedSessions} flagged session${flaggedSessions === 1 ? '' : 's'} should be inspected for accuracy.`,
            severity: 'warning' as const,
          }
        : {
            id: 'alert-healthy',
            title: 'Clock data looks healthy',
            message: 'Recent sessions are closing without location or duration exceptions.',
            severity: 'info' as const,
          },
    ]

    const sessions = rows.map(mapTimeSession)
    const activeSession = sessions.find((session) => session.personName === (ctx.user.name ?? ctx.user.email ?? 'Unknown') && (session.status === 'clocked-in' || session.status === 'on-break')) ?? null

    return {
      summary: {
        clockedInNow: String(clockedInNow),
        hoursThisWeek: (hoursThisWeek / 60).toFixed(1),
        pendingApprovals: String(pendingApprovals),
        flaggedSessions: String(flaggedSessions),
      },
      sessions,
      alerts,
      activeSession,
    }
  },
})

export const seedTimeModule = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
  },
  returns: z.object({ inserted: z.number() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('workforceTimeSessions')
      .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .take(1)

    if (existing.length > 0) {
      return { inserted: 0 }
    }

    const seedRows = [
      { personName: 'Maya Adler', role: 'Account lead', project: 'Novatech retention', status: 'clocked-in' as const, minutesAgo: 260, durationMinutes: 258, locationLabel: 'Hybrid · Bengaluru', flaggedReason: null },
      { personName: 'Sofia Reyes', role: 'Performance strategist', project: 'BlueOrbit launch sprint', status: 'on-break' as const, minutesAgo: 225, durationMinutes: 222, locationLabel: 'Remote · Madrid', flaggedReason: null },
      { personName: 'James Liu', role: 'Creative ops', project: 'Meridian review pack', status: 'needs-review' as const, minutesAgo: 390, durationMinutes: 214, locationLabel: 'Client site · Singapore', flaggedReason: 'Manual location override' },
      { personName: 'Kiran Patel', role: 'Project manager', project: 'Northstar migration', status: 'clocked-out' as const, minutesAgo: 480, durationMinutes: 443, locationLabel: 'HQ · Bengaluru', flaggedReason: null },
    ]

    for (const [index, row] of seedRows.entries()) {
      const startedAtMs = ctx.now - row.minutesAgo * 60_000
      const endedAtMs = row.status === 'clocked-out' || row.status === 'needs-review'
        ? startedAtMs + row.durationMinutes * 60_000
        : null

      await ctx.db.insert('workforceTimeSessions', {
        workspaceId: args.workspaceId,
        legacyId: `time_seed_${index + 1}`,
        personId: `${index + 1}`,
        personName: row.personName,
        role: row.role,
        project: row.project,
        status: row.status,
        startedAtMs,
        endedAtMs,
        durationMinutes: row.durationMinutes,
        locationLabel: row.locationLabel,
        flaggedReason: row.flaggedReason,
        managerReview: row.status === 'needs-review' ? 'pending' : 'none',
        createdAtMs: ctx.now,
        updatedAtMs: ctx.now,
      })
    }

    return { inserted: seedRows.length }
  },
})

export const clockAction = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    action: z.enum(['clockIn', 'startBreak', 'clockOut']),
    project: z.string().optional(),
    locationLabel: z.string().optional(),
  },
  returns: z.object({
    legacyId: z.string(),
    status: z.string(),
  }),
  handler: async (ctx, args) => {
    if (args.action === 'clockIn') {
      const legacyId = generateLegacyId('time', ctx.now)
      await ctx.db.insert('workforceTimeSessions', {
        workspaceId: args.workspaceId,
        legacyId,
        personId: ctx.legacyId,
        personName: ctx.user.name ?? ctx.user.email ?? 'Workspace user',
        role: ctx.user.role ?? 'team',
        project: args.project ?? 'General operations',
        status: 'clocked-in',
        startedAtMs: ctx.now,
        endedAtMs: null,
        durationMinutes: 0,
        locationLabel: args.locationLabel ?? 'Workspace default',
        flaggedReason: null,
        managerReview: 'none',
        createdAtMs: ctx.now,
        updatedAtMs: ctx.now,
      })

      return { legacyId, status: 'clocked-in' }
    }

    const latest = await ctx.db
      .query('workforceTimeSessions')
      .withIndex('by_workspace_personId_updatedAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('personId', ctx.legacyId),
      )
      .order('desc')
      .first()

    if (!latest) {
      throw Errors.resource.notFound('Time session (active)', ctx.legacyId)
    }

    const durationMinutes = Math.max(0, Math.round((ctx.now - latest.startedAtMs) / 60_000))
    const nextStatus = args.action === 'startBreak' ? 'on-break' : 'clocked-out'
    await ctx.db.patch(latest._id, {
      status: nextStatus,
      endedAtMs: args.action === 'clockOut' ? ctx.now : latest.endedAtMs,
      durationMinutes,
      updatedAtMs: ctx.now,
    })

    return { legacyId: latest.legacyId, status: nextStatus }
  },
})

export const submitTimeSessionReview = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    sessionLegacyId: z.string(),
    decision: z.enum(['approve', 'reject', 'flag']),
    note: z.string().optional(),
  },
  returns: z.object({ ok: z.literal(true) }),
  handler: async (ctx, args) => {
    assertTeamOrAdmin(ctx)
    const row = await ctx.db
      .query('workforceTimeSessions')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.sessionLegacyId))
      .unique()

    if (!row) {
      throw Errors.resource.notFound('Time session', args.sessionLegacyId)
    }

    const reviewer = ctx.user.name ?? ctx.user.email ?? 'Manager'
    const note = args.note?.trim() ?? null

    if (args.decision === 'approve') {
      await ctx.db.patch(row._id, {
        managerReview: 'approved',
        approvedAtMs: ctx.now,
        approvedById: ctx.legacyId,
        approvedByName: reviewer,
        managerNote: note ?? row.managerNote,
        status: row.status === 'needs-review' ? 'clocked-out' : row.status,
        updatedAtMs: ctx.now,
      })
    } else if (args.decision === 'reject') {
      await ctx.db.patch(row._id, {
        managerReview: 'rejected',
        approvedAtMs: ctx.now,
        approvedById: ctx.legacyId,
        approvedByName: reviewer,
        managerNote: note,
        updatedAtMs: ctx.now,
      })
    } else {
      await ctx.db.patch(row._id, {
        managerReview: 'pending',
        flaggedReason: note ?? 'Flagged by manager',
        status: 'needs-review',
        updatedAtMs: ctx.now,
      })
    }

    return { ok: true as const }
  },
})

export const getSchedulingDashboard = zWorkspaceQuery({
  args: { workspaceId: z.string() },
  returns: z.object({
    summary: z.object({
      shiftsThisWeek: z.string(),
      openCoverageGaps: z.string(),
      swapRequests: z.string(),
      averageBlockHours: z.string(),
    }),
    alerts: z.array(coverageAlertZ),
    shifts: z.array(shiftZ),
    swaps: z.array(shiftSwapZ),
  }),
  handler: async (ctx, args) => {
    const [shiftsRows, swapRows, availabilityRows] = await Promise.all([
      ctx.db
        .query('workforceShifts')
        .withIndex('by_workspace_dayStartMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
        .take(50),
      ctx.db
        .query('workforceShiftSwaps')
        .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
        .order('desc')
        .take(20),
      ctx.db
        .query('workforceAvailability')
        .withIndex('by_workspace_startMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
        .take(200),
    ])

    const avWindows = availabilityRows.map((row) => ({
      personId: row.personId,
      startMs: row.startMs,
      endMs: row.endMs,
      kind: row.kind,
      label: row.label,
    }))

    const shifts = shiftsRows.map((row) => {
      const conflictAv =
        row.assigneeId && avWindows.some(
          (w) =>
            w.kind === 'unavailable' &&
            w.personId === row.assigneeId &&
            row.dayStartMs >= w.startMs &&
            row.dayStartMs < w.endMs,
        )
          ? avWindows.find(
              (w) =>
                w.kind === 'unavailable' &&
                w.personId === row.assigneeId &&
                row.dayStartMs >= w.startMs &&
                row.dayStartMs < w.endMs,
            )?.label ?? 'Unavailable'
          : null

      const avNote = conflictAv
        ? `Conflicts with marked unavailable: ${conflictAv}`
        : (row.conflictWithAvailability ?? undefined)
      const mergedTimeOff = row.conflictWithTimeOff ?? undefined

      return {
        id: row.legacyId,
        title: row.title,
        assignee: row.assigneeName,
        team: row.team,
        dayLabel: row.dayLabel,
        timeLabel: row.timeLabel,
        coverageLabel: row.coverageLabel,
        status: row.status,
        locationLabel: row.locationLabel,
        notes: row.notes,
        conflictWithTimeOff: mergedTimeOff,
        conflictWithAvailability: avNote ?? row.conflictWithAvailability,
        canClaim: row.status === 'open',
      }
    })

    const availabilityConflictCount = shifts.filter((s) => s.conflictWithAvailability).length
    const timeOffShiftConflicts = shifts.filter((s) => s.conflictWithTimeOff).length

    const swaps = swapRows.map((row) => ({
      id: row.legacyId,
      shiftTitle: row.shiftTitle,
      requestedBy: row.requestedBy,
      requestedTo: row.requestedTo,
      windowLabel: row.windowLabel,
      status: row.status,
    }))

    const openCoverageGaps = shiftsRows.filter((row) => row.status === 'open').length
    const avgBlockHours = shiftsRows.length > 0
      ? (
          shiftsRows.reduce((sum, row) => sum + parseHoursFromTimeLabel(row.timeLabel), 0) /
          shiftsRows.length
        ).toFixed(1)
      : '0.0'

    const alerts = [
      openCoverageGaps > 0
        ? {
            id: 'alert-open-shifts',
            title: 'Open shifts still need coverage',
            message: `${openCoverageGaps} shift${openCoverageGaps === 1 ? '' : 's'} are still unassigned before the next delivery window.`,
            severity: openCoverageGaps > 1 ? 'warning' as const : 'info' as const,
          }
        : {
            id: 'alert-staffed',
            title: 'Coverage is staffed',
            message: 'No open shifts are waiting on assignment.',
            severity: 'info' as const,
          },
      swapRows.filter((r) => r.status === 'pending').length > 0
        ? {
            id: 'alert-swaps',
            title: 'Shift swaps need review',
            message: `${swapRows.filter((r) => r.status === 'pending').length} swap request(s) are waiting on a decision.`,
            severity: 'warning' as const,
          }
        : {
            id: 'alert-swaps-clear',
            title: 'Swap queue is clear',
            message: 'No open shift-swap requests at the moment.',
            severity: 'info' as const,
          },
      availabilityConflictCount + timeOffShiftConflicts > 0
        ? {
            id: 'alert-availability-pto',
            title: 'Schedule conflicts detected',
            message: `${availabilityConflictCount + timeOffShiftConflicts} shift(s) touch unavailable time or approved leave.`,
            severity: 'warning' as const,
          }
        : {
            id: 'alert-no-pto',
            title: 'No PTO or availability hard conflicts on published shifts',
            message: 'Review individual rows for coverage and swaps.',
            severity: 'info' as const,
          },
    ]

    return {
      summary: {
        shiftsThisWeek: String(shiftsRows.length),
        openCoverageGaps: String(openCoverageGaps),
        swapRequests: String(swapRows.filter((r) => r.status === 'pending').length),
        averageBlockHours: avgBlockHours,
      },
      alerts,
      shifts,
      swaps,
    }
  },
})

export const seedSchedulingModule = zAuthenticatedMutation({
  args: { workspaceId: z.string() },
  returns: z.object({ inserted: z.number() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('workforceShifts')
      .withIndex('by_workspace_dayStartMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .take(1)

    if (existing.length > 0) {
      return { inserted: 0 }
    }

    const shifts = [
      { legacyId: 'shift_seed_1', title: 'Morning traffic monitoring', assigneeId: 'member-sofia', assigneeName: 'Sofia Reyes', team: 'Paid media', dayLabel: 'Mon', timeLabel: '08:00 - 12:00', coverageLabel: 'Primary owner assigned', status: 'scheduled' as const, dayStartMs: ctx.now },
      { legacyId: 'shift_seed_2', title: 'Client escalation desk', assigneeId: null, assigneeName: 'Open shift', team: 'Client success', dayLabel: 'Tue', timeLabel: '14:00 - 18:00', coverageLabel: 'Needs backup', status: 'open' as const, dayStartMs: ctx.now + 86_400_000 },
      { legacyId: 'shift_seed_3', title: 'Creative QA handoff', assigneeId: 'member-james', assigneeName: 'James Liu', team: 'Creative ops', dayLabel: 'Thu', timeLabel: '16:00 - 20:00', coverageLabel: 'Swap requested', status: 'swap-requested' as const, dayStartMs: ctx.now + 3 * 86_400_000 },
      { legacyId: 'shift_seed_4', title: 'Weekly launch room', assigneeId: 'member-maya', assigneeName: 'Maya Adler', team: 'Delivery', dayLabel: 'Fri', timeLabel: '10:00 - 15:00', coverageLabel: 'Ready to publish', status: 'scheduled' as const, dayStartMs: ctx.now + 4 * 86_400_000 },
    ]

    for (const row of shifts) {
      await ctx.db.insert('workforceShifts', {
        workspaceId: args.workspaceId,
        ...row,
        createdAtMs: ctx.now,
        updatedAtMs: ctx.now,
      })
    }

    await ctx.db.insert('workforceShiftSwaps', {
      workspaceId: args.workspaceId,
      legacyId: 'swap_seed_1',
      shiftLegacyId: 'shift_seed_3',
      shiftTitle: 'Creative QA handoff',
      requestedBy: 'James Liu',
      requestedTo: 'Dan Wright',
      windowLabel: 'Thu · 16:00 - 20:00',
      status: 'pending',
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
    })

    // Demo: Sofia unavailable during "Morning traffic" window (same day as first shift)
    await ctx.db.insert('workforceAvailability', {
      workspaceId: args.workspaceId,
      legacyId: 'avail_seed_1',
      personId: 'member-sofia',
      startMs: ctx.now - 2 * 60 * 60_000,
      endMs: ctx.now + 12 * 60 * 60_000,
      kind: 'unavailable',
      label: 'Conference · offline',
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
    })

    return { inserted: shifts.length + 2 }
  },
})

export const createCoverageShift = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    title: z.string().optional(),
    team: z.string().optional(),
    locationLabel: z.string().optional(),
    notes: z.string().optional(),
    timeLabel: z.string().optional(),
  },
  returns: z.object({ legacyId: z.string() }),
  handler: async (ctx, args) => {
    const legacyId = generateLegacyId('shift', ctx.now)
    const offset = 1 + Math.floor(Math.random() * 4)
    const dayLabel = getCurrentDayLabel(offset)
    const dayStartMs = ctx.now + offset * 86_400_000
    const timeLabel = args.timeLabel ?? '13:00 - 17:00'

    await ctx.db.insert('workforceShifts', {
      workspaceId: args.workspaceId,
      legacyId,
      title: args.title ?? 'Coverage shift',
      assigneeId: null,
      assigneeName: 'Open shift',
      team: args.team ?? 'Operations',
      dayStartMs,
      dayLabel,
      timeLabel,
      coverageLabel: 'Created from the dashboard',
      status: 'open',
      locationLabel: args.locationLabel,
      notes: args.notes,
      startsAtMs: dayStartMs,
      endsAtMs: dayStartMs + 4 * 60 * 60_000,
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
    })

    return { legacyId }
  },
})

export const setMyAvailability = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    startMs: z.number(),
    endMs: z.number(),
    kind: z.enum(['unavailable', 'preferred']),
    label: z.string(),
  },
  returns: z.object({ legacyId: z.string() }),
  handler: async (ctx, args) => {
    if (args.endMs <= args.startMs) {
      throw Errors.validation.invalidState('endMs must be after startMs')
    }
    const legacyId = generateLegacyId('avail', ctx.now)
    await ctx.db.insert('workforceAvailability', {
      workspaceId: args.workspaceId,
      legacyId,
      personId: ctx.legacyId,
      startMs: args.startMs,
      endMs: args.endMs,
      kind: args.kind,
      label: args.label,
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
    })
    return { legacyId }
  },
})

export const createShiftSwapRequest = zWorkspaceMutation({
  args: { workspaceId: z.string(), shiftLegacyId: z.string(), requestedTo: z.string() },
  returns: z.object({ legacyId: z.string() }),
  handler: async (ctx, args) => {
    const shift = await ctx.db
      .query('workforceShifts')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.shiftLegacyId))
      .unique()
    if (!shift) {
      throw Errors.resource.notFound('Shift', args.shiftLegacyId)
    }
    if (shift.status === 'open') {
      throw Errors.validation.invalidState('Open shifts are claimed, not swapped. Use claim for open blocks.')
    }
    const requester = ctx.user.name ?? ctx.user.email ?? 'Team member'
    const legacyId = generateLegacyId('swap', ctx.now)
    await ctx.db.insert('workforceShiftSwaps', {
      workspaceId: args.workspaceId,
      legacyId,
      shiftLegacyId: shift.legacyId,
      shiftTitle: shift.title,
      requestedBy: requester,
      requestedTo: args.requestedTo,
      windowLabel: `${shift.dayLabel} · ${shift.timeLabel}`,
      status: 'pending',
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
    })
    await ctx.db.patch(shift._id, { status: 'swap-requested', updatedAtMs: ctx.now })
    return { legacyId }
  },
})

export const reviewShiftSwapRequest = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    swapLegacyId: z.string(),
    decision: z.enum(['approved', 'blocked']),
  },
  returns: z.object({ ok: z.literal(true) }),
  handler: async (ctx, args) => {
    assertTeamOrAdmin(ctx)
    const row = await ctx.db
      .query('workforceShiftSwaps')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.swapLegacyId))
      .unique()
    if (!row) {
      throw Errors.resource.notFound('Shift swap', args.swapLegacyId)
    }
    if (row.status !== 'pending') {
      throw Errors.validation.invalidState('This swap is no longer pending review.')
    }
    await ctx.db.patch(row._id, {
      status: args.decision,
      updatedAtMs: ctx.now,
    })
    if (args.decision === 'blocked' && row.shiftLegacyId) {
      const s = await ctx.db
        .query('workforceShifts')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', row.shiftLegacyId))
        .unique()
      if (s?.status === 'swap-requested') {
        await ctx.db.patch(s._id, { status: 'scheduled', updatedAtMs: ctx.now })
      }
    }
    return { ok: true as const }
  },
})

export const getFormsDashboard = zWorkspaceQuery({
  args: { workspaceId: z.string() },
  returns: z.object({
    summary: z.object({
      activeTemplates: z.string(),
      submissionQuality: z.string(),
      followUpsNeeded: z.string(),
      automationReady: z.string(),
    }),
    templates: z.array(templateZ),
    fields: z.array(formFieldZ),
    submissions: z.array(submissionZ),
  }),
  handler: async (ctx, args) => {
    const [templateRows, submissionRows] = await Promise.all([
      ctx.db
        .query('workforceFormTemplates')
        .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
        .order('desc')
        .take(25),
      ctx.db
        .query('workforceFormSubmissions')
        .withIndex('by_workspace_submittedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
        .order('desc')
        .take(25),
    ])

    const templates = templateRows.map((row) => ({
      id: row.legacyId,
      title: row.title,
      category: row.category,
      completionRate: `${Math.round(row.completionRate)}%`,
      fieldsCount: row.fieldsCount,
      frequency: row.frequency,
    }))

    const submissions = submissionRows.map((row) => ({
      id: row.legacyId,
      templateTitle: row.templateTitle,
      submittedBy: row.submittedBy,
      submittedAt: new Date(row.submittedAtMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: row.status,
      scoreLabel: `${row.scoreCompleted}/${row.scoreTotal} complete`,
    }))

    const avgQuality = submissionRows.length > 0
      ? Math.round(
          submissionRows.reduce((sum, row) => sum + (row.scoreTotal > 0 ? (row.scoreCompleted / row.scoreTotal) * 100 : 0), 0) /
            submissionRows.length,
        )
      : 0

    return {
      summary: {
        activeTemplates: String(templateRows.length),
        submissionQuality: `${avgQuality}%`,
        followUpsNeeded: String(submissionRows.filter((row) => row.status === 'needs-follow-up').length),
        automationReady: String(templateRows.reduce((sum, row) => sum + row.fields.filter((field) => field.required).length, 0)),
      },
      templates,
      fields: templateRows[0]?.fields ?? [],
      submissions,
    }
  },
})

export const seedFormsModule = zAuthenticatedMutation({
  args: { workspaceId: z.string() },
  returns: z.object({ inserted: z.number() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('workforceFormTemplates')
      .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .take(1)

    if (existing.length > 0) {
      return { inserted: 0 }
    }

    const fields = defaultTemplateFields()
    const templates = [
      { legacyId: 'template_seed_1', title: 'Campaign launch readiness', category: 'Delivery', completionRate: 92, fieldsCount: 14, frequency: 'Every launch' },
      { legacyId: 'template_seed_2', title: 'Weekly client status pulse', category: 'Client ops', completionRate: 88, fieldsCount: 9, frequency: 'Weekly' },
      { legacyId: 'template_seed_3', title: 'Creative upload QA', category: 'Creative ops', completionRate: 95, fieldsCount: 11, frequency: 'Per asset batch' },
    ]

    for (const row of templates) {
      await ctx.db.insert('workforceFormTemplates', {
        workspaceId: args.workspaceId,
        ...row,
        fields,
        createdAtMs: ctx.now,
        updatedAtMs: ctx.now,
      })
    }

    const submissions = [
      { legacyId: 'submission_seed_1', templateLegacyId: 'template_seed_1', templateTitle: 'Campaign launch readiness', submittedBy: 'Sofia Reyes', status: 'ready' as const, scoreCompleted: 14, scoreTotal: 14, submittedAtMs: ctx.now - 90 * 60_000 },
      { legacyId: 'submission_seed_2', templateLegacyId: 'template_seed_2', templateTitle: 'Weekly client status pulse', submittedBy: 'Maya Adler', status: 'in-review' as const, scoreCompleted: 7, scoreTotal: 9, submittedAtMs: ctx.now - 180 * 60_000 },
      { legacyId: 'submission_seed_3', templateLegacyId: 'template_seed_3', templateTitle: 'Creative upload QA', submittedBy: 'James Liu', status: 'needs-follow-up' as const, scoreCompleted: 9, scoreTotal: 11, submittedAtMs: ctx.now - 24 * 60 * 60_000 },
    ]

    for (const row of submissions) {
      await ctx.db.insert('workforceFormSubmissions', {
        workspaceId: args.workspaceId,
        ...row,
        createdAtMs: ctx.now,
        updatedAtMs: ctx.now,
      })
    }

    return { inserted: templates.length + submissions.length }
  },
})

export const createChecklistTemplate = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    title: z.string().optional(),
    category: z.string().optional(),
    frequency: z.string().optional(),
  },
  returns: z.object({ legacyId: z.string() }),
  handler: async (ctx, args) => {
    const legacyId = generateLegacyId('template', ctx.now)
    const fields = defaultTemplateFields()
    const title = args.title ?? `Operations checklist ${new Date(ctx.now).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

    await ctx.db.insert('workforceFormTemplates', {
      workspaceId: args.workspaceId,
      legacyId,
      title,
      category: args.category ?? 'Operations',
      completionRate: 100,
      fieldsCount: fields.length,
      frequency: args.frequency ?? 'Ad hoc',
      fields,
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
    })

    return { legacyId }
  },
})

const answerFieldZ = z.object({
  fieldId: z.string(),
  value: z.string(),
})

export const submitChecklist = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    templateLegacyId: z.string(),
    answers: z.array(answerFieldZ),
  },
  returns: z.object({ legacyId: z.string() }),
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query('workforceFormTemplates')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.templateLegacyId))
      .unique()
    if (!template) {
      throw Errors.resource.notFound('Checklist template', args.templateLegacyId)
    }

    const answersByFieldId = new Map(args.answers.map((answer) => [answer.fieldId, answer] as const))

    for (const field of template.fields) {
      if (field.required) {
        const hit = answersByFieldId.get(field.id)
        if (!hit || !hit.value.trim()) {
          throw Errors.validation.invalidInput(`Required field: ${field.label}`, { fieldId: field.id })
        }
      }
    }

    let completed = 0
    for (const field of template.fields) {
      const hit = answersByFieldId.get(field.id)
      if (hit?.value?.trim()) {
        completed += 1
      }
    }
    const total = template.fields.length
    const status: 'ready' | 'in-review' | 'needs-follow-up' =
      completed === total && total > 0 ? 'ready' : completed > 0 ? 'in-review' : 'needs-follow-up'

    const legacyId = generateLegacyId('sub', ctx.now)
    const submittedBy = ctx.user.name ?? ctx.user.email ?? 'Team member'

    await ctx.db.insert('workforceFormSubmissions', {
      workspaceId: args.workspaceId,
      legacyId,
      templateLegacyId: template.legacyId,
      templateTitle: template.title,
      submittedBy,
      submittedAtMs: ctx.now,
      status,
      scoreCompleted: completed,
      scoreTotal: total,
      answers: args.answers,
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
    })

    return { legacyId }
  },
})

export const reviewFormSubmission = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    submissionLegacyId: z.string(),
    status: z.enum(['ready', 'needs-follow-up', 'in-review']),
  },
  returns: z.object({ ok: z.literal(true) }),
  handler: async (ctx, args) => {
    assertTeamOrAdmin(ctx)
    const row = await ctx.db
      .query('workforceFormSubmissions')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.submissionLegacyId))
      .unique()
    if (!row) {
      throw Errors.resource.notFound('Form submission', args.submissionLegacyId)
    }
    await ctx.db.patch(row._id, {
      status: args.status,
      updatedAtMs: ctx.now,
    })
    return { ok: true as const }
  },
})

export const claimOpenShift = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    shiftLegacyId: z.string(),
  },
  returns: z.object({ ok: z.literal(true) }),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('workforceShifts')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.shiftLegacyId))
      .unique()

    if (!row) {
      throw Errors.resource.notFound('Shift', args.shiftLegacyId)
    }
    if (row.status !== 'open') {
      throw Errors.validation.invalidState('Only open shifts can be claimed.')
    }

    const name = ctx.user.name ?? ctx.user.email ?? 'Team member'
    await ctx.db.patch(row._id, {
      status: 'scheduled',
      assigneeId: ctx.legacyId,
      assigneeName: name,
      updatedAtMs: ctx.now,
    })

    return { ok: true as const }
  },
})

export const getTimeOffDashboard = zWorkspaceQuery({
  args: { workspaceId: z.string() },
  returns: z.object({
    summary: z.object({
      balanceRows: z.string(),
      pendingApprovals: z.string(),
    }),
    balances: z.array(timeOffBalanceZ),
    requests: z.array(timeOffRequestZ),
  }),
  handler: async (ctx, args) => {
    const [balanceRows, requestRows] = await Promise.all([
      ctx.db
        .query('workforceTimeOffBalances')
        .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
        .order('desc')
        .take(20),

      ctx.db
        .query('workforceTimeOffRequests')
        .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
        .order('desc')
        .take(50),
    ])

    const balances = balanceRows.map((row) => ({
      id: row.legacyId,
      label: row.label,
      used: row.usedLabel,
      remaining: row.remainingLabel,
    }))

    const requests = requestRows.map((row) => ({
      id: row.legacyId,
      personName: row.personName,
      type: row.type,
      windowLabel: row.windowLabel,
      status: row.status,
      approver: row.approverName,
    }))

    const pendingApprovals = requestRows.filter((r) => r.status === 'pending').length

    return {
      summary: {
        balanceRows: String(balanceRows.length),
        pendingApprovals: String(pendingApprovals),
      },
      balances,
      requests,
    }
  },
})

export const seedTimeOffModule = zWorkspaceMutation({
  args: { workspaceId: z.string() },
  returns: z.object({ inserted: z.number() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('workforceTimeOffBalances')
      .withIndex('by_workspace_updatedAtMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
      .take(1)

    if (existing.length > 0) {
      return { inserted: 0 }
    }

    const balances = [
      { legacyId: 'to_balance_1', label: 'Annual leave', usedLabel: '7 days used', remainingLabel: '11 days left' },
      { legacyId: 'to_balance_2', label: 'Flex days', usedLabel: '1 day used', remainingLabel: '3 days left' },
      { legacyId: 'to_balance_3', label: 'Sick leave', usedLabel: '2 days used', remainingLabel: '6 days left' },
    ]

    for (const row of balances) {
      await ctx.db.insert('workforceTimeOffBalances', {
        workspaceId: args.workspaceId,
        ...row,
        createdAtMs: ctx.now,
        updatedAtMs: ctx.now,
      })
    }

    const requests = [
      {
        legacyId: 'to_req_1',
        personId: 'member_1',
        personName: 'Sofia Reyes',
        type: 'Annual leave',
        windowLabel: 'May 5 - May 9',
        status: 'pending' as const,
        approverName: 'Workspace admin',
      },
      {
        legacyId: 'to_req_2',
        personId: 'member_2',
        personName: 'Maya Adler',
        type: 'Flex day',
        windowLabel: 'Apr 12',
        status: 'approved' as const,
        approverName: 'Workspace admin',
      },
    ]

    for (const row of requests) {
      await ctx.db.insert('workforceTimeOffRequests', {
        workspaceId: args.workspaceId,
        ...row,
        createdAtMs: ctx.now,
        updatedAtMs: ctx.now,
      })
    }

    return { inserted: balances.length + requests.length }
  },
})

export const createTimeOffRequest = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    type: z.string(),
    windowLabel: z.string(),
  },
  returns: z.object({ legacyId: z.string() }),
  handler: async (ctx, args) => {
    const legacyId = generateLegacyId('toreq', ctx.now)
    const personName = ctx.user.name ?? ctx.user.email ?? 'Team member'

    await ctx.db.insert('workforceTimeOffRequests', {
      workspaceId: args.workspaceId,
      legacyId,
      personId: ctx.legacyId,
      personName,
      type: args.type,
      windowLabel: args.windowLabel,
      status: 'pending',
      approverName: 'Pending assignment',
      createdAtMs: ctx.now,
      updatedAtMs: ctx.now,
    })

    return { legacyId }
  },
})

export const reviewTimeOffRequest = zWorkspaceMutation({
  args: {
    workspaceId: z.string(),
    requestLegacyId: z.string(),
    decision: z.enum(['approved', 'declined']),
  },
  returns: z.object({ ok: z.literal(true) }),
  handler: async (ctx, args) => {
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'team') {
      throw Errors.auth.forbidden('Only team members can review time-off requests.')
    }

    const row = await ctx.db
      .query('workforceTimeOffRequests')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.requestLegacyId))
      .unique()

    if (!row) {
      throw Errors.resource.notFound('Time-off request', args.requestLegacyId)
    }
    if (row.status !== 'pending') {
      throw Errors.validation.invalidState('Request is no longer pending.')
    }

    const reviewer = ctx.user.name ?? ctx.user.email ?? 'Manager'
    await ctx.db.patch(row._id, {
      status: args.decision,
      approverName: reviewer,
      updatedAtMs: ctx.now,
    })

    if (args.decision === 'approved') {
      const shifts = await ctx.db
        .query('workforceShifts')
        .withIndex('by_workspace_dayStartMs_legacyId', (q) => q.eq('workspaceId', args.workspaceId))
        .take(80)
      const message = `Approved ${row.type} (${row.windowLabel}) — reassign if needed.`
      for (const s of shifts) {
        if (s.assigneeId === row.personId) {
          await ctx.db.patch(s._id, {
            conflictWithTimeOff: message,
            updatedAtMs: ctx.now,
          })
        }
      }
    }

    return { ok: true as const }
  },
})
