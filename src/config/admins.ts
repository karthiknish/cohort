export const DEFAULT_ADMIN_EMAILS = ['karthik.nishanth06@gmail.com'] as const

export function isDefaultAdminEmail(candidate: unknown): boolean {
  return typeof candidate === 'string' && DEFAULT_ADMIN_EMAILS.some((email) => email.toLowerCase() === candidate.toLowerCase())
}
