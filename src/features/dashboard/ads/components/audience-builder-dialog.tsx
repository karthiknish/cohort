'use client'

import { useMemo, useCallback, useReducer } from 'react'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useAction } from 'convex/react'

import {
  Dialog,
  DialogContent,
} from '@/shared/ui/dialog'
import type { LocationMarker } from '@/shared/ui/location-map'
import { asErrorMessage } from '@/lib/convex-errors'
import { toast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { adsAudiencesApi } from '@/lib/convex-api'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils'

import { MetaAudiencesPanel } from '@/features/dashboard/ads/components/meta-audiences-panel'
import { MetaEventsToolsPanel } from '@/features/dashboard/ads/components/meta-events-tools-panel'
import {
  hasMetaAdvancedTools,
  hasMetaEventsTools,
  resolveMetaCampaignUiVisibility,
} from '@/lib/meta-campaign-ui'
import { MetaAdvancedToolsPanel } from '@/features/dashboard/ads/components/meta-advanced-tools-panel'
import {
  AudienceBuilderDialogFooter,
  AudienceBuilderDialogHeader,
  AudienceBuilderDialogTabs,
  type AudienceFormData,
} from './audience-builder-dialog-sections'

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  providerId: string
}

type AudienceBuilderState = {
  activeTab: string
  loading: boolean
  formData: AudienceFormData
  newSegment: string
  newInterest: string
}

type AudienceBuilderAction =
  | { type: 'setActiveTab'; value: string }
  | { type: 'setLoading'; value: boolean }
  | { type: 'setFormData'; value: AudienceFormData | ((prev: AudienceFormData) => AudienceFormData) }
  | { type: 'setNewSegment'; value: string }
  | { type: 'setNewInterest'; value: string }
  | { type: 'resetForm' }

function createInitialAudienceBuilderState(): AudienceBuilderState {
  return {
    activeTab: 'basics',
    loading: false,
    formData: {
      name: '',
      description: '',
      segments: [],
      locations: [],
      interests: [],
      genders: [],
    },
    newSegment: '',
    newInterest: '',
  }
}

function audienceBuilderReducer(state: AudienceBuilderState, action: AudienceBuilderAction): AudienceBuilderState {
  switch (action.type) {
    case 'setActiveTab':
      return { ...state, activeTab: action.value }
    case 'setLoading':
      return { ...state, loading: action.value }
    case 'setFormData':
      return {
        ...state,
        formData: typeof action.value === 'function' ? action.value(state.formData) : action.value,
      }
    case 'setNewSegment':
      return { ...state, newSegment: action.value }
    case 'setNewInterest':
      return { ...state, newInterest: action.value }
    case 'resetForm':
      return createInitialAudienceBuilderState()
    default:
      return state
  }
}

export function AudienceBuilderDialog({ isOpen, onOpenChange, providerId }: Props) {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()

  const createAudience = useAction(adsAudiencesApi.createAudience)

  const [state, dispatch] = useReducer(audienceBuilderReducer, undefined, createInitialAudienceBuilderState)
  const { activeTab, loading, formData, newSegment, newInterest } = state

  const handleAddSegment = useCallback(() => {
    if (!newSegment.trim()) return
    dispatch({
      type: 'setFormData',
      value: (prev) => ({
        ...prev,
        segments: [...prev.segments, newSegment.trim()],
      }),
    })
    dispatch({ type: 'setNewSegment', value: '' })
  }, [newSegment])

  const handleRemoveSegment = useCallback((index: number) => {
    dispatch({
      type: 'setFormData',
      value: (prev) => ({
        ...prev,
        segments: prev.segments.filter((_, i) => i !== index),
      }),
    })
  }, [])

  const handleAddInterest = useCallback((interest: string) => {
    if (formData.interests.includes(interest)) return
    dispatch({
      type: 'setFormData',
      value: (prev) => ({
        ...prev,
        interests: [...prev.interests, interest],
      }),
    })
    dispatch({ type: 'setNewInterest', value: '' })
  }, [formData.interests])

  const handleRemoveInterest = useCallback((interest: string) => {
    dispatch({
      type: 'setFormData',
      value: (prev) => ({
        ...prev,
        interests: prev.interests.filter((i) => i !== interest),
      }),
    })
  }, [])

  const handleLocationSelect = useCallback((location: LocationMarker) => {
    dispatch({
      type: 'setFormData',
      value: (prev) => {
        if (prev.locations.some((l) => l.id === location.id)) return prev
        return { ...prev, locations: [...prev.locations, location] }
      },
    })
  }, [])

  const handleLocationRemove = useCallback((locationId: string) => {
    dispatch({
      type: 'setFormData',
      value: (prev) => ({
        ...prev,
        locations: prev.locations.filter((l) => l.id !== locationId),
      }),
    })
  }, [])

  const handleGenderToggle = useCallback((gender: string) => {
    dispatch({
      type: 'setFormData',
      value: (prev) => ({
        ...prev,
        genders: prev.genders.includes(gender)
          ? prev.genders.filter((g) => g !== gender)
          : [...prev.genders, gender],
      }),
    })
  }, [])

  const handleAgePreset = useCallback((min: number, max: number) => {
    dispatch({
      type: 'setFormData',
      value: (prev) => ({
        ...prev,
        ageMin: min,
        ageMax: max,
      }),
    })
  }, [])

  const resetForm = useCallback(() => {
    dispatch({ type: 'resetForm' })
  }, [])

  const convexProviderId = toAdsProviderId(providerId)
  const isMetaAudience = convexProviderId === 'facebook'

  const handleCreate = useCallback(() => {
    if (!formData.name) {
      notifyFailure({
        title: 'Missing information',
        message: 'Please provide an audience name.',
      })
      return
    }

    if (
      !isMetaAudience &&
      formData.segments.length === 0 &&
      formData.locations.length === 0 &&
      formData.interests.length === 0
    ) {
      notifyFailure({
        title: 'Missing targeting',
        message: 'Please add at least one segment, location, or interest.',
      })
      return
    }

    dispatch({ type: 'setLoading', value: true })
    const workspaceId = user?.agencyId ? String(user.agencyId) : null
    if (!workspaceId) {
      notifyFailure({
        title: 'Error',
        message: 'Failed to create audience.',
      })
      dispatch({ type: 'setLoading', value: false })
      return
    }

    void createAudience({
        workspaceId,
      providerId: convexProviderId,
        clientId: selectedClientId ?? null,
        name: formData.name,
        description: formData.description,
        segments: isMetaAudience ? [] : formData.segments,
        locations: isMetaAudience ? [] : formData.locations.map((l) => ({ id: l.id, name: l.name, lat: l.lat, lng: l.lng })),
        interests: isMetaAudience ? [] : formData.interests,
        demographics: isMetaAudience
          ? undefined
          : {
          ageMin: formData.ageMin,
          ageMax: formData.ageMax,
          genders: formData.genders,
        },
      })

      .then((result) => {
        toast({
          title: 'Success',
          description: isMetaAudience
            ? `Empty custom audience "${formData.name}" created. Upload customer lists in Meta Events Manager, then attach to ad set targeting.`
            : result.message || `Audience "${formData.name}" created successfully.`,
        })

        onOpenChange(false)
        resetForm()
      })
      .catch((err: unknown) => {
        reportConvexFailure({
        error: err,
        context: 'audience-builder-dialog.tsx:catch',
        title: 'Could not create audience',
        fallbackMessage: 'Could not create audience',
        })
      })
      .finally(() => {
        dispatch({ type: 'setLoading', value: false })
      })
  }, [convexProviderId, formData, isMetaAudience, user, selectedClientId, createAudience, onOpenChange, resetForm])

  const handleDialogOpenChange = useCallback((open: boolean) => {
    onOpenChange(open)
    if (!open) resetForm()
  }, [onOpenChange, resetForm])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleDescriptionChange = useCallback((value: string) => {
    dispatch({
      type: 'setFormData',
      value: (prev) => ({ ...prev, description: value }),
    })
  }, [])

  const handleNameChange = useCallback((value: string) => {
    dispatch({
      type: 'setFormData',
      value: (prev) => ({ ...prev, name: value }),
    })
  }, [])

  const handleResetGenders = useCallback(() => {
    dispatch({
      type: 'setFormData',
      value: (prev) => ({ ...prev, genders: [] }),
    })
  }, [])

  const handleSelectStep = useCallback((step: string) => {
    dispatch({ type: 'setActiveTab', value: step })
  }, [])

  const handleSegmentInputChange = useCallback((value: string) => {
    dispatch({ type: 'setNewSegment', value })
  }, [])

  const handleInterestInputChange = useCallback((value: string) => {
    dispatch({ type: 'setNewInterest', value })
  }, [])

  const completionSteps = [
    { id: 'basics', label: 'Basics', complete: Boolean(formData.name) },
    { id: 'locations', label: 'Locations', complete: formData.locations.length > 0 },
    { id: 'targeting', label: 'Targeting', complete: formData.segments.length > 0 || formData.interests.length > 0 },
    { id: 'demographics', label: 'Demographics', complete: Boolean(formData.ageMin || formData.genders.length > 0) },
  ]

  const completedCount = completionSteps.filter(s => s.complete).length

  const accountMetaUi = useMemo(
    () => resolveMetaCampaignUiVisibility({ scope: 'account' }),
    [],
  )
  const showAccountEventsTools = hasMetaEventsTools(accountMetaUi)
  const showAccountAdvancedTools = hasMetaAdvancedTools(accountMetaUi)

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <AudienceBuilderDialogHeader activeTab={activeTab} completionSteps={completionSteps} onSelectStep={handleSelectStep} providerId={providerId} />
        {isMetaAudience && user?.agencyId ? (
          <div className="space-y-3 px-6 pb-2">
            <Alert>
              <AlertDescription className="text-xs">
                Meta custom audiences start empty. Segments, map pins, and interests in this dialog are not sent to Meta - configure targeting on each ad set instead.
              </AlertDescription>
            </Alert>
            <MetaAudiencesPanel workspaceId={String(user.agencyId)} clientId={selectedClientId} />
            {showAccountEventsTools ? (
              <MetaEventsToolsPanel
                workspaceId={String(user.agencyId)}
                clientId={selectedClientId}
                scope="account"
              />
            ) : null}
            {showAccountAdvancedTools ? (
              <MetaAdvancedToolsPanel
                workspaceId={String(user.agencyId)}
                clientId={selectedClientId}
                scope="account"
              />
            ) : null}
          </div>
        ) : null}
        <AudienceBuilderDialogTabs
          activeTab={activeTab}
          formData={formData}
          newInterest={newInterest}
          newSegment={newSegment}
          onAddInterest={handleAddInterest}
          onAddSegment={handleAddSegment}
          onAgePreset={handleAgePreset}
          onDescriptionChange={handleDescriptionChange}
          onGenderToggle={handleGenderToggle}
          onInterestInputChange={handleInterestInputChange}
          onLocationRemove={handleLocationRemove}
          onLocationSelect={handleLocationSelect}
          onNameChange={handleNameChange}
          onRemoveInterest={handleRemoveInterest}
          onRemoveSegment={handleRemoveSegment}
          onResetGenders={handleResetGenders}
          onSegmentInputChange={handleSegmentInputChange}
          providerId={providerId}
          setActiveTab={handleSelectStep}
        />
        <AudienceBuilderDialogFooter completedCount={completedCount} loading={loading} onCancel={handleCancel} onCreate={handleCreate} totalSteps={completionSteps.length} />
      </DialogContent>
    </Dialog>
  )
}
