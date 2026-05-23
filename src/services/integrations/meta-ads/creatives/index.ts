export {
  toMetaApiDestinationSpec,
  sanitizeMetaDestinationSpec,
  mergeMetaDestinationSpec,
} from './destination-spec'
export type { MetaApiDestinationSpec, MetaStoredDestinationSpec } from './destination-spec'

export {
  normalizeMetaObjectTypeForCreate,
  extractVideoThumbnailFromAssetFeed,
} from './spec-builders'

export type {
  CreateAdCreativeOptions,
  MetaPageActor,
  FetchMetaPageActorsOptions,
  CreateAdOptions,
  UpdateAdOptions,
  DeleteAdCreativeOptions,
  UpdateAdCreativeOptions,
  RecreateMetaAdCreativeOptions,
  UploadMediaOptions,
} from './types'

export { fetchMetaPageActors } from './page-actors'
export { createMetaAdCreative } from './create-creative'
export { createMetaAd, updateMetaAd } from './ads'
export { recreateMetaAdCreativeForEdit } from './recreate-creative'
export { deleteMetaAdCreative, updateMetaAdCreative } from './creative-mutations'
export { uploadVideoToMeta, uploadMediaToMeta } from './media-upload'
