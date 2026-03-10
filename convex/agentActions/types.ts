import type { ActionCtx } from '../_generated/server'

export type ProviderId = 'google' | 'tiktok' | 'linkedin' | 'facebook'
export type ReportPeriod = 'daily' | 'weekly' | 'monthly'

export type AgentRequestContextType = {
  previousMessages?: Array<{ type: 'user' | 'agent'; content: string }>
  activeProposalId?: string | null
  activeProjectId?: string | null
  activeClientId?: string | null
  attachmentContext?: Array<{
    name: string
    mimeType: string
    sizeLabel: string
    excerpt: string
    extractedText?: string
    extractionStatus: 'ready' | 'limited' | 'failed'
    errorMessage?: string
  }>
}

export type ParsedAgentResponse = {
  action: string
  route?: string
  message?: string
  operation?: string
  params?: Record<string, unknown>
}

export type OperationResult = {
  success: boolean
  data?: Record<string, unknown>
  route?: string
  retryable?: boolean
  userMessage?: string
}

export type JsonScalar = string | number | boolean | null
export type JsonLayer1 = JsonScalar | JsonScalar[] | Record<string, JsonScalar>
export type JsonLayer2 = JsonLayer1 | JsonLayer1[] | Record<string, JsonLayer1>
export type JsonRecord = Record<string, JsonLayer2>

export type OperationInput = {
  workspaceId: string
  userId: string
  conversationId: string
  params: Record<string, unknown>
  context?: AgentRequestContextType
  rawMessage?: string
}

export type OperationHandler = (ctx: ActionCtx, input: OperationInput) => Promise<OperationResult>

export type ConversationListResult = {
  conversations: Array<{
    legacyId: string
    title: string | null
    startedAt: number | null
    lastMessageAt: number | null
    messageCount: number
  }>
}

export type ConversationGetResult = {
  conversation: {
    userId: string
    startedAt: number | null
    lastMessageAt: number | null
    messageCount: number
  } | null
}

export type ConversationMessagesResult = {
  messages: Array<{
    legacyId: string
    type: 'user' | 'agent'
    content: string
    createdAt: number
    route: string | null
    action: string | null
    operation: string | null
    executeResult: Record<string, unknown> | null
  }>
}

export type DeterministicAgentIntent =
  | {
      action: 'navigate'
      route: string
      message: string
    }
  | {
      action: 'clarify'
      message: string
    }
  | {
      action: 'execute'
      operation: string
      params: Record<string, unknown>
      message?: string
    }

export const OPERATION_ALIASES: Record<string, string> = {
  senddirectmessage: 'sendDirectMessage',
  senddm: 'sendDirectMessage',
  directmessage: 'sendDirectMessage',
  sendmessage: 'sendDirectMessage',
  sendchat: 'sendDirectMessage',
  summarizeclienttasks: 'summarizeClientTasks',
  clienttasksummary: 'summarizeClientTasks',
  listclienttasks: 'summarizeClientTasks',
  listtasksforclient: 'summarizeClientTasks',
  createtask: 'createTask',
  addtask: 'createTask',
  remindme: 'createTask',
  updatetask: 'updateTask',
  edittask: 'updateTask',
  modifytask: 'updateTask',
  createproject: 'createProject',
  addproject: 'createProject',
  updateproject: 'updateProject',
  editproject: 'updateProject',
  createclient: 'createClient',
  addclient: 'createClient',
  addclientteammember: 'addClientTeamMember',
  addteammember: 'addClientTeamMember',
  createproposal: 'createProposalDraft',
  createproposaldraft: 'createProposalDraft',
  updateproposal: 'updateProposalDraft',
  updateproposaldraft: 'updateProposalDraft',
  generateproposal: 'generateProposalFromDraft',
  generateproposalfromdraft: 'generateProposalFromDraft',
  updatecampaignstatus: 'updateAdsCampaignStatus',
  updateadscampaignstatus: 'updateAdsCampaignStatus',
  updatecreativestatus: 'updateAdsCreativeStatus',
  updateadscreativestatus: 'updateAdsCreativeStatus',
  generateperformancereport: 'generatePerformanceReport',
  generatedailyreport: 'generatePerformanceReport',
  generateweeklyreport: 'generatePerformanceReport',
  generatemonthlyreport: 'generatePerformanceReport',
  summarizeadsperformance: 'summarizeAdsPerformance',
  summarizeadsmetrics: 'summarizeAdsPerformance',
  getadsmetricsnapshot: 'summarizeAdsPerformance',
  getmetaadmetrics: 'summarizeAdsPerformance',
  getfacebookadmetrics: 'summarizeAdsPerformance',
  adsnapshot: 'summarizeAdsPerformance',
}

export const PROPOSAL_STATUSES = new Set(['draft', 'in_progress', 'ready', 'partial_success', 'sent', 'failed'])
