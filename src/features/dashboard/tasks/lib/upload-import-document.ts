const MAX_TASK_IMPORT_BYTES = 15 * 1024 * 1024

export async function uploadTaskImportDocument(args: {
  file: File
  generateUploadUrl: () => Promise<{ url: string }>
}): Promise<string> {
  const { file, generateUploadUrl } = args

  if (file.size > MAX_TASK_IMPORT_BYTES) {
    throw new Error('File is too large for import (max 15 MB).')
  }

  const { url: uploadUrl } = await generateUploadUrl()
  const contentType = file.type || 'application/octet-stream'

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file (${uploadResponse.status}).`)
  }

  const json = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null
  if (!json?.storageId) {
    throw new Error('Upload did not return a storage id.')
  }

  return json.storageId
}
