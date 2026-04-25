export type WorkforceRouteId =
  | 'time'
  | 'scheduling'
  | 'forms'
  | 'time-off'

export type WorkforceVisibility = 'admin' | 'team' | 'client'

export type TimeSessionStatus = 'clocked-in' | 'on-break' | 'clocked-out' | 'needs-review'

export type TimeSessionManagerReview = 'none' | 'pending' | 'approved' | 'rejected'

export interface TimeSession {
  id: string
  personName: string
  role: string
  project: string
  status: TimeSessionStatus
  startedAt: string
  endedAt: string | null
  durationLabel: string
  locationLabel: string
  geofenceStatus?: 'inside' | 'outside' | 'manual'
  breakDueInMinutes?: number
  flaggedReason?: string
  managerReview?: TimeSessionManagerReview
  approvedByName?: string | null
  managerNote?: string | null
}

export interface CoverageAlert {
  id: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
}

export interface Shift {
  id: string
  title: string
  assignee: string
  team: string
  dayLabel: string
  timeLabel: string
  coverageLabel: string
  status: 'scheduled' | 'open' | 'swap-requested'
  requiredStaff?: number
  filledStaff?: number
  canClaim?: boolean
  locationLabel?: string
  notes?: string
  conflictWithTimeOff?: string
  conflictWithAvailability?: string
}

export interface ShiftSwapRequest {
  id: string
  shiftTitle: string
  requestedBy: string
  requestedTo: string
  windowLabel: string
  status: 'pending' | 'approved' | 'blocked'
}

export interface ChecklistTemplate {
  id: string
  title: string
  category: string
  completionRate: string
  fieldsCount: number
  frequency: string
}

export interface ChecklistSubmission {
  id: string
  templateTitle: string
  submittedBy: string
  submittedAt: string
  status: 'ready' | 'needs-follow-up' | 'in-review'
  scoreLabel: string
}

export interface FormFieldDefinition {
  id: string
  label: string
  type: 'text' | 'select' | 'photo' | 'checklist' | 'number'
  required: boolean
}

export interface UpdatePost {
  id: string
  title: string
  audience: string
  summary: string
  scheduledFor: string
  readCount: string
  status: 'live' | 'scheduled' | 'draft'
}

export interface DirectoryContact {
  id: string
  name: string
  role: string
  team: string
  location: string
  timezone: string
  email: string
  focus: string
}

export interface TeamNode {
  id: string
  name: string
  lead: string
  members: number
  summary: string
}

export interface KnowledgeCollection {
  id: string
  title: string
  articleCount: number
  owner: string
  summary: string
}

export interface KnowledgeArticle {
  id: string
  title: string
  collection: string
  updatedAt: string
  owner: string
  status: 'published' | 'draft' | 'needs-review'
}

export interface HelpDeskRequest {
  id: string
  title: string
  requester: string
  queue: string
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'pending' | 'resolved'
  slaLabel: string
}

export interface TrainingLesson {
  id: string
  title: string
  durationLabel: string
  format: 'video' | 'playbook' | 'quiz'
}

export interface TrainingModule {
  id: string
  title: string
  audience: string
  progressLabel: string
  completionRate: string
  lessons: TrainingLesson[]
}

export interface TimeOffBalance {
  id: string
  label: string
  used: string
  remaining: string
}

export interface TimeOffRequest {
  id: string
  personName: string
  type: string
  windowLabel: string
  status: 'pending' | 'approved' | 'declined'
  approver: string
}

export interface RecognitionEntry {
  id: string
  personName: string
  title: string
  summary: string
  team: string
  awardedAt: string
}
