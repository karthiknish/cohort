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

/** Raw PII fields before hashing for Meta Conversions API `user_data`. */
export type MetaCapiUserDataInput = {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  clientIpAddress?: string
  clientUserAgent?: string
  fbc?: string
  fbp?: string
  externalId?: string
}

/** Hashed / pass-through fields sent as Meta CAPI `user_data`. */
export type MetaCapiHashedUserData = Record<string, string | string[]>
