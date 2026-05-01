'use client'

import { useCallback, useState, type DragEvent } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { chromaticTransitionClass } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { FeatureItem, FeatureStatus } from '@/types/features'
import { FEATURE_STATUSES, FEATURE_STATUS_LABELS, getFeatureStatusBadgeStyle } from '@/types/features'
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

  const handleAddFeatureClick = useCallback(
    (status: FeatureStatus) => {
      onAddFeature(status)
    },
    [onAddFeature]
  )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {FEATURE_STATUSES.map((status) => {
        const columnFeatures = getFeaturesByStatus(status)
        const isDropTarget = dragOverColumn === status
        const isDraggedFromThis = draggedFeature?.status === status

        return (
          <FeatureKanbanColumn
            key={status}
            status={status}
            features={columnFeatures}
            isDropTarget={isDropTarget}
            isDraggedFromThis={isDraggedFromThis}
            draggedFeature={draggedFeature}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            onEditFeature={onEditFeature}
            onDeleteFeature={onDeleteFeature}
            onAddFeature={handleAddFeatureClick}
          />
        )
      })}
    </div>
  )
}

function FeatureKanbanColumn({
  status,
  features,
  isDropTarget,
  isDraggedFromThis,
  draggedFeature,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragStart,
  handleDragEnd,
  onEditFeature,
  onDeleteFeature,
  onAddFeature,
}: {
  status: FeatureStatus
  features: FeatureItem[]
  isDropTarget: boolean
  isDraggedFromThis: boolean
  draggedFeature: FeatureItem | null
  handleDragOver: (e: DragEvent<HTMLDivElement>, status: FeatureStatus) => void
  handleDragLeave: () => void
  handleDrop: (e: DragEvent<HTMLDivElement>, targetStatus: FeatureStatus) => void
  handleDragStart: (e: DragEvent<HTMLDivElement>, feature: FeatureItem) => void
  handleDragEnd: () => void
  onEditFeature: (feature: FeatureItem) => void
  onDeleteFeature: (feature: FeatureItem) => void
  onAddFeature: (status: FeatureStatus) => void
}) {
  const handleColumnDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    handleDragOver(e, status)
  }, [handleDragOver, status])

  const handleColumnDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    handleDrop(e, status)
  }, [handleDrop, status])

  const handleAddClick = useCallback(() => {
    onAddFeature(status)
  }, [onAddFeature, status])

  return (
    <div
      onDragOver={handleColumnDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleColumnDrop}
      className={cn(
        'flex flex-col rounded-xl border bg-muted/30 min-h-[500px]',
        chromaticTransitionClass,
        isDropTarget && !isDraggedFromThis && 'border-primary bg-primary/5 ring-2 ring-primary/20'
      )}
    >
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
            style={getFeatureStatusBadgeStyle(status)}
          >
            {FEATURE_STATUS_LABELS[status]}
          </span>
          <span className="text-xs text-muted-foreground">{features.length}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleAddClick}
          aria-label={`Add feature to ${FEATURE_STATUS_LABELS[status]} column`}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {features.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
            <p className="text-xs text-muted-foreground">No features</p>
          </div>
        ) : (
          features.map((feature) => (
            <FeatureKanbanDraggableItem
              key={feature.id}
              feature={feature}
              draggedFeatureId={draggedFeature?.id}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              onEditFeature={onEditFeature}
              onDeleteFeature={onDeleteFeature}
            />
          ))
        )}
      </div>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleAddClick}
        >
          <Plus className="h-4 w-4" />
          Add feature
        </Button>
      </div>
    </div>
  )
}

function FeatureKanbanDraggableItem({
  feature,
  draggedFeatureId,
  handleDragStart,
  handleDragEnd,
  onEditFeature,
  onDeleteFeature,
}: {
  feature: FeatureItem
  draggedFeatureId: string | undefined
  handleDragStart: (e: DragEvent<HTMLDivElement>, feature: FeatureItem) => void
  handleDragEnd: () => void
  onEditFeature: (feature: FeatureItem) => void
  onDeleteFeature: (feature: FeatureItem) => void
}) {
  const handleStart = useCallback((e: DragEvent<HTMLDivElement>) => {
    handleDragStart(e, feature)
  }, [feature, handleDragStart])

  return (
    <div
      draggable
      onDragStart={handleStart}
      onDragEnd={handleDragEnd}
      className="cursor-grab active:cursor-grabbing"
    >
      <FeatureCard
        feature={feature}
        onEdit={onEditFeature}
        onDelete={onDeleteFeature}
        isDragging={draggedFeatureId === feature.id}
      />
    </div>
  )
}
