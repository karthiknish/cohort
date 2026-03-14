import { action, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { Errors, withErrorHandling } from './errors'
import { api, internal } from '/_generated/api'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export const exportUserData = action({
  args: {},
  handler: async (ctx) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const userId = identity.subject

      const exportData: Record<string, unknown> = {
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0',
        userId,
      }

      const user = await ctx.runQuery(api.users.getByLegacyId, { legacyId: userId })
      if (user) {
        exportData.profile = {
          name: user.name ?? null,
          email: user.email ?? null,
          role: user.role ?? null,
          phoneNumber: user.phoneNumber ?? null,
          photoUrl: user.photoUrl ?? null,
          notificationPreferences: user.notificationPreferences ?? null,
          regionalPreferences: user.regionalPreferences ?? null,
          createdAt: user.createdAtMs ? new Date(user.createdAtMs).toISOString() : null,
          updatedAt: user.updatedAtMs ? new Date(user.updatedAtMs).toISOString() : null,
        }
      }

      const workspaceId = user?.agencyId ?? null

      if (workspaceId) {
        const clientsResult = await ctx.runQuery(api.clients.list, {
          workspaceId,
          limit: 500,
        })
        const clients = clientsResult?.items
        exportData.clients = (Array.isArray(clients) ? clients : []).map((client) => {
          const record = client && typeof client === 'object' ? (client as Record<string, unknown>) : null
          return {
            id: typeof record?.legacyId === 'string' ? record.legacyId : '',
            name: typeof record?.name === 'string' ? record.name : '',
            accountManager: record?.accountManager ?? null,
            teamMembers: record?.teamMembers ?? null,
            createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
            updatedAt: typeof record?.updatedAtMs === 'number' ? new Date(record.updatedAtMs).toISOString() : null,
          }
        })

        const projectsResult = await ctx.runQuery(api.projects.list, {
          workspaceId,
          limit: 500,
        })
        const projects = projectsResult?.items
        exportData.projects = (Array.isArray(projects) ? projects : []).map((project) => {
          const record = project && typeof project === 'object' ? (project as Record<string, unknown>) : null
          return {
            id: typeof record?.legacyId === 'string' ? record.legacyId : '',
            name: typeof record?.name === 'string' ? record.name : '',
            description: typeof record?.description === 'string' ? record.description : null,
            status: typeof record?.status === 'string' ? record.status : null,
            clientId: typeof record?.clientId === 'string' ? record.clientId : null,
            createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
            updatedAt: typeof record?.updatedAtMs === 'number' ? new Date(record.updatedAtMs).toISOString() : null,
          }
        })

        const proposals = await ctx.runQuery(api.proposals.list, {
          workspaceId,
          limit: 500,
        })
        exportData.proposals = (Array.isArray(proposals) ? proposals : []).map((proposal) => {
          const record = proposal && typeof proposal === 'object' ? (proposal as Record<string, unknown>) : null
          return {
            id: typeof record?.legacyId === 'string' ? record.legacyId : '',
            title: typeof record?.title === 'string' ? record.title : null,
            status: typeof record?.status === 'string' ? record.status : null,
            clientId: typeof record?.clientId === 'string' ? record.clientId : null,
            totalAmount: typeof record?.totalAmount === 'number' ? record.totalAmount : null,
            createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
            updatedAt: typeof record?.updatedAtMs === 'number' ? new Date(record.updatedAtMs).toISOString() : null,
          }
        })

        const notificationsResult = await ctx.runQuery(api.notifications.list, {
          workspaceId,
          pageSize: 500,
        })
        const notifications = notificationsResult?.notifications
        exportData.notifications = (Array.isArray(notifications) ? notifications : []).map((notification) => {
          const record = notification && typeof notification === 'object' ? (notification as Record<string, unknown>) : null
          return {
            id: record?._id ?? null,
            type: typeof record?.type === 'string' ? record.type : null,
            title: typeof record?.title === 'string' ? record.title : null,
            message: typeof record?.message === 'string' ? record.message : null,
            read: record?.acknowledgedAtMs != null,
            createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
          }
        })

        // Activity log is not available at workspace level; activity is client-scoped
        exportData.activityLog = []
      }

      return exportData
    }, 'authActions:exportUserData'),
})

export const deleteAccount = action({
  args: {},
  handler: async (ctx) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const userId = identity.subject

      await ctx.runMutation(internal.authActions.softDeleteUser, { legacyId: userId })

      return { ok: true }
    }, 'authActions:deleteAccount'),
})

export const softDeleteUser = internalMutation({
  args: {
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    if (identity.subject !== args.legacyId) {
      throw Errors.auth.forbidden('can only delete own account')
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!user) {
      return { ok: true }
    }

    await ctx.db.patch(user._id, {
      status: 'deleted',
      email: null,
      emailLower: null,
      name: '[Deleted User]',
      phoneNumber: null,
      photoUrl: null,
      updatedAtMs: Date.now(),
    })

    return { ok: true }
  },
})
