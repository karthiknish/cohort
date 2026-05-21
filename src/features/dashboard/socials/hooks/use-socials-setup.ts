'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAction, useConvexAuth, useMutation } from 'convex/react'

import { socialsIntegrationsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'

import type { SocialsMetaSetupState, SocialsSurfaceStatus } from '../components/socials-state'
import type { SocialsConnectionStatus } from './use-socials-connections'

export type MetaSocialPageOption = {
  id: string
  name: string
  instagramBusinessId: string | null
  instagramBusinessName: string | null
}

export type UseSocialsSetupReturn = {
  setupState: SocialsMetaSetupState
  pages: MetaSocialPageOption[]
  pagesLoading: boolean
  pagesError: string | null
  selectedPageId: string
  setSelectedPageId: (pageId: string) => void
  confirmingPage: boolean
  facebookStatus: SocialsSurfaceStatus
  instagramStatus: SocialsSurfaceStatus
  facebookCount: number
  instagramCount: number
  selectedPageLabel: string | null
  loadPages: () => Promise<void>
  confirmSelectedPage: () => Promise<void>
}

export function useSocialsSetup(status: SocialsConnectionStatus | null): UseSocialsSetupReturn {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()

  const discoverPages = useAction(socialsIntegrationsApi.discoverPages)
  const confirmSurfaceBinding = useMutation(socialsIntegrationsApi.confirmSurfaceBinding)

  const [pages, setPages] = useState<MetaSocialPageOption[]>([])
  const [pagesLoading, setPagesLoading] = useState(false)
  const [pagesError, setPagesError] = useState<string | null>(null)
  const [selectedPageId, setSelectedPageId] = useState('')
  const [confirmingPage, setConfirmingPage] = useState(false)

  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const canAct = !isPreviewMode && isAuthenticated && !convexAuthLoading && Boolean(workspaceId)

  const loadPages = useCallback(async () => {
    if (!canAct || !workspaceId) return

    setPagesLoading(true)
    setPagesError(null)

    try {
      const result = await discoverPages({
        workspaceId,
        clientId: selectedClientId ?? null,
      })
      const options = (result ?? []) as MetaSocialPageOption[]
      setPages(options)

      if (status?.facebookPageId) {
        setSelectedPageId(status.facebookPageId)
      } else if (!selectedPageId && options.length === 1) {
        const only = options[0]
        if (only) setSelectedPageId(only.id)
      }
    } catch (error: unknown) {
      logError(error, 'useSocialsSetup:loadPages')
      setPagesError(asErrorMessage(error))
      setPages([])
    } finally {
      setPagesLoading(false)
    }
  }, [canAct, discoverPages, selectedClientId, selectedPageId, status?.facebookPageId, workspaceId])

  useEffect(() => {
    if (!status?.connected) {
      setPages([])
      setSelectedPageId('')
      return
    }
    void loadPages()
  }, [status?.connected, status?.facebookPageId, loadPages])

  const confirmSelectedPage = useCallback(async () => {
    if (!canAct || !workspaceId || !selectedPageId) return

    const page = pages.find((p) => p.id === selectedPageId)
    if (!page) return

    setConfirmingPage(true)
    try {
      await confirmSurfaceBinding({
        workspaceId,
        clientId: selectedClientId ?? null,
        facebookPageId: page.id,
        facebookPageName: page.name,
        instagramBusinessId: page.instagramBusinessId,
        instagramBusinessName: page.instagramBusinessName,
      })
    } catch (error: unknown) {
      logError(error, 'useSocialsSetup:confirmSelectedPage')
      setPagesError(asErrorMessage(error))
      throw error
    } finally {
      setConfirmingPage(false)
    }
  }, [
    canAct,
    confirmSurfaceBinding,
    pages,
    selectedClientId,
    selectedPageId,
    workspaceId,
  ])

  const facebookCount = pages.length
  const instagramCount = pages.filter((p) => p.instagramBusinessId).length

  const setupComplete = Boolean(status?.facebookPageId)
  const hasInstagramBinding = Boolean(status?.instagramBusinessId)

  const facebookStatus: SocialsSurfaceStatus = useMemo(() => {
    if (!status?.connected) return 'disconnected'
    if (pagesLoading) return 'loading'
    if (pagesError) return 'error'
    if (!setupComplete) return 'source_required'
    return 'ready'
  }, [pagesError, pagesLoading, setupComplete, status?.connected])

  const instagramStatus: SocialsSurfaceStatus = useMemo(() => {
    if (!status?.connected) return 'disconnected'
    if (!setupComplete) return 'source_required'
    if (!hasInstagramBinding) return 'empty'
    if (pagesLoading) return 'loading'
    if (pagesError) return 'error'
    return 'ready'
  }, [hasInstagramBinding, pagesError, pagesLoading, setupComplete, status?.connected])

  const setupState: SocialsMetaSetupState = useMemo(() => {
    if (!status?.connected) {
      return {
        stage: 'disconnected',
        title: 'Connect organic social (Meta)',
        description: 'One Meta login covers Facebook Pages and linked Instagram business profiles — not Ad Manager.',
        switchSourceRecommended: false,
        switchSourceMessage: null,
      }
    }

    if (!setupComplete) {
      return {
        stage: 'source_selection',
        title: 'Select a Facebook Page',
        description: 'Choose the Page for this workspace. Linked Instagram loads automatically when available.',
        switchSourceRecommended: false,
        switchSourceMessage: null,
      }
    }

    if (pagesError) {
      return {
        stage: 'recovery',
        title: 'Setup needs attention',
        description: pagesError,
        switchSourceRecommended: false,
        switchSourceMessage: null,
      }
    }

    if (!hasInstagramBinding) {
      return {
        stage: 'partial',
        title: 'Facebook ready · Instagram pending',
        description: 'This Page has no linked Instagram business account. Instagram metrics stay empty until you link one in Meta.',
        switchSourceRecommended: false,
        switchSourceMessage: null,
      }
    }

    return {
      stage: 'ready',
      title: 'Organic surfaces configured',
      description: 'Facebook Page and Instagram business profile are bound. Run sync to refresh KPIs.',
      switchSourceRecommended: false,
      switchSourceMessage: null,
    }
  }, [hasInstagramBinding, pagesError, setupComplete, status?.connected])

  const selectedPageLabel =
    pages.find((p) => p.id === selectedPageId)?.name ?? status?.facebookPageName ?? null

  return {
    setupState,
    pages,
    pagesLoading,
    pagesError,
    selectedPageId,
    setSelectedPageId,
    confirmingPage,
    facebookStatus,
    instagramStatus,
    facebookCount,
    instagramCount,
    selectedPageLabel,
    loadPages,
    confirmSelectedPage,
  }
}
