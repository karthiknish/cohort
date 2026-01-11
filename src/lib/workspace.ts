import { ConvexHttpClient } from 'convex/browser'

import { ValidationError } from './api-errors'

function normalizeCandidate(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getConvexClient(): ConvexHttpClient | null {
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  const deployKey = process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY

  if (!url || !deployKey) {
    return null
  }

  const client = new ConvexHttpClient(url)
  ;(client as any).setAdminAuth(deployKey, {
    issuer: 'system',
    subject: 'workspace-resolver',
  })

  return client
}

/**
 * Resolve workspace ID for a given user ID.
 * Uses Convex to look up the user's agencyId, falling back to userId if not found.
 */
export async function resolveWorkspaceIdForUser(userId: string): Promise<string> {
  if (!userId) {
    throw new ValidationError('User id is required to resolve workspace id')
  }

  const convex = getConvexClient()
  if (!convex) {
    // Fallback to userId if Convex is not configured
    console.warn('[workspace] Convex not configured, falling back to userId as workspaceId')
    return userId
  }

  try {
    const result = (await convex.query('users:getWorkspaceIdForUser' as any, {
      userId,
    })) as { workspaceId: string; userExists: boolean } | null

    return result?.workspaceId ?? userId
  } catch (error) {
    console.error('[workspace] Failed to resolve workspace ID from Convex:', error)
    // Fallback to userId on error
    return userId
  }
}

/**
 * Simplified workspace context - just the workspaceId.
 * Legacy collection references are no longer needed since we use Convex.
 */
export type WorkspaceContext = {
  workspaceId: string
}

/**
 * Resolve workspace context from auth claims.
 * This is a simplified version that only returns workspaceId.
 */
export async function resolveWorkspaceContext(auth: {
  uid: string | null
  claims?: Record<string, unknown>
}): Promise<WorkspaceContext> {
  if (!auth.uid) {
    throw new ValidationError('Authentication required')
  }

  // Check claims first for agencyId
  const claimAgency = normalizeCandidate(auth.claims?.agencyId)
  if (claimAgency) {
    return { workspaceId: claimAgency }
  }

  // Fall back to database lookup
  const workspaceId = await resolveWorkspaceIdForUser(auth.uid)
  return { workspaceId }
}
