import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'

const SessionSchema = z.object({
  token: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
})

export const POST = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'sensitive',
    bodySchema: SessionSchema,
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
      sameSite: 'lax' as const, // Changed from strict to lax for better redirect reliability
    }

    cookieStore.set('cohorts_token', token, cookieOptions)
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
