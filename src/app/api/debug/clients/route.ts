import { NextRequest, NextResponse } from 'next/server'

import { ConvexHttpClient } from 'convex/browser'

import { getToken } from '@/lib/auth-server'
import { debugApi } from '@/lib/convex-api'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)

  const mode = url.searchParams.get('mode') ?? 'count'
  const limit = Number(url.searchParams.get('limit') ?? '200')
  const resolvedLimit = Number.isFinite(limit) ? limit : 200

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL
  if (!convexUrl) {
    return NextResponse.json({ ok: false, error: 'Convex not configured' }, { status: 500 })
  }

  const convexToken = await getToken()
  if (!convexToken) {
    return NextResponse.json({ ok: false, error: 'No Better Auth session' }, { status: 401 })
  }

  const convex = new ConvexHttpClient(convexUrl, { auth: convexToken })

  try {
    if (mode === 'list') {
      const rows = await convex.query(debugApi.listAnyClients, { limit: resolvedLimit })
      return NextResponse.json({ ok: true, mode, rows })
    }

    const result = await convex.query(debugApi.countClientsByWorkspace, { limit: resolvedLimit })
    return NextResponse.json({ ok: true, mode, result })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
