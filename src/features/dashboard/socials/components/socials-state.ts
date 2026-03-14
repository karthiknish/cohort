export type SocialSurfaceKey = 'facebook' | 'instagram'

export type SocialsSurfaceStatus =
  | 'disconnected'
  | 'source_required'
  | 'loading'
  | 'error'
  | 'ready'
  | 'empty'

export type SocialsMetaSetupStage =
  | 'disconnected'
  | 'source_selection'
  | 'discovering'
  | 'recovery'
  | 'partial'
  | 'ready'
  | 'connected_empty'

export type SocialsSurfaceAvailability = {
  status: SocialsSurfaceStatus
  count: number
  emptyMessage: string
}

export type SocialsMetaSetupState = {
  stage: SocialsMetaSetupStage
  title: string
  description: string
  switchSourceRecommended: boolean
  switchSourceMessage: string | null
}