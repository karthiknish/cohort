import { sha256Hex } from './metaSha256'

/** Meta customer file: SHA-256 of normalized email (lowercase, trimmed). */
export async function hashMetaCustomerEmail(email: string): Promise<string> {
  return sha256Hex(email.trim().toLowerCase())
}

const EMAIL_LINE_PATTERN = /^[^\s@]+@[^\s@]+/

/** Normalized emails valid for Meta customer file upload (deduped). */
export function normalizeValidMetaCustomerEmails(emails: string[]): string[] {
  const validEmails: string[] = []
  const seen = new Set<string>()
  for (const email of emails) {
    const normalized = email.trim().toLowerCase()
    if (!EMAIL_LINE_PATTERN.test(normalized)) continue
    if (seen.has(normalized)) continue
    seen.add(normalized)
    validEmails.push(normalized)
  }
  return validEmails
}

export function parseEmailLines(raw: string): string[] {
  const seen = new Set<string>()
  const emails: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    const value = line.trim().toLowerCase()
    if (!value || !EMAIL_LINE_PATTERN.test(value)) continue
    if (seen.has(value)) continue
    seen.add(value)
    emails.push(value)
  }
  return emails
}
