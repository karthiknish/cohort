/** Standard Meta CAPI `event_name` values (subset). */
export const META_CAPI_STANDARD_EVENTS = [
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Lead', label: 'Lead' },
  { value: 'CompleteRegistration', label: 'Complete registration' },
  { value: 'AddToCart', label: 'Add to cart' },
  { value: 'InitiateCheckout', label: 'Initiate checkout' },
  { value: 'ViewContent', label: 'View content' },
  { value: 'PageView', label: 'Page view' },
] as const

export const META_CAPI_ACTION_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'app', label: 'App' },
  { value: 'phone_call', label: 'Phone call' },
  { value: 'chat', label: 'Chat' },
  { value: 'email', label: 'Email' },
  { value: 'physical_store', label: 'Physical store (offline)' },
  { value: 'system_generated', label: 'System generated' },
  { value: 'other', label: 'Other' },
] as const

export type MetaCapiActionSource = (typeof META_CAPI_ACTION_SOURCES)[number]['value']

export const META_OFFLINE_ACTION_SOURCE: MetaCapiActionSource = 'physical_store'

export const META_BATCH_MAX_REQUESTS = 50
