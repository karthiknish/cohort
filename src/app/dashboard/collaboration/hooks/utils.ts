// Collaboration hook utility functions

import type {
  CollaborationAttachment,
  CollaborationMention,
  CollaborationMessage,
  CollaborationMessageFormat,
  CollaborationReaction,
} from '@/types/collaboration'
import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions'
import type { Channel } from '../types'
import {
  MAX_ATTACHMENT_SIZE,
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_MIME_TYPES,
} from './constants'
import type { PendingAttachment, AttachmentValidationResult } from './types'
import { validateFile } from '@/lib/utils'
import { toISO, parseDate } from '@/lib/dates'

/**
 * Read session token from cookie
 */
export function readSessionTokenCookie(): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('cohorts_token='))

  if (!match) {
    return null
  }

  const value = match.split('=')[1]
  if (!value) {
    return null
  }

  try {
    const decoded = decodeURIComponent(value)
    return decoded.length > 0 ? decoded : null
  } catch (error) {
    console.warn('Failed to decode session token cookie', error)
    return null
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

/**
 * Validate a single attachment file
 */
export function validateAttachment(file: File): string | null {
  const validation = validateFile(file, {
    allowedTypes: Array.from(ALLOWED_ATTACHMENT_MIME_TYPES),
    maxSizeMb: MAX_ATTACHMENT_SIZE / (1024 * 1024),
  })

  if (!validation.valid) {
    // Fallback to extension check if MIME type is not recognized but extension is allowed
    const extension = file.name.toLowerCase().split('.').pop()
    if (extension && ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension)) {
      // If extension is allowed, we check size separately
      if (file.size > MAX_ATTACHMENT_SIZE) {
        return `File size exceeds ${formatFileSize(MAX_ATTACHMENT_SIZE)} limit`
      }
      return null
    }
    return validation.error || 'File type not supported'
  }

  return null
}

/**
 * Validate multiple attachments and return valid ones with errors
 */
export function validateAttachments(
  files: FileList | File[],
  currentCount: number,
  maxAttachments: number
): AttachmentValidationResult {
  const fileArray = Array.from(files)
  const valid: PendingAttachment[] = []
  const errors: string[] = []

  if (currentCount + fileArray.length > maxAttachments) {
    errors.push(`Maximum ${maxAttachments} attachments allowed per message`)
    return { valid, errors }
  }

  fileArray.forEach((file) => {
    const error = validateAttachment(file)
    if (error) {
      errors.push(`${file.name}: ${error}`)
    } else {
      valid.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        sizeLabel: formatFileSize(file.size),
        mimeType: file.type,
      })
    }
  })

  return { valid, errors }
}

/**
 * Convert Firestore timestamp or date to ISO string
 */
export function convertToIso(value: unknown): string | null {
  if (!value && value !== 0) {
    return null
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return toISO((value as { toDate: () => Date }).toDate())
  }

  if (typeof value === 'string') {
    const parsed = parseDate(value)
    return parsed ? toISO(parsed) : value
  }

  if (value instanceof Date) {
    return toISO(value)
  }

  return null
}

/**
 * Parse channel type from unknown value
 */
export function parseChannelType(value: unknown): Channel['type'] {
  if (value === 'client' || value === 'team' || value === 'project') {
    return value
  }
  return 'team'
}

/**
 * Parse message format from unknown value
 */
export function parseMessageFormat(value: unknown): CollaborationMessageFormat {
  if (value === 'markdown' || value === 'plaintext') {
    return value
  }
  return 'markdown'
}

/**
 * Sanitize attachment data from Firestore
 */
export function sanitizeAttachment(input: unknown): CollaborationAttachment | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as Record<string, unknown>
  const name = typeof data.name === 'string' ? data.name : null
  const url = typeof data.url === 'string' ? data.url : null

  if (!name || !url) {
    return null
  }

  return {
    name,
    url,
    type: typeof data.type === 'string' ? data.type : null,
    size: typeof data.size === 'string' ? data.size : null,
  }
}

/**
 * Sanitize mention data from Firestore
 */
export function sanitizeMention(input: unknown): CollaborationMention | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as Record<string, unknown>
  const slug = typeof data.slug === 'string' ? data.slug.trim() : null
  const name = typeof data.name === 'string' ? data.name.trim() : null

  if (!slug || !name) {
    return null
  }

  return {
    slug,
    name,
    role: typeof data.role === 'string' ? data.role : null,
  }
}

/**
 * Sanitize reaction data from Firestore
 */
export function sanitizeReaction(input: unknown): CollaborationReaction | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as Record<string, unknown>
  const emoji = typeof data.emoji === 'string' ? data.emoji : null

  if (!emoji || !COLLABORATION_REACTION_SET.has(emoji)) {
    return null
  }

  const userIdsRaw = Array.isArray(data.userIds) ? data.userIds : []
  const validUserIds = Array.from(
    new Set(
      userIdsRaw.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    )
  )

  const countFromUsers = validUserIds.length
  const count = typeof data.count === 'number' && Number.isFinite(data.count) 
    ? Math.max(0, Math.round(data.count)) 
    : countFromUsers

  if (countFromUsers === 0 && count <= 0) {
    return null
  }

  return {
    emoji,
    count: countFromUsers > 0 ? countFromUsers : count,
    userIds: validUserIds,
  }
}

