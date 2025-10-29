import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { z } from 'zod'

import { db } from '@/lib/firebase'
import { notifyContactEmail, notifyContactSlack } from '@/lib/notifications'

const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  company: z.string().max(120).optional().or(z.literal('')),
  message: z.string().min(10).max(2000),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)

    const parseResult = contactSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Please check the form and try again.', details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const payload = {
      ...parseResult.data,
      company: parseResult.data.company?.trim() || null,
    }

    await addDoc(collection(db, 'contactMessages'), {
      ...payload,
      createdAt: serverTimestamp(),
      status: 'new',
    })

    await Promise.allSettled([
      notifyContactEmail(payload),
      notifyContactSlack(payload),
    ])

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[contact] failed to handle submission', error)
    return NextResponse.json({ error: 'Unable to send your message right now.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Contact endpoint ready' })
}
