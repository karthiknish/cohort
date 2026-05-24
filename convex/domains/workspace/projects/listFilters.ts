import type { Doc } from '../../../_generated/dataModel'
import type { QueryCtx } from '../../../_generated/server'

import { applyManualPagination, getPaginatedResponse } from '../../../functions'

export type ProjectListFilterArgs = {
  status?: string
  clientId?: string
  searchQuery?: string
}

type PaginationCursor = {
  fieldValue: number
  legacyId: string
}

const FILTER_SCAN_BATCH_SIZE = 100
const FILTER_SCAN_MAX_ROWS = 2500

export function normalizeProjectListFilters(filters: ProjectListFilterArgs | undefined): ProjectListFilterArgs {
  if (!filters) return {}

  return {
    status: filters.status?.trim() || undefined,
    clientId: filters.clientId?.trim() || undefined,
    searchQuery: filters.searchQuery?.trim().toLowerCase() || undefined,
  }
}

export function hasActiveProjectListFilters(filters: ProjectListFilterArgs | undefined): boolean {
  const normalized = normalizeProjectListFilters(filters)
  return Boolean(normalized.status || normalized.clientId || normalized.searchQuery)
}

export function projectMatchesListFilters(row: Doc<'projects'>, filters: ProjectListFilterArgs): boolean {
  const normalized = normalizeProjectListFilters(filters)

  if (normalized.status && row.status !== normalized.status) {
    return false
  }

  if (normalized.clientId && row.clientId !== normalized.clientId) {
    return false
  }

  if (normalized.searchQuery) {
    const query = normalized.searchQuery
    const name = row.name.toLowerCase()
    const description = (row.description ?? '').toLowerCase()
    const clientName = (row.clientName ?? '').toLowerCase()
    const matchesTags = row.tags.some((tag) => tag.toLowerCase().includes(query))

    if (!name.includes(query) && !description.includes(query) && !clientName.includes(query) && !matchesTags) {
      return false
    }
  }

  return true
}

function buildProjectListQuery(
  ctx: QueryCtx,
  args: {
    workspaceId: string
    filters: ProjectListFilterArgs
  },
) {
  const filters = normalizeProjectListFilters(args.filters)
  const status = filters.status ?? null
  const clientId = filters.clientId ?? null

  if (status && clientId) {
    return ctx.db
      .query('projects')
      .withIndex('by_workspace_status_clientId_updatedAtMs_legacyId', (index) =>
        index.eq('workspaceId', args.workspaceId).eq('status', status).eq('clientId', clientId),
      )
      .order('desc')
  }

  if (status) {
    return ctx.db
      .query('projects')
      .withIndex('by_workspace_status_updatedAtMs_legacyId', (index) =>
        index.eq('workspaceId', args.workspaceId).eq('status', status),
      )
      .order('desc')
  }

  if (clientId) {
    return ctx.db
      .query('projects')
      .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (index) =>
        index.eq('workspaceId', args.workspaceId).eq('clientId', clientId),
      )
      .order('desc')
  }

  return ctx.db
    .query('projects')
    .withIndex('by_workspace_updatedAtMs_legacyId', (index) => index.eq('workspaceId', args.workspaceId))
    .order('desc')
}

function needsFilterScan(filters: ProjectListFilterArgs): boolean {
  return Boolean(normalizeProjectListFilters(filters).searchQuery)
}

function normalizeProjectPaginationCursor(
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

export async function fetchFilteredProjectsPage(
  ctx: QueryCtx,
  args: {
    workspaceId: string
    filters?: ProjectListFilterArgs
    cursor?: { fieldValue: number | string; legacyId: string } | null
    limit: number
  },
) {
  const filters = normalizeProjectListFilters(args.filters)
  const cursor = normalizeProjectPaginationCursor(args.cursor)

  if (!hasActiveProjectListFilters(filters)) {
    let query = buildProjectListQuery(ctx, { workspaceId: args.workspaceId, filters })
    query = applyManualPagination(query, cursor, 'updatedAtMs', 'desc')
    const rows = await query.take(args.limit + 1)
    const result = getPaginatedResponse(rows, args.limit, 'updatedAtMs')
    return {
      items: result.items,
      nextCursor: result.nextCursor,
    }
  }

  if (!needsFilterScan(filters)) {
    let query = buildProjectListQuery(ctx, { workspaceId: args.workspaceId, filters })
    query = applyManualPagination(query, cursor, 'updatedAtMs', 'desc')
    const rows = await query.take(args.limit + 1)
    const matched = rows.filter((row) => projectMatchesListFilters(row, filters))
    const result = getPaginatedResponse(matched, args.limit, 'updatedAtMs')
    return {
      items: result.items,
      nextCursor: result.nextCursor,
    }
  }

  const matched: Doc<'projects'>[] = []
  let scanned = 0
  let scanCursor: PaginationCursor | null = cursor

  while (matched.length < args.limit + 1 && scanned < FILTER_SCAN_MAX_ROWS) {
    let query = buildProjectListQuery(ctx, { workspaceId: args.workspaceId, filters })
    query = applyManualPagination(query, scanCursor, 'updatedAtMs', 'desc')
    const batch = await query.take(FILTER_SCAN_BATCH_SIZE)
    if (!batch.length) {
      break
    }

    scanned += batch.length

    for (const row of batch) {
      if (!projectMatchesListFilters(row, filters)) {
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
      fieldValue: lastRow.updatedAtMs,
      legacyId: lastRow.legacyId,
    }
  }

  const result = getPaginatedResponse(matched, args.limit, 'updatedAtMs')
  return {
    items: result.items,
    nextCursor: result.nextCursor,
  }
}
