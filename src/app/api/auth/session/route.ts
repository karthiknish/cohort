import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { adminAuth } from '@/lib/firebase-admin'

const SessionSchema = z.object({
  token: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
})

export const POST = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'standard',
    bodySchema: SessionSchema,
    skipIdempotency: true,
  },
  async (request, context) => {
    const { token, role, status } = context.body
    const cookieStore = await cookies()

    if (!token) {
      // Clear cookies
      cookieStore.delete('cohorts_token')
      cookieStore.delete('cohorts_role')
      cookieStore.delete('cohorts_status')
      return NextResponse.json(
        { success: true },
        { 
          headers: { 'Cache-Control': 'no-store, max-age=0' }
        }
      )
    }

    // Set cookies with security flags
    // 2 hours expiration instead of 14 days
    const maxAge = 2 * 60 * 60 
    const isProduction = process.env.NODE_ENV === 'production'

    const cookieOptions = {
      maxAge,
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
    }

    try {
      // Exchange the ID token for a session cookie
      // This provides an encrypted session reference as requested
      const sessionCookie = await adminAuth.createSessionCookie(token, { 
        expiresIn: maxAge * 1000 
      })
      cookieStore.set('cohorts_token', sessionCookie, cookieOptions)
    } catch (error) {
      console.error('[SessionRoute] Failed to create session cookie:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create secure session' },
        { status: 500 }
      )
    }

    cookieStore.set('cohorts_role', role || 'client', cookieOptions)
    cookieStore.set('cohorts_status', status || 'pending', cookieOptions)

    return NextResponse.json(
      { success: true },
      { 
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    )
  }
)

export const DELETE = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'standard',
  },
  async () => {
    const cookieStore = await cookies()
    cookieStore.delete('cohorts_token')
    cookieStore.delete('cohorts_role')
    cookieStore.delete('cohorts_status')
    return NextResponse.json(
      { success: true },
      { 
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    )
  }
)
