import type { AdMetricsSummary } from '@/lib/ad-algorithms'

import type { CreativeSocialPreviewPlatform } from './creative-platform-mock'

export type CreativePerformanceSummary = AdMetricsSummary & {
  ctr: number
  roas: number
  cpc: number
  currency?: string
}

export type Platform = CreativeSocialPreviewPlatform

export type CreativeSocialPreviewState = {
  imageLoadFailed: boolean
  imageLightboxOpen: boolean
  profileImageError: boolean
  aspectRatio: 'feed' | 'reel'
  isPlaying: boolean
  activePlatform: Platform
}

export type CreativeSocialPreviewAction =
  | { type: 'setImageLoadFailed'; value: boolean }
  | { type: 'setImageLightboxOpen'; value: boolean }
  | { type: 'setProfileImageError'; value: boolean }
  | { type: 'setAspectRatio'; value: 'feed' | 'reel' }
  | { type: 'setIsPlaying'; value: boolean }
  | { type: 'setActivePlatform'; value: Platform }

export function createInitialCreativeSocialPreviewState(defaultPlatform: Platform): CreativeSocialPreviewState {
  return {
    imageLoadFailed: false,
    imageLightboxOpen: false,
    profileImageError: false,
    aspectRatio: 'feed',
    isPlaying: false,
    activePlatform: defaultPlatform,
  }
}

export function creativeSocialPreviewReducer(
  state: CreativeSocialPreviewState,
  action: CreativeSocialPreviewAction,
): CreativeSocialPreviewState {
  switch (action.type) {
    case 'setImageLoadFailed':
      return { ...state, imageLoadFailed: action.value }
    case 'setImageLightboxOpen':
      return { ...state, imageLightboxOpen: action.value }
    case 'setProfileImageError':
      return { ...state, profileImageError: action.value }
    case 'setAspectRatio':
      return { ...state, aspectRatio: action.value }
    case 'setIsPlaying':
      return { ...state, isPlaying: action.value }
    case 'setActivePlatform':
      return { ...state, activePlatform: action.value }
    default:
      return state
  }
}

export function safeHostname(url: string | undefined, fallback: string): string {
  if (!url) return fallback
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return fallback
  }
}
