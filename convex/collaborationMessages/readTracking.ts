import {
  type ReadCheckpointPosition,
  THREAD_SCAN_BATCH_SIZE,
  THREAD_SCAN_MAX_ROWS,
  assertAccessToMessage,
  assertChannelAccess,
  buildChannelTypeQuery,
  buildListChannelQuery,
  buildThreadQuery,
  canAccessCustomChannel,
  comparePosition,
  getReadCheckpoint,
  isAfterCheckpoint,
  normalizeChannelScope,
  pickNewestCheckpoint,
  readPositionFromRow,
  requireActorUserId,
  resolveChannelKey,
  resolveChannelKeyFromScope,
  scanChannelRows,
  upsertReadCheckpoint,
  z,
  zWorkspaceMutation,
  zWorkspaceQuery,
} from './shared'

export const markAsRead = zWorkspaceMutation({
  args: {
    legacyId: z.string(),
    userId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.userId)

    const row = await assertAccessToMessage(
      ctx,
      args.workspaceId,
      await ctx.db
      .query('collaborationMessages')
      .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId))
      .unique(),
    )

    // Don't mark own messages as read
    if (row.senderId === currentUserId) {
      return { success: true, alreadyRead: true }
    }

    const readBy: string[] = Array.isArray(row.readBy) ? row.readBy : []

    // Check if already read
    if (readBy.includes(currentUserId)) {
      return { success: true, alreadyRead: true }
    }

    // Add user to readBy array
    await ctx.db.patch(row._id, {
      readBy: [...readBy, currentUserId],
      updatedAtMs: ctx.now,
    })

    return { success: true, alreadyRead: false }
  },
})

// Mark multiple messages as read (batch operation)
export const markMultipleAsRead = zWorkspaceMutation({
  args: {
    legacyIds: z.array(z.string()),
    userId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.userId)
    let marked = 0

    for (const legacyId of args.legacyIds) {
      const row = await assertAccessToMessage(
        ctx,
        args.workspaceId,
        await ctx.db
        .query('collaborationMessages')
        .withIndex('by_workspace_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', legacyId))
        .unique(),
      )

      if (row.senderId === currentUserId) continue

      const readBy: string[] = Array.isArray(row.readBy) ? row.readBy : []

      if (!readBy.includes(currentUserId)) {
        await ctx.db.patch(row._id, {
          readBy: [...readBy, currentUserId],
          updatedAtMs: ctx.now,
        })
        marked += 1
      }
    }

    return { success: true, marked }
  },
})

// Mark all messages in a channel as read for a user
export const markChannelAsRead = zWorkspaceMutation({
  args: {
    channelId: z.string().nullable().optional(),
    channelType: z.string(),
    clientId: z.string().nullable().optional(),
    projectId: z.string().nullable().optional(),
    userId: z.string(),
    beforeMs: z.number().optional(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.userId)
    const scope = normalizeChannelScope({
      channelId: args.channelId,
      channelType: args.channelType,
      clientId: args.clientId,
      projectId: args.projectId,
    })
    await assertChannelAccess(ctx, args.workspaceId, scope)
    const checkpoint = await getReadCheckpoint(ctx, {
      workspaceId: args.workspaceId,
      userId: currentUserId,
      scopeType: 'channel',
      channelId: scope.channelId,
      channelType: scope.channelType,
      clientId: scope.clientId,
      projectId: scope.projectId,
      threadRootId: null,
    })

    let marked = 0
    const newestReadablePositionRef: { current: { createdAtMs: number; legacyId: string } | null } = {
      current: null,
    }

    const scanResult = await scanChannelRows(
      () =>
        buildListChannelQuery(ctx, {
          workspaceId: args.workspaceId,
          channelId: scope.channelId,
          channelType: scope.channelType,
          clientId: scope.clientId,
          projectId: scope.projectId,
        }),
      async (message) => {
        if (message.senderId === currentUserId) return
        if (message.deleted) return

        if (typeof args.beforeMs === 'number' && message.createdAtMs > args.beforeMs) {
          return
        }

        const position = readPositionFromRow(message)
        if (!position) return

        if (!newestReadablePositionRef.current) {
          newestReadablePositionRef.current = position
        }

        if (checkpoint && !isAfterCheckpoint(message, checkpoint)) {
          return false
        }

        const readBy: string[] = Array.isArray(message.readBy) ? message.readBy : []

        if (!readBy.includes(currentUserId)) {
          await ctx.db.patch(message._id, {
            readBy: [...readBy, currentUserId],
            updatedAtMs: ctx.now,
          })
          marked += 1
        }

        return true
      },
    )

    let checkpointAdvanced = false
    if (newestReadablePositionRef.current) {
      const upsertResult = await upsertReadCheckpoint(ctx, {
        workspaceId: args.workspaceId,
        userId: currentUserId,
        scopeType: 'channel',
        channelId: scope.channelId,
        channelType: scope.channelType,
        clientId: scope.clientId,
        projectId: scope.projectId,
        threadRootId: null,
        lastReadCreatedAtMs: newestReadablePositionRef.current.createdAtMs,
        lastReadLegacyId: newestReadablePositionRef.current.legacyId,
        updatedAtMs: ctx.now,
      })
      checkpointAdvanced = upsertResult.advanced
    }

    return {
      success: true,
      marked,
      truncated: scanResult.truncated,
      checkpointAdvanced,
    }
  },
})

// Get unread message count for a channel
export const getUnreadCount = zWorkspaceQuery({
  args: {
    channelId: z.string().nullable().optional(),
    channelType: z.string(),
    clientId: z.string().nullable().optional(),
    projectId: z.string().nullable().optional(),
    userId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.userId)
    const scope = normalizeChannelScope({
      channelId: args.channelId,
      channelType: args.channelType,
      clientId: args.clientId,
      projectId: args.projectId,
    })
    await assertChannelAccess(ctx, args.workspaceId, scope)

    const checkpoint = await getReadCheckpoint(ctx, {
      workspaceId: args.workspaceId,
      userId: currentUserId,
      scopeType: 'channel',
      channelId: scope.channelId,
      channelType: scope.channelType,
      clientId: scope.clientId,
      projectId: scope.projectId,
      threadRootId: null,
    })

    let unreadCount = 0

    const scanResult = await scanChannelRows(
      () =>
        buildListChannelQuery(ctx, {
          workspaceId: args.workspaceId,
          channelId: scope.channelId,
          channelType: scope.channelType,
          clientId: scope.clientId,
          projectId: scope.projectId,
        }),
      (message) => {
        if (message.senderId === currentUserId) return
        if (message.deleted) return

        if (checkpoint && !isAfterCheckpoint(message, checkpoint)) {
          return false
        }

        const readBy: string[] = Array.isArray(message.readBy) ? message.readBy : []
        if (!readBy.includes(currentUserId)) {
          unreadCount += 1
        }

        return true
      },
    )

    return { count: unreadCount, truncated: scanResult.truncated }
  },
})

export const markThreadAsRead = zWorkspaceMutation({
  args: {
    channelId: z.string().nullable().optional(),
    channelType: z.string(),
    clientId: z.string().nullable().optional(),
    projectId: z.string().nullable().optional(),
    threadRootId: z.string(),
    userId: z.string(),
    beforeMs: z.number().optional(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.userId)
    const scope = normalizeChannelScope({
      channelId: args.channelId,
      channelType: args.channelType,
      clientId: args.clientId,
      projectId: args.projectId,
    })
    await assertChannelAccess(ctx, args.workspaceId, scope)
    const threadCheckpoint = await getReadCheckpoint(ctx, {
      workspaceId: args.workspaceId,
      userId: currentUserId,
      scopeType: 'thread',
      channelId: scope.channelId,
      channelType: scope.channelType,
      clientId: scope.clientId,
      projectId: scope.projectId,
      threadRootId: args.threadRootId,
    })
    const channelCheckpoint = await getReadCheckpoint(ctx, {
      workspaceId: args.workspaceId,
      userId: currentUserId,
      scopeType: 'channel',
      channelId: scope.channelId,
      channelType: scope.channelType,
      clientId: scope.clientId,
      projectId: scope.projectId,
      threadRootId: null,
    })
    const checkpoint = pickNewestCheckpoint(threadCheckpoint, channelCheckpoint)

    let marked = 0
    const newestReadablePositionRef: { current: { createdAtMs: number; legacyId: string } | null } = {
      current: null,
    }

    const scanResult = await scanChannelRows(
      () => buildThreadQuery(ctx, args.workspaceId, args.threadRootId, 'desc'),
      async (message) => {
        if (message.senderId === currentUserId) return
        if (message.deleted) return

        if (typeof args.beforeMs === 'number' && message.createdAtMs > args.beforeMs) {
          return
        }

        const position = readPositionFromRow(message)
        if (!position) return

        if (!newestReadablePositionRef.current) {
          newestReadablePositionRef.current = position
        }

        if (checkpoint && !isAfterCheckpoint(message, checkpoint)) {
          return false
        }

        const readBy: string[] = Array.isArray(message.readBy) ? message.readBy : []
        if (!readBy.includes(currentUserId)) {
          await ctx.db.patch(message._id, {
            readBy: [...readBy, currentUserId],
            updatedAtMs: ctx.now,
          })
          marked += 1
        }

        return true
      },
      { batchSize: THREAD_SCAN_BATCH_SIZE, maxRows: THREAD_SCAN_MAX_ROWS },
    )

    let checkpointAdvanced = false
    if (newestReadablePositionRef.current) {
      const upsertResult = await upsertReadCheckpoint(ctx, {
        workspaceId: args.workspaceId,
        userId: currentUserId,
        scopeType: 'thread',
        channelId: scope.channelId,
        channelType: scope.channelType,
        clientId: scope.clientId,
        projectId: scope.projectId,
        threadRootId: args.threadRootId,
        lastReadCreatedAtMs: newestReadablePositionRef.current.createdAtMs,
        lastReadLegacyId: newestReadablePositionRef.current.legacyId,
        updatedAtMs: ctx.now,
      })
      checkpointAdvanced = upsertResult.advanced
    }

    return {
      success: true,
      marked,
      truncated: scanResult.truncated,
      checkpointAdvanced,
    }
  },
})

export const getThreadUnreadCounts = zWorkspaceQuery({
  args: {
    channelId: z.string().nullable().optional(),
    channelType: z.string(),
    clientId: z.string().nullable().optional(),
    projectId: z.string().nullable().optional(),
    threadRootIds: z.array(z.string()),
    userId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.userId)
    const scope = normalizeChannelScope({
      channelId: args.channelId,
      channelType: args.channelType,
      clientId: args.clientId,
      projectId: args.projectId,
    })
    await assertChannelAccess(ctx, args.workspaceId, scope)
    const channelCheckpoint = await getReadCheckpoint(ctx, {
      workspaceId: args.workspaceId,
      userId: currentUserId,
      scopeType: 'channel',
      channelId: scope.channelId,
      channelType: scope.channelType,
      clientId: scope.clientId,
      projectId: scope.projectId,
      threadRootId: null,
    })

    const countsByThreadRootId: Record<string, number> = {}
    let truncated = false
    let scannedMessages = 0

    const normalizedThreadRootIds: string[] = (Array.isArray(args.threadRootIds) ? args.threadRootIds : [])
      .map((id: unknown): string => (typeof id === 'string' ? id.trim() : ''))
      .filter((id: string) => id.length > 0)
    const threadRootIds = Array.from(new Set<string>(normalizedThreadRootIds)).slice(0, 200)

    for (const threadRootId of threadRootIds) {
      const threadCheckpoint = await getReadCheckpoint(ctx, {
        workspaceId: args.workspaceId,
        userId: currentUserId,
        scopeType: 'thread',
        channelId: scope.channelId,
        channelType: scope.channelType,
        clientId: scope.clientId,
        projectId: scope.projectId,
        threadRootId,
      })
      const checkpoint = pickNewestCheckpoint(threadCheckpoint, channelCheckpoint)

      let unreadCount = 0

      const scanResult = await scanChannelRows(
        () => buildThreadQuery(ctx, args.workspaceId, threadRootId, 'desc'),
        (message) => {
          if (message.senderId === currentUserId) return
          if (message.deleted) return

          if (checkpoint && !isAfterCheckpoint(message, checkpoint)) {
            return false
          }

          const readBy: string[] = Array.isArray(message.readBy) ? message.readBy : []
          if (!readBy.includes(currentUserId)) {
            unreadCount += 1
          }

          return true
        },
        { batchSize: THREAD_SCAN_BATCH_SIZE, maxRows: THREAD_SCAN_MAX_ROWS },
      )

      countsByThreadRootId[threadRootId] = unreadCount
      scannedMessages += scanResult.scanned
      truncated = truncated || scanResult.truncated
    }

    return {
      countsByThreadRootId,
      truncated,
      scannedMessages,
    }
  },
})

export const getUnreadCountsByChannel = zWorkspaceQuery({
  args: {
    userId: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = requireActorUserId(ctx, args.userId)

    const checkpointRows = await ctx.db
      .query('collaborationReadCheckpoints')
      .withIndex('by_workspace_user_scope_updatedAtMs', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', currentUserId).eq('scopeType', 'channel'),
      )
      .order('desc')
      .take(500)

    const checkpointByChannelKey: Record<string, ReadCheckpointPosition> = {}
    for (const row of checkpointRows) {
      const scope = normalizeChannelScope({
        channelId: typeof row?.channelId === 'string' ? row.channelId : null,
        channelType: typeof row?.channelType === 'string' ? row.channelType : 'team',
        clientId: typeof row?.clientId === 'string' ? row.clientId : null,
        projectId: typeof row?.projectId === 'string' ? row.projectId : null,
      })
      const channelKey = resolveChannelKeyFromScope(scope)
      if (!channelKey) continue

      const createdAtMs = typeof row?.lastReadCreatedAtMs === 'number' ? row.lastReadCreatedAtMs : null
      const legacyId = typeof row?.lastReadLegacyId === 'string' ? row.lastReadLegacyId : null
      if (createdAtMs === null || !legacyId) continue

      const existing = checkpointByChannelKey[channelKey]
      if (
        !existing ||
        comparePosition(
          { createdAtMs, legacyId },
          { createdAtMs: existing.lastReadCreatedAtMs, legacyId: existing.lastReadLegacyId },
        ) > 0
      ) {
        checkpointByChannelKey[channelKey] = {
          lastReadCreatedAtMs: createdAtMs,
          lastReadLegacyId: legacyId,
        }
      }
    }

    const countsByChannelId: Record<string, number> = {}
    let totalUnread = 0
    let totalScanned = 0
    let truncated = false

    const customChannels = (await ctx.db
      .query('collaborationChannels')
      .withIndex('by_workspace_channelType_updatedAtMs_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('channelType', 'team'),
      )
      .order('desc')
      .take(200))
      .filter((row) => canAccessCustomChannel(ctx, row))

    for (const channelType of ['team', 'client', 'project']) {
      const scanResult = await scanChannelRows(
        () => buildChannelTypeQuery(ctx, args.workspaceId, channelType),
        (message) => {
          if (message.senderId === currentUserId) return
          if (message.deleted) return
          if (channelType === 'team' && typeof message.channelId === 'string' && message.channelId.length > 0) return

          const channelKey = resolveChannelKey(message)
          if (!channelKey) return

          const checkpoint = checkpointByChannelKey[channelKey] ?? null
          if (checkpoint && !isAfterCheckpoint(message, checkpoint)) {
            // Team has a single channel, so we can stop scanning once we cross its checkpoint.
            if (channelType === 'team') {
              return false
            }
            return
          }

          const readBy: string[] = Array.isArray(message.readBy) ? message.readBy : []
          if (readBy.includes(currentUserId)) return

          countsByChannelId[channelKey] = (countsByChannelId[channelKey] ?? 0) + 1
          totalUnread += 1

          return true
        },
      )

      totalScanned += scanResult.scanned
      truncated = truncated || scanResult.truncated
    }

    for (const channel of customChannels) {
      const scanResult = await scanChannelRows(
        () =>
          buildListChannelQuery(ctx, {
            workspaceId: args.workspaceId,
            channelId: channel.legacyId,
            channelType: 'team',
            clientId: null,
            projectId: null,
          }),
        (message) => {
          if (message.senderId === currentUserId) return
          if (message.deleted) return

          const checkpoint = checkpointByChannelKey[channel.legacyId] ?? null
          if (checkpoint && !isAfterCheckpoint(message, checkpoint)) {
            return false
          }

          const readBy: string[] = Array.isArray(message.readBy) ? message.readBy : []
          if (readBy.includes(currentUserId)) return

          countsByChannelId[channel.legacyId] = (countsByChannelId[channel.legacyId] ?? 0) + 1
          totalUnread += 1
          return true
        },
      )

      totalScanned += scanResult.scanned
      truncated = truncated || scanResult.truncated
    }

    return {
      countsByChannelId,
      totalUnread,
      scannedMessages: totalScanned,
      truncated,
    }
  },
})

