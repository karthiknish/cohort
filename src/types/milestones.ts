export const MILESTONE_STATUSES = ['planned', 'in_progress', 'blocked', 'completed'] as const
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number]

export type MilestoneRecord = {
  id: string
  projectId: string
  title: string
  description: string | null
  status: MilestoneStatus
  startDate: string | null
  endDate: string | null
  ownerId: string | null
  order: number | null
  createdAt: string | null
  updatedAt: string | null
}
