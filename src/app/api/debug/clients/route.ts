import { NextRequest, NextResponse } from 'next/server'

import { ConvexHttpClient } from 'convex/browser'

import { getToken } from '@/lib/auth-server'
import { debugApi } from '@/lib/convex-api'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)

  const mode = url.searchParams.get('mode') ?? 'count'
  const limit = Number(url.searchParams.get('limit') ?? '200')
  const resolvedLimit = Number.isFinite(limit) ? limit : 200

  const requestId = req.headers.get('x-vercel-id') ?? crypto.randomUUID()

  const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    return NextResponse.json(
      { ok: false, requestId, error: 'Convex not configured', debug: { hasConvexUrl: false } },
      { status: 500 }
    )
  }

  let convexToken: string | null = null
  try {
    convexToken = (await getToken()) ?? null
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        requestId,
        error: 'Failed to read Better Auth session',
        debug: { convexUrl, tokenError: error instanceof Error ? error.message : String(error) },
      },
      { status: 401 }
    )
  }

  if (!convexToken) {
    return NextResponse.json(
      { ok: false, requestId, error: 'No Better Auth session', debug: { convexUrl } },
      { status: 401 }
    )
  }

  const convex = new ConvexHttpClient(convexUrl, { auth: convexToken })

  try {
    const whoami = await convex.query(debugApi.whoami, {})

    if (mode === 'whoami') {
      return NextResponse.json({ ok: true, requestId, mode, whoami })
    }

    if (mode === 'list') {
      const rows = await convex.query(debugApi.listAnyClients, { limit: resolvedLimit })
      return NextResponse.json({ ok: true, requestId, mode, whoami, rows })
    }

    const result = await convex.query(debugApi.countClientsByWorkspace, { limit: resolvedLimit })
    return NextResponse.json({ ok: true, requestId, mode, whoami, result })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        requestId,
        error: error instanceof Error ? error.message : String(error),
        debug: { convexUrl },
      },
      { status: 500 }
    )
  }
}
