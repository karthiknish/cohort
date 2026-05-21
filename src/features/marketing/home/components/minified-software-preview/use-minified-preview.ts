'use client'

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react'

import { AUTO_ROTATE_MS } from './constants'
import { INITIAL_OVERVIEW_METRIC_ID } from './preview-data'
import { applyPreviewTilt, resetPreviewTilt } from './preview-tilt'
import {
  getNextPreviewTabId,
  INITIAL_PREVIEW_TAB,
  isPreviewTabId,
  PREVIEW_TAB_ORDER,
  PREVIEW_TABS,
} from './tabs'
import type { PreviewTab, PreviewTabId } from './types'

export type MinifiedPreviewController = {
  activeTabId: PreviewTabId
  activeMetricId: string
  isAutoRotationPaused: boolean
  surfaceRef: RefObject<HTMLDivElement | null>
  tab: PreviewTab
  activeTabIndex: number
  handleTabClick: (e: MouseEvent<HTMLButtonElement>) => void
  handleTabKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void
  handleMetricClick: (e: MouseEvent<HTMLButtonElement>) => void
  stepTab: (delta: -1 | 1) => void
  handlePreviewMouseEnter: () => void
  handlePreviewMouseLeave: () => void
  handlePreviewMouseMove: (event: MouseEvent<HTMLDivElement>) => void
}

export function useMinifiedPreview(): MinifiedPreviewController {
  const [activeTabId, setActiveTabId] = useState<PreviewTabId>(INITIAL_PREVIEW_TAB.id)
  const [activeMetricId, setActiveMetricId] = useState(INITIAL_OVERVIEW_METRIC_ID)
  const [isAutoRotationPaused, setIsAutoRotationPaused] = useState(false)
  const surfaceRef = useRef<HTMLDivElement | null>(null)

  const tab = useMemo(
    () => PREVIEW_TABS.find((t) => t.id === activeTabId) ?? INITIAL_PREVIEW_TAB,
    [activeTabId],
  )
  const activeTabIndex = PREVIEW_TAB_ORDER.indexOf(activeTabId)

  useEffect(() => {
    if (activeTabId === 'overview') {
      return
    }
    startTransition(() => {
      setActiveMetricId(INITIAL_OVERVIEW_METRIC_ID)
    })
  }, [activeTabId])

  useEffect(() => {
    if (isAutoRotationPaused || typeof window === 'undefined') {
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const intervalId = window.setInterval(() => {
      startTransition(() => {
        setActiveTabId((current) => getNextPreviewTabId(current))
      })
    }, AUTO_ROTATE_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isAutoRotationPaused])

  const focusTabButton = useCallback((id: PreviewTabId) => {
    requestAnimationFrame(() => {
      const tabButton =
        document.getElementById(`preview-tab-d-${id}`) ??
        document.getElementById(`preview-tab-m-${id}`)
      tabButton?.focus()
    })
  }, [])

  const selectTab = useCallback(
    (id: PreviewTabId) => {
      if (id === activeTabId) return
      setIsAutoRotationPaused(true)
      startTransition(() => setActiveTabId(id))
      focusTabButton(id)
    },
    [activeTabId, focusTabButton],
  )

  const handleTabClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const id = e.currentTarget.dataset.tabId
      if (isPreviewTabId(id) && id !== activeTabId) {
        selectTab(id)
      }
    },
    [activeTabId, selectTab],
  )

  const handleTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const id = e.currentTarget.dataset.tabId
      if (!isPreviewTabId(id)) return

      const vertical = e.key === 'ArrowDown' || e.key === 'ArrowUp'
      const horizontal = e.key === 'ArrowRight' || e.key === 'ArrowLeft'
      if (!vertical && !horizontal) {
        if (e.key === 'Home') {
          e.preventDefault()
          selectTab(PREVIEW_TAB_ORDER[0]!)
        }
        if (e.key === 'End') {
          e.preventDefault()
          selectTab(PREVIEW_TAB_ORDER[PREVIEW_TAB_ORDER.length - 1]!)
        }
        return
      }

      e.preventDefault()
      const idx = PREVIEW_TAB_ORDER.indexOf(id)
      if (idx === -1) return
      const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1
      const nextIdx = Math.min(Math.max(idx + delta, 0), PREVIEW_TAB_ORDER.length - 1)
      const nextId = PREVIEW_TAB_ORDER[nextIdx]
      if (nextId && nextId !== id) selectTab(nextId)
    },
    [selectTab],
  )

  const handleMetricClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const id = e.currentTarget.dataset.metricId
      if (id && id !== activeMetricId) {
        startTransition(() => setActiveMetricId(id))
      }
    },
    [activeMetricId],
  )

  const stepTab = useCallback(
    (delta: -1 | 1) => {
      const index = PREVIEW_TAB_ORDER.indexOf(activeTabId)
      if (index === -1) return
      const nextIndex = Math.min(Math.max(index + delta, 0), PREVIEW_TAB_ORDER.length - 1)
      const nextId = PREVIEW_TAB_ORDER[nextIndex]
      if (nextId && nextId !== activeTabId) {
        selectTab(nextId)
      }
    },
    [activeTabId, selectTab],
  )

  const handlePreviewMouseEnter = useCallback(() => {
    setIsAutoRotationPaused(true)
  }, [])

  const handlePreviewMouseLeave = useCallback(() => {
    resetPreviewTilt(surfaceRef.current)
    setIsAutoRotationPaused(false)
  }, [])

  const handlePreviewMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const node = surfaceRef.current
    if (!node) return
    const bounds = node.getBoundingClientRect()
    const horizontalOffset = (event.clientX - bounds.left) / bounds.width - 0.5
    const verticalOffset = (event.clientY - bounds.top) / bounds.height - 0.5
    applyPreviewTilt(node, verticalOffset * -6, horizontalOffset * 8)
  }, [])

  return {
    activeTabId,
    activeMetricId,
    isAutoRotationPaused,
    surfaceRef,
    tab,
    activeTabIndex,
    handleTabClick,
    handleTabKeyDown,
    handleMetricClick,
    stepTab,
    handlePreviewMouseEnter,
    handlePreviewMouseLeave,
    handlePreviewMouseMove,
  }
}
