import type {
  ChecklistSubmission,
  ChecklistTemplate,
  CoverageAlert,
  DirectoryContact,
  HelpDeskRequest,
  KnowledgeArticle,
  KnowledgeCollection,
  RecognitionEntry,
  Shift,
  ShiftSwapRequest,
  TeamNode,
  TimeOffBalance,
  TimeOffRequest,
  TimeSession,
  TrainingModule,
  UpdatePost,
  FormFieldDefinition,
} from '@/types/workforce'

const PREVIEW_TIME_SUMMARY = {
  clockedInNow: '14',
  hoursThisWeek: '386.5',
  pendingApprovals: '6',
  flaggedSessions: '3',
}

const PREVIEW_TIME_SESSIONS: TimeSession[] = [
  { id: 'ts-1', personName: 'Maya Adler', role: 'Account lead', project: 'Novatech retention', status: 'clocked-in', startedAt: '08:12', endedAt: null, durationLabel: '4h 18m', locationLabel: 'Hybrid · Bengaluru', geofenceStatus: 'inside', breakDueInMinutes: 27 },
  { id: 'ts-2', personName: 'Sofia Reyes', role: 'Performance strategist', project: 'BlueOrbit launch sprint', status: 'on-break', startedAt: '07:56', endedAt: null, durationLabel: '3h 42m', locationLabel: 'Remote · Madrid', geofenceStatus: 'manual' },
  { id: 'ts-3', personName: 'James Liu', role: 'Creative ops', project: 'Meridian review pack', status: 'needs-review', startedAt: '06:40', endedAt: '10:14', durationLabel: '3h 34m', locationLabel: 'Client site · Singapore', geofenceStatus: 'outside', flaggedReason: 'Manual location override' },
  { id: 'ts-4', personName: 'Kiran Patel', role: 'Project manager', project: 'Northstar migration', status: 'clocked-out', startedAt: '05:48', endedAt: '13:11', durationLabel: '7h 23m', locationLabel: 'HQ · Bengaluru', geofenceStatus: 'inside' },
]

const PREVIEW_COVERAGE_ALERTS: CoverageAlert[] = [
  { id: 'ca-1', title: 'Two open Friday evening shifts', message: 'Campaign QA coverage drops below target after 6:00 PM across the launch pod.', severity: 'warning' },
  { id: 'ca-2', title: 'Approvals queue is stacking', message: 'Timecard review is waiting on one team lead and could slip payroll export.', severity: 'critical' },
  { id: 'ca-3', title: 'Scheduling confidence is healthy', message: 'Next week is fully staffed for client review windows and support coverage.', severity: 'info' },
]

const PREVIEW_SHIFTS: Shift[] = [
  { id: 'sh-1', title: 'Morning traffic monitoring', assignee: 'Sofia Reyes', team: 'Paid media', dayLabel: 'Mon', timeLabel: '08:00 - 12:00', coverageLabel: 'Primary owner assigned', status: 'scheduled', requiredStaff: 2, filledStaff: 2, canClaim: false },
  { id: 'sh-2', title: 'Client escalation desk', assignee: 'Open shift', team: 'Client success', dayLabel: 'Tue', timeLabel: '14:00 - 18:00', coverageLabel: 'Needs backup', status: 'open', requiredStaff: 2, filledStaff: 1, canClaim: true },
  { id: 'sh-3', title: 'Creative QA handoff', assignee: 'James Liu', team: 'Creative ops', dayLabel: 'Thu', timeLabel: '16:00 - 20:00', coverageLabel: 'Swap requested', status: 'swap-requested', requiredStaff: 2, filledStaff: 1, canClaim: false },
  { id: 'sh-4', title: 'Weekly launch room', assignee: 'Maya Adler', team: 'Delivery', dayLabel: 'Fri', timeLabel: '10:00 - 15:00', coverageLabel: 'Ready to publish', status: 'scheduled', requiredStaff: 3, filledStaff: 3, canClaim: false },
]

const PREVIEW_SHIFT_SWAPS: ShiftSwapRequest[] = [
  { id: 'ss-1', shiftTitle: 'Creative QA handoff', requestedBy: 'James Liu', requestedTo: 'Dan Wright', windowLabel: 'Thu · 16:00 - 20:00', status: 'pending' },
  { id: 'ss-2', shiftTitle: 'Client escalation desk', requestedBy: 'Ops manager', requestedTo: 'Maya Adler', windowLabel: 'Tue · 14:00 - 18:00', status: 'blocked' },
]

const PREVIEW_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  { id: 'ct-1', title: 'Campaign launch readiness', category: 'Delivery', completionRate: '92%', fieldsCount: 14, frequency: 'Every launch' },
  { id: 'ct-2', title: 'Weekly client status pulse', category: 'Client ops', completionRate: '88%', fieldsCount: 9, frequency: 'Weekly' },
  { id: 'ct-3', title: 'Creative upload QA', category: 'Creative ops', completionRate: '95%', fieldsCount: 11, frequency: 'Per asset batch' },
]

const PREVIEW_FORM_FIELDS: FormFieldDefinition[] = [
  { id: 'ff-1', label: 'Campaign owner', type: 'select', required: true },
  { id: 'ff-2', label: 'Tracking links verified', type: 'checklist', required: true },
  { id: 'ff-3', label: 'Screenshot proof', type: 'photo', required: false },
  { id: 'ff-4', label: 'Budget confirmation', type: 'number', required: true },
]

const PREVIEW_SUBMISSIONS: ChecklistSubmission[] = [
  { id: 'sub-1', templateTitle: 'Campaign launch readiness', submittedBy: 'Sofia Reyes', submittedAt: 'Today · 10:12', status: 'ready', scoreLabel: '14/14 complete' },
  { id: 'sub-2', templateTitle: 'Weekly client status pulse', submittedBy: 'Maya Adler', submittedAt: 'Today · 08:48', status: 'in-review', scoreLabel: '7/9 complete' },
  { id: 'sub-3', templateTitle: 'Creative upload QA', submittedBy: 'James Liu', submittedAt: 'Yesterday · 18:20', status: 'needs-follow-up', scoreLabel: '9/11 complete' },
]

const PREVIEW_UPDATES: UpdatePost[] = [
  { id: 'up-1', title: 'Q2 review week staffing plan', audience: 'All delivery leads', summary: 'Final review windows, escalation owners, and support coverage for review week.', scheduledFor: 'Live now', readCount: '18/24 read', status: 'live' },
  { id: 'up-2', title: 'Travel policy refresh', audience: 'Operations and client success', summary: 'Updated reimbursement caps and submission rules for on-site client work.', scheduledFor: 'Tomorrow · 09:00', readCount: 'Scheduled', status: 'scheduled' },
  { id: 'up-3', title: 'New launch checklist v2', audience: 'Paid media pod', summary: 'Draft note summarizing the new readiness checklist and approval threshold.', scheduledFor: 'Draft', readCount: 'Draft', status: 'draft' },
]

const PREVIEW_DIRECTORY: DirectoryContact[] = [
  { id: 'dc-1', name: 'Maya Adler', role: 'Account lead', team: 'Client success', location: 'Bengaluru', timezone: 'IST', email: 'maya@cohorts.example', focus: 'Executive client reviews' },
  { id: 'dc-2', name: 'Sofia Reyes', role: 'Performance strategist', team: 'Paid media', location: 'Madrid', timezone: 'CET', email: 'sofia@cohorts.example', focus: 'Google and Meta launches' },
  { id: 'dc-3', name: 'James Liu', role: 'Creative ops manager', team: 'Creative ops', location: 'Singapore', timezone: 'SGT', email: 'james@cohorts.example', focus: 'Asset QA and approvals' },
  { id: 'dc-4', name: 'Dan Wright', role: 'Operations manager', team: 'Operations', location: 'Chicago', timezone: 'CST', email: 'dan@cohorts.example', focus: 'Coverage planning and escalations' },
]

const PREVIEW_TEAM_TREE: TeamNode[] = [
  { id: 'tt-1', name: 'Delivery pod', lead: 'Maya Adler', members: 8, summary: 'Owns launches, review prep, and client communication coverage.' },
  { id: 'tt-2', name: 'Creative ops', lead: 'James Liu', members: 5, summary: 'Handles production QA, asset routing, and submission checks.' },
  { id: 'tt-3', name: 'Operations', lead: 'Dan Wright', members: 4, summary: 'Manages coverage planning, workflows, and internal support.' },
]

const PREVIEW_COLLECTIONS: KnowledgeCollection[] = [
  { id: 'kc-1', title: 'Launch playbooks', articleCount: 12, owner: 'Paid media ops', summary: 'Step-by-step launch patterns, QA lists, and escalation rules.' },
  { id: 'kc-2', title: 'Client communication', articleCount: 8, owner: 'Client success', summary: 'Review cadence, handoff notes, and standard messaging templates.' },
  { id: 'kc-3', title: 'Operations handbook', articleCount: 15, owner: 'Ops leadership', summary: 'Coverage policy, travel rules, and service expectations.' },
]

const PREVIEW_ARTICLES: KnowledgeArticle[] = [
  { id: 'ka-1', title: 'How launch readiness is approved', collection: 'Launch playbooks', updatedAt: 'Updated 2 days ago', owner: 'Sofia Reyes', status: 'published' },
  { id: 'ka-2', title: 'Escalation matrix for review week', collection: 'Operations handbook', updatedAt: 'Updated yesterday', owner: 'Dan Wright', status: 'needs-review' },
  { id: 'ka-3', title: 'Client recap template', collection: 'Client communication', updatedAt: 'Updated 5 days ago', owner: 'Maya Adler', status: 'draft' },
]

const PREVIEW_HELP_REQUESTS: HelpDeskRequest[] = [
  { id: 'hd-1', title: 'Laptop replacement approval', requester: 'Kiran Patel', queue: 'IT and equipment', priority: 'medium', status: 'open', slaLabel: 'Due in 6h' },
  { id: 'hd-2', title: 'Access to retained client docs', requester: 'Maya Adler', queue: 'Operations', priority: 'high', status: 'pending', slaLabel: 'Waiting on owner' },
  { id: 'hd-3', title: 'Travel reimbursement follow-up', requester: 'James Liu', queue: 'Finance ops', priority: 'low', status: 'resolved', slaLabel: 'Closed today' },
]

const PREVIEW_TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'tm-1',
    title: 'New account lead onboarding',
    audience: 'Client success',
    progressLabel: '6 assigned',
    completionRate: '74%',
    lessons: [
      { id: 'tl-1', title: 'Review-week operating model', durationLabel: '12 min', format: 'video' },
      { id: 'tl-2', title: 'Escalation routing', durationLabel: '9 min', format: 'playbook' },
      { id: 'tl-3', title: 'Handoff quality quiz', durationLabel: '6 min', format: 'quiz' },
    ],
  },
  {
    id: 'tm-2',
    title: 'Creative QA certification',
    audience: 'Creative ops',
    progressLabel: '4 assigned',
    completionRate: '88%',
    lessons: [
      { id: 'tl-4', title: 'Asset checklist walkthrough', durationLabel: '11 min', format: 'video' },
      { id: 'tl-5', title: 'Upload exception policy', durationLabel: '7 min', format: 'playbook' },
    ],
  },
]

const PREVIEW_TIME_OFF_BALANCES: TimeOffBalance[] = [
  { id: 'tb-1', label: 'Annual leave', used: '7 days used', remaining: '11 days left' },
  { id: 'tb-2', label: 'Flex days', used: '1 day used', remaining: '3 days left' },
  { id: 'tb-3', label: 'Sick leave', used: '2 days used', remaining: '6 days left' },
]

const PREVIEW_TIME_OFF_REQUESTS: TimeOffRequest[] = [
  { id: 'tr-1', personName: 'Sofia Reyes', type: 'Annual leave', windowLabel: 'Apr 18 - Apr 22', status: 'pending', approver: 'Dan Wright' },
  { id: 'tr-2', personName: 'Maya Adler', type: 'Flex day', windowLabel: 'Apr 12', status: 'approved', approver: 'Dan Wright' },
  { id: 'tr-3', personName: 'James Liu', type: 'Sick leave', windowLabel: 'Apr 03', status: 'declined', approver: 'Dan Wright' },
]

const PREVIEW_RECOGNITION: RecognitionEntry[] = [
  { id: 're-1', personName: 'Maya Adler', title: 'Kept review week on track', summary: 'Closed a last-minute coverage gap and kept the client review calendar intact.', team: 'Client success', awardedAt: 'Today' },
  { id: 're-2', personName: 'James Liu', title: 'Raised asset quality bar', summary: 'Updated the QA template and cut revision loops across two active accounts.', team: 'Creative ops', awardedAt: 'Yesterday' },
  { id: 're-3', personName: 'Sofia Reyes', title: 'Shared a reusable launch playbook', summary: 'Documented the paid media rollout pattern now used across three client pods.', team: 'Paid media', awardedAt: 'This week' },
]

export function getPreviewTimeSummary() {
  return PREVIEW_TIME_SUMMARY
}

export function getPreviewTimeSessions() {
  return PREVIEW_TIME_SESSIONS
}

export function getPreviewCoverageAlerts() {
  return PREVIEW_COVERAGE_ALERTS
}

export function getPreviewShifts() {
  return PREVIEW_SHIFTS
}

export function getPreviewShiftSwaps() {
  return PREVIEW_SHIFT_SWAPS
}

export function getPreviewChecklistTemplates() {
  return PREVIEW_CHECKLIST_TEMPLATES
}

export function getPreviewFormFields() {
  return PREVIEW_FORM_FIELDS
}

export function getPreviewChecklistSubmissions() {
  return PREVIEW_SUBMISSIONS
}

export function getPreviewUpdates() {
  return PREVIEW_UPDATES
}

export function getPreviewDirectoryContacts() {
  return PREVIEW_DIRECTORY
}

export function getPreviewTeamTree() {
  return PREVIEW_TEAM_TREE
}

export function getPreviewKnowledgeCollections() {
  return PREVIEW_COLLECTIONS
}

export function getPreviewKnowledgeArticles() {
  return PREVIEW_ARTICLES
}

export function getPreviewHelpDeskRequests() {
  return PREVIEW_HELP_REQUESTS
}

export function getPreviewTrainingModules() {
  return PREVIEW_TRAINING_MODULES
}

export function getPreviewTimeOffBalances() {
  return PREVIEW_TIME_OFF_BALANCES
}

export function getPreviewTimeOffRequests() {
  return PREVIEW_TIME_OFF_REQUESTS
}

export function getPreviewRecognitionEntries() {
  return PREVIEW_RECOGNITION
}
