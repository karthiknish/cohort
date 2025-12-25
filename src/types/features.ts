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
  backlog: 'bg-slate-100 text-slate-700',
  planned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

export const FEATURE_PRIORITY_COLORS: Record<FeaturePriority, string> = {
  low: 'border-slate-300 text-slate-600',
  medium: 'border-amber-300 text-amber-600',
  high: 'border-red-300 text-red-600',
}
