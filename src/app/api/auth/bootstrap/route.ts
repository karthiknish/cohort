import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { logAuditAction } from '@/lib/audit-logger'
import { ConvexHttpClient } from 'convex/browser'
import { getToken as getConvexBetterAuthToken } from '@convex-dev/better-auth/utils'
import { getToken as getNextJsConvexToken } from '@/lib/auth-server'

const payloadSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
  })
  .optional()

const roleSchema = z.enum(['admin', 'team', 'client'])
const statusSchema = z.enum(['active', 'pending', 'invited', 'disabled', 'suspended'])


export const POST = createApiHandler(
  {
    bodySchema: payloadSchema,
    rateLimit: 'standard',
  },
  async (req, { auth, body }) => {
    const providedName = body?.name

    const claimedRole = typeof auth.claims?.role === 'string' ? normalizeRole(auth.claims.role) : null
    const claimedStatus = typeof auth.claims?.status === 'string' ? normalizeStatus(auth.claims.status, 'active') : null

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? process.env.NEXT_PUBLIC_CONVEX_HTTP_URL

    if (!convexUrl || !convexSiteUrl) {
      return { ok: false, error: 'Convex auth not configured' }
    }

    // Prefer Next.js integration helper (it knows Better Auth cookie names).
    // Fallback to direct util extraction.
    const convexToken =
      (await getNextJsConvexToken().catch(() => null)) ??
      (await getConvexBetterAuthToken(convexSiteUrl, req.headers).then((r) => r?.token).catch(() => null))

    if (!convexToken) {
      return { ok: false, error: 'No Better Auth session' }
    }

    const convex = new ConvexHttpClient(convexUrl, { auth: convexToken })

    const currentUser = (await convex.query('auth:getCurrentUser' as any, {})) as
      | { id?: string; email?: string | null; name?: string | null }
      | null

    if (process.env.NODE_ENV !== 'production') {
      console.log('[BootstrapRoute] currentUser', {
        hasUser: Boolean(currentUser),
        email: currentUser?.email ?? null,
        id: currentUser?.id ?? null,
      })
    }

    // Better Auth sessions are the source of truth for email/name.
    // `auth.email` here refers to the legacy auth bridge and can be null.
    const email = currentUser?.email ? String(currentUser.email) : null
    const name = providedName ?? (currentUser?.name ? String(currentUser.name) : null) ?? email ?? 'Pending user'

    if (!email) {
      return { ok: false, error: 'Missing email' }
    }

    const normalizedEmail = email.toLowerCase()

    const existing = (await convex.query('users:getByEmail' as any, {
      email: normalizedEmail,
    })) as
      | { legacyId: string; role?: string | null; status?: string | null; agencyId?: string | null }
      | null

    const storedRole = existing ? normalizeRole(existing.role) : null
    const storedStatus = existing ? normalizeStatus(existing.status, 'active') : null

    const admins = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)

    const isAdminEmail = admins.includes(normalizedEmail)

    const finalRole = claimedRole ?? (isAdminEmail ? 'admin' : null) ?? storedRole ?? 'client'
    let finalStatus = claimedStatus ?? storedStatus ?? (finalRole === 'admin' ? 'active' : 'pending')

    if (process.env.NODE_ENV !== 'production') {
      console.log('[BootstrapRoute] roleResolution', {
        normalizedEmail,
        isAdminEmail,
        claimedRole,
        claimedStatus,
        storedRole,
        storedStatus,
        finalRole,
        finalStatus,
      })
    }
    if (finalRole === 'admin' && finalStatus !== 'active') {
      finalStatus = 'active'
    }

    const legacyId = currentUser?.id
    if (!legacyId) {
      return { ok: false, error: 'Missing Better Auth user id' }
    }

    await convex.mutation('users:bulkUpsert' as any, {
      users: [
        {
          legacyId: String(legacyId),
          email: normalizedEmail,
          name,
          role: finalRole,
          status: finalStatus,
          agencyId: existing?.agencyId ?? String(legacyId),
        },
      ],
    })

    const claimsNeedUpdate = Boolean(existing?.role !== finalRole || existing?.status !== finalStatus)

    if (claimsNeedUpdate) {
      await logAuditAction({
        action: 'ADMIN_ROLE_CHANGE',
        actorId: 'SYSTEM_BOOTSTRAP',
        targetId: String(legacyId),
        metadata: {
          oldRole: existing?.role ?? null,
          newRole: finalRole,
          oldStatus: existing?.status ?? null,
          newStatus: finalStatus,
        },
        requestId: req.headers.get('x-request-id') || undefined,
      })
    }

    return {
      ok: true,
      role: finalRole,
      status: finalStatus,
      claimsUpdated: claimsNeedUpdate,
      agencyId: existing?.agencyId || String(legacyId),
    }
  }
)

function normalizeRole(value: unknown): z.infer<typeof roleSchema> {
  if (value === 'admin' || value === 'team' || value === 'client') {
    return value
  }
  if (value === 'manager') {
    return 'team'
  }
  if (value === 'member') {
    return 'client'
  }
  return 'client'
}

function normalizeStatus(value: unknown, fallback: z.infer<typeof statusSchema> = 'active'): z.infer<typeof statusSchema> {
  if (value === 'active' || value === 'pending' || value === 'invited' || value === 'disabled' || value === 'suspended') {
    return value
  }
  if (value === 'inactive' || value === 'blocked') {
    return 'disabled'
  }
  return fallback
}
