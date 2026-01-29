/**
 * META ADS UTILITIES - Helper functions for Meta Ads integration
 */

/**
 * Meta CDN URLs often contain quality parameters that reduce image quality.
 * This function optimizes the URL to request higher quality images.
 *
 * Common Meta CDN parameters:
 * - ccb=1-7: Content buffering/quality (higher = better quality, default is often 1-2)
 * - _nc_sid: Session ID (can be ignored)
 * - _nc_ohc: Original content hash
 * - _nc_ht: Host
 * - st=100: Sometimes used for quality
 * - bytestrand=...
 *
 * @param imageUrl - The original Meta CDN image URL
 * @returns Optimized URL with higher quality settings
 */
export function optimizeMetaImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined

  try {
    const url = new URL(imageUrl)

    // Remove quality-limiting parameters and set higher quality
    const params = url.searchParams

    // Set higher quality content buffering (1-7 is max quality)
    params.set('ccb', '1-7')

    // Remove any explicit width/height constraints that might reduce quality
    params.delete('w')
    params.delete('h')
    params.delete('width')
    params.delete('height')

    // Some Meta URLs have 'stp' parameter for scaling type
    // 'dst-resp' can cause downscaling
    if (params.get('stp')?.includes('dst-resp')) {
      params.delete('stp')
    }

    return url.toString()
  } catch {
    // If URL parsing fails, return original
    return imageUrl
  }
}

/**
 * Determines if a URL is a Meta/Facebook CDN URL
 */
export function isMetaCdnUrl(url?: string): boolean {
  if (!url) return false
  return url.includes('fbcdn.net') || url.includes('facebook.com') || url.includes('instagram.com')
}
