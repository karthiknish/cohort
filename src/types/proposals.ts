import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'

export type ProposalStatus = 'draft' | 'in_progress' | 'ready' | 'sent'

export interface ProposalPresentationDeck {
  generationId: string | null
  status: string
  instructions: string | null
  webUrl: string | null
  shareUrl: string | null
  pptxUrl: string | null
  pdfUrl: string | null
  generatedFiles: Array<{ fileType: string; fileUrl: string }>
  storageUrl: string | null
  pdfStorageUrl?: string | null
}

/** @deprecated Use ProposalPresentationDeck instead */
export type ProposalGammaDeck = ProposalPresentationDeck

export interface ProposalDraft {
  id: string
  status: ProposalStatus
  stepProgress: number
  formData: ProposalFormData
  aiInsights: unknown
  aiSuggestions: string | null
  pdfUrl?: string | null
  pptUrl?: string | null
  createdAt: string | null
  updatedAt: string | null
  lastAutosaveAt: string | null
  clientId: string | null
  clientName: string | null
  presentationDeck?: ProposalPresentationDeck | null
  /** @deprecated Use presentationDeck instead */
  gammaDeck?: ProposalPresentationDeck | null
}

export function normalizeProposalDraft(input: ProposalDraft): ProposalDraft {
  return {
    ...input,
    formData: mergeProposalForm((input as { formData?: unknown })?.formData ?? null),
  }
}

export function resolveProposalDeck<
  T extends {
    pptUrl?: string | null
    presentationDeck?: ProposalPresentationDeck | null
    gammaDeck?: ProposalPresentationDeck | null
    aiSuggestions?: string | null
  },
>(payload: T): T & { presentationDeck?: ProposalPresentationDeck | null } {
  const deck = payload.presentationDeck ?? payload.gammaDeck
  if (!deck) {
    const fallbackUrl = payload.pptUrl ?? null
    if (fallbackUrl && payload.pptUrl !== fallbackUrl) {
      return { ...payload, pptUrl: fallbackUrl, aiSuggestions: payload.aiSuggestions ?? null }
    }
    return { ...payload, aiSuggestions: payload.aiSuggestions ?? null }
  }

  const resolvedStorage = deck.storageUrl ?? payload.pptUrl ?? null
  if (!resolvedStorage || (deck.storageUrl === resolvedStorage && payload.pptUrl === resolvedStorage)) {
    return { ...payload, presentationDeck: deck, aiSuggestions: payload.aiSuggestions ?? null }
  }

  return {
    ...payload,
    pptUrl: payload.pptUrl ?? resolvedStorage,
    presentationDeck: {
      ...deck,
      storageUrl: resolvedStorage,
    },
    aiSuggestions: payload.aiSuggestions ?? null,
  }
}
