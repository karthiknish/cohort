import { assertGoogleApiOk } from '@/lib/errors/google-api-error'

/** ISO 4217 code from GA4 Admin API `properties/{id}.currencyCode`. */
export function normalizeGoogleAnalyticsCurrencyCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const code = raw.trim().toUpperCase()
  return /^[A-Z]{3}$/.test(code) ? code : null
}

/**
 * Fetch the reporting currency configured on the GA4 property.
 * @see https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/properties
 */
export async function fetchGoogleAnalyticsPropertyCurrency(options: {
  accessToken: string
  propertyId: string
}): Promise<string | null> {
  const propertyId = options.propertyId.trim()
  if (!propertyId) return null

  const response = await fetch(
    `https://analyticsadmin.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}`,
    {
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
      },
    },
  )

  await assertGoogleApiOk(response, 'Failed to fetch Google Analytics property')

  const payload = (await response.json()) as { currencyCode?: unknown }
  return normalizeGoogleAnalyticsCurrencyCode(payload.currencyCode)
}
