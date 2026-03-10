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

export type AgentAttachmentContext = {
  id: string
  name: string
  mimeType: string
  sizeLabel: string
  excerpt: string
  extractedText?: string
  extractionStatus: 'ready' | 'limited' | 'failed'
  errorMessage?: string
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

  const parts: string[] = []
  for (const entryName of matchingNames) {
    const entry = zip.file(entryName)
    if (!entry) continue
    const raw = await entry.async('text')
    const cleaned = stripXmlLikeMarkup(raw)
    if (!cleaned) continue
    parts.push(cleaned)
    if (parts.join(' ').length >= MAX_ATTACHMENT_TEXT_LENGTH) break
  }

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
        errorMessage: 'PDF text extraction is limited here. Add a short instruction if the important fields are not obvious.',
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

export async function buildAgentAttachmentContext(file: File): Promise<AgentAttachmentContext> {
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
