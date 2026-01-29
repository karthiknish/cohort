'use client'

import { useState, useCallback, useMemo } from 'react'
import { GripVertical, X, ChevronDown, ChevronUp, Eye, EyeOff, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export type DashboardWidget = {
  id: string
  title: string
  description?: string
  component: string
  size: 'small' | 'medium' | 'large'
  visible: boolean
  collapsible: boolean
  collapsed?: boolean
  category: 'analytics' | 'tasks' | 'finance' | 'collaboration' | 'projects' | 'admin'
}

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

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'stats-cards',
    title: 'Stats Overview',
    component: 'StatsCards',
    size: 'large',
    visible: true,
    collapsible: false,
    category: 'analytics',
  },
  {
    id: 'performance-chart',
    title: 'Performance Chart',
    component: 'PerformanceChart',
    size: 'large',
    visible: true,
    collapsible: false,
    category: 'analytics',
  },
  {
    id: 'attention-summary',
    title: 'Attention Summary',
    component: 'AttentionSummaryCard',
    size: 'medium',
    visible: true,
    collapsible: true,
    category: 'admin',
  },
  {
    id: 'activity-feed',
    title: 'Recent Activity',
    component: 'ActivityWidget',
    size: 'medium',
    visible: true,
    collapsible: true,
    category: 'collaboration',
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    component: 'QuickActions',
    size: 'small',
    visible: true,
    collapsible: false,
    category: 'admin',
  },
  {
    id: 'tasks-kanban',
    title: 'Task Board',
    component: 'MiniTaskKanban',
    size: 'medium',
    visible: true,
    collapsible: true,
    category: 'tasks',
  },
  {
    id: 'tasks-list',
    title: 'Upcoming Tasks',
    component: 'TasksCard',
    size: 'small',
    visible: true,
    collapsible: true,
    category: 'tasks',
  },
  {
    id: 'platform-comparison',
    title: 'Platform Comparison',
    component: 'PlatformComparisonSummaryCard',
    size: 'small',
    visible: true,
    collapsible: true,
    category: 'analytics',
  },
  {
    id: 'ad-insights',
    title: 'Ad Insights',
    component: 'AdInsightsWidget',
    size: 'medium',
    visible: true,
    collapsible: true,
    category: 'analytics',
  },
  {
    id: 'workspace-comparison',
    title: 'Workspace Comparison',
    component: 'WorkspaceComparison',
    size: 'medium',
    visible: true,
    collapsible: true,
    category: 'analytics',
  },
  {
    id: 'workspace-trends',
    title: 'Workspace Trends',
    component: 'WorkspaceTrendsCard',
    size: 'medium',
    visible: true,
    collapsible: true,
    category: 'analytics',
  },
]

export { DEFAULT_WIDGETS }

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

  const visibleWidgets = useMemo(
    () => activeWidgets.filter((w) => w.visible),
    [activeWidgets]
  )

  const hiddenWidgets = useMemo(
    () => availableWidgets.filter((w) => !activeWidgets.some((aw) => aw.id === w.id)),
    [availableWidgets, activeWidgets]
  )

  // Group widgets by category
  const widgetsByCategory = useMemo(() => {
    const grouped: Record<string, DashboardWidget[]> = {
      analytics: [],
      tasks: [],
      finance: [],
      collaboration: [],
      projects: [],
      admin: [],
    }
    visibleWidgets.forEach((widget) => {
      const category = widget.category as keyof typeof grouped
      if (grouped[category]) {
        grouped[category].push(widget)
      }
    })
    return grouped
  }, [visibleWidgets])

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return
    const newWidgets = [...visibleWidgets]
    const temp = newWidgets[index - 1]!
    newWidgets[index - 1] = newWidgets[index]!
    newWidgets[index] = temp
    onLayoutChange(newWidgets)
  }, [visibleWidgets, onLayoutChange])

  const handleMoveDown = useCallback((index: number) => {
    if (index === visibleWidgets.length - 1) return
    const newWidgets = [...visibleWidgets]
    const temp = newWidgets[index + 1]!
    newWidgets[index + 1] = newWidgets[index]!
    newWidgets[index] = temp
    onLayoutChange(newWidgets)
  }, [visibleWidgets, onLayoutChange])

  const handleToggleVisibility = useCallback(
    (widgetId: string, currentlyVisible: boolean) => {
      onWidgetToggle(widgetId, !currentlyVisible)
      toast({
        title: currentlyVisible ? 'Widget hidden' : 'Widget shown',
        description: currentlyVisible
          ? 'The widget has been removed from your dashboard.'
          : 'The widget has been added to your dashboard.',
      })
    },
    [onWidgetToggle, toast]
  )

  const handleCollapse = useCallback(
    (widgetId: string, currentlyCollapsed: boolean) => {
      onWidgetCollapse(widgetId, !currentlyCollapsed)
    },
    [onWidgetCollapse]
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
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
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
          {/* Active widgets */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase">
              Active Widgets ({visibleWidgets.length})
            </h3>
            {visibleWidgets.map((widget, index) => (
              <div
                key={widget.id}
                className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 group"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === visibleWidgets.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{widget.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {widget.description || widget.category}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {widget.collapsible && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              handleCollapse(widget.id, widget.collapsed ?? false)
                            }
                          >
                            {widget.collapsed ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {widget.collapsed ? 'Expand widget' : 'Collapse widget'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggleVisibility(widget.id, true)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Hide widget</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>

          {/* Hidden widgets */}
          {hiddenWidgets.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase">
                Hidden Widgets ({hiddenWidgets.length})
              </h3>
              {hiddenWidgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-2 rounded-lg border bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium">{widget.title}</p>
                    <p className="text-xs text-muted-foreground">{widget.category}</p>
                  </div>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggleVisibility(widget.id, false)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Show widget</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

/**
 * Draggable widget wrapper for dashboard items
 */
export function DraggableWidget({
  widget,
  isEditing,
  onCollapse,
  onRemove,
  children,
}: {
  widget: DashboardWidget
  isEditing: boolean
  onCollapse?: () => void
  onRemove?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'relative group rounded-lg border bg-background transition-all',
        isEditing && 'ring-2 ring-primary/20',
        widget.collapsed && 'overflow-hidden'
      )}
    >
      {/* Drag handle for editing mode */}
      {isEditing && (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
        </div>
      )}

      {/* Widget content */}
      {children}
    </div>
  )
}

/**
 * Widget size selector
 */
export function WidgetSizeSelector({
  currentSize,
  onSizeChange,
  disabled,
}: {
  currentSize: 'small' | 'medium' | 'large'
  onSizeChange: (size: 'small' | 'medium' | 'large') => void
  disabled?: boolean
}) {
  const sizes: Array<{ value: 'small' | 'medium' | 'large'; label: string; width: string }> = [
    { value: 'small', label: 'S', width: 'col-span-1' },
    { value: 'medium', label: 'M', width: 'col-span-2' },
    { value: 'large', label: 'L', width: 'lg:col-span-2' },
  ]

  return (
    <div className="flex items-center gap-1">
      {sizes.map((size) => (
        <button
          key={size.value}
          type="button"
          onClick={() => onSizeChange(size.value)}
          disabled={disabled}
          className={cn(
            'h-6 w-6 rounded flex items-center justify-center text-xs font-medium transition-colors',
            currentSize === size.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/70',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          title={`${size.label}: ${size.width}`}
        >
          {size.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Hook for managing dashboard widget state
 */
export function useDashboardWidgets(initialWidgets?: DashboardWidget[]) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(
    initialWidgets ?? DEFAULT_WIDGETS
  )

  const toggleWidget = useCallback((widgetId: string, visible: boolean) => {
    setWidgets((prev) => {
      const widget = prev.find((w) => w.id === widgetId)
      if (!widget) return prev

      if (visible) {
        // Add to active widgets if not already present
        if (!prev.some((w) => w.id === widgetId)) {
          return [...prev, { ...widget, visible: true }]
        }
        return prev.map((w) => (w.id === widgetId ? { ...w, visible: true } : w))
      } else {
        // Remove from visible widgets (or mark as hidden)
        return prev.map((w) => (w.id === widgetId ? { ...w, visible: false } : w))
      }
    })
  }, [])

  const collapseWidget = useCallback((widgetId: string, collapsed: boolean) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, collapsed } : w))
    )
  }, [])

  const resetWidgets = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS)
  }, [])

  const moveWidget = useCallback((fromIndex: number, toIndex: number) => {
    setWidgets((prev) => {
      const newWidgets = [...prev]
      const [removed] = newWidgets.splice(fromIndex, 1)
      if (removed) {
        newWidgets.splice(toIndex, 0, removed)
      }
      return newWidgets
    })
  }, [])

  return {
    widgets,
    setWidgets,
    toggleWidget,
    collapseWidget,
    resetWidgets,
    moveWidget,
  }
}
