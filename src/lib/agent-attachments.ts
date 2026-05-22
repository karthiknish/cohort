'use client'

const MAX_ATTACHMENT_TEXT_LENGTH = 12000
const MAX_ATTACHMENT_EXCERPT_LENGTH = 1800

const TEXT_MIME_TYPES = new Set([
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
  'application/xml',
  'text/xml',
  'text/html',
])

const ZIP_DOCUMENT_EXTENSIONS = new Set(['docx', 'pptx', 'xlsx', 'odt', 'ods', 'odp'])

const XML_ENTRY_PATTERNS: Record<string, RegExp[]> = {
  docx: [/^word\/document.xml$/],
  pptx: [/^ppt\/slides\/slide\d+\.xml$/],
  xlsx: [/^xl\/sharedStrings.xml$/, /^xl\/worksheets\/sheet\d+\.xml$/],
  odt: [/^content.xml$/],
  ods: [/^content.xml$/],
  odp: [/^content.xml$/],
}

export const AGENT_ATTACHMENT_ACCEPT = [
  '.txt',
  '.md',
  '.csv',
  '.json',
  '.xml',
  '.html',
  '.docx',
  '.pptx',
  '.xlsx',
  '.odt',
  '.ods',
  '.odp',
  '.pdf',
].join(',')

export type AgentAttachmentExtractionStatus = 'extracting' | 'ready' | 'limited' | 'failed'

export type AgentAttachmentContext = {
  id: string
  name: string
  mimeType: string
  sizeLabel: string
  excerpt: string
  extractedText?: string
  extractionStatus: AgentAttachmentExtractionStatus
  errorMessage?: string
}

export type AgentStoredAttachment = {
  id: string
  name: string
  mimeType: string
  sizeLabel: string
  excerpt: string
  extractedText?: string
  extractionStatus: Exclude<AgentAttachmentExtractionStatus, 'extracting'>
  errorMessage?: string
}

export function createPendingAttachmentPlaceholder(file: File): AgentAttachmentContext {
  return {
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeLabel: formatFileSize(file.size),
    excerpt: 'Reading file…',
    extractionStatus: 'extracting',
  }
}

function isPersistableAttachment(
  attachment: AgentAttachmentContext,
): attachment is AgentAttachmentContext & { extractionStatus: AgentStoredAttachment['extractionStatus'] } {
  return attachment.extractionStatus !== 'extracting'
}

export function serializeAgentAttachmentsForStorage(
  attachments: AgentAttachmentContext[],
): AgentStoredAttachment[] {
  return attachments.flatMap((attachment) => isPersistableAttachment(attachment)
    ? [{
        id: attachment.id,
        name: attachment.name,
        mimeType: attachment.mimeType,
        sizeLabel: attachment.sizeLabel,
        excerpt: attachment.excerpt,
        extractedText: attachment.extractedText,
        extractionStatus: attachment.extractionStatus,
        errorMessage: attachment.errorMessage,
      }]
    : [])
}

export function toAgentRequestAttachmentContext(
  attachments: AgentAttachmentContext[],
): Array<{
  name: string
  mimeType: string
  sizeLabel: string
  excerpt: string
  extractedText?: string
  extractionStatus: AgentStoredAttachment['extractionStatus']
  errorMessage?: string
}> {
  return attachments.flatMap((attachment) => isPersistableAttachment(attachment)
    ? [{
        name: attachment.name,
        mimeType: attachment.mimeType,
        sizeLabel: attachment.sizeLabel,
        excerpt: attachment.excerpt,
        extractedText: attachment.extractedText,
        extractionStatus: attachment.extractionStatus,
        errorMessage: attachment.errorMessage,
      }]
    : [])
}

export function parseAgentAttachmentsFromStored(value: unknown): AgentAttachmentContext[] | undefined {
  if (!Array.isArray(value)) return undefined

  const attachments: AgentAttachmentContext[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const id = typeof record.id === 'string' ? record.id : null
    const name = typeof record.name === 'string' ? record.name : null
    const mimeType = typeof record.mimeType === 'string' ? record.mimeType : 'application/octet-stream'
    const sizeLabel = typeof record.sizeLabel === 'string' ? record.sizeLabel : '—'
    const excerpt = typeof record.excerpt === 'string' ? record.excerpt : ''
    const status = record.extractionStatus
    if (!id || !name) continue
    if (status !== 'ready' && status !== 'limited' && status !== 'failed') continue

    attachments.push({
      id,
      name,
      mimeType,
      sizeLabel,
      excerpt,
      extractedText: typeof record.extractedText === 'string' ? record.extractedText : undefined,
      extractionStatus: status,
      errorMessage: typeof record.errorMessage === 'string' ? record.errorMessage : undefined,
    })
  }

  return attachments.length > 0 ? attachments : undefined
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '1 KB'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileExtension(fileName: string): string {
  const extension = fileName.split('.').pop()
  return typeof extension === 'string' ? extension.toLowerCase() : ''
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

function stripXmlLikeMarkup(value: string): string {
  return normalizeWhitespace(
    value
      .replace(/<\?xml[\s\S]*?\?>/gi, ' ')
      .replace(/<\/?(?:text|table|office|draw|style|svg):[^>]+>/gi, ' ')
      .replace(/<\/?[^>]+>/g, ' ')
  )
}

async function readPlainTextAttachment(file: File): Promise<string> {
  const raw = await file.text()
  return truncateText(normalizeWhitespace(raw), MAX_ATTACHMENT_TEXT_LENGTH)
}

async function readZipDocumentAttachment(file: File, extension: string): Promise<string> {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const entryPatterns = XML_ENTRY_PATTERNS[extension] ?? []
  const matchingNames = Object.keys(zip.files)
    .filter((name) => entryPatterns.some((pattern) => pattern.test(name)))
    .sort()

  const collectParts = async (index: number, parts: string[]): Promise<string[]> => {
    if (index >= matchingNames.length) return parts
    if (parts.join(' ').length >= MAX_ATTACHMENT_TEXT_LENGTH) return parts

    const entryName = matchingNames[index]
    if (!entryName) return collectParts(index + 1, parts)

    const entry = zip.file(entryName)
    if (!entry) return collectParts(index + 1, parts)

    const raw = await entry.async('text')
    const cleaned = stripXmlLikeMarkup(raw)
    if (!cleaned) return collectParts(index + 1, parts)

    return collectParts(index + 1, [...parts, cleaned])
  }

  const parts = await collectParts(0, [])

  return truncateText(normalizeWhitespace(parts.join(' ')), MAX_ATTACHMENT_TEXT_LENGTH)
}

async function extractTextFromAttachment(file: File): Promise<{
  extractedText?: string
  extractionStatus: AgentAttachmentContext['extractionStatus']
  errorMessage?: string
}> {
  const extension = getFileExtension(file.name)
  const mimeType = file.type || 'application/octet-stream'

  try {
    if (TEXT_MIME_TYPES.has(mimeType) || ['txt', 'md', 'csv', 'json', 'xml', 'html'].includes(extension)) {
      const extractedText = await readPlainTextAttachment(file)
      return extractedText
        ? { extractedText, extractionStatus: 'ready' }
        : { extractionStatus: 'failed', errorMessage: 'This file did not contain readable text.' }
    }

    if (ZIP_DOCUMENT_EXTENSIONS.has(extension)) {
      const extractedText = await readZipDocumentAttachment(file, extension)
      return extractedText
        ? { extractedText, extractionStatus: 'ready' }
        : { extractionStatus: 'failed', errorMessage: 'This document did not expose readable text.' }
    }

    if (extension === 'pdf' || mimeType === 'application/pdf') {
      return {
        extractionStatus: 'limited',
        errorMessage: 'PDF text could not be extracted. Add a short instruction if the important fields are not obvious.',
      }
    }

    return {
      extractionStatus: 'failed',
      errorMessage: 'This file type is not supported for context extraction yet.',
    }
  } catch (error) {
    return {
      extractionStatus: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unable to read this attachment.',
    }
  }
}

export async function readFileAsBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]!)
  }
  return btoa(binary)
}

export type ServerPdfExtractionResult = {
  extractionStatus: 'ready' | 'limited' | 'failed'
  extractedText?: string
  errorMessage?: string
}

export async function buildAgentAttachmentContext(
  file: File,
  options?: {
    extractPdfOnServer?: (file: File) => Promise<ServerPdfExtractionResult | null>
  },
): Promise<AgentAttachmentContext> {
  const extension = getFileExtension(file.name)
  const mimeType = file.type || 'application/octet-stream'

  if ((extension === 'pdf' || mimeType === 'application/pdf') && options?.extractPdfOnServer) {
    const serverResult = await options.extractPdfOnServer(file)
    if (serverResult) {
      const extractedText = serverResult.extractedText
      const excerptSource = extractedText ?? serverResult.errorMessage ?? 'Attached for reference.'
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${file.name}`,
        name: file.name,
        mimeType,
        sizeLabel: formatFileSize(file.size),
        excerpt: truncateText(excerptSource, MAX_ATTACHMENT_EXCERPT_LENGTH),
        extractedText,
        extractionStatus: serverResult.extractionStatus,
        errorMessage: serverResult.errorMessage,
      }
    }
  }

  const extracted = await extractTextFromAttachment(file)
  const extractedText = extracted.extractedText
  const excerptSource = extractedText ?? extracted.errorMessage ?? 'Attached for reference.'

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${file.name}`,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeLabel: formatFileSize(file.size),
    excerpt: truncateText(excerptSource, MAX_ATTACHMENT_EXCERPT_LENGTH),
    extractedText,
    extractionStatus: extracted.extractionStatus,
    errorMessage: extracted.errorMessage,
  }
}

export function hasUsableAttachmentContext(attachments: AgentAttachmentContext[]): boolean {
  return attachments.some((attachment) => attachment.extractionStatus === 'ready' && Boolean(attachment.extractedText))
}
