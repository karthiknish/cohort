/**
 * Feature planning types for Kanban board in admin section
 */

import { getPriorityColor, getSemanticBadgeStyle, getStatusColor } from '@/lib/colors'

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

export function getFeatureStatusBadgeStyle(status: FeatureStatus): { backgroundColor: string; borderColor: string; color: string } {
  return getSemanticBadgeStyle(getStatusColor(status))
}

export function getFeaturePriorityBadgeStyle(priority: FeaturePriority): { backgroundColor: string; borderColor: string; color: string } {
  return getSemanticBadgeStyle(getPriorityColor(priority), 0.08)
}
