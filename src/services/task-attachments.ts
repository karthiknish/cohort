import type { TaskAttachment } from '@/types/tasks'
import type { PendingAttachment } from '@/features/dashboard/collaboration/hooks/types'
import { uploadStorageFile } from '@/lib/upload-storage-file'

const ALLOWED_TASK_ATTACHMENT_MIME_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/zip',
  'application/x-zip-compressed',
])

const MAX_TASK_ATTACHMENT_BYTES = 15 * 1024 * 1024

export type PendingTaskAttachment = PendingAttachment

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '1 KB'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function buildPendingTaskAttachments(files: FileList): PendingTaskAttachment[] {
  const now = Date.now()

  return Array.from(files).map((file, index) => ({
    id: `${now}-${index}-${file.name}`,
    file,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeLabel: formatFileSize(file.size),
  }))
}

export async function uploadTaskAttachment(args: {
  userId: string
  file: File
  generateUploadUrl: () => Promise<{ url: string; key: string }>
  syncMetadata: (args: { key: string }) => Promise<unknown>
  getPublicUrl: (args: { storageId: string }) => Promise<{ url: string | null }>
}): Promise<TaskAttachment> {
  const { userId, file, generateUploadUrl, syncMetadata, getPublicUrl } = args

  if (!userId) throw new Error('userId is required')
  if (!file) throw new Error('file is required')

  if (file.size > MAX_TASK_ATTACHMENT_BYTES) {
    throw new Error('Attachment is too large (max 15MB)')
  }

  const contentType = file.type || 'application/octet-stream'
  if (!ALLOWED_TASK_ATTACHMENT_MIME_TYPES.has(contentType)) {
    throw new Error('Unsupported attachment file type')
  }

  const storageId = await uploadStorageFile({
    file,
    contentType,
    generateUploadUrl,
    syncMetadata,
  })

  const publicUrl = await getPublicUrl({ storageId })

  if (!publicUrl?.url) {
    throw new Error('Unable to resolve uploaded file URL')
  }

  return {
    name: file.name,
    url: publicUrl.url,
    type: contentType,
    size: formatFileSize(file.size),
  }
}
