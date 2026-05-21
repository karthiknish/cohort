import type { ProposalFormData } from '@/lib/proposals'
import type { GammaGenerationRequest, GammaTemplateRequest, GammaTextAmount } from '@/services/gamma/types'
import { createPresentationRequest, createTemplateRequest } from '@/services/gamma/api'

function buildDeckInputText(formData: ProposalFormData, summary?: string): string {
  const companyName = formData.company?.name?.trim() || 'Client'
  const industry = formData.company?.industry?.trim()
  const goals = formData.goals?.objectives?.join(', ')
  const budget = formData.marketing?.budget?.trim()
  const scope = [...(formData.scope?.services || []), formData.scope?.otherService].filter(Boolean).join(', ')

  return [
    `Client: ${companyName}`,
    industry ? `Industry: ${industry}` : null,
    goals ? `Strategic Goals: ${goals}` : null,
    budget ? `Budget: ${budget}` : null,
    scope ? `Proposed Scope: ${scope}` : null,
    summary ? `AI Generated Outline:\n${summary}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

/** User-facing name for the deck generation integration (never expose vendor names in UI). */
export const PRESENTATION_ENGINE_LABEL = 'Presentation engine'

function mapProposalSizeToTextAmount(proposalSize: string): GammaTextAmount {
  const normalized = proposalSize.toLowerCase()
  if (normalized.includes('10,000+') || normalized.includes('10000')) {
    return 'detailed'
  }
  if (normalized.includes('5,000') || normalized.includes('5000')) {
    return 'medium'
  }
  return 'brief'
}

export function countOutlineSlides(instructions: string): number {
  const matches = instructions.match(/^Slide\s+\d+/gim)
  const count = matches?.length ?? 0
  if (count > 12) return 12
  if (count >= 1) return count
  return 10
}

export function formatDeckInputWithSlideBreaks(
  formData: ProposalFormData,
  instructions: string,
): string {
  const header = buildDeckInputText(formData, instructions)
  const slideBlocks = instructions
    .split(/\n(?=Slide\s+\d+)/i)
    .map((block) => block.trim())
    .filter(Boolean)

  if (slideBlocks.length > 1) {
    return [header, ...slideBlocks].join('\n---\n')
  }

  return `${header}\n---\n${instructions.trim()}`
}

function resolvePresentationFolderIds(): string[] | undefined {
  const folderId = process.env.PRESENTATION_FOLDER_ID ?? process.env.GAMMA_FOLDER_ID
  if (typeof folderId === 'string' && folderId.trim().length > 0) {
    return [folderId.trim()]
  }
  return undefined
}

function resolveMasterTemplateId(): string | null {
  const templateId = process.env.PROPOSAL_MASTER_TEMPLATE_ID ?? process.env.GAMMA_MASTER_TEMPLATE_ID
  if (typeof templateId === 'string' && templateId.trim().length > 0) {
    return templateId.trim()
  }
  return null
}

export function createProposalDeckRequest(
  formData: ProposalFormData,
  instructions: string,
  options?: { themeId?: string },
): GammaGenerationRequest {
  const companyName = formData.company?.name?.trim()
  const numCards = countOutlineSlides(instructions)
  const inputText = formatDeckInputWithSlideBreaks(formData, instructions)
  const audience = formData.goals?.audience?.trim()

  return createPresentationRequest(inputText, {
    themeId: options?.themeId,
    additionalInstructions: instructions.trim().slice(0, 2000),
    exportAs: ['pptx', 'pdf'],
    cardSplit: 'inputTextBreaks',
    numCards,
    textOptions: {
      amount: mapProposalSizeToTextAmount(formData.value?.proposalSize ?? ''),
      audience: audience || undefined,
      language: 'en',
      tone: 'Professional, confident, and client-focused',
    },
    cardOptions: {
      dimensions: '16x9',
      headerFooter: companyName
        ? {
            bottomRight: { type: 'text', value: companyName },
          }
        : undefined,
    },
    folderIds: resolvePresentationFolderIds(),
    sharingOptions: {
      externalAccess: 'view',
      workspaceAccess: 'edit',
    },
  })
}

export function createProposalTemplateDeckRequest(
  formData: ProposalFormData,
  instructions: string,
  templateDeckId: string,
  options?: { themeId?: string },
): GammaTemplateRequest {
  const prompt = [
    buildDeckInputText(formData, instructions),
    '',
    'Adapt the master deck using this slide-by-slide outline:',
    instructions.trim(),
  ]
    .filter(Boolean)
    .join('\n')

  return createTemplateRequest(templateDeckId, prompt.slice(0, 100_000), {
    themeId: options?.themeId,
    exportAs: ['pptx', 'pdf'],
    folderIds: resolvePresentationFolderIds(),
    sharingOptions: {
      externalAccess: 'view',
      workspaceAccess: 'edit',
    },
  })
}

export function resolveDeckGenerationMode(): 'template' | 'generate' {
  return resolveMasterTemplateId() ? 'template' : 'generate'
}

export function getMasterTemplateDeckId(): string | null {
  return resolveMasterTemplateId()
}

export type DeckGenerationCredits = {
  deducted: number | null
  remaining: number | null
}

export function parseDeckGenerationCredits(raw: Record<string, unknown> | undefined): DeckGenerationCredits {
  if (!raw || typeof raw !== 'object') {
    return { deducted: null, remaining: null }
  }
  const credits = raw.credits
  if (!credits || typeof credits !== 'object') {
    return { deducted: null, remaining: null }
  }
  const record = credits as Record<string, unknown>
  return {
    deducted: typeof record.deducted === 'number' ? record.deducted : null,
    remaining: typeof record.remaining === 'number' ? record.remaining : null,
  }
}

export function extractExternalDeckId(payload: Record<string, unknown>): string | null {
  if (typeof payload.gammaId === 'string' && payload.gammaId.trim()) {
    return payload.gammaId.trim()
  }

  const webUrl =
    typeof payload.gammaUrl === 'string'
      ? payload.gammaUrl
      : typeof payload.webAppUrl === 'string'
        ? payload.webAppUrl
        : typeof payload.webUrl === 'string'
          ? payload.webUrl
          : null

  if (!webUrl) return null

  try {
    const pathname = new URL(webUrl).pathname
    const segments = pathname.split('/').filter(Boolean)
    return segments.at(-1) ?? null
  } catch {
    return null
  }
}

export function sanitizeDeckProviderWarnings(warnings: string[] | undefined): string[] {
  if (!warnings?.length) return []
  return warnings.map((warning) =>
    warning.replace(/\bGamma\b/gi, 'Presentation'),
  )
}
