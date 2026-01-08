import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

import { storage } from '@/lib/firebase'
import type { ExpenseAttachment } from '@/types/expenses'

const ALLOWED_RECEIPT_MIME_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
])

const MAX_RECEIPT_BYTES = 15 * 1024 * 1024

export async function uploadExpenseReceipt(args: {
  userId: string
  file: File
}): Promise<ExpenseAttachment> {
  const { userId, file } = args

  if (!userId) {
    throw new Error('userId is required')
  }

  if (!file) {
    throw new Error('file is required')
  }

  if (file.size > MAX_RECEIPT_BYTES) {
    throw new Error('Receipt is too large (max 15MB)')
  }

  const contentType = file.type || 'application/octet-stream'
  if (!ALLOWED_RECEIPT_MIME_TYPES.has(contentType)) {
    throw new Error('Unsupported receipt file type')
  }

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')
  const storagePath = `users/${userId}/expenses/${timestamp}-${safeName}`
  const fileRef = ref(storage, storagePath)

  await uploadBytes(fileRef, file, { contentType })
  const url = await getDownloadURL(fileRef)

  return {
    name: file.name,
    url,
    type: contentType,
    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
  }
}
