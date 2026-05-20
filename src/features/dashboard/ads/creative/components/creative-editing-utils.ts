import type { Creative } from './types'

export function normalizeStringList(items: string[]): string[] {
  return items.flatMap((item) => {
    const trimmed = item.trim()
    return trimmed ? [trimmed] : []
  })
}

export function listsEqual(a: string[], b: string[]): boolean {
  const na = normalizeStringList(a)
  const nb = normalizeStringList(b)
  if (na.length !== nb.length) return false
  return na.every((value, index) => value === nb[index])
}

export function creativeCopyIsDirty(
  creative: Creative,
  edited: {
    headlines: string[]
    descriptions: string[]
    cta: string
    landingPage: string
  },
): boolean {
  if (!listsEqual(edited.headlines, creative.headlines ?? [])) return true
  if (!listsEqual(edited.descriptions, creative.descriptions ?? [])) return true
  if (edited.cta.trim() !== (creative.callToAction ?? '').trim()) return true
  if (edited.landingPage.trim() !== (creative.landingPageUrl ?? '').trim()) return true
  return false
}

/** Merge edited copy into an existing Meta asset_feed_spec JSON string. */
export function mergeMetaAssetFeedSpecForSave(
  existingSpec: string | undefined,
  headlines: string[],
  descriptions: string[],
  landingPageUrl: string,
): string | undefined {
  if (!existingSpec?.trim()) return undefined

  let spec: Record<string, unknown>
  try {
    spec = JSON.parse(existingSpec) as Record<string, unknown>
  } catch {
    return undefined
  }

  const normalizedHeadlines = normalizeStringList(headlines)
  const normalizedDescriptions = normalizeStringList(descriptions)

  if (normalizedHeadlines.length > 0) {
    spec.titles = normalizedHeadlines.map((text) => ({ text }))
  }
  if (normalizedDescriptions.length > 0) {
    spec.bodies = normalizedDescriptions.map((text) => ({ text }))
  }

  const url = landingPageUrl.trim()
  if (url) {
    const linkUrls = Array.isArray(spec.link_urls)
      ? (spec.link_urls as Array<Record<string, unknown>>)
      : []
    if (linkUrls.length > 0) {
      spec.link_urls = linkUrls.map((entry, index) =>
        index === 0 ? { ...entry, website_url: url } : entry,
      )
    } else {
      spec.link_urls = [{ website_url: url }]
    }
  }

  return JSON.stringify(spec)
}

export const META_CTA_OPTIONS = [
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'BOOK_NOW', label: 'Book Now' },
  { value: 'BOOK_TRAVEL', label: 'Book Travel' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'GET_OFFER', label: 'Get Offer' },
  { value: 'APPLY_NOW', label: 'Apply Now' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'SEND_MESSAGE', label: 'Send Message' },
  { value: 'WATCH_MORE', label: 'Watch More' },
  { value: 'GET_QUOTE', label: 'Get Quote' },
  { value: 'SUBSCRIBE', label: 'Subscribe' },
] as const
