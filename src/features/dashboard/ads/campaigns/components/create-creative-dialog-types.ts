export type CreateCreativeDialogProps = {
  workspaceId: string | null
  providerId: string
  campaignId: string
  clientId?: string | null
  adSetId?: string
  availableAdSets?: Array<{ id: string; name: string }>
  onSuccess?: () => void
}

export type MetaCreativeObjectType =
  | 'IMAGE'
  | 'VIDEO'
  | 'CAROUSEL_IMAGE'
  | 'CAROUSEL_VIDEO'
  | 'DYNAMIC_CAROUSEL'
