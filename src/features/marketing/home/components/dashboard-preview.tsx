'use client'

import { startTransition, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'

import {
  applySurfaceTransform,
  findPreviewView,
  getNextPreviewViewId,
  INITIAL_METRIC_ID,
  INITIAL_VIEW_ID,
  isPreviewViewId,
  resetSurfaceTransform,
  type PreviewView,
} from './dashboard-preview-data'
import {
  DashboardPreviewAgentPanel,
  DashboardPreviewChrome,
  DashboardPreviewFooterHints,
  DashboardPreviewMetricDetail,
  DashboardPreviewMetricPicker,
  DashboardPreviewQueuePanel,
  DashboardPreviewViewRail,
} from './dashboard-preview-sections'

export function DashboardPreview() {
  const [activeViewId, setActiveViewId] = useState<PreviewView['id']>(INITIAL_VIEW_ID)
  const [activeMetricId, setActiveMetricId] = useState<string>(INITIAL_METRIC_ID)
  const isAutoRotationPausedRef = useRef(false)
  const surfaceRef = useRef<HTMLDivElement | null>(null)

  const currentView = useMemo(() => findPreviewView(activeViewId), [activeViewId])
  const currentMetric = useMemo(
    () => currentView.metrics.find((metric) => metric.id === activeMetricId) ?? currentView.metrics[0],
    [activeMetricId, currentView],
  )

  useEffect(() => {
    if (currentView.metrics.some((metric) => metric.id === activeMetricId)) {
      return
    }

    startTransition(() => {
      setActiveMetricId(currentView.metrics[0].id)
    })
  }, [activeMetricId, currentView])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const intervalId = window.setInterval(() => {
      if (isAutoRotationPausedRef.current) {
        return
      }

      startTransition(() => {
        setActiveViewId((current) => getNextPreviewViewId(current))
      })
    }, 4800)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const handlePreviewMouseEnter = useCallback(() => {
    isAutoRotationPausedRef.current = true
  }, [])

  const handlePreviewMouseLeave = useCallback(() => {
    resetSurfaceTransform(surfaceRef.current)
    isAutoRotationPausedRef.current = false
  }, [])

  const handlePreviewMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const node = surfaceRef.current
    if (!node) {
      return
    }

    const bounds = node.getBoundingClientRect()
    const horizontalOffset = (event.clientX - bounds.left) / bounds.width - 0.5
    const verticalOffset = (event.clientY - bounds.top) / bounds.height - 0.5

    applySurfaceTransform(node, verticalOffset * -8, horizontalOffset * 10)
  }, [])

  const handleViewSelect = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const nextViewId = event.currentTarget.dataset.viewId
      if (!isPreviewViewId(nextViewId) || nextViewId === activeViewId) {
        return
      }

      startTransition(() => {
        setActiveViewId(nextViewId)
        setActiveMetricId(findPreviewView(nextViewId).metrics[0].id)
      })
    },
    [activeViewId],
  )

  const handleMetricSelect = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const nextMetricId = event.currentTarget.dataset.metricId
      if (!nextMetricId || !currentView.metrics.some((metric) => metric.id === nextMetricId)) {
        return
      }

      startTransition(() => {
        setActiveMetricId(nextMetricId)
      })
    },
    [currentView.metrics],
  )

  return (
    <div className="relative mx-auto w-full max-w-280">
      <div aria-hidden="true" className="absolute inset-x-12 top-10 h-24 rounded-full bg-muted/90 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-4 top-28 size-44 rounded-full bg-foreground/6 blur-3xl" />

      <div
        className="relative perspective-[1800px]"
        onMouseEnter={handlePreviewMouseEnter}
        onMouseLeave={handlePreviewMouseLeave}
        onMouseMove={handlePreviewMouseMove}
      >
        <div
          ref={surfaceRef}
          className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out"
        >
          <DashboardPreviewChrome />

          <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[90px_minmax(0,1fr)] lg:gap-6">
            <DashboardPreviewViewRail activeViewId={activeViewId} onViewSelect={handleViewSelect} />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)] lg:gap-5">
              <div className="space-y-4">
                <DashboardPreviewMetricPicker
                  currentView={currentView}
                  currentMetric={currentMetric}
                  onMetricSelect={handleMetricSelect}
                />
                <DashboardPreviewMetricDetail currentMetric={currentMetric} />
              </div>

              <div className="space-y-4">
                <DashboardPreviewQueuePanel currentView={currentView} />
                <DashboardPreviewAgentPanel currentView={currentView} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardPreviewFooterHints />
    </div>
  )
}
