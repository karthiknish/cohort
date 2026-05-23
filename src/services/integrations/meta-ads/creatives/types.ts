import type { MetaApiDestinationSpec, MetaStoredDestinationSpec } from './destination-spec'

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
  /** Legacy IG actor id — use when returned on the existing creative as `instagram_actor_id`. */
  instagramActorId?: string
  /** IG user id from Meta v25+ reads (`instagram_user_id`) — not interchangeable with actor id. */
  instagramUserId?: string
  /** JSON string or parsed array of carousel `child_attachments` objects (Marketing API). */
  assetFeedSpec?: string | unknown[]
  /** Prefer explicit cards over `assetFeedSpec` when both provided. */
  carouselChildAttachments?: unknown[]
  /** Meta API shape — only `website` is accepted on create; URLs go in `linkUrl`. */
  destinationSpec?: MetaApiDestinationSpec | MetaStoredDestinationSpec | Record<string, unknown> | null
  /** Instant form for lead-generation creatives (`object_story_spec.link_data.call_to_action`). */
  leadgenFormId?: string
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

export interface UpdateAdOptions {
  accessToken: string
  adId: string
  creativeId: string
  name?: string
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

export interface RecreateMetaAdCreativeOptions {
  accessToken: string
  adAccountId: string
  adId: string
  creativeId?: string
  name?: string
  title?: string
  body?: string
  description?: string
  callToActionType?: string
  linkUrl?: string
  objectType?: string
  imageUrl?: string
  imageHash?: string
  videoId?: string
  pageId?: string
  instagramActorId?: string
  instagramUserId?: string
  assetFeedSpec?: string | unknown[]
  carouselChildAttachments?: unknown[]
  destinationSpec?: CreateAdCreativeOptions['destinationSpec']
  maxRetries?: number
}

export interface UploadMediaOptions {
  accessToken: string
  adAccountId: string
  fileName: string
  fileData: Uint8Array
  mimeType?: string
  maxRetries?: number
}
