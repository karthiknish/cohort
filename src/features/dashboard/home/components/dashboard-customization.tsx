'use client'

import { useState, useCallback, useId, useMemo } from 'react'
import { Settings2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { cn } from '@/lib/utils'
import { LiveRegion } from '@/shared/ui/live-region'
import { useToast } from '@/shared/ui/use-toast'
import { DashboardWidgetRow } from './dashboard-widget-row'
import { HiddenDashboardWidgetRow } from './hidden-dashboard-widget-row'
import { DEFAULT_WIDGETS, type DashboardWidget } from './dashboard-customization-types'

export type { DashboardWidget } from './dashboard-customization-types'
export { DEFAULT_WIDGETS } from './dashboard-customization-types'
export { DraggableWidget } from './draggable-widget'
export { WidgetSizeSelector } from './widget-size-selector'
export { useDashboardWidgets } from './use-dashboard-widgets'

interface DashboardCustomizationProps {
  availableWidgets: DashboardWidget[]
  activeWidgets: DashboardWidget[]
  onLayoutChange: (widgets: DashboardWidget[]) => void
  onWidgetToggle: (widgetId: string, visible: boolean) => void
  onWidgetCollapse: (widgetId: string, collapsed: boolean) => void
  onReset?: () => void
  isEditing?: boolean
  onEditToggle?: () => void
}

/**
 * Widget customization panel for dashboard personalization
 */
export function DashboardCustomization({
  availableWidgets = DEFAULT_WIDGETS,
  activeWidgets,
  onLayoutChange,
  onWidgetToggle,
  onWidgetCollapse,
  onReset,
  isEditing = false,
  onEditToggle,
}: DashboardCustomizationProps) {
  const { toast } = useToast()
  const instructionsId = useId()
  const [layoutAnnouncement, setLayoutAnnouncement] = useState('')

  const visibleWidgets = useMemo(
    () => activeWidgets.filter((w) => w.visible),
    [activeWidgets]
  )

  const hiddenWidgets = useMemo(
    () => availableWidgets.filter((w) => !activeWidgets.some((aw) => aw.id === w.id)),
    [availableWidgets, activeWidgets]
  )

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return
    const movedWidget = visibleWidgets[index]
    const newWidgets = [...visibleWidgets]
    const temp = newWidgets[index - 1]!
    newWidgets[index - 1] = newWidgets[index]!
    newWidgets[index] = temp
    onLayoutChange(newWidgets)
    if (movedWidget) {
      setLayoutAnnouncement(`${movedWidget.title} moved to position ${index}.`)
    }
  }, [visibleWidgets, onLayoutChange])

  const handleMoveDown = useCallback((index: number) => {
    if (index === visibleWidgets.length - 1) return
    const movedWidget = visibleWidgets[index]
    const newWidgets = [...visibleWidgets]
    const temp = newWidgets[index + 1]!
    newWidgets[index + 1] = newWidgets[index]!
    newWidgets[index] = temp
    onLayoutChange(newWidgets)
    if (movedWidget) {
      setLayoutAnnouncement(`${movedWidget.title} moved to position ${index + 2}.`)
    }
  }, [visibleWidgets, onLayoutChange])

  const handleToggleVisibility = useCallback(
    (widgetId: string, currentlyVisible: boolean) => {
      onWidgetToggle(widgetId, !currentlyVisible)
      const widget = availableWidgets.find((item) => item.id === widgetId)
      if (widget) {
        setLayoutAnnouncement(
          currentlyVisible
            ? `${widget.title} hidden from dashboard.`
            : `${widget.title} added to dashboard.`
        )
      }
      toast({
        title: currentlyVisible ? 'Widget hidden' : 'Widget shown',
        description: currentlyVisible
          ? 'The widget has been removed from your dashboard.'
          : 'The widget has been added to your dashboard.',
      })
    },
    [availableWidgets, onWidgetToggle, toast]
  )

  const handleCollapse = useCallback(
    (widgetId: string, currentlyCollapsed: boolean) => {
      onWidgetCollapse(widgetId, !currentlyCollapsed)
      const widget = activeWidgets.find((item) => item.id === widgetId)
      if (widget) {
        setLayoutAnnouncement(
          currentlyCollapsed
            ? `${widget.title} expanded.`
            : `${widget.title} collapsed.`
        )
      }
    },
    [activeWidgets, onWidgetCollapse]
  )

  const handleReset = useCallback(() => {
    onReset?.()
    toast({
      title: 'Dashboard reset',
      description: 'Your dashboard layout has been reset to default.',
    })
  }, [onReset, toast])

  return (
    <Card className={cn('border-dashed transition-colors', isEditing && 'border-primary')}>
      <LiveRegion message={layoutAnnouncement} />
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm">Dashboard Widgets</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={isEditing ? 'default' : 'outline'}
                  size="sm"
                  onClick={onEditToggle}
                >
                  {isEditing ? 'Done' : 'Customize'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isEditing ? 'Finish customizing' : 'Customize dashboard layout'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {onReset && isEditing && (
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </CardHeader>

      {isEditing && (
        <CardContent className="space-y-4">
          <p id={instructionsId} className="sr-only">
            Use the move up and move down buttons, or press Alt plus Up Arrow and Alt plus Down Arrow while focused on a widget row, to reorder widgets in your dashboard.
          </p>
          <ul className="list-none space-y-2" aria-describedby={instructionsId}>
            <h3 className="text-xs font-medium text-muted-foreground uppercase">
              Active Widgets ({visibleWidgets.length})
            </h3>
            {visibleWidgets.map((widget, index) => (
              <DashboardWidgetRow
                key={widget.id}
                instructionsId={instructionsId}
                widget={widget}
                index={index}
                total={visibleWidgets.length}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onCollapse={handleCollapse}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </ul>

          {hiddenWidgets.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">
                Hidden Widgets ({hiddenWidgets.length})
              </h3>
              {hiddenWidgets.map((widget) => (
                <HiddenDashboardWidgetRow
                  key={widget.id}
                  widget={widget}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
