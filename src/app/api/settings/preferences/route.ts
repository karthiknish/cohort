'use server'

import { NextRequest, NextResponse } from 'next/server'

import { authenticateRequest } from '@/lib/server-auth'
import { adminDb } from '@/lib/firebase-admin'
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from '@/constants/currencies'

interface UserPreferences {
  currency: CurrencyCode
  timezone?: string
  locale?: string
  updatedAt: Date
}

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: DEFAULT_CURRENCY,
  updatedAt: new Date(),
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const uid = authResult.uid

    const docRef = adminDb.collection('userPreferences').doc(uid)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ preferences: DEFAULT_PREFERENCES })
    }

    const data = snapshot.data()
    return NextResponse.json({
      preferences: {
        currency: data?.currency ?? DEFAULT_CURRENCY,
        timezone: data?.timezone ?? null,
        locale: data?.locale ?? null,
        updatedAt: data?.updatedAt?.toDate?.() ?? new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to fetch user preferences:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch preferences'
    if (message.includes('Unauthorized') || message.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (!authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const uid = authResult.uid
    const body = await request.json()

    const updates: Partial<UserPreferences> = {}

    // Validate and set currency
    if (body.currency) {
      const normalizedCurrency = String(body.currency).toUpperCase() as CurrencyCode
      if (normalizedCurrency in SUPPORTED_CURRENCIES) {
        updates.currency = normalizedCurrency
      } else {
        return NextResponse.json({ error: 'Unsupported currency code' }, { status: 400 })
      }
    }

    // Validate and set timezone
    if (typeof body.timezone === 'string' && body.timezone.trim()) {
      updates.timezone = body.timezone.trim()
    }

    // Validate and set locale
    if (typeof body.locale === 'string' && body.locale.trim()) {
      updates.locale = body.locale.trim()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid preferences provided' }, { status: 400 })
    }

    const docRef = adminDb.collection('userPreferences').doc(uid)
    await docRef.set(
      {
        ...updates,
        updatedAt: new Date(),
      },
      { merge: true }
    )

    const updated = await docRef.get()
    const data = updated.data()

    return NextResponse.json({
      preferences: {
        currency: data?.currency ?? DEFAULT_CURRENCY,
        timezone: data?.timezone ?? null,
        locale: data?.locale ?? null,
        updatedAt: data?.updatedAt?.toDate?.() ?? new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to update user preferences:', error)
    const message = error instanceof Error ? error.message : 'Failed to update preferences'
    if (message.includes('Unauthorized') || message.includes('Authentication')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
