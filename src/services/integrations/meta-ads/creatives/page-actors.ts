import { appendMetaAuthParams, META_API_BASE } from '../client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'

import type { FetchMetaPageActorsOptions, MetaPageActor } from './types'

export async function fetchMetaPageActors(options: FetchMetaPageActorsOptions): Promise<MetaPageActor[]> {
  const {
    accessToken,
    appSecret = process.env.META_APP_SECRET,
    limit = 100,
    maxRetries,
  } = options

  const params = new URLSearchParams({
    fields: 'id,name,tasks,instagram_business_account{id,name,username}',
    limit: String(limit),
  })

  await appendMetaAuthParams({ params, accessToken, appSecret })

  const { payload } = await metaAdsClient.executeRequest<{
    data?: Array<{
      id?: unknown
      name?: unknown
      tasks?: unknown
      instagram_business_account?: {
        id?: unknown
        name?: unknown
        username?: unknown
      } | null
    }>
  }>({
    url: `${META_API_BASE}/me/accounts?${params.toString()}`,
    operation: 'fetchMetaPageActors',
    maxRetries,
  })

  const rows = Array.isArray(payload?.data) ? payload.data : []

  return rows.flatMap((row): MetaPageActor[] => {
    const id = typeof row?.id === 'string' ? row.id : null
    if (!id) return []

    const name = typeof row?.name === 'string' && row.name.length > 0 ? row.name : `Page ${id}`
    const tasks = Array.isArray(row?.tasks)
      ? row.tasks.filter((task): task is string => typeof task === 'string')
      : []

    const instagram = row?.instagram_business_account
    const instagramId = typeof instagram?.id === 'string' ? instagram.id : null

    return [
      {
        id,
        name,
        tasks,
        instagramBusinessAccount: instagramId
          ? {
              id: instagramId,
              name: typeof instagram?.name === 'string' ? instagram.name : undefined,
              username: typeof instagram?.username === 'string' ? instagram.username : undefined,
            }
          : undefined,
      },
    ]
  })
}
