'use client'

import { useCallback, useMemo, useState } from 'react'
import { Lightbulb, LoaderCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { toErrorMessage } from '@/lib/error-utils'
import { cn } from '@/lib/utils'
import type { FeatureItem, FeatureStatus, FeaturePriority, FeatureReference } from '@/types/features'
import { FeatureKanbanBoard } from './components/feature-kanban-board'
import { FeatureFormDialog } from './components/feature-form-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function AdminFeaturesPage() {
  // Convex identity auth is handled by Convex client.
  // This page no longer calls `/api/admin/*`.

  const { toast } = useToast()

  const [refreshing, setRefreshing] = useState(false)

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<FeatureItem | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<FeatureStatus>('backlog')

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [featureToDelete, setFeatureToDelete] = useState<FeatureItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const featuresResponse = useQuery(api.adminFeatures.listFeatures)
  const createFeature = useMutation(api.adminFeatures.createFeature)
  const updateFeature = useMutation(api.adminFeatures.updateFeature)
  const deleteFeature = useMutation(api.adminFeatures.deleteFeature)

  const features: FeatureItem[] = useMemo(() => {
    const raw = featuresResponse?.features ?? []
    return raw.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      imageUrl: row.imageUrl,
      references: row.references,
      createdAt: new Date(row.createdAtMs).toISOString(),
      updatedAt: new Date(row.updatedAtMs).toISOString(),
    }))
  }, [featuresResponse])

  const loading = featuresResponse === undefined

  const fetchFeatures = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) return
      setRefreshing(true)
      // Convex is realtime; keep button for UX.
      setTimeout(() => setRefreshing(false), 400)
    },
    []
  )

  const handleAddFeature = useCallback((status: FeatureStatus) => {
    setEditingFeature(null)
    setDefaultStatus(status)
    setFormDialogOpen(true)
  }, [])

  const handleEditFeature = useCallback((feature: FeatureItem) => {
    setEditingFeature(feature)
    setDefaultStatus(feature.status)
    setFormDialogOpen(true)
  }, [])

  const handleDeleteFeature = useCallback((feature: FeatureItem) => {
    setFeatureToDelete(feature)
    setDeleteConfirmOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!featureToDelete) return

    setIsDeleting(true)

    try {
      await deleteFeature({ id: featureToDelete.id as any })
      toast({
        title: 'Feature deleted',
        description: 'The feature has been removed from the board.',
      })
    } catch (error) {
      console.error('Failed to delete feature:', error)
      toast({
        title: 'Delete failed',
        description: 'Unable to delete the feature. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setFeatureToDelete(null)
    }
  }, [featureToDelete, toast])

  const handleMoveFeature = useCallback(
    async (featureId: string, newStatus: FeatureStatus) => {
      const feature = features.find((f) => f.id === featureId)
      if (!feature || feature.status === newStatus) return

      try {
        await updateFeature({ id: featureId as any, status: newStatus as any })

        toast({
          title: 'Status updated',
          description: `Feature moved to ${newStatus.replace('_', ' ')}.`,
        })
      } catch (error) {
        console.error('Failed to move feature:', error)
        // Convex is source of truth; UI will settle automatically.
        toast({
          title: 'Move failed',
          description: 'Unable to update the feature status.',
          variant: 'destructive',
        })
      }
    },
    [features, toast]
  )

  const handleSubmitFeature = useCallback(
    async (data: {
      title: string
      description: string
      status: FeatureStatus
      priority: FeaturePriority
      imageUrl: string | null
      references: FeatureReference[]
    }) => {
      try {
        if (editingFeature) {
          // Update existing feature
          await updateFeature({
            id: editingFeature.id as any,
            title: data.title,
            description: data.description,
            status: data.status as any,
            priority: data.priority as any,
            imageUrl: data.imageUrl,
            references: data.references,
          })

          toast({
            title: 'Feature updated',
            description: 'Your changes have been saved.',
          })
        } else {
          // Create new feature
          await createFeature({
            title: data.title,
            description: data.description,
            status: data.status as any,
            priority: data.priority as any,
            imageUrl: data.imageUrl,
            references: data.references,
          })

          toast({
            title: 'Feature added',
            description: 'The new feature has been added to the board.',
          })
        }
      } catch (error) {
        console.error('Failed to save feature:', error)
        toast({
          title: 'Save failed',
          description: toErrorMessage(error, 'Unable to save the feature. Please try again.'),
          variant: 'destructive',
        })
      }
    },
    [editingFeature, toast, createFeature, updateFeature]
  )

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading features...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Feature Planning</h1>
            <p className="text-sm text-muted-foreground">
              Plan and track platform features with a visual Kanban board.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchFeatures(true)}
          disabled={refreshing}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Kanban Board */}
      <FeatureKanbanBoard
        features={features}
        onAddFeature={handleAddFeature}
        onEditFeature={handleEditFeature}
        onDeleteFeature={handleDeleteFeature}
        onMoveFeature={handleMoveFeature}
      />

      {/* Feature Form Dialog */}
      <FeatureFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        feature={editingFeature}
        defaultStatus={defaultStatus}
        onSubmit={handleSubmitFeature}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{featureToDelete?.title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
