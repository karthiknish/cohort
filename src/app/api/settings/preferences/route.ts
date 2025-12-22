'use server'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from '@/constants/currencies'
import { createApiHandler } from '@/lib/api-handler'

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

const preferencesSchema = z.object({
  currency: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
})

export const GET = createApiHandler({}, async (req, { auth }) => {
  const uid = auth.uid!

  const docRef = adminDb.collection('userPreferences').doc(uid)
  const snapshot = await docRef.get()

  if (!snapshot.exists) {
    return { preferences: DEFAULT_PREFERENCES }
  }

  const data = snapshot.data()
  return {
    preferences: {
      currency: data?.currency ?? DEFAULT_CURRENCY,
      timezone: data?.timezone ?? null,
      locale: data?.locale ?? null,
      updatedAt: data?.updatedAt?.toDate?.() ?? new Date(),
    },
  }
})

export const POST = createApiHandler(
  {
    bodySchema: preferencesSchema,
  },
  async (req, { auth, body }) => {
    const uid = auth.uid!
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

    return {
      preferences: {
        currency: data?.currency ?? DEFAULT_CURRENCY,
        timezone: data?.timezone ?? null,
        locale: data?.locale ?? null,
        updatedAt: data?.updatedAt?.toDate?.() ?? new Date(),
      },
    }
  }
)
