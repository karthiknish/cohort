'use client'

import { useCallback, useState, DragEvent } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FeatureItem, FeatureStatus } from '@/types/features'
import { FEATURE_STATUSES, FEATURE_STATUS_LABELS, FEATURE_STATUS_COLORS } from '@/types/features'
import { FeatureCard } from './feature-card'

interface FeatureKanbanBoardProps {
  features: FeatureItem[]
  onAddFeature: (status: FeatureStatus) => void
  onEditFeature: (feature: FeatureItem) => void
  onDeleteFeature: (feature: FeatureItem) => void
  onMoveFeature: (featureId: string, newStatus: FeatureStatus) => void
}

export function FeatureKanbanBoard({
  features,
  onAddFeature,
  onEditFeature,
  onDeleteFeature,
  onMoveFeature,
}: FeatureKanbanBoardProps) {
  const [draggedFeature, setDraggedFeature] = useState<FeatureItem | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<FeatureStatus | null>(null)

  const getFeaturesByStatus = useCallback(
    (status: FeatureStatus) => features.filter((f) => f.status === status),
    [features]
  )

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, feature: FeatureItem) => {
      setDraggedFeature(feature)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', feature.id)
    },
    []
  )

  const handleDragEnd = useCallback(() => {
    setDraggedFeature(null)
    setDragOverColumn(null)
  }, [])

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, status: FeatureStatus) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverColumn(status)
    },
    []
  )

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, targetStatus: FeatureStatus) => {
      e.preventDefault()
      const featureId = e.dataTransfer.getData('text/plain')

      if (featureId && draggedFeature && draggedFeature.status !== targetStatus) {
        onMoveFeature(featureId, targetStatus)
      }

      setDraggedFeature(null)
      setDragOverColumn(null)
    },
    [draggedFeature, onMoveFeature]
  )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {FEATURE_STATUSES.map((status) => {
        const columnFeatures = getFeaturesByStatus(status)
        const isDropTarget = dragOverColumn === status
        const isDraggedFromThis = draggedFeature?.status === status

        return (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            className={cn(
              'flex flex-col rounded-xl border bg-muted/30 transition-all min-h-[500px]',
              isDropTarget && !isDraggedFromThis && 'border-primary bg-primary/5 ring-2 ring-primary/20'
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b p-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    FEATURE_STATUS_COLORS[status]
                  )}
                >
                  {FEATURE_STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {columnFeatures.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onAddFeature(status)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Column Content */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {columnFeatures.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <p className="text-xs text-muted-foreground">
                    No features
                  </p>
                </div>
              ) : (
                columnFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, feature)}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <FeatureCard
                      feature={feature}
                      onEdit={onEditFeature}
                      onDelete={onDeleteFeature}
                      isDragging={draggedFeature?.id === feature.id}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Add Button at Bottom */}
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => onAddFeature(status)}
              >
                <Plus className="h-4 w-4" />
                Add feature
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
