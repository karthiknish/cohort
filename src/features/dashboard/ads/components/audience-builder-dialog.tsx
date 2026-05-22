'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useAction } from 'convex/react'
import { useCallback, useState } from 'react'

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

export function AudienceBuilderDialog({ isOpen, onOpenChange, providerId }: Props) {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()

  const createAudience = useAction(adsAudiencesApi.createAudience)

  const [activeTab, setActiveTab] = useState('basics')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<AudienceFormData>({
    name: '',
    description: '',
    segments: [],
    locations: [],
    interests: [],
    genders: [],
  })
  const [newSegment, setNewSegment] = useState('')
  const [newInterest, setNewInterest] = useState('')

  const handleAddSegment = useCallback(() => {
    if (!newSegment.trim()) return
    setFormData(prev => ({
      ...prev,
      segments: [...prev.segments, newSegment.trim()]
    }))
    setNewSegment('')
  }, [newSegment])

  const handleRemoveSegment = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      segments: prev.segments.filter((_, i) => i !== index)
    }))
  }, [])

  const handleAddInterest = useCallback((interest: string) => {
    if (formData.interests.includes(interest)) return
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, interest]
    }))
    setNewInterest('')
  }, [formData.interests])

  const handleRemoveInterest = useCallback((interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }, [])

  const handleLocationSelect = useCallback((location: LocationMarker) => {
    setFormData(prev => {
      if (prev.locations.some(l => l.id === location.id)) return prev
      return { ...prev, locations: [...prev.locations, location] }
    })
  }, [])

  const handleLocationRemove = useCallback((locationId: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l.id !== locationId)
    }))
  }, [])

  const handleGenderToggle = useCallback((gender: string) => {
    setFormData(prev => ({
      ...prev,
      genders: prev.genders.includes(gender)
        ? prev.genders.filter(g => g !== gender)
        : [...prev.genders, gender]
    }))
  }, [])

  const handleAgePreset = useCallback((min: number, max: number) => {
    setFormData(prev => ({
      ...prev,
      ageMin: min,
      ageMax: max
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      segments: [],
      locations: [],
      interests: [],
      genders: [],
    })
    setActiveTab('basics')
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

    setLoading(true)
    const workspaceId = user?.agencyId ? String(user.agencyId) : null
    if (!workspaceId) {
      notifyFailure({
        title: 'Error',
        message: 'Failed to create audience.',
      })
      setLoading(false)
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
        setLoading(false)
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
    setFormData((prev) => ({ ...prev, description: value }))
  }, [])

  const handleNameChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, name: value }))
  }, [])

  const handleResetGenders = useCallback(() => {
    setFormData((prev) => ({ ...prev, genders: [] }))
  }, [])

  const completionSteps = [
    { id: 'basics', label: 'Basics', complete: Boolean(formData.name) },
    { id: 'locations', label: 'Locations', complete: formData.locations.length > 0 },
    { id: 'targeting', label: 'Targeting', complete: formData.segments.length > 0 || formData.interests.length > 0 },
    { id: 'demographics', label: 'Demographics', complete: Boolean(formData.ageMin || formData.genders.length > 0) },
  ]

  const completedCount = completionSteps.filter(s => s.complete).length

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <AudienceBuilderDialogHeader activeTab={activeTab} completionSteps={completionSteps} onSelectStep={setActiveTab} providerId={providerId} />
        {isMetaAudience && user?.agencyId ? (
          <div className="space-y-3 px-6 pb-2">
            <Alert>
              <AlertDescription className="text-xs">
                Meta custom audiences start empty. Segments, map pins, and interests in this dialog are not sent to Meta — configure targeting on each ad set instead.
              </AlertDescription>
            </Alert>
            <MetaAudiencesPanel workspaceId={String(user.agencyId)} clientId={selectedClientId} />
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
          onInterestInputChange={setNewInterest}
          onLocationRemove={handleLocationRemove}
          onLocationSelect={handleLocationSelect}
          onNameChange={handleNameChange}
          onRemoveInterest={handleRemoveInterest}
          onRemoveSegment={handleRemoveSegment}
          onResetGenders={handleResetGenders}
          onSegmentInputChange={setNewSegment}
          providerId={providerId}
          setActiveTab={setActiveTab}
        />
        <AudienceBuilderDialogFooter completedCount={completedCount} loading={loading} onCancel={handleCancel} onCreate={handleCreate} totalSteps={completionSteps.length} />
      </DialogContent>
    </Dialog>
  )
}
