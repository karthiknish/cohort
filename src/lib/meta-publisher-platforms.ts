/** Meta `targeting.publisher_platforms` values. */
export const META_PUBLISHER_PLATFORMS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'audience_network', label: 'Audience Network' },
  { id: 'messenger', label: 'Messenger' },
] as const

export type MetaPublisherPlatformId = (typeof META_PUBLISHER_PLATFORMS)[number]['id']

export const DEFAULT_META_PUBLISHER_PLATFORMS: MetaPublisherPlatformId[] = [
  'facebook',
  'instagram',
  'audience_network',
  'messenger',
]
