/**
 * HTML intended for `TrustedHtml` must be **trusted** (sanitized server-side or from a safe template).
 * Never pass raw user-controlled strings — use `escapeHtml` / a sanitizer before building `__html`.
 */
export type TrustedHtml = {
  __html: string
  source: string
}

/** Pair sanitized HTML with a non-production `source` label for debugging. */
export function createTrustedHtml(html: string, source: string): TrustedHtml {
  return { __html: html, source }
}
