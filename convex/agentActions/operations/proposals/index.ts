import { mergeProposalForm } from '../../../../src/lib/proposals'
import { api } from '/_generated/api'
import type { ActionCtx } from '../../../_generated/server'
import {
  extractClientNameFromProposalRequest,
  getNextRequiredProposalPrompt,
  getProposalConversationPrompt,
  getProposalConversationPromptLabel,
  getProposalConversationStepProgress,
  parseProposalConversationAnswer,
  type ProposalConversationPromptId,
} from '../../helpers/proposalConversation'
import {
  asNonEmptyString,
  asNumber,
  asRecord,
  asString,
  mergeProposalPatch,
  normalizeProposalStatus,
  resolveClientIdFromParams,
  resolveProposalId,
  unwrapConvexResult,
} from '../../helpers'
import type { JsonRecord, OperationHandler, OperationInput, OperationResult } from '../../types'

function buildProposalDeckRoute(proposalId: string) {
  return `/dashboard/proposals/${encodeURIComponent(proposalId)}/deck`
}

async function runProposalGeneration(ctx: ActionCtx, input: OperationInput, proposalId: string): Promise<OperationResult> {
  const now = Date.now()
  await ctx.runMutation(api.proposals.update, {
    workspaceId: input.workspaceId,
    legacyId: proposalId,
    updatedAtMs: now,
    lastAutosaveAtMs: now,
    agentConversationId: input.conversationId,
    lastAgentInteractionAtMs: now,
  })

  const rawGeneration = await ctx.runAction(api.proposalGeneration.generateFromProposal, {
    workspaceId: input.workspaceId,
    legacyId: proposalId,
  })

  const generation = unwrapConvexResult(rawGeneration)
  const generationRecord = asRecord(generation)
  const status = asNonEmptyString(generationRecord?.status) ?? 'unknown'
  const success = status !== 'failed'
  const route = buildProposalDeckRoute(proposalId)

  return {
    success,
    route: success ? route : undefined,
    data: {
      proposalId,
      status,
      route,
      result: generationRecord ?? { value: generation },
    },
    userMessage: success
      ? status === 'in_progress'
        ? `I’ve started generating proposal ${proposalId}. You can open it here while it finishes.`
        : `Your proposal ${proposalId} is ready. You can open it here.`
      : `Proposal generation failed for ${proposalId}.`,
    retryable: !success,
  }
}

function findConversationProposal(records: unknown[], conversationId: string) {
  return records
    .map((record) => asRecord(record))
    .filter((record): record is Record<string, unknown> => Boolean(record))
    .filter((record) => asString(record.agentConversationId) === conversationId)
    .reduce<Record<string, unknown> | null>((latest, record) => {
      if (latest === null) {
        return record
      }

      return (asNumber(record.lastAgentInteractionAtMs) ?? 0) > (asNumber(latest.lastAgentInteractionAtMs) ?? 0)
        ? record
        : latest
    }, null)
}

function buildCollectingProposalResponse(args: {
  proposalId: string
  promptId: ProposalConversationPromptId
  clientName?: string | null
  stepProgress: number
  prefix?: string | null
}): OperationResult {
  const question = getProposalConversationPrompt(args.promptId)

  return {
    success: true,
    data: {
      proposalId: args.proposalId,
      clientName: args.clientName ?? null,
      stage: 'collecting',
      stepProgress: args.stepProgress,
      nextPromptId: args.promptId,
      nextPromptLabel: getProposalConversationPromptLabel(args.promptId),
    },
    userMessage: args.prefix ? `${args.prefix} ${question}` : question,
  }
}

export const proposalOperationHandlers: Record<string, OperationHandler> = {
  async createProposalDraft(ctx, input) {
    const now = Date.now()
    const formDataPatch = asRecord(input.params.formData) ?? {}
    const formData = mergeProposalForm(formDataPatch)
    const status = normalizeProposalStatus(input.params.status) ?? 'draft'
    const stepProgress = asNumber(input.params.stepProgress) ?? 0
    const clientId = asNonEmptyString(input.params.clientId) ?? asNonEmptyString(input.context?.activeClientId ?? null)
    const clientName = asNonEmptyString(input.params.clientName)

    const rawResult = await ctx.runMutation(api.proposals.create, {
      workspaceId: input.workspaceId,
      ownerId: input.userId,
      status,
      stepProgress,
      formData,
      clientId: clientId ?? null,
      clientName: clientName ?? null,
      agentConversationId: input.conversationId,
      lastAgentInteractionAtMs: now,
    })

    const unwrapped = unwrapConvexResult(rawResult)
    const record = asRecord(unwrapped)
    const proposalId = asNonEmptyString(record?.legacyId)

    return {
      success: true,
      data: { proposalId, status, stepProgress },
      userMessage: proposalId ? `Created proposal draft ${proposalId}.` : 'Created proposal draft.',
    }
  },

  async updateProposalDraft(ctx, input) {
    const proposalId = resolveProposalId(input.params, input.context)
    if (!proposalId) {
      return {
        success: false,
        data: { error: 'proposalId is required.' },
        userMessage: 'Tell me which proposal to update, or open it first and ask again.',
      }
    }

    const now = Date.now()
    const current = await ctx.runQuery(api.proposals.getByLegacyId, {
      workspaceId: input.workspaceId,
      legacyId: proposalId,
    })

    const currentRecord = asRecord(current)
    if (!currentRecord) {
      return {
        success: false,
        data: { error: 'Proposal not found.' },
        userMessage: `I could not find proposal ${proposalId}.`,
      }
    }

    const updateArgs: {
      workspaceId: string
      legacyId: string
      updatedAtMs: number
      lastAutosaveAtMs: number
      agentConversationId: string
      lastAgentInteractionAtMs: number
      formData?: JsonRecord
      status?: string
      stepProgress?: number
      clientId?: string | null
      clientName?: string | null
    } = {
      workspaceId: input.workspaceId,
      legacyId: proposalId,
      updatedAtMs: now,
      lastAutosaveAtMs: now,
      agentConversationId: input.conversationId,
      lastAgentInteractionAtMs: now,
    }

    const formPatch = asRecord(input.params.formPatch) ?? asRecord(input.params.formData)
    if (formPatch) {
      const mergedForm = mergeProposalPatch(asRecord(currentRecord.formData) ?? {}, formPatch)
      updateArgs.formData = mergedForm as JsonRecord
    }

    const status = normalizeProposalStatus(input.params.status)
    if (status) updateArgs.status = status

    const stepProgress = asNumber(input.params.stepProgress)
    if (stepProgress !== null) updateArgs.stepProgress = stepProgress

    if ('clientId' in input.params) updateArgs.clientId = asString(input.params.clientId)
    if ('clientName' in input.params) updateArgs.clientName = asString(input.params.clientName)

    const changedFields = Object.keys(updateArgs).filter(
      (field) => !['workspaceId', 'legacyId', 'updatedAtMs', 'lastAutosaveAtMs'].includes(field),
    )

    if (changedFields.length === 0) {
      return {
        success: false,
        data: { error: 'No valid proposal fields to update.' },
        userMessage: 'Tell me what to refine on the proposal (section fields, status, step progress, etc.).',
      }
    }

    await ctx.runMutation(api.proposals.update, updateArgs)

    return {
      success: true,
      data: { proposalId, updatedFields: changedFields },
      userMessage: 'Proposal draft updated.',
    }
  },

  async advanceProposalConversation(ctx, input) {
    const now = Date.now()
    const promptId = asNonEmptyString(input.params.promptId) as ProposalConversationPromptId | null
    const proposalList = await ctx.runQuery(api.proposals.list, {
      workspaceId: input.workspaceId,
      limit: 100,
    })
    const existingProposal = findConversationProposal(asRecord(proposalList)?.items as unknown[] ?? [], input.conversationId)

    let proposalId = asNonEmptyString(existingProposal?.legacyId)
    let clientId = asNonEmptyString(existingProposal?.clientId)
    let clientName = asNonEmptyString(existingProposal?.clientName)
    let formData = asRecord(existingProposal?.formData) ?? {}

    if (!proposalId) {
      const seededClientName = asNonEmptyString(extractClientNameFromProposalRequest(input.rawMessage ?? ''))
      const resolvedClient = await resolveClientIdFromParams(
        ctx,
        input.workspaceId,
        {
          clientId: input.params.clientId,
          clientName: input.params.clientName ?? seededClientName,
        },
        input.context,
      )

      clientId = asNonEmptyString(resolvedClient.clientId)
      clientName = asNonEmptyString(resolvedClient.clientName)
      formData = mergeProposalForm(clientName ? ({ company: { name: clientName } } as never) : {}) as unknown as Record<string, unknown>

      const created = unwrapConvexResult(
        await ctx.runMutation(api.proposals.create, {
          workspaceId: input.workspaceId,
          ownerId: input.userId,
          status: 'draft',
          stepProgress: getProposalConversationStepProgress({ clientId, clientName, formData }),
          formData: formData as JsonRecord,
          clientId: clientId ?? null,
          clientName: clientName ?? null,
          agentConversationId: input.conversationId,
          lastAgentInteractionAtMs: now,
        }),
      )

      proposalId = asNonEmptyString(asRecord(created)?.legacyId)
    }

    if (!proposalId) {
      return {
        success: false,
        data: { error: 'Unable to create proposal draft.' },
        userMessage: 'I couldn’t start that proposal draft. Please try again.',
      }
    }

    let mergedForm = mergeProposalForm(formData)

    if (promptId) {
      const parsed = parseProposalConversationAnswer(promptId, input.rawMessage ?? '')
      if (parsed.errorMessage) {
        return buildCollectingProposalResponse({
          proposalId,
          promptId,
          clientName,
          stepProgress: getProposalConversationStepProgress({ clientId, clientName, formData: mergedForm as Record<string, unknown> }),
          prefix: parsed.errorMessage,
        })
      }

      const updateArgs: {
        workspaceId: string
        legacyId: string
        updatedAtMs: number
        lastAutosaveAtMs: number
        agentConversationId: string
        lastAgentInteractionAtMs: number
        formData?: JsonRecord
        stepProgress?: number
        clientId?: string | null
        clientName?: string | null
      } = {
        workspaceId: input.workspaceId,
        legacyId: proposalId,
        updatedAtMs: now,
        lastAutosaveAtMs: now,
        agentConversationId: input.conversationId,
        lastAgentInteractionAtMs: now,
      }

      if (parsed.clientName) {
        const resolvedClient = await resolveClientIdFromParams(
          ctx,
          input.workspaceId,
          { clientName: parsed.clientName },
          input.context,
        )

        clientId = asNonEmptyString(resolvedClient.clientId)
        clientName = asNonEmptyString(resolvedClient.clientName) ?? parsed.clientName
        updateArgs.clientId = clientId ?? null
        updateArgs.clientName = clientName ?? null
        mergedForm = mergeProposalForm({
          ...mergedForm,
          company: {
            ...mergedForm.company,
            name: mergedForm.company.name || clientName || parsed.clientName,
          },
        })
      }

      if (parsed.formPatch) {
        mergedForm = mergeProposalPatch(mergedForm as Record<string, unknown>, parsed.formPatch as Record<string, unknown>) as typeof mergedForm
      }

      updateArgs.formData = mergedForm as JsonRecord
      updateArgs.stepProgress = getProposalConversationStepProgress({
        clientId,
        clientName,
        formData: mergedForm as Record<string, unknown>,
      })

      await ctx.runMutation(api.proposals.update, updateArgs)
    }

    const nextRequiredPrompt = getNextRequiredProposalPrompt({
      clientId,
      clientName,
      formData: mergedForm as Record<string, unknown>,
    })

    if (nextRequiredPrompt) {
      return buildCollectingProposalResponse({
        proposalId,
        promptId: nextRequiredPrompt,
        clientName,
        stepProgress: getProposalConversationStepProgress({ clientId, clientName, formData: mergedForm as Record<string, unknown> }),
        prefix: promptId ? 'Got it.' : 'Let’s build it.',
      })
    }

    if (promptId !== 'additionalNotes' && !asNonEmptyString(mergedForm.value.additionalNotes)) {
      return buildCollectingProposalResponse({
        proposalId,
        promptId: 'additionalNotes',
        clientName,
        stepProgress: getProposalConversationStepProgress({ clientId, clientName, formData: mergedForm as Record<string, unknown> }),
        prefix: 'Perfect.',
      })
    }

    return runProposalGeneration(ctx, input, proposalId)
  },

  async generateProposalFromDraft(ctx, input) {
    const proposalId = resolveProposalId(input.params, input.context)
    if (!proposalId) {
      return {
        success: false,
        data: { error: 'proposalId is required.' },
        userMessage: 'Please tell me which proposal draft to generate.',
      }
    }

    return runProposalGeneration(ctx, input, proposalId)
  },
}