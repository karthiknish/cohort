import type { ProjectStatus } from '@/types/projects'

export type ProjectDocumentImportPhase =
  | 'idle'
  | 'dragging'
  | 'extracting'
  | 'analyzing'
  | 'review'
  | 'creating'
  | 'error'

export type ProjectClientStatus = 'resolved' | 'ambiguous' | 'unassigned' | 'preferred'

export type ProjectDateStatus = 'resolved' | 'missing' | 'unclear'

export type ProposedImportProject = {
  localId: string
  name: string
  description: string
  status: ProjectStatus
  clientId: string
  documentClientName: string | null
  clientStatus: ProjectClientStatus
  startDate: string
  endDate: string
  startDateStatus: ProjectDateStatus
  endDateStatus: ProjectDateStatus
  startDateHint: string | null
  endDateHint: string | null
  tags: string[]
  suggestions: string[]
  sourceExcerpt: string | null
  include: boolean
}

export type ProposedImportProjectFromServer = {
  name: string
  description: string | null
  status: ProjectStatus
  clientId: string | null
  documentClientName: string | null
  clientStatus: ProjectClientStatus
  startDateMs: number | null
  endDateMs: number | null
  startDateStatus: ProjectDateStatus
  endDateStatus: ProjectDateStatus
  startDateHint: string | null
  endDateHint: string | null
  tags: string[]
  suggestions: string[]
  sourceExcerpt: string | null
}
