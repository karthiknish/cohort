/**
 * HTML intended for `TrustedHtml` must be **trusted** (sanitized server-side or from a safe template).
 * Never pass raw user-controlled strings — use `escapeHtml` / a sanitizer before building `__html`.
 */
export type TrustedHtml = {
  __html: string
  source: string
}

/**
 * Wrap already-safe HTML for `TrustedHtml`. Does not escape or sanitize.
 * @see docs/security-and-env.md
 */
export function createTrustedHtml(html: string, source: string): TrustedHtml {
  return { __html: html, source }
}
