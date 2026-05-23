import { createHash } from 'node:crypto'

/** Meta customer file: SHA-256 of normalized email (lowercase, trimmed). */
export function hashMetaCustomerEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  return createHash('sha256').update(normalized).digest('hex')
}

export function parseEmailLines(raw: string): string[] {
  const seen = new Set<string>()
  const emails: string[] = []
  for (const line of raw.split(/\r?\n/)) {
    const value = line.trim().toLowerCase()
    if (!value || !value.includes('@')) continue
    if (seen.has(value)) continue
    seen.add(value)
    emails.push(value)
  }
  return emails
}
