import { action, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { api, internal } from './_generated/api'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw new Error('Unauthorized')
  }
}

export const exportUserData = action({
  args: {},
  handler: async (ctx) => {
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
      const clients = await ctx.runQuery(api.clients.list, {
        workspaceId,
        limit: 500,
      })
      exportData.clients = (clients ?? []).map((client: any) => ({
        id: client.legacyId,
        name: client.name,
        accountManager: client.accountManager,
        teamMembers: client.teamMembers,
        billingEmail: client.billingEmail,
        createdAt: client.createdAtMs ? new Date(client.createdAtMs).toISOString() : null,
        updatedAt: client.updatedAtMs ? new Date(client.updatedAtMs).toISOString() : null,
      }))

      const projects = await ctx.runQuery(api.projects.list, {
        workspaceId,
        limit: 500,
      })
      exportData.projects = (projects ?? []).map((project: any) => ({
        id: project.legacyId,
        name: project.name,
        description: project.description,
        status: project.status,
        clientId: project.clientId,
        createdAt: project.createdAtMs ? new Date(project.createdAtMs).toISOString() : null,
        updatedAt: project.updatedAtMs ? new Date(project.updatedAtMs).toISOString() : null,
      }))

      const proposals = await ctx.runQuery(api.proposals.list, {
        workspaceId,
        limit: 500,
      })
      exportData.proposals = (proposals ?? []).map((proposal: any) => ({
        id: proposal.legacyId,
        title: proposal.title,
        status: proposal.status,
        clientId: proposal.clientId,
        totalAmount: proposal.totalAmount,
        createdAt: proposal.createdAtMs ? new Date(proposal.createdAtMs).toISOString() : null,
        updatedAt: proposal.updatedAtMs ? new Date(proposal.updatedAtMs).toISOString() : null,
      }))

      const invoices = await ctx.runQuery(api.financeInvoices.list, {
        workspaceId,
        limit: 500,
      })
      exportData.invoices = (invoices?.invoices ?? []).map((invoice: any) => ({
        id: invoice.legacyId ?? invoice.id,
        number: invoice.number,
        status: invoice.status,
        amount: invoice.amount,
        currency: invoice.currency,
        clientId: invoice.clientId,
        dueDate: invoice.dueDate,
        issuedDate: invoice.issuedDate,
      }))

      const notificationsResult = await ctx.runQuery(api.notifications.list, {
        workspaceId,
        pageSize: 500,
      })
      exportData.notifications = (notificationsResult?.notifications ?? []).map((notification: any) => ({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.acknowledgedAtMs !== null,
        createdAt: notification.createdAtMs ? new Date(notification.createdAtMs).toISOString() : null,
      }))

      // Activity log is not available at workspace level; activity is client-scoped
      exportData.activityLog = []
    }

    return exportData
  },
})

export const deleteAccount = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const userId = identity.subject

    await ctx.runMutation(internal.authActions.softDeleteUser, { legacyId: userId })

    return { ok: true }
  },
})

export const softDeleteUser = internalMutation({
  args: {
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    if (identity.subject !== args.legacyId) {
      throw new Error('Unauthorized: can only delete own account')
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
