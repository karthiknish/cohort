import { v } from 'convex/values'
import { components } from './_generated/api'
import { mutation, query } from './_generated/server'
import { Presence } from '@convex-dev/presence'
import { Errors } from './errors'
import { getAuthenticatedContext } from './lib/functions/auth'

export const presence = new Presence(components.presence)

/**
 * Room-scoped presence data attached to each user so clients can render
 * avatars/names without an extra join per subscription.
 */
const presenceDataValidator = v.object({
  name: v.string(),
  role: v.union(v.string(), v.null()),
  photoUrl: v.union(v.string(), v.null()),
})

/**
 * Keepalive heartbeat. Authenticated — the userId is derived from the JWT so
 * clients cannot spoof another user's presence. User metadata (name/role/photo)
 * is attached via updateRoomUser so list subscribers can render avatars without
 * per-user reads (keeps the list query cache-friendly).
 */
export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    // userId is accepted to match the @convex-dev/presence/react hook's
    // PresenceAPI shape, but is overridden by the authenticated identity below
    // so clients cannot spoof another user's presence.
    userId: v.string(),
    sessionId: v.string(),
    interval: v.number(),
  },
  returns: v.object({
    roomToken: v.string(),
    sessionToken: v.string(),
  }),
  handler: async (ctx, { roomId, sessionId, interval }) => {
    const auth = await getAuthenticatedContext(ctx)
    const userId = auth.legacyId

    const result = await presence.heartbeat(ctx, roomId, userId, sessionId, interval)

    const name = (typeof auth.user.name === 'string' && auth.user.name.trim().length > 0
      ? auth.user.name
      : (auth.user.email ?? 'User')) as string
    const role = typeof auth.user.role === 'string' ? auth.user.role : null
    const photoUrl = auth.user.photoUrl ?? null

    await presence.updateRoomUser(ctx, roomId, userId, { name, role, photoUrl })

    return result
  },
})

/**
 * List presence for a room. Takes a roomToken (issued by heartbeat) so the
 * query is cacheable across all subscribers without per-user reads.
 */
export const list = query({
  args: { roomToken: v.string() },
  returns: v.array(
    v.object({
      userId: v.string(),
      online: v.boolean(),
      lastDisconnected: v.number(),
      data: v.optional(presenceDataValidator),
    }),
  ),
  handler: async (ctx, { roomToken }) => {
    const rows = await presence.list(ctx, roomToken)
    return rows as Array<{
      userId: string
      online: boolean
      lastDisconnected: number
      data?: { name: string; role: string | null; photoUrl: string | null }
    }>
  },
})

/**
 * Graceful disconnect. Called via navigator.sendBeacon on tab close, so auth
 * cannot be checked here (the README confirms this). The sessionToken is opaque
 * and scoped to the caller's own session, so it can only disconnect itself.
 */
export const disconnect = mutation({
  args: { sessionToken: v.string() },
  returns: v.null(),
  handler: async (ctx, { sessionToken }) => {
    if (!sessionToken) {
      throw Errors.validation.invalidInput('sessionToken is required')
    }
    return await presence.disconnect(ctx, sessionToken)
  },
})

/**
 * Update the caller's presence data (name/role/photo) in a room without
 * sending a heartbeat. Useful when profile info changes mid-session.
 */
export const updateRoomUser = mutation({
  args: {
    roomId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { roomId }) => {
    const auth = await getAuthenticatedContext(ctx)
    const name = (typeof auth.user.name === 'string' && auth.user.name.trim().length > 0
      ? auth.user.name
      : (auth.user.email ?? 'User')) as string
    const role = typeof auth.user.role === 'string' ? auth.user.role : null
    const photoUrl = auth.user.photoUrl ?? null
    return await presence.updateRoomUser(ctx, roomId, auth.legacyId, { name, role, photoUrl })
  },
})
