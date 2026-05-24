import type { Doc } from '../../../_generated/dataModel'
import type { QueryCtx } from '../../../_generated/server'

import { applyManualPagination, getPaginatedResponse } from '../../../functions'

export type TaskListFilterArgs = {
  status?: string
  searchQuery?: string
  assigneeUserId?: string
  assigneeMatch?: string
  projectId?: string
}

type PaginationCursor = {
  fieldValue: number
  legacyId: string
}

const FILTER_SCAN_BATCH_SIZE = 100
const FILTER_SCAN_MAX_ROWS = 2500

export function normalizeTaskListFilters(filters: TaskListFilterArgs | undefined): TaskListFilterArgs {
  if (!filters) return {}

  return {
    status: filters.status?.trim() || undefined,
    searchQuery: filters.searchQuery?.trim().toLowerCase() || undefined,
    assigneeUserId: filters.assigneeUserId?.trim() || undefined,
    assigneeMatch: filters.assigneeMatch?.trim().toLowerCase() || undefined,
    projectId: filters.projectId?.trim() || undefined,
  }
}

export function hasActiveTaskListFilters(filters: TaskListFilterArgs | undefined): boolean {
  const normalized = normalizeTaskListFilters(filters)
  return Boolean(
    normalized.status ||
      normalized.searchQuery ||
      normalized.assigneeUserId ||
      normalized.assigneeMatch ||
      normalized.projectId,
  )
}

export function taskMatchesListFilters(row: Doc<'tasks'>, filters: TaskListFilterArgs): boolean {
  const normalized = normalizeTaskListFilters(filters)

  if (normalized.status && row.status !== normalized.status) {
    return false
  }

  if (normalized.projectId && row.projectId !== normalized.projectId) {
    return false
  }

  if (normalized.searchQuery) {
    const title = row.title.toLowerCase()
    const description = (row.description ?? '').toLowerCase()
    if (!title.includes(normalized.searchQuery) && !description.includes(normalized.searchQuery)) {
      return false
    }
  }

  const assigned = row.assignedTo ?? []

  if (normalized.assigneeUserId && !assigned.includes(normalized.assigneeUserId)) {
    return false
  }

  if (normalized.assigneeMatch) {
    const matchesAssignee = assigned.some((assignee) => assignee.toLowerCase().includes(normalized.assigneeMatch!))
    if (!matchesAssignee) {
      return false
    }
  }

  return true
}

function buildTaskListQuery(
  ctx: QueryCtx,
  args: {
    workspaceId: string
    clientId?: string
    filters: TaskListFilterArgs
  },
) {
  const filters = normalizeTaskListFilters(args.filters)

  if (args.clientId) {
    return ctx.db
      .query('tasks')
      .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (index) =>
        index.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId!),
      )
      .order('desc')
  }

  if (filters.projectId) {
    return ctx.db
      .query('tasks')
      .withIndex('by_workspace_projectId_createdAtMs', (index) =>
        index.eq('workspaceId', args.workspaceId).eq('projectId', filters.projectId!),
      )
      .order('desc')
  }

  if (filters.status) {
    return ctx.db
      .query('tasks')
      .withIndex('by_workspace_status_createdAtMs', (index) =>
        index.eq('workspaceId', args.workspaceId).eq('status', filters.status!),
      )
      .order('desc')
  }

  return ctx.db
    .query('tasks')
    .withIndex('by_workspace_createdAtMs_legacyId', (index) => index.eq('workspaceId', args.workspaceId))
    .order('desc')
}

function needsFilterScan(filters: TaskListFilterArgs, clientId?: string): boolean {
  const normalized = normalizeTaskListFilters(filters)
  if (!hasActiveTaskListFilters(normalized)) {
    return false
  }

  if (normalized.searchQuery || normalized.assigneeUserId || normalized.assigneeMatch) {
    return true
  }

  if (clientId) {
    return true
  }

  if (normalized.projectId && normalized.status) {
    return true
  }

  return false
}

function normalizeTaskPaginationCursor(
  cursor: { fieldValue: number | string; legacyId: string } | null | undefined,
): PaginationCursor | null {
  if (!cursor) {
    return null
  }

  const fieldValue = typeof cursor.fieldValue === 'number' ? cursor.fieldValue : Number(cursor.fieldValue)
  if (!Number.isFinite(fieldValue)) {
    return null
  }

  return {
    fieldValue,
    legacyId: cursor.legacyId,
  }
}

export async function fetchFilteredTasksPage(
  ctx: QueryCtx,
  args: {
    workspaceId: string
    clientId?: string
    filters?: TaskListFilterArgs
    cursor?: { fieldValue: number | string; legacyId: string } | null
    limit: number
  },
) {
  const filters = normalizeTaskListFilters(args.filters)
  const paginationField = args.clientId ? ('updatedAtMs' as const) : ('createdAtMs' as const)
  const cursor = normalizeTaskPaginationCursor(args.cursor)

  if (!hasActiveTaskListFilters(filters)) {
    let query = buildTaskListQuery(ctx, { workspaceId: args.workspaceId, clientId: args.clientId, filters })
    query = applyManualPagination(query, cursor, paginationField, 'desc')
    const rows = await query.take(args.limit + 1)
    const result = getPaginatedResponse(rows, args.limit, paginationField)
    return {
      items: result.items,
      nextCursor: result.nextCursor,
    }
  }

  if (!needsFilterScan(filters, args.clientId)) {
    let query = buildTaskListQuery(ctx, { workspaceId: args.workspaceId, clientId: args.clientId, filters })
    query = applyManualPagination(query, cursor, paginationField, 'desc')

    const rows = await query.take(args.limit + 1)
    const matched = rows.filter((row) => taskMatchesListFilters(row, filters))
    const result = getPaginatedResponse(matched, args.limit, paginationField)
    return {
      items: result.items,
      nextCursor: result.nextCursor,
    }
  }

  const matched: Doc<'tasks'>[] = []
  let scanned = 0
  let scanCursor: PaginationCursor | null = cursor

  while (matched.length < args.limit + 1 && scanned < FILTER_SCAN_MAX_ROWS) {
    let query = buildTaskListQuery(ctx, { workspaceId: args.workspaceId, clientId: args.clientId, filters })
    query = applyManualPagination(query, scanCursor, paginationField, 'desc')
    const batch = await query.take(FILTER_SCAN_BATCH_SIZE)
    if (!batch.length) {
      break
    }

    scanned += batch.length

    for (const row of batch) {
      if (!taskMatchesListFilters(row, filters)) {
        continue
      }
      matched.push(row)
      if (matched.length >= args.limit + 1) {
        break
      }
    }

    if (batch.length < FILTER_SCAN_BATCH_SIZE) {
      break
    }

    const lastRow = batch[batch.length - 1]!
    scanCursor = {
      fieldValue: lastRow[paginationField],
      legacyId: lastRow.legacyId,
    }
  }

  const result = getPaginatedResponse(matched, args.limit, paginationField)
  return {
    items: result.items,
    nextCursor: result.nextCursor,
  }
}
