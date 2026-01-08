import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

import { storage } from '@/lib/firebase'
import type { TaskCommentAttachment } from '@/types/task-comments'

const ALLOWED_MIME_TYPES = new Set<string>([
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

const MAX_BYTES = 15 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '1 KB'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function uploadTaskCommentAttachment(args: {
  userId: string
  taskId: string
  file: File
}): Promise<TaskCommentAttachment> {
  const { userId, taskId, file } = args

  if (!userId) throw new Error('userId is required')
  if (!taskId) throw new Error('taskId is required')
  if (!file) throw new Error('file is required')

  if (file.size > MAX_BYTES) {
    throw new Error('Attachment is too large (max 15MB)')
  }

  const contentType = file.type || 'application/octet-stream'
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new Error('Unsupported attachment file type')
  }

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')
  const storagePath = `users/${userId}/tasks/${taskId}/${timestamp}-${safeName}`
  const fileRef = ref(storage, storagePath)

  await uploadBytes(fileRef, file, { contentType })
  const url = await getDownloadURL(fileRef)

  return {
    name: file.name,
    url,
    type: contentType,
    size: formatFileSize(file.size),
  }
}
