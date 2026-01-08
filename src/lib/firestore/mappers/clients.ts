import type { Timestamp } from 'firebase-admin/firestore'

import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import type { StoredClient } from '@/types/stored-types'
import { coerceNumber, toISO } from '@/lib/utils'

type TimestampLike = Timestamp | Date | { toDate: () => Date } | string | null | undefined

export type { StoredClient } from '@/types/stored-types'

export function coerceClientTeamMembers(value: unknown): ClientTeamMember[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }

      const record = item as Record<string, unknown>
      const name = typeof record.name === 'string' ? record.name.trim() : ''
      const role = typeof record.role === 'string' ? record.role.trim() : ''

      if (!name) {
        return null
      }

      return {
        name,
        role: role || 'Contributor',
      }
    })
    .filter(Boolean) as ClientTeamMember[]
}

export function mapClientDoc(docId: string, data: StoredClient): ClientRecord {
  const name = typeof data.name === 'string' ? data.name : 'Untitled client'
  const accountManager = typeof data.accountManager === 'string' ? data.accountManager : 'Unassigned'
  const teamMembers = coerceClientTeamMembers(data.teamMembers)
  const billingEmail = typeof data.billingEmail === 'string' ? data.billingEmail : null
  const stripeCustomerId = typeof data.stripeCustomerId === 'string' ? data.stripeCustomerId : null
  const lastInvoiceStatus = typeof data.lastInvoiceStatus === 'string' ? data.lastInvoiceStatus : null
  const lastInvoiceAmount = coerceNumber(data.lastInvoiceAmount)
  const lastInvoiceCurrency = typeof data.lastInvoiceCurrency === 'string' ? data.lastInvoiceCurrency : null
  const lastInvoiceIssuedAt = toISO(data.lastInvoiceIssuedAt as TimestampLike)
  const lastInvoiceNumber = typeof data.lastInvoiceNumber === 'string' ? data.lastInvoiceNumber : null
  const lastInvoiceUrl = typeof data.lastInvoiceUrl === 'string' ? data.lastInvoiceUrl : null

  return {
    id: docId,
    name,
    accountManager,
    teamMembers,
    billingEmail,
    stripeCustomerId,
    lastInvoiceStatus,
    lastInvoiceAmount,
    lastInvoiceCurrency,
    lastInvoiceIssuedAt,
    lastInvoiceNumber,
    lastInvoiceUrl,
    createdAt: toISO(data.createdAt as TimestampLike),
    updatedAt: toISO(data.updatedAt as TimestampLike),
  }
}
