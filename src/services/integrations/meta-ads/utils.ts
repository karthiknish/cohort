/**
 * META ADS UTILITIES - Helper functions for Meta Ads integration
 */

/**
 * Meta CDN URLs often contain quality parameters that reduce image quality.
 * This function optimizes the URL to request higher quality images.
 * 
 * IMPORTANT: Meta CDN URLs with `oh` and `oe` parameters are cryptographically signed.
 * ANY modification to these URLs will invalidate the signature and cause 403 errors.
 * For signed URLs, this function returns them unchanged.
 *
 * Common Meta CDN parameters:
 * - ccb=1-7: Content buffering/quality (higher = better quality)
 * - stp=...: Scaling type parameters with embedded quality settings
 *   Example: stp=c0.5000x0.5000f_dst-emg0_p64x64_q75_tt6
 * - URL path patterns:
 *   - /v/t45.1600-4/ - Ads thumbnail endpoint
 *   - /v/t39.30808-6/ - Standard image endpoint
 *   - /v/t51.29350-10/ - Instagram thumbnail endpoint
 * 
 * @param imageUrl - The original Meta CDN image URL
 * @returns Optimized URL, or original if signed/unchanged
 */
export function optimizeMetaImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined

  try {
    const url = new URL(imageUrl)
    const params = url.searchParams

    // Check if URL is cryptographically signed
    // Signed URLs have `oh` (object hash) and `oe` (object expiration) params
    // ANY modification to signed URLs invalidates the signature
    const isSigned = params.has('oh') && params.has('oe')
    
    if (isSigned) {
      // DO NOT modify signed URLs - return as-is
      // Modifying them causes "URL signature mismatch" errors (403)
      return imageUrl
    }

    // For UNSIGNED URLs, we can safely optimize
    const stp = params.get('stp')
    if (stp) {
      let optimizedStp = stp

      // Upgrade to larger size
      optimizedStp = optimizedStp.replace(/p\d+x\d+/g, 'p1080x1080')
      // Upgrade quality to max
      optimizedStp = optimizedStp.replace(/q\d+/g, 'q100')
      // Remove thumbnail type indicators
      optimizedStp = optimizedStp.replace(/tt\d+/g, '')
      // Remove emergency mode compression
      optimizedStp = optimizedStp.replace(/dst-emg\d*/g, '')
      // Clean up
      optimizedStp = optimizedStp.replace(/_+/g, '_')
      optimizedStp = optimizedStp.replace(/^_+|_+$/g, '')

      if (optimizedStp && optimizedStp !== stp) {
        params.set('stp', optimizedStp)
      }
    }

    // Set higher quality content buffering
    params.set('ccb', '1-7')
    
    // Remove sizing constraints (safe for unsigned URLs)
    params.delete('w')
    params.delete('h')
    params.delete('width')
    params.delete('height')
    
    // Remove other quality-limiting params
    params.delete('dst')
    params.delete('tp')
    params.delete('nc_tp')

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

/**
 * Check if an image URL is a signed Meta thumbnail
 * Signed thumbnails cannot be modified without breaking the URL
 */
export function isSignedMetaThumbnail(url?: string): boolean {
  if (!url) return false
  try {
    const urlObj = new URL(url)
    const params = urlObj.searchParams
    const isSigned = params.has('oh') && params.has('oe')
    const isThumbnail = urlObj.pathname.includes('/t45.') || urlObj.pathname.includes('/t51.')
    return isSigned && isThumbnail
  } catch {
    return false
  }
}
