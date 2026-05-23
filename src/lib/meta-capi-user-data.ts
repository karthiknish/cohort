import { createHash } from 'node:crypto'

import { hashMetaCustomerEmail } from '@/lib/meta-audience-user-hash'

export type MetaCapiUserDataInput = {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  clientIpAddress?: string
  clientUserAgent?: string
  fbc?: string
  fbp?: string
  externalId?: string
}

export type MetaCapiHashedUserData = Record<string, string | string[]>

function hashNormalized(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/** Meta CAPI: digits only, include country code (default US `1`). */
export function hashMetaCapiPhone(phone: string, defaultCountryCode = '1'): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  const normalized = digits.startsWith(defaultCountryCode) ? digits : `${defaultCountryCode}${digits}`
  return hashNormalized(normalized)
}

function hashNamePart(value: string): string {
  return hashNormalized(value.trim().toLowerCase())
}

export function buildMetaCapiHashedUserData(input: MetaCapiUserDataInput): MetaCapiHashedUserData {
  const userData: MetaCapiHashedUserData = {}

  if (input.email?.trim()) {
    userData.em = [hashMetaCustomerEmail(input.email)]
  }
  if (input.phone?.trim()) {
    const hashedPhone = hashMetaCapiPhone(input.phone)
    if (hashedPhone) userData.ph = [hashedPhone]
  }
  if (input.firstName?.trim()) {
    userData.fn = hashNamePart(input.firstName)
  }
  if (input.lastName?.trim()) {
    userData.ln = hashNamePart(input.lastName)
  }
  if (input.city?.trim()) {
    userData.ct = hashNamePart(input.city)
  }
  if (input.state?.trim()) {
    userData.st = hashNamePart(input.state)
  }
  if (input.zip?.trim()) {
    userData.zp = hashNamePart(input.zip)
  }
  if (input.country?.trim()) {
    userData.country = hashNamePart(input.country)
  }
  if (input.externalId?.trim()) {
    userData.external_id = hashNormalized(input.externalId.trim())
  }
  if (input.clientIpAddress?.trim()) {
    userData.client_ip_address = input.clientIpAddress.trim()
  }
  if (input.clientUserAgent?.trim()) {
    userData.client_user_agent = input.clientUserAgent.trim()
  }
  if (input.fbc?.trim()) {
    userData.fbc = input.fbc.trim()
  }
  if (input.fbp?.trim()) {
    userData.fbp = input.fbp.trim()
  }

  return userData
}
