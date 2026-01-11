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
  generateUploadUrl: () => Promise<{ url: string }>
  getPublicUrl: (args: { storageId: string }) => Promise<{ url: string | null }>
}): Promise<ExpenseAttachment> {
  const { userId, file, generateUploadUrl, getPublicUrl } = args

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

  const { url: uploadUrl } = await generateUploadUrl()

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload file (${uploadResponse.status})`)
  }

  const json = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null
  if (!json?.storageId) {
    throw new Error('Upload did not return storageId')
  }

  const publicUrl = await getPublicUrl({ storageId: json.storageId })

  if (!publicUrl?.url) {
    throw new Error('Unable to resolve uploaded file URL')
  }

  return {
    name: file.name,
    url: publicUrl.url,
    type: contentType,
    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
  }
}
