import { api } from '/_generated/api'
import { asNonEmptyString } from '../../helpers'
import type { OperationHandler } from '../../types'

const MAX_LIST_PAGES = 25
const PAGE_SIZE = 100
const ACK_CHUNK = 500

type NotificationListRow = { id?: unknown }

type NotificationListPage = {
  notifications?: unknown
  nextCursor?: { createdAtMs?: unknown; legacyId?: unknown } | null
}

export const notificationOperationHandlers: Record<string, OperationHandler> = {
  async markAllNotificationsRead(ctx, input) {
    const clientId =
      asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)

    const idSet = new Set<string>()
    let cursor: { createdAtMs: number; legacyId: string } | null = null

    for (let page = 0; page < MAX_LIST_PAGES; page++) {
      const raw = (await ctx.runQuery(api.notifications.list, {
        workspaceId: input.workspaceId,
        pageSize: PAGE_SIZE,
        unread: true,
        ...(cursor
          ? { afterCreatedAtMs: cursor.createdAtMs, afterLegacyId: cursor.legacyId }
          : {}),
      })) as NotificationListPage

      const rows = Array.isArray(raw.notifications) ? raw.notifications : []
      for (const row of rows) {
        const rec = row && typeof row === 'object' ? (row as NotificationListRow) : null
        const id = typeof rec?.id === 'string' && rec.id.length > 0 ? rec.id : null
        if (id) idSet.add(id)
      }

      const next = raw.nextCursor
      if (!next || typeof next.createdAtMs !== 'number' || typeof next.legacyId !== 'string') {
        break
      }
      cursor = { createdAtMs: next.createdAtMs, legacyId: next.legacyId }
      if (rows.length < PAGE_SIZE) break
    }

    const ids = Array.from(idSet)
    if (ids.length === 0) {
      return {
        success: true,
        data: { marked: 0 },
        userMessage: 'No unread notifications.',
        route: '/dashboard/notifications',
      }
    }

    for (let offset = 0; offset < ids.length; offset += ACK_CHUNK) {
      const chunk = ids.slice(offset, offset + ACK_CHUNK)
      await ctx.runMutation(api.notifications.ack, {
        workspaceId: input.workspaceId,
        ids: chunk,
        action: 'read',
        ...(clientId ? { clientId } : {}),
      })
    }

    return {
      success: true,
      data: { marked: ids.length },
      userMessage: `Marked ${ids.length} notification${ids.length === 1 ? '' : 's'} as read.`,
      route: '/dashboard/notifications',
    }
  },
}
