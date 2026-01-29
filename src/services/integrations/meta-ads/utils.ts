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

    // Check if this is a t45 ads thumbnail endpoint
    const isAdsThumbnail = url.pathname.includes('/t45.')

    if (isAdsThumbnail) {
      // For t45 thumbnail URLs, we need to modify stp carefully, not delete it
      // The t45 endpoint requires stp to function, but we can optimize within it
      const stp = params.get('stp')
      if (stp) {
        let optimizedStp = stp

        // Remove size constraints like p64x64, p1080x1080
        // Replace with larger size like p1080x1080 or remove the constraint
        optimizedStp = optimizedStp.replace(/p\d+x\d+/g, 'p1080x1080')

        // Upgrade quality to max
        optimizedStp = optimizedStp.replace(/q\d+/g, 'q100')

        // Remove emergency mode compression
        optimizedStp = optimizedStp.replace(/dst-emg\d*/g, '')

        // Clean up any double underscores left from removals
        optimizedStp = optimizedStp.replace(/_+/g, '_')

        params.set('stp', optimizedStp)
      }

      // Set higher quality content buffering
      params.set('ccb', '1-7')
    } else {
      // For non-thumbnail endpoints (t39, etc.), be more aggressive
      const stp = params.get('stp')
      if (stp) {
        const isThumbnail = /tt\d+|dst|p\d+x\d+|q\d+/.test(stp)
        if (isThumbnail) {
          params.delete('stp')
        }
      }

      // Remove all quality-limiting parameters
      params.delete('dst')
      params.delete('tp')
      params.delete('nc_tp')

      // Remove any explicit width/height constraints
      params.delete('w')
      params.delete('h')
      params.delete('width')
      params.delete('height')

      // Set higher quality content buffering
      params.set('ccb', '1-7')
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
