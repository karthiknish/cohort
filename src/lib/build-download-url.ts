/**
 * Wraps a cross-origin storage URL (R2, GCS) with the same-origin proxy
 * so the browser respects the `download` attribute and Content-Disposition
 * header. Without this, cross-origin `<a download="file.pptx">` links
 * ignore the filename and the file saves without an extension.
 *
 * The proxy at `/api/proxy/file` sets `Content-Disposition: attachment`
 * when a `filename` query param is provided, ensuring the correct extension.
 */
export function buildDownloadUrl(
  sourceUrl: string | null | undefined,
  filename: string,
): string | null {
  if (!sourceUrl) return null
  // Already a proxy URL — don't double-wrap
  if (sourceUrl.startsWith('/api/proxy/file') || sourceUrl.startsWith('/api/files/proxy')) {
    return sourceUrl
  }
  const params = new URLSearchParams({
    url: sourceUrl,
    filename,
    download: '1',
  })
  return `/api/proxy/file?${params.toString()}`
}
