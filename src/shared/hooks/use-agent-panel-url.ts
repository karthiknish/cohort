'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  agentPanelHref,
  parseAgentPanelUrl,
  type AgentPanelUrlView,
} from '@/lib/agent-panel-url'

type UseAgentPanelUrlOptions = {
  isOpen: boolean
  setOpen: (open: boolean) => void
  showHistory: boolean
  setShowHistory: (show: boolean) => void
  conversationId: string | null
  onLoadConversation?: (conversationId: string) => void
}

export function useAgentPanelUrl({
  isOpen,
  setOpen,
  showHistory,
  setShowHistory,
  conversationId,
  onLoadConversation,
}: UseAgentPanelUrlOptions) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydratedFromUrlRef = useRef(false)
  const lastPushedRef = useRef<string | null>(null)

  const replaceUrl = useCallback(
    (patch: { open?: boolean; view?: AgentPanelUrlView; conversationId?: string | null }) => {
      const href = agentPanelHref(pathname, searchParams, {
        open: patch.open ?? isOpen,
        view: patch.view ?? (showHistory ? 'history' : 'chat'),
        conversationId:
          patch.conversationId !== undefined ? patch.conversationId : conversationId,
      })

      if (lastPushedRef.current === href) return
      lastPushedRef.current = href
      router.replace(href, { scroll: false })
    },
    [conversationId, isOpen, pathname, router, searchParams, showHistory],
  )

  useEffect(() => {
    if (hydratedFromUrlRef.current) return
    hydratedFromUrlRef.current = true

    const parsed = parseAgentPanelUrl(searchParams)
    if (parsed.open) {
      setOpen(true)
    }
    if (parsed.view === 'history') {
      setShowHistory(true)
    }
    if (parsed.conversationId && onLoadConversation) {
      void onLoadConversation(parsed.conversationId)
    }
  }, [onLoadConversation, searchParams, setOpen, setShowHistory])

  useEffect(() => {
    if (!hydratedFromUrlRef.current) return
    replaceUrl({
      open: isOpen,
      view: showHistory ? 'history' : 'chat',
      conversationId,
    })
  }, [conversationId, isOpen, replaceUrl, showHistory])

  const openHistoryView = useCallback(() => {
    setShowHistory(true)
    replaceUrl({ open: true, view: 'history' })
  }, [replaceUrl, setShowHistory])

  const closeHistoryView = useCallback(() => {
    setShowHistory(false)
    replaceUrl({ open: isOpen, view: 'chat' })
  }, [isOpen, replaceUrl, setShowHistory])

  return { openHistoryView, closeHistoryView, replaceUrl }
}
