import type { CollaborationMessage } from '@/types/collaboration'

export type CollaborationFlattenedMessageItem =
  | { id: string; type: 'separator'; label: string }
  | { id: string; type: 'message'; message: CollaborationMessage; isFirstInGroup: boolean }
