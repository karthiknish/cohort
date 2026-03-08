import type { MutationCtx, QueryCtx } from './_generated/server'

type NotificationAudienceRow = {
  actorId?: unknown
  readBy?: unknown
  recipientRoles?: unknown
  recipientClientId?: unknown
  recipientClientIds?: unknown
  recipientUserIds?: unknown
  metadata?: unknown
}

type MentionTarget = {
  slug?: string | null
  name?: string | null
}

type WorkspaceUserRow = {
  legacyId?: unknown
  status?: unknown
  name?: unknown
}

type TaskNotificationAudienceOptions = {
  workspaceId: string
  assignedTo?: unknown
  createdBy?: unknown
  projectId?: string | null
  taskLegacyId?: string | null
  includeCommentAuthors?: boolean
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : []
}

function normalizeNameKey(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().toLowerCase()
  return trimmed.length > 0 ? trimmed : null
}

function buildMentionSlug(name: string): string {
  return encodeURIComponent(name.trim().toLowerCase())
}

function isActiveWorkspaceUser(row: WorkspaceUserRow): row is WorkspaceUserRow & { legacyId: string } {
  const legacyId = typeof row.legacyId === 'string' ? row.legacyId : null
  const status = typeof row.status === 'string' ? row.status : null
  return Boolean(legacyId) && status !== 'disabled' && status !== 'suspended'
}

async function loadWorkspaceUserRows(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  workspaceId: string,
): Promise<WorkspaceUserRow[]> {
  const [membersByAgency, workspaceOwner] = await Promise.all([
    ctx.db.query('users').withIndex('by_agencyId', (q) => q.eq('agencyId', workspaceId)).take(500),
    ctx.db.query('users').withIndex('by_legacyId', (q) => q.eq('legacyId', workspaceId)).unique(),
  ])

  const candidateRows = workspaceOwner ? [...membersByAgency, workspaceOwner] : membersByAgency
  const uniqueRows = new Map<string, WorkspaceUserRow>()

  for (const row of candidateRows) {
    if (!isActiveWorkspaceUser(row)) continue
    uniqueRows.set(row.legacyId, row)
  }

  return [...uniqueRows.values()]
}

export async function resolveWorkspaceUserIds(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  workspaceId: string,
  options: {
    userIds?: Array<string | null | undefined>
    names?: Array<string | null | undefined>
    slugs?: Array<string | null | undefined>
  },
): Promise<string[]> {
  if (!workspaceId) return []

  const requestedUserIds = new Set(normalizeStringArray(options.userIds))
  const requestedNameKeys = new Set<string>()

  for (const slug of normalizeStringArray(options.slugs)) {
    requestedNameKeys.add(slug)
  }

  for (const name of normalizeStringArray(options.names)) {
    const normalizedName = normalizeNameKey(name)
    if (!normalizedName) continue
    requestedNameKeys.add(normalizedName)
    requestedNameKeys.add(buildMentionSlug(normalizedName))
  }

  if (requestedUserIds.size === 0 && requestedNameKeys.size === 0) return []

  const candidateRows = await loadWorkspaceUserRows(ctx, workspaceId)
  const matches = new Set<string>()

  for (const row of candidateRows) {
    if (!isActiveWorkspaceUser(row)) continue

    const normalizedName = normalizeNameKey(typeof row.name === 'string' ? row.name : null)
    if (requestedUserIds.has(row.legacyId)) {
      matches.add(row.legacyId)
      continue
    }

    if (!normalizedName) continue
    if (requestedNameKeys.has(normalizedName) || requestedNameKeys.has(buildMentionSlug(normalizedName))) {
      matches.add(row.legacyId)
    }
  }

  return [...matches].sort()
}

export function matchesNotificationRecipient(
  row: NotificationAudienceRow,
  options: {
    userId: string
    role?: string | null
    clientId?: string | null
    unreadOnly?: boolean
    excludeActor?: boolean
  },
): boolean {
  const recipientUserIds = normalizeStringArray(row.recipientUserIds)
  if (recipientUserIds.length > 0 && !recipientUserIds.includes(options.userId)) return false

  const recipientRoles = normalizeStringArray(row.recipientRoles)
  if (options.role && recipientRoles.length > 0 && !recipientRoles.includes(options.role)) return false

  if (options.clientId) {
    const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : undefined
    const metadataClientId = typeof metadata?.clientId === 'string' ? metadata.clientId : null
    const recipientClientId = typeof row.recipientClientId === 'string' ? row.recipientClientId : null
    const recipientClientIds = normalizeStringArray(row.recipientClientIds)
    const matchesClient = recipientClientId === options.clientId
      || recipientClientIds.includes(options.clientId)
      || metadataClientId === options.clientId

    if (!matchesClient) return false
  }

  const readBy = normalizeStringArray(row.readBy)
  if (options.unreadOnly && readBy.includes(options.userId)) return false
  if (options.excludeActor && row.actorId === options.userId) return false

  return true
}

export async function resolveMentionRecipientUserIds(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  workspaceId: string,
  mentions: MentionTarget[],
): Promise<string[]> {
  if (!workspaceId || mentions.length === 0) return []

  return resolveWorkspaceUserIds(ctx, workspaceId, {
    names: mentions.map((mention) => mention.name),
    slugs: mentions.map((mention) => mention.slug),
  })
}

export async function resolveTaskNotificationRecipientUserIds(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  options: TaskNotificationAudienceOptions,
): Promise<string[]> {
  const projectId = typeof options.projectId === 'string' && options.projectId.length > 0 ? options.projectId : null
  const taskLegacyId = typeof options.taskLegacyId === 'string' && options.taskLegacyId.length > 0
    ? options.taskLegacyId
    : null

  const projectPromise =
    projectId
      ? ctx.db
        .query('projects')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', options.workspaceId).eq('legacyId', projectId))
        .unique()
      : Promise.resolve(null)

  const commentRowsPromise = options.includeCommentAuthors && taskLegacyId
    ? ctx.db
      .query('taskComments')
      .withIndex('by_workspace_task_createdAtMs_legacyId', (q) =>
        q.eq('workspaceId', options.workspaceId).eq('taskLegacyId', taskLegacyId)
      )
      .take(500)
    : Promise.resolve([])

  const [project, commentRows] = await Promise.all([projectPromise, commentRowsPromise])

  const commentAuthorIds = commentRows
    .filter((row) => row.deleted !== true && typeof row.authorId === 'string' && row.authorId.length > 0)
    .map((row) => row.authorId as string)

  return resolveWorkspaceUserIds(ctx, options.workspaceId, {
    userIds: [
      typeof options.createdBy === 'string' ? options.createdBy : null,
      typeof project?.ownerId === 'string' ? project.ownerId : null,
      ...commentAuthorIds,
      ...normalizeStringArray(options.assignedTo),
    ],
    names: normalizeStringArray(options.assignedTo),
  })
}

export async function resolveProjectNotificationRecipientUserIds(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  workspaceId: string,
  ownerId: string | null | undefined,
): Promise<string[]> {
  return resolveWorkspaceUserIds(ctx, workspaceId, {
    userIds: [ownerId],
  })
}