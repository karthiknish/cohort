import { NextResponse } from 'next/server'
import { serverCache } from '@/lib/cache'

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Forbidden', { status: 403 })
  }

  serverCache.clear()
  console.log('Server cache cleared via debug endpoint')
  
  return NextResponse.json({ success: true, message: 'Cache cleared' })
}
