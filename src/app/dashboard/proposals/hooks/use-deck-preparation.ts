import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { refreshProposalDraft } from '@/services/proposals'
import { useQuery } from 'convex/react'
import { proposalsApi } from '@/lib/convex-api'
import type { ProposalDraft, ProposalPresentationDeck } from '@/types/proposals'
import { formatUserFacingErrorMessage } from '@/lib/user-friendly-error'
import {
    trackDeckGenerationStarted,
    trackDeckGenerationCompleted,
    trackDeckGenerationFailed,
} from '@/services/proposal-analytics'
import type { DeckProgressStage } from '../components/deck-progress-overlays'

function getErrorMessage(error: unknown, fallback: string): string {
    return formatUserFacingErrorMessage(error, fallback)
}

export interface UseDeckPreparationOptions {
    draftId: string | null
    refreshProposals: () => Promise<unknown>
    setPresentationDeck: (deck: ProposalPresentationDeck | null) => void
    setAiSuggestions: (suggestions: string | null) => void
    setProposals: (fn: (prev: ProposalDraft[]) => ProposalDraft[]) => void
    presentationDeck?: ProposalPresentationDeck | null
}

export interface UseDeckPreparationReturn {
    downloadingDeckId: string | null
    deckProgressStage: DeckProgressStage | null
    handleDownloadDeck: (proposal: ProposalDraft) => Promise<void>
    openDeckUrl: (url: string, pendingWindow?: Window | null) => void
}

export function useDeckPreparation(options: UseDeckPreparationOptions): UseDeckPreparationReturn {
    const {
        draftId,
        refreshProposals,
        setPresentationDeck,
        setAiSuggestions,
        setProposals,
        presentationDeck,
    } = options

    const { toast } = useToast()
    const { user, getIdToken } = useAuth()

    const workspaceId = user?.agencyId ?? null

    const [downloadingDeckId, setDownloadingDeckId] = useState<string | null>(null)
    const [deckProgressStage, setDeckProgressStage] = useState<DeckProgressStage | null>(null)
    const pendingDeckWindowRef = useRef<Window | null>(null)

    const openDeckUrl = useCallback((url: string, pendingWindow?: Window | null) => {
        if (typeof window === 'undefined') {
            return
        }

        if (pendingWindow && !pendingWindow.closed) {
            pendingWindow.location.href = url
            return
        }

        const anchor = document.createElement('a')
        anchor.href = url
        anchor.target = '_blank'
        anchor.rel = 'noopener'
        anchor.style.display = 'none'

        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
    }, [])

    const activeConvexProposal = useQuery(
        proposalsApi.getByLegacyId,
        !workspaceId || !draftId
            ? 'skip'
            : {
                workspaceId,
                legacyId: draftId,
            }
    )

    const handleDownloadDeck = useCallback(async (proposal: ProposalDraft) => {
        const localDeckUrl = proposal.pptUrl ?? proposal.presentationDeck?.storageUrl ?? proposal.presentationDeck?.pptxUrl ?? null
        console.log('[ProposalDownload] URL priority check:', {
            pptUrl: proposal.pptUrl,
            storageUrl: proposal.presentationDeck?.storageUrl,
            pptxUrl: proposal.presentationDeck?.pptxUrl,
            selectedUrl: localDeckUrl
        })

        if (localDeckUrl) {
            console.log('[ProposalDownload] Using existing URL:', localDeckUrl)
            openDeckUrl(localDeckUrl)
            return
        }

        if (downloadingDeckId) {
            console.log('[ProposalDownload] Download already in progress for:', downloadingDeckId)
            toast({
                title: 'Deck already preparing',
                description: 'Please wait for the current deck request to finish.',
            })
            return
        }

        setDeckProgressStage('initializing')

        const pendingWindow = pendingDeckWindowRef.current
        if (pendingWindow && !pendingWindow.closed) {
            pendingWindow.close()
        }
        pendingDeckWindowRef.current = null

        try {
            console.log('[ProposalDownload] Starting deck preparation for proposal:', proposal.id)
            if (typeof window !== 'undefined') {
                const popup = window.open('about:blank', '_blank')
                if (popup) {
                    pendingDeckWindowRef.current = popup
                    try {
                        popup.document.open()
                        popup.document.write(`<!doctype html><title>Preparing presentation...</title><style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; display: flex; min-height: 100vh; align-items: center; justify-content: center; background: #0f172a; color: white; }
              .container { text-align: center; max-width: 360px; padding: 24px; }
              .spinner { width: 48px; height: 48px; border-radius: 9999px; border: 4px solid rgba(255,255,255,0.2); border-top-color: white; animation: spin 1s linear infinite; margin: 0 auto 16px; }
              @keyframes spin { to { transform: rotate(360deg); } }
            </style><body><div class="container"><div class="spinner" aria-hidden="true"></div><h1 style="font-size: 20px; margin-bottom: 12px;">Preparing your deck...</h1><p style="font-size: 14px; line-height: 1.5; opacity: 0.85;">We're generating your presentation and saving a copy to your workspace. Keep this tab open &mdash; the download launches automatically once it's ready.</p></div></body>`)
                        popup.document.close()
                    } catch (popupError) {
                        console.warn('[ProposalDownload] Unable to render popup content', popupError)
                    }
                }
            }
            setDeckProgressStage('polling')
            setDownloadingDeckId(proposal.id)

            // Track deck generation start for analytics
            const deckStartTime = Date.now()
            if (workspaceId) {
                trackDeckGenerationStarted(workspaceId, proposal.id, proposal.clientId, proposal.clientName).catch(console.error)
            }

            const token = await getIdToken()
            if (!token || !workspaceId) {
                throw new Error('Missing auth token or workspace')
            }

            // Deck preparation happens server-side; poll Convex for updated pptUrl.
            const pollMaxAttempts = 30
            const pollIntervalMs = 2000

            for (let attempt = 0; attempt < pollMaxAttempts; attempt++) {
                const row = await refreshProposalDraft(proposal.id, {
                    workspaceId,
                    convexToken: token,
                })

                const deckUrl = row.pptUrl ?? row.presentationDeck?.storageUrl ?? null
                if (deckUrl) {
                    const result = row
                    const deckDuration = Date.now() - deckStartTime
                    if (workspaceId) {
                        trackDeckGenerationCompleted(workspaceId, proposal.id, deckDuration, proposal.clientId, proposal.clientName).catch(console.error)
                    }

                    setDeckProgressStage('launching')
                    openDeckUrl(deckUrl, pendingDeckWindowRef.current ?? undefined)
                    pendingDeckWindowRef.current = null

                    setProposals((prev) =>
                        prev.map((item) =>
                            item.id !== proposal.id
                                ? item
                                : {
                                    ...item,
                                    pptUrl: deckUrl,
                                    presentationDeck: result.presentationDeck
                                        ? { ...result.presentationDeck, storageUrl: deckUrl }
                                        : item.presentationDeck
                                            ? { ...item.presentationDeck, storageUrl: deckUrl }
                                            : null,
                                },
                        ),
                    )

                    await refreshProposals()
                    toast({
                        title: 'Deck ready',
                        description: 'We saved the PPT and opened it in a new tab.',
                    })
                    return
                }

                await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
            }

            setDeckProgressStage('queued')
            const pendingWindow = pendingDeckWindowRef.current
            if (pendingWindow && !pendingWindow.closed) {
                pendingWindow.close()
            }
            pendingDeckWindowRef.current = null
        } catch (error: unknown) {
            setDeckProgressStage('error')
            console.error('[ProposalDownload] Deck preparation failed for proposal:', proposal.id, error)
            const message = getErrorMessage(error, 'Failed to prepare the presentation deck')

            // Track deck generation failure
            if (workspaceId) {
                trackDeckGenerationFailed(workspaceId, proposal.id, message, proposal.clientId, proposal.clientName).catch(console.error)
            }

            toast({ title: 'Unable to prepare deck', description: message, variant: 'destructive' })
            const pendingWindow = pendingDeckWindowRef.current
            if (pendingWindow && !pendingWindow.closed) {
                pendingWindow.close()
            }
            pendingDeckWindowRef.current = null
        } finally {
            console.log('[ProposalDownload] Clearing downloading state for proposal:', proposal.id)
            setDownloadingDeckId(null)
            setDeckProgressStage(null)
        }
    }, [downloadingDeckId, draftId, openDeckUrl, refreshProposals, toast, setPresentationDeck, setAiSuggestions, setProposals, activeConvexProposal])

    return {
        downloadingDeckId,
        deckProgressStage,
        handleDownloadDeck,
        openDeckUrl,
    }
}
