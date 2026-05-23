'use client'

import type {
  CreativeObjectType,
  CreativeStatus,
  MetaPageActorOption,
} from './create-creative-dialog-sections'
import type { MetaCreativeObjectType } from './create-creative-dialog-types'

export function toMetaCreativeObjectType(objectType: CreativeObjectType): MetaCreativeObjectType {
  switch (objectType) {
    case 'CAROUSEL':
      return 'CAROUSEL_IMAGE'
    case 'DYNAMIC':
      return 'DYNAMIC_CAROUSEL'
    default:
      return objectType
  }
}

export function parseImageHashFromCreativeSpec(spec: string): string | null {
  const trimmed = spec.trim()
  if (!trimmed) return null
  if (!trimmed.startsWith('{')) return trimmed
  try {
    const parsed = JSON.parse(trimmed) as { image_hash?: string }
    return parsed.image_hash ?? null
  } catch {
    return null
  }
}

export function revokeBlobPreview(url: string | null) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export function generateCreativeIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `creative_${crypto.randomUUID()}`
  }
  return `creative_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
type CreateCreativeDialogState = {
  open: boolean
  loading: boolean
  uploadingImage: boolean
  uploadingVideo: boolean
  videoPreviewUrl: string | null
  loadingPageActors: boolean
  metaPageActors: MetaPageActorOption[]
  selectedAdSetId: string | undefined
  name: string
  objectType: CreativeObjectType
  title: string
  body: string
  description: string
  callToActionType: string
  linkUrl: string
  imageUrl: string
  imageHash: string
  imagePreviewUrl: string | null
  videoId: string
  pageId: string
  instagramActorId: string
  leadFormId: string
  status: CreativeStatus
}

export type CreateCreativeDialogAction =
  | { type: 'setOpen'; value: boolean }
  | { type: 'setLoading'; value: boolean }
  | { type: 'setUploadingImage'; value: boolean }
  | { type: 'setUploadingVideo'; value: boolean }
  | { type: 'setVideoPreviewUrl'; value: string | null }
  | { type: 'setLoadingPageActors'; value: boolean }
  | { type: 'setMetaPageActors'; value: MetaPageActorOption[] }
  | { type: 'setSelectedAdSetId'; value: string | undefined }
  | { type: 'setName'; value: string }
  | { type: 'setObjectType'; value: CreativeObjectType }
  | { type: 'setTitle'; value: string }
  | { type: 'setBody'; value: string }
  | { type: 'setDescription'; value: string }
  | { type: 'setCallToActionType'; value: string }
  | { type: 'setLinkUrl'; value: string }
  | { type: 'setImageUrl'; value: string }
  | { type: 'setImageHash'; value: string }
  | { type: 'setImagePreviewUrl'; value: string | null }
  | { type: 'setVideoId'; value: string }
  | { type: 'setPageId'; value: string }
  | { type: 'setInstagramActorId'; value: string }
  | { type: 'setLeadFormId'; value: string }
  | { type: 'setStatus'; value: CreativeStatus }
  | { type: 'selectPage'; pageId: string; instagramActorId: string }
  | { type: 'clearImage' }
  | { type: 'clearVideo' }
  | { type: 'reset'; selectedAdSetId: string | undefined }
  | { type: 'applyMetaPageActors'; actors: MetaPageActorOption[] }
  | { type: 'clearMetaPageActorsOnError' }

export function createInitialCreateCreativeDialogState(
  selectedAdSetId: string | undefined,
): CreateCreativeDialogState {
  return {
    open: false,
    loading: false,
    uploadingImage: false,
    uploadingVideo: false,
    videoPreviewUrl: null,
    loadingPageActors: false,
    metaPageActors: [],
    selectedAdSetId,
    name: '',
    objectType: 'IMAGE',
    title: '',
    body: '',
    description: '',
    callToActionType: '',
    linkUrl: '',
    imageUrl: '',
    imageHash: '',
    imagePreviewUrl: null,
    videoId: '',
    pageId: '',
    instagramActorId: '',
    leadFormId: '',
    status: 'PAUSED',
  }
}

export function createCreativeDialogReducer(
  state: CreateCreativeDialogState,
  action: CreateCreativeDialogAction,
): CreateCreativeDialogState {
  switch (action.type) {
    case 'setOpen':
      return { ...state, open: action.value }
    case 'setLoading':
      return { ...state, loading: action.value }
    case 'setUploadingImage':
      return { ...state, uploadingImage: action.value }
    case 'setUploadingVideo':
      return { ...state, uploadingVideo: action.value }
    case 'setVideoPreviewUrl':
      return { ...state, videoPreviewUrl: action.value }
    case 'setLoadingPageActors':
      return { ...state, loadingPageActors: action.value }
    case 'setMetaPageActors':
      return { ...state, metaPageActors: action.value }
    case 'setSelectedAdSetId':
      return { ...state, selectedAdSetId: action.value }
    case 'setName':
      return { ...state, name: action.value }
    case 'setObjectType':
      return { ...state, objectType: action.value }
    case 'setTitle':
      return { ...state, title: action.value }
    case 'setBody':
      return { ...state, body: action.value }
    case 'setDescription':
      return { ...state, description: action.value }
    case 'setCallToActionType':
      return { ...state, callToActionType: action.value }
    case 'setLinkUrl':
      return { ...state, linkUrl: action.value }
    case 'setImageUrl':
      return { ...state, imageUrl: action.value }
    case 'setImageHash':
      return { ...state, imageHash: action.value }
    case 'setImagePreviewUrl':
      return { ...state, imagePreviewUrl: action.value }
    case 'setVideoId':
      return { ...state, videoId: action.value }
    case 'setPageId':
      return { ...state, pageId: action.value }
    case 'setInstagramActorId':
      return { ...state, instagramActorId: action.value }
    case 'setLeadFormId':
      return { ...state, leadFormId: action.value }
    case 'setStatus':
      return { ...state, status: action.value }
    case 'selectPage':
      return { ...state, pageId: action.pageId, instagramActorId: action.instagramActorId, leadFormId: '' }
    case 'clearImage':
      return { ...state, imagePreviewUrl: null, imageUrl: '', imageHash: '' }
    case 'clearVideo':
      return { ...state, videoPreviewUrl: null, videoId: '' }
    case 'reset':
      return createInitialCreateCreativeDialogState(action.selectedAdSetId)
    case 'applyMetaPageActors': {
      const normalizedActors = action.actors
      const currentPageId = state.pageId
      const nextPageId =
        currentPageId && normalizedActors.some((actor) => actor.id === currentPageId)
          ? currentPageId
          : (normalizedActors[0]?.id ?? '')

      if (!nextPageId) {
        return {
          ...state,
          metaPageActors: normalizedActors,
          pageId: '',
          instagramActorId: '',
        }
      }

      const pageActor = normalizedActors.find((actor) => actor.id === nextPageId)
      return {
        ...state,
        metaPageActors: normalizedActors,
        pageId: nextPageId,
        instagramActorId: pageActor?.instagramBusinessAccountId ?? '',
      }
    }
    case 'clearMetaPageActorsOnError':
      return { ...state, metaPageActors: [], pageId: '', instagramActorId: '' }
    default:
      return state
  }
}
