import type { QueryCtx, MutationCtx, ActionCtx } from '../../_generated/server'
import type { Doc } from '/_generated/dataModel'
import { api } from '/_generated/api'
import { Errors } from '../../errors'
import type { AuthenticatedQueryCtx, AuthenticatedMutationCtx, AuthenticatedActionCtx } from './types'

export type { AuthenticatedQueryCtx, AuthenticatedMutationCtx, AuthenticatedActionCtx } from './types'

function assertUserIsActive(user: Doc<'users'>) {
  if (user.status === 'active') {
    return
  }

  if (user.status === 'disabled' || user.status === 'suspended') {
    throw Errors.auth.userDisabled()
  }

  throw Errors.auth.forbidden('Your account is awaiting admin approval.')
}

/**
 * Shared helper to get validated authentication context for queries/mutations.
 */
export async function getAuthenticatedContext(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw Errors.auth.unauthorized()
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_legacyId', (q) => q.eq('legacyId', identity.subject))
    .unique()

  if (!user) {
    throw Errors.auth.userNotFound(
      'Your account is being set up. Please wait a moment and refresh the page.'
    )
  }

  assertUserIsActive(user)

  return {
    user,
    legacyId: user.legacyId as string,
    agencyId: (user.agencyId ?? user.legacyId) as string,
  }
}

/**
 * Identity-only auth: valid JWT, optional `users` row (any status). Use for sign-in bootstrap.
 */
export async function getIdentityContext(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw Errors.auth.unauthorized()
  }

  const legacyId = identity.subject
  const user = await ctx.db
    .query('users')
    .withIndex('by_legacyId', (q) => q.eq('legacyId', legacyId))
    .unique()

  return {
    legacyId,
    identity,
    user: user ?? null,
  }
}

/**
 * Ensures the caller is allowed to act on the given workspace (admin, or `agencyId` / legacy workspace match).
 * Use in raw `mutation` handlers that take `workspaceId` but are not using `zWorkspaceMutation`.
 */
export async function requireWorkspaceAccess(ctx: QueryCtx | MutationCtx, workspaceId: string) {
  const auth = await getAuthenticatedContext(ctx)
  if (auth.user.role !== 'admin' && auth.agencyId !== workspaceId) {
    throw Errors.auth.workspaceAccessDenied()
  }
  return auth
}

export async function getAuthenticatedActionContext(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw Errors.auth.unauthorized()
  }

  const user = (await ctx.runQuery(api.users.getByLegacyId, {
    legacyId: identity.subject,
  })) as Doc<'users'> | null

  if (!user) {
    throw Errors.auth.userNotFound()
  }

  assertUserIsActive(user)

  return {
    user,
    legacyId: user.legacyId as string,
    agencyId: (user.agencyId ?? user.legacyId) as string,
  }
}
