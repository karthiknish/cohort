import { Errors } from '../../../../../errors'
import { adsOperationHandlers } from '../ads/index'
import { reportOperationHandlers } from '../ads/reports'
import { summarizeAnalyticsPerformanceHandler } from '../analyticsSummary'
import { clientOperationHandlers } from '../clients/index'
import { meetingOperationHandlers } from '../meetings/index'
import { projectOperationHandlers } from '../projects/index'
import { proposalOperationHandlers } from '../proposals/index'
import { socialOperationHandlers } from '../socials/index'
import { taskOperationHandlers } from '../tasks/index'
import type { OperationHandler, OperationResult } from '../../types'
import {
  buildSpreadsheetExportFromOperationData,
  type SpreadsheetExportPayload,
} from './builders'
import { asNonEmptyString } from '../../helpers'
import {
  extractClientReferenceFromIntent,
  normalizeIntentText,
  resolveSpreadsheetSourceFromMessage,
} from '../../helpers/intents/parsing'

type SpreadsheetSource =
  | 'ads'
  | 'analytics'
  | 'social'
  | 'tasks'
  | 'clientTasks'
  | 'clients'
  | 'projects'
  | 'proposals'
  | 'meetings'
  | 'report'

function resolveSpreadsheetSource(
  params: Record<string, unknown>,
  rawMessage: string,
  context?: { activeClientId?: string | null },
): SpreadsheetSource | null {
  const explicit = asNonEmptyString(params.source)?.toLowerCase()
  if (explicit === 'ads') return 'ads'
  if (explicit === 'analytics') return 'analytics'
  if (explicit === 'social') return 'social'
  if (explicit === 'tasks') return 'tasks'
  if (explicit === 'clienttasks' || explicit === 'client_tasks') return 'clientTasks'
  if (explicit === 'clients') return 'clients'
  if (explicit === 'projects') return 'projects'
  if (explicit === 'proposals') return 'proposals'
  if (explicit === 'meetings') return 'meetings'
  if (explicit === 'report') return 'report'

  const normalized = normalizeIntentText(rawMessage)
  const inferred = resolveSpreadsheetSourceFromMessage(
    normalized,
    context,
    extractClientReferenceFromIntent(rawMessage),
  )
  if (inferred === 'clientTasks') return 'clientTasks'
  if (inferred === 'tasks') return 'tasks'
  if (inferred === 'clients') return 'clients'
  if (inferred === 'projects') return 'projects'
  if (inferred === 'proposals') return 'proposals'
  if (inferred === 'meetings') return 'meetings'
  if (inferred === 'social') return 'social'
  if (inferred === 'analytics') return 'analytics'
  if (inferred === 'ads') return 'ads'
  if (inferred === 'report') return 'report'
  return null
}

function operationForSource(source: SpreadsheetSource): string {
  switch (source) {
    case 'ads':
      return 'summarizeAdsPerformance'
    case 'analytics':
      return 'summarizeAnalyticsPerformance'
    case 'social':
      return 'summarizeSocialPerformance'
    case 'tasks':
      return 'summarizeMyTasks'
    case 'clientTasks':
      return 'summarizeClientTasks'
    case 'clients':
      return 'listWorkspaceClients'
    case 'projects':
      return 'listActiveProjects'
    case 'proposals':
      return 'listProposals'
    case 'meetings':
      return 'summarizeMeetings'
    case 'report':
      return 'generatePerformanceReport'
  }
}

async function runSourceOperation(
  ctx: Parameters<OperationHandler>[0],
  source: SpreadsheetSource,
  input: Parameters<OperationHandler>[1],
): Promise<OperationResult> {
  switch (source) {
    case 'ads': {
      const handler = adsOperationHandlers.summarizeAdsPerformance
      if (!handler) throw Errors.base.internal('summarizeAdsPerformance handler missing')
      return handler(ctx, input)
    }
    case 'analytics':
      return summarizeAnalyticsPerformanceHandler(ctx, input)
    case 'social': {
      const handler = socialOperationHandlers.summarizeSocialPerformance
      if (!handler) throw Errors.base.internal('summarizeSocialPerformance handler missing')
      return handler(ctx, input)
    }
    case 'tasks': {
      const handler = taskOperationHandlers.summarizeMyTasks
      if (!handler) throw Errors.base.internal('summarizeMyTasks handler missing')
      return handler(ctx, {
        ...input,
        params: { ...input.params, mode: input.params.mode ?? 'list' },
      })
    }
    case 'clientTasks': {
      const handler = taskOperationHandlers.summarizeClientTasks
      if (!handler) throw Errors.base.internal('summarizeClientTasks handler missing')
      return handler(ctx, {
        ...input,
        params: { ...input.params, mode: input.params.mode ?? 'list' },
      })
    }
    case 'clients': {
      const handler = clientOperationHandlers.listWorkspaceClients
      if (!handler) throw Errors.base.internal('listWorkspaceClients handler missing')
      return handler(ctx, input)
    }
    case 'projects': {
      const handler = projectOperationHandlers.listActiveProjects
      if (!handler) throw Errors.base.internal('listActiveProjects handler missing')
      return handler(ctx, input)
    }
    case 'proposals': {
      const handler = proposalOperationHandlers.listProposals
      if (!handler) throw Errors.base.internal('listProposals handler missing')
      return handler(ctx, input)
    }
    case 'meetings': {
      const handler = meetingOperationHandlers.summarizeMeetings
      if (!handler) throw Errors.base.internal('summarizeMeetings handler missing')
      return handler(ctx, input)
    }
    case 'report': {
      const handler = reportOperationHandlers.generatePerformanceReport
      if (!handler) throw Errors.base.internal('generatePerformanceReport handler missing')
      return handler(ctx, input)
    }
  }
}

function attachSpreadsheetExport(
  operation: string,
  result: OperationResult,
): OperationResult {
  if (!result.success || !result.data) return result

  const spreadsheetExport = buildSpreadsheetExportFromOperationData(operation, result.data)
  if (!spreadsheetExport) {
    return {
      ...result,
      success: false,
      retryable: false,
      userMessage:
        'I pulled the data, but there was nothing to put in a spreadsheet for that window. Try another date range or connect the integration first.',
      data: {
        ...result.data,
        spreadsheetExport: null,
      },
    }
  }

  return {
    ...result,
    data: {
      ...result.data,
      spreadsheetExport,
    },
    userMessage: buildExportUserMessage(operation, spreadsheetExport, result.userMessage),
  }
}

function buildExportUserMessage(
  operation: string,
  payload: SpreadsheetExportPayload,
  fallback?: string,
): string {
  const base = fallback?.trim()
  if (operation === 'summarizeAdsPerformance') {
    return `${base ?? 'Ads data is ready.'} Download the Excel file below.`
  }
  if (operation === 'summarizeAnalyticsPerformance') {
    return `${base ?? 'Analytics data is ready.'} Download the Excel file below.`
  }
  if (operation === 'summarizeSocialPerformance') {
    return `${base ?? 'Social metrics are ready.'} Download the Excel file below.`
  }
  if (operation === 'summarizeMyTasks' || operation === 'summarizeClientTasks') {
    return `${base ?? 'Task list is ready.'} Download the Excel file below.`
  }
  if (operation === 'generatePerformanceReport') {
    return `${base ?? 'Report is ready.'} Download the Excel workbook below.`
  }
  return `${base ?? `${payload.title} is ready.`} Download the Excel file below.`
}

export const spreadsheetExportHandlers: Record<string, OperationHandler> = {
  async exportSpreadsheet(ctx, input) {
    const source = resolveSpreadsheetSource(input.params, input.rawMessage ?? '', input.context)
    if (!source) {
      return {
        success: false,
        retryable: false,
        data: { error: 'source_required' },
        userMessage:
          'I can export paid ads, analytics, social, tasks, clients, projects, proposals, meetings, or a performance report — which should I use?',
      }
    }

    const operation = operationForSource(source)
    const result = await runSourceOperation(ctx, source, input)
    return attachSpreadsheetExport(operation, result)
  },
}
