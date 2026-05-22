'use client'

import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error'
import { useCallback, useMemo, useReducer } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '/_generated/api'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'
import { getPreviewAdminFeatures } from '@/lib/preview-data'
import type { FeatureItem, FeaturePriority, FeatureReference, FeatureStatus } from '@/types/features'
import {
  adminFeaturesReducer,
  createInitialAdminFeaturesState,
  toFeatureDocId,
  type FeatureRow,
  type FeatureSubmitData,
} from '../admin-features-types'

export function useAdminFeaturesPage() {
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const [state, dispatch] = useReducer(adminFeaturesReducer, undefined, createInitialAdminFeaturesState)
  const {
    refreshing,
    previewFeatures,
    formDialogOpen,
    editingFeature,
    defaultStatus,
    deleteConfirmOpen,
    featureToDelete,
    isDeleting,
  } = state

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

  const featuresQueryError = useConvexQueryError({
    data: featuresResponse,
    skipped: isPreviewMode,
    loading,
    fallbackMessage: 'Unable to load the feature backlog.',
  })

  const fetchFeatures = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) return
      dispatch({ type: 'setRefreshing', value: true })
      if (isPreviewMode) {
        dispatch({ type: 'setPreviewFeatures', value: getPreviewAdminFeatures() })
        setTimeout(() => dispatch({ type: 'setRefreshing', value: false }), 250)
        return
      }
      setTimeout(() => dispatch({ type: 'setRefreshing', value: false }), 400)
    },
    [isPreviewMode]
  )

  const handleRefresh = useCallback(() => {
    void fetchFeatures(true)
  }, [fetchFeatures])

  const handleAddFeature = useCallback((status: FeatureStatus) => {
    dispatch({ type: 'openFormDialog', editingFeature: null, defaultStatus: status })
  }, [])

  const handleEditFeature = useCallback((feature: FeatureItem) => {
    dispatch({ type: 'openFormDialog', editingFeature: feature, defaultStatus: feature.status })
  }, [])

  const handleDeleteFeature = useCallback((feature: FeatureItem) => {
    dispatch({ type: 'openDeleteConfirm', feature })
  }, [])

  const handleFormDialogOpenChange = useCallback((open: boolean) => {
    dispatch({ type: 'setFormDialogOpen', value: open })
  }, [])

  const handleDeleteConfirmOpenChange = useCallback((open: boolean) => {
    if (!open) {
      dispatch({ type: 'closeDeleteConfirm' })
    }
  }, [])

  const confirmDelete = useCallback(() => {
    if (!featureToDelete) return

    if (isPreviewMode) {
      dispatch({
        type: 'updatePreviewFeatures',
        updater: (current) => current.filter((feature) => feature.id !== featureToDelete.id),
      })
      toast({
        title: 'Preview mode',
        description: 'Sample feature removed locally for this session.',
      })
      dispatch({ type: 'closeDeleteConfirm' })
      return
    }

    dispatch({ type: 'setIsDeleting', value: true })

    void deleteFeature({ id: toFeatureDocId(featureToDelete.id) })
      .then(() => {
        toast({
          title: 'Feature deleted',
          description: 'The feature has been removed from the board.',
        })
      })
      .catch((error) => {
        reportConvexFailure({
          error: error,
          context: 'AdminFeaturesPage:confirmDelete',
          title: 'Delete failed',
          fallbackMessage: 'Delete failed',
        })
      })
      .finally(() => {
        dispatch({ type: 'closeDeleteConfirm' })
      })
  }, [deleteFeature, featureToDelete, isPreviewMode, toast])

  const handleMoveFeature = useCallback(
    (featureId: string, newStatus: FeatureStatus) => {
      const feature = features.find((f) => f.id === featureId)
      if (!feature || feature.status === newStatus) return

      if (isPreviewMode) {
        dispatch({
          type: 'updatePreviewFeatures',
          updater: (current) => current.map((item) => (
            item.id === featureId ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
          )),
        })
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
          reportConvexFailure({
            error,
            context: 'AdminFeaturesPage:handleMoveFeature',
            title: 'Move failed',
            fallbackMessage: 'Unable to update feature status.',
          })
        })
    },
    [features, isPreviewMode, toast, updateFeature]
  )

  const handleSubmitFeature = useCallback(
    (data: FeatureSubmitData) => {
      if (isPreviewMode) {
        return Promise.resolve().then(() => {
          if (editingFeature) {
            dispatch({
              type: 'updatePreviewFeatures',
              updater: (current) => current.map((feature) => (
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
              )),
            })
          } else {
            dispatch({
              type: 'updatePreviewFeatures',
              updater: (current) => [
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
              ],
            })
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
          reportConvexFailure({
            error: error,
            context: 'AdminFeaturesPage:handleSubmitFeature',
            title: 'Save failed',
            fallbackMessage: 'Save failed',
          })
        })
    },
    [createFeature, editingFeature, isPreviewMode, toast, updateFeature]
  )

  return {
    isPreviewMode,
    loading,
    features,
    featuresQueryError,
    refreshing,
    formDialogOpen,
    editingFeature,
    defaultStatus,
    deleteConfirmOpen,
    featureToDelete,
    isDeleting,
    handleRefresh,
    handleAddFeature,
    handleEditFeature,
    handleDeleteFeature,
    handleFormDialogOpenChange,
    handleDeleteConfirmOpenChange,
    confirmDelete,
    handleMoveFeature,
    handleSubmitFeature,
  }
}
