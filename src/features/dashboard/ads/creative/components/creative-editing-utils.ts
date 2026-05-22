import { META_CTA_LABELS } from '@/services/integrations/meta-ads/meta-call-to-action'

import type { Creative } from './types'
import { normalizeCreativeCtaValue } from './helpers'

export function normalizeStringList(items: string[]): string[] {
  return items.flatMap((item) => {
    const trimmed = item.trim()
    return trimmed ? [trimmed] : []
  })
}

export function listsEqual(a: string[], b: string[]): boolean {
  const na = normalizeStringList(a)
  const nb = normalizeStringList(b)
  return na.length === nb.length && na.every((value, index) => value === nb[index])
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
  if (
    normalizeCreativeCtaValue(edited.cta)
    !== normalizeCreativeCtaValue(creative.callToAction)
  ) {
    return true
  }
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

export const META_CTA_OPTIONS = (
  [
    'LEARN_MORE',
    'SHOP_NOW',
    'SIGN_UP',
    'BOOK_NOW',
    'BOOK_TRAVEL',
    'DOWNLOAD',
    'GET_OFFER',
    'APPLY_NOW',
    'CONTACT_US',
    'SEND_MESSAGE',
    'WATCH_MORE',
    'GET_QUOTE',
    'SUBSCRIBE',
    'ORDER_NOW',
    'GET_DIRECTIONS',
  ] as const
).map((value) => ({
  value,
  label: META_CTA_LABELS[value] ?? value,
}))
