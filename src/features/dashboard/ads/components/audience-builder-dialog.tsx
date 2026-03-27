'use client'

import { useAction } from 'convex/react'
import { useCallback, useState } from 'react'

import {
  Dialog,
  DialogContent,
} from '@/shared/ui/dialog'
import type { LocationMarker } from '@/shared/ui/location-map'
import { toast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { adsAudiencesApi } from '@/lib/convex-api'

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

  const handleCreate = useCallback(() => {
    if (!formData.name) {
      toast({
        title: 'Missing information',
        description: 'Please provide an audience name.',
        variant: 'destructive',
      })
      return
    }

    if (formData.segments.length === 0 && formData.locations.length === 0 && formData.interests.length === 0) {
      toast({
        title: 'Missing targeting',
        description: 'Please add at least one segment, location, or interest.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const workspaceId = user?.agencyId ? String(user.agencyId) : null
    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Failed to create audience.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    void createAudience({
        workspaceId,
      providerId,
        clientId: selectedClientId ?? null,
        name: formData.name,
        description: formData.description,
        segments: formData.segments,
        locations: formData.locations.map((l) => ({ id: l.id, name: l.name, lat: l.lat, lng: l.lng })),
        interests: formData.interests,
        demographics: {
          ageMin: formData.ageMin,
          ageMax: formData.ageMax,
          genders: formData.genders,
        },
      })

      .then((result) => {
        toast({
          title: 'Success',
          description: result.message || `Audience "${formData.name}" created successfully.`,
        })

        onOpenChange(false)
        resetForm()
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to create audience.',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [formData, user, providerId, selectedClientId, createAudience, onOpenChange, resetForm])

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
