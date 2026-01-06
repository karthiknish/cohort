'use client'

import { useCallback, useEffect, useState } from 'react'
import { Lightbulb, LoaderCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
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
  const { getIdToken } = useAuth()
  const { toast } = useToast()

  const [features, setFeatures] = useState<FeatureItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<FeatureItem | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<FeatureStatus>('backlog')

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [featureToDelete, setFeatureToDelete] = useState<FeatureItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchFeatures = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const token = await getIdToken()
        const response = await fetch('/api/admin/features', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch features')
        }

        const data = await response.json()
        setFeatures(data.features ?? [])
      } catch (error) {
        console.error('Failed to fetch features:', error)
        toast({
          title: 'Failed to load features',
          description: 'Please try refreshing the page.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [getIdToken, toast]
  )

  useEffect(() => {
    fetchFeatures()
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

  const confirmDelete = useCallback(async () => {
    if (!featureToDelete) return

    setIsDeleting(true)

    try {
      const token = await getIdToken()
      const response = await fetch(`/api/admin/features/${featureToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to delete feature')
      }

      setFeatures((prev) => prev.filter((f) => f.id !== featureToDelete.id))
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
  }, [featureToDelete, getIdToken, toast])

  const handleMoveFeature = useCallback(
    async (featureId: string, newStatus: FeatureStatus) => {
      const feature = features.find((f) => f.id === featureId)
      if (!feature || feature.status === newStatus) return

      // Optimistic update
      setFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? { ...f, status: newStatus } : f))
      )

      try {
        const token = await getIdToken()
        const response = await fetch(`/api/admin/features/${featureId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
          throw new Error('Failed to update feature status')
        }

        toast({
          title: 'Status updated',
          description: `Feature moved to ${newStatus.replace('_', ' ')}.`,
        })
      } catch (error) {
        console.error('Failed to move feature:', error)
        // Revert optimistic update
        setFeatures((prev) =>
          prev.map((f) => (f.id === featureId ? { ...f, status: feature.status } : f))
        )
        toast({
          title: 'Move failed',
          description: 'Unable to update the feature status.',
          variant: 'destructive',
        })
      }
    },
    [features, getIdToken, toast]
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
      const token = await getIdToken()

      if (editingFeature) {
        // Update existing feature
        const response = await fetch(`/api/admin/features/${editingFeature.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to update feature')
        }

        const result = await response.json()
        setFeatures((prev) =>
          prev.map((f) => (f.id === editingFeature.id ? result.feature : f))
        )

        toast({
          title: 'Feature updated',
          description: 'Your changes have been saved.',
        })
      } else {
        // Create new feature
        const response = await fetch('/api/admin/features', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to create feature')
        }

        const result = await response.json()
        setFeatures((prev) => [result.feature, ...prev])

        toast({
          title: 'Feature added',
          description: 'The new feature has been added to the board.',
        })
      }
    },
    [editingFeature, getIdToken, toast]
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
