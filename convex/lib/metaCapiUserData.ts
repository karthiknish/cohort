import { hashMetaCustomerEmail } from './metaAudienceHash'
import { sha256Hex } from './metaSha256'

import type { MetaCapiHashedUserData, MetaCapiUserDataInput } from '@/lib/meta-capi-events'

async function hashNormalized(value: string): Promise<string> {
  return sha256Hex(value)
}

/** Meta CAPI: digits only, include country code (default US `1`). */
export async function hashMetaCapiPhone(phone: string, defaultCountryCode = '1'): Promise<string> {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  const normalized = digits.startsWith(defaultCountryCode) ? digits : `${defaultCountryCode}${digits}`
  return hashNormalized(normalized)
}

async function hashNamePart(value: string): Promise<string> {
  return hashNormalized(value.trim().toLowerCase())
}

export async function buildMetaCapiHashedUserData(
  input: MetaCapiUserDataInput,
): Promise<MetaCapiHashedUserData> {
  const userData: MetaCapiHashedUserData = {}

  if (input.email?.trim()) {
    userData.em = [await hashMetaCustomerEmail(input.email)]
  }
  if (input.phone?.trim()) {
    const hashedPhone = await hashMetaCapiPhone(input.phone)
    if (hashedPhone) userData.ph = [hashedPhone]
  }
  if (input.firstName?.trim()) {
    userData.fn = await hashNamePart(input.firstName)
  }
  if (input.lastName?.trim()) {
    userData.ln = await hashNamePart(input.lastName)
  }
  if (input.city?.trim()) {
    userData.ct = await hashNamePart(input.city)
  }
  if (input.state?.trim()) {
    userData.st = await hashNamePart(input.state)
  }
  if (input.zip?.trim()) {
    userData.zp = await hashNamePart(input.zip)
  }
  if (input.country?.trim()) {
    userData.country = await hashNamePart(input.country)
  }
  if (input.externalId?.trim()) {
    userData.external_id = await hashNormalized(input.externalId.trim())
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
