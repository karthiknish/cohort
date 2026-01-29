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
 *   - tt6, tt1: Thumbnail type
 * - _nc_sid, _nc_ohc, _nc_ht: Internal Meta params (preserve these for auth)
 *
 * @param imageUrl - The original Meta CDN image URL
 * @returns Optimized URL with higher quality settings
 */
export function optimizeMetaImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined

  try {
    const url = new URL(imageUrl)
    const params = url.searchParams

    // Set higher quality content buffering (1-7 is max quality)
    params.set('ccb', '1-7')

    // Handle the stp parameter which contains multiple quality/size settings
    // Format: stp=c0.5000x0.5000f_dst-emg0_p64x64_q75_tt6
    const stp = params.get('stp')
    if (stp) {
      let optimizedStp = stp

      // Remove size constraints like p64x64, p1080x1080, p200x200
      optimizedStp = optimizedStp.replace(/p\d+x\d+/g, '')

      // Remove emergency mode compression
      optimizedStp = optimizedStp.replace(/dst-emg\d*/g, '')

      // Upgrade quality to 95 (highest reasonable quality)
      optimizedStp = optimizedStp.replace(/q\d+/g, 'q95')

      // Remove the stp parameter entirely if it's causing issues
      // Meta serves higher quality images without aggressive stp settings
      if (optimizedStp.match(/^c[\d.]+f*_tt\d*$/) || optimizedStp.includes('tt6')) {
        params.delete('stp')
      } else if (optimizedStp && optimizedStp !== stp) {
        params.set('stp', optimizedStp)
      }
    }

    // Remove any explicit width/height constraints that might reduce quality
    params.delete('w')
    params.delete('h')
    params.delete('width')
    params.delete('height')

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
