/**
 * Feature planning types for Kanban board in admin section
 */

export const FEATURE_STATUSES = ['backlog', 'planned', 'in_progress', 'completed'] as const
export type FeatureStatus = typeof FEATURE_STATUSES[number]

export const FEATURE_PRIORITIES = ['low', 'medium', 'high'] as const
export type FeaturePriority = typeof FEATURE_PRIORITIES[number]

export interface FeatureReference {
  url: string
  label: string
}

export interface FeatureItem {
  id: string
  title: string
  description: string
  status: FeatureStatus
  priority: FeaturePriority
  imageUrl?: string | null
  references: FeatureReference[]
  createdAt: string
  updatedAt: string
}

export interface CreateFeatureInput {
  title: string
  description: string
  status: FeatureStatus
  priority: FeaturePriority
  imageUrl?: string | null
  references?: FeatureReference[]
}

export interface UpdateFeatureInput {
  title?: string
  description?: string
  status?: FeatureStatus
  priority?: FeaturePriority
  imageUrl?: string | null
  references?: FeatureReference[]
}

export const FEATURE_STATUS_LABELS: Record<FeatureStatus, string> = {
  backlog: 'Backlog',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
}

export const FEATURE_PRIORITY_LABELS: Record<FeaturePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const FEATURE_STATUS_COLORS: Record<FeatureStatus, string> = {
  backlog: 'bg-muted/50 text-muted-foreground',
  planned: 'bg-info/10 text-info border border-info/20',
  in_progress: 'bg-warning/10 text-warning border border-warning/20',
  completed: 'bg-success/10 text-success border border-success/20',
}

export const FEATURE_PRIORITY_COLORS: Record<FeaturePriority, string> = {
  low: 'border-info/20 text-info',
  medium: 'border-warning/20 text-warning',
  high: 'border-destructive/20 text-destructive',
}
