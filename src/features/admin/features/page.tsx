'use client'

import { useCallback, useMemo, useState } from 'react'
import { Lightbulb, LoaderCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'
import { useMutation, useQuery } from 'convex/react'
import { api } from '/_generated/api'
import type { Id } from '/_generated/dataModel'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { cn } from '@/lib/utils'
import { getPreviewAdminFeatures } from '@/lib/preview-data'
import type { FeatureItem, FeatureStatus, FeaturePriority, FeatureReference } from '@/types/features'
import { AdminPageShell } from '../components/admin-page-shell'
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
} from '@/shared/ui/alert-dialog'

function AdminFeaturesToolbarActions({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean
  onRefresh: () => void
}) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
      <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} aria-hidden />
      Refresh
    </Button>
  )
}

type FeatureRow = {
  id: string
  title: string
  description: string
  status: FeatureStatus
  priority: FeaturePriority
  imageUrl: string | null
  references: FeatureReference[]
  createdAtMs: number
  updatedAtMs: number
}

type FeatureDocId = Id<'platformFeatures'>

function toFeatureDocId(value: string): FeatureDocId {
  return value as unknown as FeatureDocId
}

export default function AdminFeaturesPage() {
  // Convex identity auth is handled by Convex client.
  // This page no longer calls `/api/admin/*`.

  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const [refreshing, setRefreshing] = useState(false)
  const [previewFeatures, setPreviewFeatures] = useState<FeatureItem[]>(() => getPreviewAdminFeatures())

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<FeatureItem | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<FeatureStatus>('backlog')

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [featureToDelete, setFeatureToDelete] = useState<FeatureItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const featuresResponse = useQuery(api.adminFeatures.listFeatures, isPreviewMode ? 'skip' : {})
  const createFeature = useMutation(api.adminFeatures.createFeature)
  const updateFeature = useMutation(api.adminFeatures.updateFeature)
  const deleteFeature = useMutation(api.adminFeatures.deleteFeature)

  const features: FeatureItem[] = useMemo(() => {
    if (isPreviewMode) {
      return previewFeatures
    }

    const raw = (featuresResponse?.features ?? []) as FeatureRow[]
    return raw.map((row) => ({
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
  }, [featuresResponse, isPreviewMode, previewFeatures])

  const loading = isPreviewMode ? false : featuresResponse === undefined

  const fetchFeatures = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) return
      setRefreshing(true)
      if (isPreviewMode) {
        setPreviewFeatures(getPreviewAdminFeatures())
        setTimeout(() => setRefreshing(false), 250)
        return
      }
      // Convex is realtime; keep button for UX.
      setTimeout(() => setRefreshing(false), 400)
    },
    [isPreviewMode]
  )

  const handleRefresh = useCallback(() => {
    void fetchFeatures(true)
  }, [fetchFeatures])

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

  const confirmDelete = useCallback(() => {
    if (!featureToDelete) return

    if (isPreviewMode) {
      setPreviewFeatures((current) => current.filter((feature) => feature.id !== featureToDelete.id))
      toast({
        title: 'Preview mode',
        description: 'Sample feature removed locally for this session.',
      })
      setDeleteConfirmOpen(false)
      setFeatureToDelete(null)
      return
    }

    setIsDeleting(true)

    void deleteFeature({ id: toFeatureDocId(featureToDelete.id) })
      .then(() => {
        toast({
          title: 'Feature deleted',
          description: 'The feature has been removed from the board.',
        })
      })
      .catch((error) => {
        logError(error, 'AdminFeaturesPage:confirmDelete')
        console.error('Failed to delete feature:', error)
        toast({
          title: 'Delete failed',
          description: 'Unable to delete the feature. Please try again.',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setIsDeleting(false)
        setDeleteConfirmOpen(false)
        setFeatureToDelete(null)
      })
  }, [deleteFeature, featureToDelete, isPreviewMode, toast])

  const handleMoveFeature = useCallback(
    (featureId: string, newStatus: FeatureStatus) => {
      const feature = features.find((f) => f.id === featureId)
      if (!feature || feature.status === newStatus) return

      if (isPreviewMode) {
        setPreviewFeatures((current) => current.map((item) => (
          item.id === featureId ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
        )))
        toast({
          title: 'Preview mode',
          description: `Sample feature moved to ${newStatus.replace('_', ' ')}.`,
        })
        return
      }

      void updateFeature({ id: toFeatureDocId(featureId), status: newStatus })
        .then(() => {
          toast({
            title: 'Status updated',
            description: `Feature moved to ${newStatus.replace('_', ' ')}.`,
          })
        })
        .catch((error) => {
          logError(error, 'AdminFeaturesPage:handleMoveFeature')
          console.error('Failed to move feature:', error)
          // Convex is source of truth; UI will settle automatically.
          toast({
            title: 'Move failed',
            description: 'Unable to update the feature status.',
            variant: 'destructive',
          })
        })
    },
    [features, isPreviewMode, toast, updateFeature]
  )

  const handleSubmitFeature = useCallback(
    (data: {
      title: string
      description: string
      status: FeatureStatus
      priority: FeaturePriority
      imageUrl: string | null
      references: FeatureReference[]
    }) => {
      if (isPreviewMode) {
        return Promise.resolve().then(() => {
          if (editingFeature) {
            setPreviewFeatures((current) => current.map((feature) => (
              feature.id === editingFeature.id
                ? {
                    ...feature,
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    imageUrl: data.imageUrl,
                    references: data.references,
                    updatedAt: new Date().toISOString(),
                  }
                : feature
            )))
          } else {
            setPreviewFeatures((current) => [
              {
                id: `preview-feature-${Date.now()}`,
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                imageUrl: data.imageUrl,
                references: data.references,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              ...current,
            ])
          }

          toast({
            title: editingFeature ? 'Preview feature updated' : 'Preview feature added',
            description: 'Changes apply only to the sample board in this session.',
          })
        })
      }

      const operation = editingFeature
        ? updateFeature({
            id: toFeatureDocId(editingFeature.id),
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            imageUrl: data.imageUrl,
            references: data.references,
          })
        : createFeature({
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            imageUrl: data.imageUrl,
            references: data.references,
          })

      return operation
        .then(() => {
          toast({
            title: editingFeature ? 'Feature updated' : 'Feature added',
            description: editingFeature
              ? 'Your changes have been saved.'
              : 'The new feature has been added to the board.',
          })
        })
        .catch((error) => {
          logError(error, 'AdminFeaturesPage:handleSubmitFeature')
          console.error('Failed to save feature:', error)
          toast({
            title: 'Save failed',
            description: asErrorMessage(error),
            variant: 'destructive',
          })
        })
    },
    [createFeature, editingFeature, isPreviewMode, toast, updateFeature]
  )

  const featuresToolbarActions = useMemo(
    () => <AdminFeaturesToolbarActions refreshing={refreshing} onRefresh={handleRefresh} />,
    [refreshing, handleRefresh],
  )

  if (loading) {
    return (
      <AdminPageShell title="Feature planning" description="Loading the platform backlog…">
        <div className="grid gap-4 lg:grid-cols-4">
          {['sk-a', 'sk-b', 'sk-c', 'sk-d'].map((key) => (
            <div key={key} className="space-y-3 rounded-lg border border-border/60 bg-card/50 p-4">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </AdminPageShell>
    )
  }

  return (
    <>
    <AdminPageShell
      title="Feature planning"
      description={
        <>
          Plan and track platform features on a visual Kanban board.
          {isPreviewMode ? ' Preview mode uses a local sample backlog.' : ''}
        </>
      }
      isPreviewMode={isPreviewMode}
      actions={featuresToolbarActions}
    >
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Lightbulb className="h-4 w-4" />
        </span>
        <span>Drag cards between columns or open a card to edit details.</span>
      </div>

      <FeatureKanbanBoard
        features={features}
        onAddFeature={handleAddFeature}
        onEditFeature={handleEditFeature}
        onDeleteFeature={handleDeleteFeature}
        onMoveFeature={handleMoveFeature}
      />
    </AdminPageShell>

      <FeatureFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        feature={editingFeature}
        defaultStatus={defaultStatus}
        onSubmit={handleSubmitFeature}
      />

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
    </>
  )
}
