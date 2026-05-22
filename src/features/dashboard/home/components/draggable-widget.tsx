'use client'

import { GripVertical } from 'lucide-react'
import { chromaticTransitionClass } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { DashboardWidget } from './dashboard-customization-types'

/**
 * Draggable widget wrapper for dashboard items
 */
export function DraggableWidget({
  widget,
  isEditing,
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
        'relative group rounded-lg border bg-background',
        chromaticTransitionClass,
        isEditing && 'ring-2 ring-primary/20',
        widget.collapsed && 'overflow-hidden'
      )}
    >
      {isEditing && (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
          <GripVertical className="size-4 text-muted-foreground cursor-grab" />
        </div>
      )}

      {children}
    </div>
  )
}
