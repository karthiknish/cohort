'use client'

import { useAttachments } from './use-attachments'

interface UseAttachmentsDataOptions {
  userId: string | null
  workspaceId: string | null
}

export function useAttachmentsData({ userId, workspaceId }: UseAttachmentsDataOptions) {
  return useAttachments({ userId, workspaceId })
}
