import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'
import { getToken } from '@/lib/auth-server'
import { logAuditAction } from '@/lib/audit-logger'
import * as jose from 'jose'

const payloadSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
  })
  .optional()

const roleSchema = z.enum(['admin', 'team', 'client'])
const statusSchema = z.enum(['active', 'pending', 'invited', 'disabled', 'suspended'])

/**
 * Bootstrap route - creates/updates user in Convex users table
 * This route decodes the JWT token to get the Better Auth user ID (sub claim)
 * and ensures the user exists in our users table with proper role/status.
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || uuidv4()
  const debug: Record<string, unknown> = {}

  const reply = (
    status: number,
    data: { ok: boolean; error?: string; [key: string]: unknown }
  ) => {
    return NextResponse.json(
      {
        success: status >= 200 && status < 300,
        requestId,
        data,
      },
      {
        status,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    )
  }

  try {
    // 1. Parse optional body
    let body: z.infer<typeof payloadSchema> = undefined
    try {
      const json = await req.json()
      const result = payloadSchema.safeParse(json)
      if (result.success) {
        body = result.data
      }
    } catch {
      // No body or invalid JSON - that's fine
    }

    const providedName = body?.name

    // 2. Get Convex token using official helper
    let convexToken: string | null = null
    try {
      const token = await getToken()
      convexToken = token ?? null
      debug.hasToken = Boolean(convexToken)
    } catch (tokenError) {
      debug.hasToken = false
      debug.tokenError = tokenError instanceof Error ? tokenError.message : String(tokenError)
      // Token fetch failed - user likely not authenticated
       return reply(401, { ok: false, error: 'Failed to get auth token', debug })
    }

    if (!convexToken) {
      return reply(401, { ok: false, error: 'No Better Auth session', debug })
    }

    // 3. Decode the JWT to get the subject (Better Auth user ID)
    let jwtPayload: jose.JWTPayload | null = null
    try {
      jwtPayload = jose.decodeJwt(convexToken)
      debug.jwtSub = jwtPayload?.sub ?? null
      debug.jwtEmail = (jwtPayload as any)?.email ?? null
    } catch (err) {
      debug.jwtDecodeError = String(err)
    }

    const jwtSubject = jwtPayload?.sub
    if (!jwtSubject) {
      return reply(401, { ok: false, error: 'JWT missing subject claim', debug })
    }

    // 4. Get Convex URL and create client
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) {
      return reply(500, { ok: false, error: 'Convex not configured', debug })
    }

    const convex = new ConvexHttpClient(convexUrl, { auth: convexToken })

    // 5. Get current user info from Better Auth (for email/name)
    let currentUser: { email?: string | null; name?: string | null } | null = null
    try {
      currentUser = (await convex.query(api.auth.getCurrentUser, {})) as
        | { email?: string | null; name?: string | null }
        | null
      debug.currentUser = currentUser ? { email: currentUser.email, name: currentUser.name } : null
    } catch (queryError) {
      debug.getCurrentUserError = queryError instanceof Error ? queryError.message : String(queryError)
      return reply(502, { ok: false, error: 'Failed to get current user from Convex', debug })
    }

    const email = currentUser?.email ? String(currentUser.email) : null
    const name = providedName ?? (currentUser?.name ? String(currentUser.name) : null) ?? email ?? 'Pending user'

    if (!email) {
      return reply(400, { ok: false, error: 'Missing email from session', debug })
    }

    const normalizedEmail = email.toLowerCase()

    // 6. Check if user already exists in our users table
    type ExistingUser = { legacyId: string; role?: string | null; status?: string | null; agencyId?: string | null }
    let existing: ExistingUser | null = null
    try {
      existing = (await convex.query(api.users.getByEmail, {
        email: normalizedEmail,
      })) as ExistingUser | null
      debug.existingUser = existing ? { legacyId: existing.legacyId, role: existing.role, status: existing.status } : null
    } catch (queryError) {
      debug.getByEmailError = queryError instanceof Error ? queryError.message : String(queryError)
      // Non-fatal - user might not exist yet, continue with null
    }

    const storedRole = existing ? normalizeRole(existing.role) : null
    const storedStatus = existing ? normalizeStatus(existing.status, 'active') : null

    // 7. Determine final role/status - use stored values from Convex, default to client/pending for new users
    const finalRole = storedRole ?? 'client'
    const finalStatus = storedStatus ?? 'pending'

    debug.roleResolution = { storedRole, storedStatus, finalRole, finalStatus }

    // 8. Use JWT subject as the legacyId (this is the Better Auth user ID)
    const legacyId = jwtSubject

    // 9. Upsert user in Convex users table
    await convex.mutation(api.users.bulkUpsert, {
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
        requestId,
      })
    }

    return reply(200, {
      ok: true,
      role: finalRole,
      status: finalStatus,
      claimsUpdated: claimsNeedUpdate,
      agencyId: existing?.agencyId || String(legacyId),
      debug,
    })
  } catch (error) {
    console.error('[Bootstrap] Error:', error)
    debug.error = error instanceof Error ? error.message : String(error)

    return reply(500, { ok: false, error: 'Bootstrap failed', debug })
  }
}

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
