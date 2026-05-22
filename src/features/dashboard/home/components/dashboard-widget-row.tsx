'use client'

import { useCallback } from 'react'
import { ChevronDown, ChevronUp, Eye, EyeOff, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import type { DashboardWidget } from './dashboard-customization-types'

export function DashboardWidgetRow({
  instructionsId,
  widget,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onCollapse,
  onToggleVisibility,
}: {
  instructionsId: string
  widget: DashboardWidget
  index: number
  total: number
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onCollapse: (widgetId: string, collapsed: boolean) => void
  onToggleVisibility: (widgetId: string, currentlyVisible: boolean) => void
}) {
  const handleMoveUp = useCallback(() => {
    onMoveUp(index)
  }, [index, onMoveUp])

  const handleMoveDown = useCallback(() => {
    onMoveDown(index)
  }, [index, onMoveDown])

  const handleCollapse = useCallback(() => {
    onCollapse(widget.id, widget.collapsed ?? false)
  }, [onCollapse, widget.collapsed, widget.id])

  const handleHide = useCallback(() => {
    onToggleVisibility(widget.id, true)
  }, [onToggleVisibility, widget.id])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!event.altKey) {
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        handleMoveUp()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        handleMoveDown()
      }
    },
    [handleMoveDown, handleMoveUp]
  )

  return (
    <li
      className="flex list-none items-center gap-2 rounded-lg border bg-muted/30 p-2 group"
      tabIndex={-1}
      aria-describedby={instructionsId}
      aria-label={`${widget.title}, position ${index + 1} of ${total}`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-5 p-0"
          onClick={handleMoveUp}
          disabled={index === 0}
          aria-label={`Move ${widget.title} up`}
        >
          <ChevronUp className="size-3" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-5 p-0"
          onClick={handleMoveDown}
          disabled={index === total - 1}
          aria-label={`Move ${widget.title} down`}
        >
          <ChevronDown className="size-3" aria-hidden />
        </Button>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{widget.title}</p>
        <p className="truncate text-xs text-muted-foreground">{widget.description || widget.category}</p>
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
                  className="size-7"
                  onClick={handleCollapse}
                  aria-expanded={!widget.collapsed}
                  aria-label={widget.collapsed ? `Expand ${widget.title}` : `Collapse ${widget.title}`}
                >
                  {widget.collapsed ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{widget.collapsed ? 'Expand widget' : 'Collapse widget'}</TooltipContent>
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
                className="size-7"
                onClick={handleHide}
                aria-label={`Hide ${widget.title}`}
              >
                <X className="size-3.5" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hide widget</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </li>
  )
}
