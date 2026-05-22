export type ChatMediaAttachment = {
  name: string
  url: string
  type?: string | null
  size?: string | null
}

export type AttachmentKind = 'image' | 'video' | 'pdf' | 'audio' | 'spreadsheet' | 'archive' | 'file'
