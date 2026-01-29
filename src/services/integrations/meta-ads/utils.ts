/**
 * META ADS UTILITIES - Helper functions for Meta Ads integration
 */

/**
 * Meta CDN URLs often contain quality parameters that reduce image quality.
 * This function optimizes the URL to request higher quality images.
 *
 * Common Meta CDN parameters:
 * - ccb=1-7: Content buffering/quality (higher = better quality, default is often 1-2)
 * - stp=...: Scaling type parameters with embedded quality settings
 *   Example: stp=c0.5000x0.5000f_dst-emg0_p64x64_q75_tt6
 *   - p64x64, p1080x1080: Size constraints (pWIDTHxHEIGHT)
 *   - q75, q80: Quality percentage (75-100, higher is better)
 *   - dst-emg0: Emergency mode compression (reduces quality)
 *   - tt6, tt1: Thumbnail type indicators
 * - URL path patterns:
 *   - /v/t45.1600-4/ - Ads thumbnail endpoint (low quality)
 *   - /v/t39.30808-6/ - Standard image endpoint (better quality)
 *
 * @param imageUrl - The original Meta CDN image URL
 * @returns Optimized URL with higher quality settings
 */
export function optimizeMetaImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined

  try {
    const url = new URL(imageUrl)
    const params = url.searchParams

    // AGGRESSIVE: Always remove stp parameter for ads images
    // stp contains thumbnail constraints that Meta's CDN enforces
    const stp = params.get('stp')
    if (stp) {
      // Check if this is a thumbnail URL (contains tt, dst, p#x#, q#)
      const isThumbnail = /tt\d+|dst|p\d+x\d+|q\d+/.test(stp)

      if (isThumbnail) {
        // Remove stp entirely for thumbnail URLs to get full quality
        params.delete('stp')
      }
    }

    // Remove all quality-limiting parameters
    params.delete('dst') // Remove destination parameter
    params.delete('tp') // Remove thumbnail parameter
    params.delete('nc_tp') // Remove another thumbnail param

    // Remove any explicit width/height constraints
    params.delete('w')
    params.delete('h')
    params.delete('width')
    params.delete('height')

    // Set higher quality content buffering
    params.set('ccb', '1-7')

    // Handle the URL path - convert thumbnail endpoint to standard endpoint
    // /v/t45.1600-4/ is the ads thumbnail endpoint
    // We can try to remove the thumbnail suffix or let Meta CDN handle it
    const pathname = url.pathname

    // For t45 ads thumbnail URLs, we need to accept them but optimize the params
    // The full image would require a different API call with full_picture field

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
