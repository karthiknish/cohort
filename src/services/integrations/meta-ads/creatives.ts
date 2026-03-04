// =============================================================================
// META ADS CREATIVES - Create, update, and manage ad creatives
// =============================================================================

import {
  appendMetaAuthParams,
  META_API_BASE,
} from './client'
import { metaAdsClient } from '../shared/base-client'

// =============================================================================
// TYPES FOR CREATE/UPDATE OPERATIONS
// =============================================================================

export interface CreateAdCreativeOptions {
  accessToken: string
  adAccountId: string
  name: string
  objectType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_IMAGE' | 'CAROUSEL_VIDEO' | 'DYNAMIC_CAROUSEL'
  title?: string
  body?: string
  description?: string
  callToActionType?: string
  linkUrl?: string
  imageUrl?: string
  imageHash?: string
  videoId?: string
  pageId?: string
  instagramActorId?: string
  assetFeedSpec?: string
  // v24.0 Website destination optimization - allows Meta to determine best landing page
  destinationSpec?: {
    url?: string
    fallback_url?: string
    additional_urls?: string[]
  }
  maxRetries?: number
}

export interface MetaPageActor {
  id: string
  name: string
  tasks: string[]
  instagramBusinessAccount?: {
    id: string
    name?: string
    username?: string
  }
}

export interface FetchMetaPageActorsOptions {
  accessToken: string
  appSecret?: string | null
  limit?: number
  maxRetries?: number
}

export interface CreateAdOptions {
  accessToken: string
  adAccountId: string
  adSetId: string
  creativeId: string
  name?: string
  status?: 'ACTIVE' | 'PAUSED'
  maxRetries?: number
}

export interface DeleteAdCreativeOptions {
  accessToken: string
  creativeId: string
  maxRetries?: number
}

export interface UpdateAdCreativeOptions {
  accessToken: string
  creativeId: string
  name?: string
  title?: string
  body?: string
  description?: string
  callToActionType?: string
  linkUrl?: string
  maxRetries?: number
}

export interface UploadMediaOptions {
  accessToken: string
  adAccountId: string
  fileName: string
  fileData: Uint8Array
  maxRetries?: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

// =============================================================================
// FETCH PAGE / INSTAGRAM ACTORS
// =============================================================================

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

  return rows
    .map((row): MetaPageActor | null => {
      const id = typeof row?.id === 'string' ? row.id : null
      if (!id) return null

      const name = typeof row?.name === 'string' && row.name.length > 0 ? row.name : `Page ${id}`
      const tasks = Array.isArray(row?.tasks)
        ? row.tasks.filter((task): task is string => typeof task === 'string')
        : []

      const instagram = row?.instagram_business_account
      const instagramId = typeof instagram?.id === 'string' ? instagram.id : null

      return {
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
      }
    })
    .filter((row): row is MetaPageActor => Boolean(row))
}

// =============================================================================
// CREATE AD CREATIVE
// =============================================================================

export async function createMetaAdCreative(options: CreateAdCreativeOptions): Promise<{
  success: boolean
  creativeId: string
  error?: string
}> {
  const {
    accessToken,
    adAccountId,
    name,
    objectType = 'IMAGE',
    title,
    body,
    description,
    callToActionType,
    linkUrl,
    imageUrl,
    imageHash,
    videoId,
    pageId,
    instagramActorId,
    assetFeedSpec,
    destinationSpec,
    maxRetries,
  } = options

  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  // Build the object_story_spec for the creative
  const objectStorySpec: Record<string, unknown> = {}

  if (objectType === 'IMAGE' || objectType === 'VIDEO') {
    objectStorySpec.page_id = pageId
    objectStorySpec.instagram_actor_id = instagramActorId

    if (objectType === 'IMAGE') {
      objectStorySpec.link_data = {
        call_to_action: callToActionType ? { type: callToActionType } : undefined,
        link: linkUrl,
        message: body,
        name: title,
        caption: description,
        picture: imageUrl || undefined,
        image_hash: imageHash || undefined,
      }
    } else if (objectType === 'VIDEO') {
      objectStorySpec.video_data = {
        video_id: videoId,
        call_to_action: linkUrl ? { type: callToActionType || 'LEARN_MORE', value: { link: linkUrl } } : undefined,
        message: body,
        title: title,
        description: description,
      }
    }
  } else if (objectType === 'CAROUSEL_IMAGE' || objectType === 'CAROUSEL_VIDEO') {
    objectStorySpec.link_data = {
      call_to_action: callToActionType ? { type: callToActionType } : undefined,
      link: linkUrl,
    }
  } else if (objectType === 'DYNAMIC_CAROUSEL' && assetFeedSpec) {
    objectStorySpec.link_data = {
      call_to_action: callToActionType ? { type: callToActionType } : undefined,
      link: linkUrl,
      child_attachments: assetFeedSpec,
    }
  }

  const params = new URLSearchParams()
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/adcreatives`

  const bodyData: Record<string, unknown> = {
    name,
    object_story_spec: objectStorySpec,
    access_token: accessToken,
  }

  // v24.0 Website destination optimization
  if (destinationSpec) {
    bodyData.destination_spec = destinationSpec
  }

  try {
    const { payload } = await metaAdsClient.executeRequest<{
      id?: string
      error?: { message?: string; type?: string }
    }>({
      url: `${url}?${params.toString()}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
      operation: 'createMetaAdCreative',
      maxRetries,
    })

    if (payload?.error || !payload?.id) {
      return {
        success: false,
        creativeId: '',
        error: payload?.error?.message || 'Failed to create creative',
      }
    }

    return {
      success: true,
      creativeId: payload.id,
    }
  } catch (error) {
    return {
      success: false,
      creativeId: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// CREATE AD (links creative to ad set)
// =============================================================================

export async function createMetaAd(options: CreateAdOptions): Promise<{
  success: boolean
  adId: string
  error?: string
}> {
  const {
    accessToken,
    adAccountId,
    adSetId,
    creativeId,
    name = `Ad - ${new Date().toISOString()}`,
    status = 'PAUSED',
    maxRetries,
  } = options

  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const params = new URLSearchParams()
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/ads`

  const bodyData = {
    name,
    adset_id: adSetId,
    creative: { creative_id: creativeId },
    status,
    access_token: accessToken,
  }

  try {
    const { payload } = await metaAdsClient.executeRequest<{
      id?: string
      error?: { message?: string; type?: string }
    }>({
      url: `${url}?${params.toString()}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
      operation: 'createMetaAd',
      maxRetries,
    })

    if (payload?.error || !payload?.id) {
      return {
        success: false,
        adId: '',
        error: payload?.error?.message || 'Failed to create ad',
      }
    }

    return {
      success: true,
      adId: payload.id,
    }
  } catch (error) {
    return {
      success: false,
      adId: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// DELETE AD CREATIVE (COMPENSATION)
// =============================================================================

export async function deleteMetaAdCreative(options: DeleteAdCreativeOptions): Promise<{
  success: boolean
  error?: string
}> {
  const {
    accessToken,
    creativeId,
    maxRetries,
  } = options

  const params = new URLSearchParams()
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${creativeId}`

  try {
    const { payload } = await metaAdsClient.executeRequest<{
      success?: boolean
      error?: { message?: string; type?: string }
    }>({
      url: `${url}?${params.toString()}`,
      method: 'DELETE',
      operation: 'deleteMetaAdCreative',
      maxRetries,
    })

    if (payload?.error) {
      return {
        success: false,
        error: payload.error.message || 'Failed to delete creative',
      }
    }

    return { success: payload?.success ?? true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// UPDATE AD CREATIVE
// =============================================================================

export async function updateMetaAdCreative(options: UpdateAdCreativeOptions): Promise<{
  success: boolean
  error?: string
}> {
  const {
    accessToken,
    creativeId,
    name,
    title,
    body,
    description,
    callToActionType,
    linkUrl,
    maxRetries,
  } = options

  const params = new URLSearchParams()
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${creativeId}`

  const updateData: Record<string, unknown> = { access_token: accessToken }

  if (name !== undefined) updateData.name = name

  const hasStoryUpdates =
    title !== undefined ||
    body !== undefined ||
    description !== undefined ||
    callToActionType !== undefined ||
    linkUrl !== undefined

  if (hasStoryUpdates) {
    let existingStorySpec: Record<string, unknown> = {}

    try {
      const readParams = new URLSearchParams({ fields: 'object_story_spec' })
      await appendMetaAuthParams({ params: readParams, accessToken, appSecret: process.env.META_APP_SECRET })

      const { payload: readPayload } = await metaAdsClient.executeRequest<{
        object_story_spec?: Record<string, unknown>
      }>({
        url: `${META_API_BASE}/${creativeId}?${readParams.toString()}`,
        operation: 'readMetaCreativeForUpdate',
        maxRetries,
      })

      const maybeStorySpec = asRecord(readPayload?.object_story_spec)
      if (maybeStorySpec) {
        existingStorySpec = { ...maybeStorySpec }
      }
    } catch {
      existingStorySpec = {}
    }

    const hasVideoData = Boolean(asRecord(existingStorySpec.video_data))
    const hasLinkData = Boolean(asRecord(existingStorySpec.link_data))
    const useVideoData = hasVideoData && !hasLinkData

    if (useVideoData) {
      const videoData = { ...(asRecord(existingStorySpec.video_data) ?? {}) }

      if (title !== undefined) videoData.title = title
      if (body !== undefined) videoData.message = body
      if (description !== undefined) videoData.description = description

      if (callToActionType !== undefined || linkUrl !== undefined) {
        const existingCta = asRecord(videoData.call_to_action) ?? {}
        const existingValue = asRecord(existingCta.value) ?? {}

        const ctaType =
          callToActionType ?? (typeof existingCta.type === 'string' ? existingCta.type : undefined)

        if (linkUrl !== undefined) {
          existingValue.link = linkUrl
        }

        if (ctaType) {
          videoData.call_to_action = {
            type: ctaType,
            value: existingValue,
          }
        }
      }

      existingStorySpec.video_data = videoData
    } else {
      const linkData = { ...(asRecord(existingStorySpec.link_data) ?? {}) }

      if (title !== undefined) linkData.name = title
      if (body !== undefined) linkData.message = body
      if (description !== undefined) linkData.description = description
      if (linkUrl !== undefined) linkData.link = linkUrl

      if (callToActionType !== undefined || linkUrl !== undefined) {
        const existingCta = asRecord(linkData.call_to_action) ?? {}
        const existingValue = asRecord(existingCta.value) ?? {}

        const ctaType =
          callToActionType ?? (typeof existingCta.type === 'string' ? existingCta.type : undefined)

        if (linkUrl !== undefined) {
          existingValue.link = linkUrl
        }

        if (ctaType) {
          linkData.call_to_action = {
            type: ctaType,
            value: existingValue,
          }
        }
      }

      existingStorySpec.link_data = linkData
    }

    if (Object.keys(existingStorySpec).length > 0) {
      updateData.object_story_spec = existingStorySpec
    }
  }

  if (Object.keys(updateData).length === 1) {
    return { success: true }
  }

  try {
    const { payload } = await metaAdsClient.executeRequest<{
      success?: boolean
      error?: { message?: string; type?: string }
    }>({
      url: `${url}?${params.toString()}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
      operation: 'updateMetaAdCreative',
      maxRetries,
    })

    if (payload?.error) {
      return {
        success: false,
        error: payload.error.message || 'Failed to update creative',
      }
    }

    return { success: payload?.success ?? true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// UPLOAD MEDIA TO AD ACCOUNT
// =============================================================================

export async function uploadMediaToMeta(options: UploadMediaOptions): Promise<{
  success: boolean
  creativeSpec?: string
  error?: string
}> {
  const {
    accessToken,
    adAccountId,
    fileName,
    fileData,
  } = options

  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const formData = new FormData()
  // Create a Blob from the Uint8Array - copy to a new buffer to ensure proper ArrayBuffer
  const buffer = new ArrayBuffer(fileData.length)
  const view = new Uint8Array(buffer)
  view.set(fileData)
  const blob = new Blob([buffer], { type: 'image/jpeg' })

  formData.append('source', blob, fileName)
  formData.append('access_token', accessToken)

  const url = `${META_API_BASE}/${formattedAccountId}/adimages`

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    const result = (await response.json()) as {
      images?: Array<{ creative_spec?: string }>
      error?: { message?: string }
    }

    if (result?.error) {
      return {
        success: false,
        error: result.error.message || 'Failed to upload media',
      }
    }

    const creativeSpec = result?.images?.[0]?.creative_spec

    return {
      success: true,
      creativeSpec,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
