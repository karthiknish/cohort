type AdminListRow = {
  legacyId: string
  updatedAtMs?: number | null
  createdAtMs?: number | null
  _creationTime?: number
}

function getSortValue(row: AdminListRow): number {
  return row.updatedAtMs ?? row.createdAtMs ?? row._creationTime ?? 0
}

function parseCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0
  const parsed = Number.parseInt(cursor, 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

export function buildAdminUserPage<T extends AdminListRow>(args: {
  owner?: T | null
  members?: T[]
  allUsers?: T[]
  includeAllWorkspaces?: boolean
  numItems: number
  cursor?: string | null
}): {
  page: T[]
  continueCursor: string | null
  isDone: boolean
} {
  const sourceRows = args.includeAllWorkspaces
    ? (args.allUsers ?? [])
    : [
        ...(args.owner ? [args.owner] : []),
        ...(args.members ?? []),
      ]

  const uniqueRows = new Map<string, T>()
  for (const row of sourceRows) {
    if (!row?.legacyId || uniqueRows.has(row.legacyId)) continue
    uniqueRows.set(row.legacyId, row)
  }

  const rows = Array.from(uniqueRows.values())
    .sort((a, b) => getSortValue(b) - getSortValue(a))

  const startIndex = parseCursor(args.cursor)
  const endIndex = startIndex + args.numItems
  const page = rows.slice(startIndex, endIndex)
  const continueCursor = endIndex < rows.length ? String(endIndex) : null

  return {
    page,
    continueCursor,
    isDone: continueCursor === null,
  }
}