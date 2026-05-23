import { uploadStorageFile } from '@/lib/upload-storage-file'

const MAX_TASK_IMPORT_BYTES = 15 * 1024 * 1024

export async function uploadTaskImportDocument(args: {
  file: File
  generateUploadUrl: () => Promise<{ url: string; key: string }>
  syncMetadata: (args: { key: string }) => Promise<unknown>
}): Promise<string> {
  const { file, generateUploadUrl, syncMetadata } = args

  if (file.size > MAX_TASK_IMPORT_BYTES) {
    throw new Error('File is too large for import (max 15 MB).')
  }

  return uploadStorageFile({
    file,
    contentType: file.type || 'application/octet-stream',
    generateUploadUrl,
    syncMetadata,
  })
}
