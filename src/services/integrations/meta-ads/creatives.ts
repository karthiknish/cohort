// =============================================================================
// META ADS CREATIVES - Create, update, and manage ad creatives
// =============================================================================

import {
  appendMetaAuthParams,
  META_API_BASE,
} from './client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'

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

export interface UpdateAdCreativeOptions {
  accessToken: string
  creativeId: string
  name?: string
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
    maxRetries = 3,
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

  const bodyData = {
    name,
    object_story_spec: objectStorySpec,
    access_token: accessToken,
  }

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    })

    const payload = await response.json() as {
      id?: string
      error?: { message?: string; type?: string }
    }

    if (payload?.error) {
      return {
        success: false,
        creativeId: '',
        error: payload.error.message || 'Failed to create creative',
      }
    }

    return {
      success: true,
      creativeId: payload?.id ?? '',
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
    maxRetries = 3,
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
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    })

    const payload = await response.json() as {
      id?: string
      error?: { message?: string; type?: string }
    }

    if (payload?.error) {
      return {
        success: false,
        adId: '',
        error: payload.error.message || 'Failed to create ad',
      }
    }

    return {
      success: true,
      adId: payload?.id ?? '',
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
    body,
    description,
    callToActionType,
    linkUrl,
    maxRetries = 3,
  } = options

  const params = new URLSearchParams()
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${creativeId}`

  const updateData: Record<string, unknown> = {
    access_token: accessToken,
  }

  if (name !== undefined) updateData.name = name
  if (body !== undefined) updateData.body = body
  if (description !== undefined) updateData.description = description
  if (callToActionType !== undefined) updateData.call_to_action_type = callToActionType
  if (linkUrl !== undefined) updateData.link_url = linkUrl

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    })

    const payload = await response.json() as {
      success?: boolean
      error?: { message?: string; type?: string }
    }

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
    maxRetries = 3,
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
