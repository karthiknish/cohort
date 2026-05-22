import {
  buildAgentAttachmentContext,
  type AgentAttachmentContext,
  type ServerPdfExtractionResult,
} from '@/lib/agent-attachments'

const TASKS_DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx'])
const TASKS_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export function isTasksDocumentFile(file: File): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (TASKS_DOCUMENT_EXTENSIONS.has(extension)) return true
  return TASKS_DOCUMENT_MIME_TYPES.has(file.type)
}

export function filterTasksDocumentFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter(isTasksDocumentFile)
}

export function isFileDragEvent(event: DragEvent | React.DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

export async function extractTasksDocumentText(
  file: File,
  options: {
    extractPdfOnServer?: (file: File) => Promise<ServerPdfExtractionResult | null>
  } = {},
): Promise<AgentAttachmentContext> {
  const extracted = await buildAgentAttachmentContext(file, options)

  if (extracted.extractionStatus === 'failed') {
    const isLegacyDoc = file.name.toLowerCase().endsWith('.doc')
    throw new Error(
      extracted.errorMessage ??
        (isLegacyDoc
          ? 'Legacy .doc files are not supported. Save as .docx and try again.'
          : 'Could not read this document.'),
    )
  }

  const text = extracted.extractedText ?? extracted.excerpt
  if (!text.trim()) {
    throw new Error('Could not read any text from this document.')
  }

  return extracted
}

export function combineExtractedDocumentText(
  documents: Array<{ fileName: string; text: string }>,
): string {
  return documents
    .map((document, index) => `--- Document ${index + 1}: ${document.fileName} ---\n${document.text}`)
    .join('\n\n')
}
