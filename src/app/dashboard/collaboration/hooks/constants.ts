// Collaboration hook constants

export const MAX_ATTACHMENTS = 5
export const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024 // 15MB

export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'csv',
  'txt',
  'zip',
  'md',
]

export const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
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
])

export const TYPING_TIMEOUT_MS = 8_000
export const TYPING_UPDATE_INTERVAL_MS = 2_500
export const THREAD_PAGE_SIZE = 50
export const MESSAGE_PAGE_SIZE = 100
export const REALTIME_MESSAGE_LIMIT = 200
