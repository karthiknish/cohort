export type GoogleAnalyticsPropertyOption = {
  id: string
  name: string
  resourceName: string
}

type GoogleAnalyticsAccountSummariesResponse = {
  accountSummaries?: Array<{
    propertySummaries?: Array<{
      property?: string
      displayName?: string
    }>
  }>
  nextPageToken?: string
}

function normalizePropertyId(resourceName: string): string {
  const trimmed = resourceName.trim()
  if (trimmed.startsWith('properties/')) {
    const extracted = trimmed.split('/')[1]
    return typeof extracted === 'string' && extracted.length > 0 ? extracted : trimmed
  }
  return trimmed
}

export async function fetchGoogleAnalyticsProperties(options: {
  accessToken: string
  pageSize?: number
  maxPages?: number
}): Promise<GoogleAnalyticsPropertyOption[]> {
  const { accessToken, pageSize = 200, maxPages = 5 } = options

  const unique = new Map<string, GoogleAnalyticsPropertyOption>()
  let nextPageToken: string | undefined
  let page = 0

  do {
    const url = new URL('https://analyticsadmin.googleapis.com/v1beta/accountSummaries')
    url.searchParams.set('pageSize', String(pageSize))
    if (typeof nextPageToken === 'string' && nextPageToken.length > 0) {
      url.searchParams.set('pageToken', nextPageToken)
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to list Google Analytics properties (${response.status}): ${text}`)
    }

    const payload = (await response.json()) as GoogleAnalyticsAccountSummariesResponse

    for (const accountSummary of payload.accountSummaries ?? []) {
      for (const property of accountSummary.propertySummaries ?? []) {
        if (typeof property.property !== 'string' || property.property.length === 0) {
          continue
        }

        const id = normalizePropertyId(property.property)
        const name = typeof property.displayName === 'string' && property.displayName.length > 0
          ? property.displayName
          : property.property

        unique.set(id, {
          id,
          name,
          resourceName: property.property,
        })
      }
    }

    nextPageToken = payload.nextPageToken
    page += 1
  } while (nextPageToken && page < maxPages)

  return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name))
}
