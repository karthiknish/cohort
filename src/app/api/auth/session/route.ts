import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, role, status } = body

    const cookieStore = await cookies()

    if (!token) {
      // Clear cookies
      cookieStore.delete('cohorts_token')
      cookieStore.delete('cohorts_role')
      cookieStore.delete('cohorts_status')
      return NextResponse.json({ success: true })
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
      sameSite: 'strict' as const,
    }

    cookieStore.set('cohorts_token', token, cookieOptions)
    
    // Role and status can be non-httpOnly if needed by client, 
    // but for maximum security we'll make them httpOnly too 
    // and the client can get them from the user object in context.
    cookieStore.set('cohorts_role', role || 'client', cookieOptions)
    cookieStore.set('cohorts_status', status || 'pending', cookieOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('cohorts_token')
  cookieStore.delete('cohorts_role')
  cookieStore.delete('cohorts_status')
  return NextResponse.json({ success: true })
}
