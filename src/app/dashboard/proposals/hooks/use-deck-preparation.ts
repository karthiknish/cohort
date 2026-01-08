import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import {
    getProposalById,
    prepareProposalDeck,
    type ProposalDraft,
    type ProposalPresentationDeck,
} from '@/services/proposals'
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

        if (pendingDeckWindowRef.current && !pendingDeckWindowRef.current.closed) {
            pendingDeckWindowRef.current.close()
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
            trackDeckGenerationStarted(proposal.id, proposal.clientId, proposal.clientName).catch(console.error)

            const result = await prepareProposalDeck(proposal.id)
            const deckDuration = Date.now() - deckStartTime
            console.log('[ProposalDownload] Deck preparation result:', {
                pptUrl: result.pptUrl,
                deckStorageUrl: result.presentationDeck?.storageUrl,
                deckPptxUrl: result.presentationDeck?.pptxUrl,
                deckShareUrl: result.presentationDeck?.shareUrl
            })

            const deckUrl = result.pptUrl
                ?? result.presentationDeck?.storageUrl
                ?? result.presentationDeck?.pptxUrl
                ?? result.presentationDeck?.shareUrl
                ?? null

            console.log('[ProposalDownload] Final selected deck URL:', deckUrl)

            // Track deck generation success
            if (deckUrl) {
                trackDeckGenerationCompleted(proposal.id, deckDuration, proposal.clientId, proposal.clientName).catch(console.error)
            }

            if (deckUrl) {
                setDeckProgressStage('launching')
                console.log('[ProposalDownload] Opening deck URL:', deckUrl)
                openDeckUrl(deckUrl, pendingDeckWindowRef.current ?? undefined)
                pendingDeckWindowRef.current = null
            } else {
                setDeckProgressStage('queued')
                if (pendingDeckWindowRef.current && !pendingDeckWindowRef.current.closed) {
                    pendingDeckWindowRef.current.close()
                }
                pendingDeckWindowRef.current = null
            }

            if (deckUrl) {
                console.log('[ProposalDownload] Updating proposal state with deck URL:', deckUrl)
                setProposals((prev) =>
                    prev.map((item) => {
                        if (item.id !== proposal.id) {
                            return item
                        }
                        const nextDeck = result.presentationDeck
                            ? { ...result.presentationDeck, storageUrl: deckUrl }
                            : item.presentationDeck
                                ? { ...item.presentationDeck, storageUrl: deckUrl }
                                : null
                        return {
                            ...item,
                            pptUrl: deckUrl,
                            presentationDeck: nextDeck,
                        }
                    })
                )
            }

            console.log('[ProposalDownload] Refreshing proposals list')
            const refreshed = await refreshProposals()
            if (proposal.id === draftId && Array.isArray(refreshed)) {
                const latest = (refreshed as ProposalDraft[]).find((candidate) => candidate.id === proposal.id)
                if (latest) {
                    console.log('[ProposalDownload] Updating presentation deck for active draft')
                    setPresentationDeck(
                        latest.presentationDeck
                            ? { ...latest.presentationDeck, storageUrl: latest.pptUrl ?? latest.presentationDeck?.storageUrl ?? null }
                            : null
                    )
                    setAiSuggestions(latest.aiSuggestions ?? null)
                }
            }

            toast({
                title: deckUrl ? 'Deck ready' : 'Deck still generating',
                description: deckUrl
                    ? 'We saved the PPT in Firebase storage and opened it in a new tab.'
                    : 'The presentation export is still processing. We will save it automatically once it finishes.',
            })
        } catch (error: unknown) {
            setDeckProgressStage('error')
            console.error('[ProposalDownload] Deck preparation failed for proposal:', proposal.id, error)
            const message = getErrorMessage(error, 'Failed to prepare the presentation deck')

            // Track deck generation failure
            trackDeckGenerationFailed(proposal.id, message, proposal.clientId, proposal.clientName).catch(console.error)

            toast({ title: 'Unable to prepare deck', description: message, variant: 'destructive' })
            if (pendingDeckWindowRef.current && !pendingDeckWindowRef.current.closed) {
                pendingDeckWindowRef.current.close()
            }
            pendingDeckWindowRef.current = null
        } finally {
            console.log('[ProposalDownload] Clearing downloading state for proposal:', proposal.id)
            setDownloadingDeckId(null)
            setDeckProgressStage(null)
        }
    }, [downloadingDeckId, draftId, openDeckUrl, refreshProposals, toast, setPresentationDeck, setAiSuggestions, setProposals])

    return {
        downloadingDeckId,
        deckProgressStage,
        handleDownloadDeck,
        openDeckUrl,
    }
}
