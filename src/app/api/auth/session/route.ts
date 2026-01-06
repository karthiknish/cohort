import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { adminAuth } from '@/lib/firebase-admin'

const SessionSchema = z.object({
  token: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
})

export const GET = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('cohorts_token')?.value
  const role = cookieStore.get('cohorts_role')?.value ?? null
  const status = cookieStore.get('cohorts_status')?.value ?? null

  return NextResponse.json(
    {
      success: true,
      hasSession: Boolean(token),
      role,
      status,
    },
    {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  )
}

export const POST = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'standard',
    bodySchema: SessionSchema,
    skipIdempotency: true,
  },
  async (request, context) => {
    const { token, role, status } = context.body
    const response = NextResponse.json(
      { success: true },
      { 
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    )

    const isProduction = process.env.NODE_ENV === 'production'
    const maxAge = 2 * 60 * 60 
    const cookieOptions = {
      maxAge,
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
    }

    if (!token) {
      response.cookies.delete('cohorts_token')
      response.cookies.delete('cohorts_role')
      response.cookies.delete('cohorts_status')
      return response
    }

    try {
      // Exchange the ID token for a session cookie
      const sessionCookie = await adminAuth.createSessionCookie(token, { 
        expiresIn: maxAge * 1000 
      })
      response.cookies.set('cohorts_token', sessionCookie, cookieOptions)
    } catch (error) {
      console.error('[SessionRoute] Failed to create session cookie:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create secure session' },
        { status: 500 }
      )
    }

    response.cookies.set('cohorts_role', role || 'client', cookieOptions)
    response.cookies.set('cohorts_status', status || 'pending', cookieOptions)

    return response
  }
)

export const DELETE = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'standard',
  },
  async () => {
    const response = NextResponse.json(
      { success: true },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    )

    // Delete cookies on the response so the browser receives Set-Cookie expirations.
    response.cookies.delete('cohorts_token')
    response.cookies.delete('cohorts_role')
    response.cookies.delete('cohorts_status')

    return response
  }
)
