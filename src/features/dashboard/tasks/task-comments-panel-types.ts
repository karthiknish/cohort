import type { TaskParticipant } from './task-types'

export type TaskCommentsPanelProps = {
  taskId: string
  workspaceId: string | null
  userId: string | null
  userName: string | null
  userRole: string | null
  participants: TaskParticipant[]
  onCommentCountChange?: (count: number) => void
}
