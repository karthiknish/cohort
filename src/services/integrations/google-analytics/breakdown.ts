import { assertGoogleApiOk } from '@/lib/errors/google-api-error'

export type GoogleAnalyticsBreakdownDimension = 'channel' | 'source' | 'device'

export type GoogleAnalyticsBreakdownRow = {
  date: string
  dimension: GoogleAnalyticsBreakdownDimension
  dimensionValue: string
  users: number
  sessions: number
  conversions: number
  revenue: number
}

const BREAKDOWN_CONFIG: Record<
  GoogleAnalyticsBreakdownDimension,
  { gaDimension: string; label: string }
> = {
  channel: { gaDimension: 'sessionDefaultChannelGroup', label: 'channel' },
  source: { gaDimension: 'sessionSource', label: 'source' },
  device: { gaDimension: 'deviceCategory', label: 'device' },
}

function formatGaDate(raw: string): string {
  if (!raw || raw.length !== 8) return raw
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

async function runBreakdownReport(options: {
  accessToken: string
  propertyId: string
  days: number
  dimension: GoogleAnalyticsBreakdownDimension
}): Promise<GoogleAnalyticsBreakdownRow[]> {
  const config = BREAKDOWN_CONFIG[options.dimension]
  const rows: GoogleAnalyticsBreakdownRow[] = []
  let offset = 0
  let rowCount: number | null = null

  for (let page = 0; page < 20; page += 1) {
    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${options.propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: `${Math.max(options.days, 1)}daysAgo`, endDate: 'today' }],
          dimensions: [{ name: 'date' }, { name: config.gaDimension }],
          metrics: [
            { name: 'totalUsers' },
            { name: 'sessions' },
            { name: 'conversions' },
            { name: 'totalRevenue' },
          ],
          limit: 10000,
          offset,
        }),
      },
    )

    await assertGoogleApiOk(response, `Failed to fetch Google Analytics ${config.label} breakdown`)

    const payload = (await response.json()) as {
      rowCount?: number
      rows?: Array<{
        dimensionValues?: Array<{ value?: string }>
        metricValues?: Array<{ value?: string }>
      }>
    }

    if (typeof payload.rowCount === 'number') rowCount = payload.rowCount

    const pageRows = (payload.rows ?? [])
      .map((row) => {
        const rawDate = row.dimensionValues?.[0]?.value ?? ''
        const dimensionValue = row.dimensionValues?.[1]?.value?.trim() || '(not set)'
        const metricValues = row.metricValues ?? []
        const users = Number(metricValues[0]?.value ?? 0)
        const sessions = Number(metricValues[1]?.value ?? 0)
        const conversions = Number(metricValues[2]?.value ?? 0)
        const revenue = Number(metricValues[3]?.value ?? 0)
        const date = formatGaDate(rawDate)
        if (!date) return null
        return {
          date,
          dimension: options.dimension,
          dimensionValue,
          users: Number.isFinite(users) ? users : 0,
          sessions: Number.isFinite(sessions) ? sessions : 0,
          conversions: Number.isFinite(conversions) ? conversions : 0,
          revenue: Number.isFinite(revenue) ? revenue : 0,
        }
      })
      .filter((row): row is GoogleAnalyticsBreakdownRow => Boolean(row))

    rows.push(...pageRows)
    if (pageRows.length === 0) break
    offset += pageRows.length
    if (rowCount !== null && offset >= rowCount) break
    if (rowCount === null && pageRows.length < 10000) break
  }

  return rows
}

export async function fetchGoogleAnalyticsBreakdowns(options: {
  accessToken: string
  propertyId: string
  days: number
}): Promise<GoogleAnalyticsBreakdownRow[]> {
  const dimensions: GoogleAnalyticsBreakdownDimension[] = ['channel', 'source', 'device']
  const results = await Promise.all(
    dimensions.map((dimension) =>
      runBreakdownReport({
        accessToken: options.accessToken,
        propertyId: options.propertyId,
        days: options.days,
        dimension,
      }),
    ),
  )
  return results.flat()
}
