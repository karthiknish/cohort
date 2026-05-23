export type StorageUploadUrlPayload = {
  url: string
  key: string
  storageId?: string
}

export type UploadStorageFileOptions = {
  file: File | Blob
  contentType?: string
  generateUploadUrl: () => Promise<StorageUploadUrlPayload>
  syncMetadata: (args: { key: string }) => Promise<unknown>
  onProgress?: (progress: { loaded: number; total: number }) => void
}

async function uploadWithProgress(
  url: string,
  file: File,
  onProgress?: (progress: { loaded: number; total: number }) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        onProgress({ loaded: event.loaded, total: event.total })
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Failed to upload file: ${xhr.statusText}`))
      }
    }
    xhr.onerror = () => reject(new Error('Failed to upload file'))
    xhr.send(file)
  })
}

/**
 * Upload a file to Cloudflare R2 via Convex signed URLs.
 * Returns the persisted object reference (`r2:<key>`) stored in existing `storageId` fields.
 */
export async function uploadStorageFile({
  file,
  contentType,
  generateUploadUrl,
  syncMetadata,
  onProgress,
}: UploadStorageFileOptions): Promise<string> {
  const payload = await generateUploadUrl()
  const uploadUrl = payload.url?.trim()
  const key = payload.key?.trim()

  if (!uploadUrl || !key) {
    throw new Error('Unable to create upload URL')
  }

  const resolvedFile =
    file instanceof File
      ? file
      : new File([file], 'upload', {
          type: contentType || 'application/octet-stream',
        })

  await uploadWithProgress(uploadUrl, resolvedFile, onProgress)
  await syncMetadata({ key })

  if (payload.storageId?.trim()) {
    return payload.storageId.trim()
  }

  return `r2:${key}`
}
