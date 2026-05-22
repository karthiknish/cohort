import { appendMetaAuthParams, META_API_BASE } from './client'
import { metaAdsClient } from '../shared/base-client'

export type MetaSocialPage = {
  id: string
  name: string
  instagramBusinessAccount?: {
    id: string
    name?: string
    username?: string
  }
}

export async function discoverMetaPages(options: {
  accessToken: string
  appSecret?: string | null
  limit?: number
  maxRetries?: number
}): Promise<MetaSocialPage[]> {
  const {
    accessToken,
    appSecret = process.env.META_APP_SECRET,
    limit = 100,
    maxRetries,
  } = options

  const params = new URLSearchParams({
    fields: 'id,name,instagram_business_account{id,name,username}',
    limit: String(limit),
  })

  await appendMetaAuthParams({ params, accessToken, appSecret })

  const { payload } = await metaAdsClient.executeRequest<{
    data?: Array<{
      id?: unknown
      name?: unknown
      instagram_business_account?: {
        id?: unknown
        name?: unknown
        username?: unknown
      } | null
    }>
  }>({
    url: `${META_API_BASE}/me/accounts?${params.toString()}`,
    operation: 'discoverMetaPages',
    maxRetries,
  })

  const rows = Array.isArray(payload?.data) ? payload.data : []

  return rows.flatMap((row): MetaSocialPage[] => {
      const id = typeof row?.id === 'string' ? row.id : null
      if (!id) return []

      const name = typeof row?.name === 'string' && row.name.length > 0 ? row.name : `Page ${id}`
      const instagram = row?.instagram_business_account
      const instagramId = typeof instagram?.id === 'string' ? instagram.id : null

      return [{
        id,
        name,
        instagramBusinessAccount: instagramId
          ? {
              id: instagramId,
              name: typeof instagram?.name === 'string' ? instagram.name : undefined,
              username: typeof instagram?.username === 'string' ? instagram.username : undefined,
            }
          : undefined,
      }]
    })
}
