 'use client'

import { useCallback } from 'react'

import { ChevronRight, Globe, Heart, Plus, Sparkles, Tag, Users, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { LocationMap, type LocationMarker } from '@/shared/ui/location-map'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tabs, TabsContent } from '@/shared/ui/tabs'
import { Textarea } from '@/shared/ui/textarea'

export type AudienceFormData = {
  name: string
  description: string
  segments: string[]
  locations: LocationMarker[]
  interests: string[]
  ageMin?: number
  ageMax?: number
  genders: string[]
}

type CompletionStep = { id: string; label: string; complete: boolean }

const SUGGESTED_INTERESTS = ['Technology', 'Fashion', 'Sports', 'Travel', 'Food & Dining', 'Health & Fitness', 'Business', 'Entertainment', 'Education', 'Finance']
const AGE_PRESETS = [{ label: '18-24', min: 18, max: 24 }, { label: '25-34', min: 25, max: 34 }, { label: '35-44', min: 35, max: 44 }, { label: '45-54', min: 45, max: 54 }, { label: '55-64', min: 55, max: 64 }, { label: '65+', min: 65, max: 100 }]

function AudienceStepButton({
  activeTab,
  index,
  onSelectStep,
  step,
  totalSteps,
}: {
  activeTab: string
  index: number
  onSelectStep: (tab: string) => void
  step: CompletionStep
  totalSteps: number
}) {
  const handleClick = useCallback(() => {
    onSelectStep(step.id)
  }, [onSelectStep, step.id])

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
          activeTab === step.id
            ? 'bg-primary text-primary-foreground'
            : step.complete
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground',
        )}
      >
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
            step.complete ? 'bg-primary/20' : 'bg-muted-foreground/20',
          )}
        >
          {index + 1}
        </span>
        {step.label}
      </button>
      {index < totalSteps - 1 ? <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" /> : null}
    </div>
  )
}

function AudienceInput({
  className,
  id,
  onEnter,
  onValueChange,
  placeholder,
  value,
}: {
  className?: string
  id?: string
  onEnter?: () => void
  onValueChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value)
  }, [onValueChange])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onEnter) {
      event.preventDefault()
      onEnter()
    }
  }, [onEnter])

  return <Input id={id} placeholder={placeholder} value={value} onChange={handleChange} onKeyDown={onEnter ? handleKeyDown : undefined} className={className} />
}

function AudienceTextarea({
  id,
  onValueChange,
  placeholder,
  rows,
  value,
}: {
  id?: string
  onValueChange: (value: string) => void
  placeholder?: string
  rows?: number
  value: string
}) {
  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange(event.target.value)
  }, [onValueChange])

  return <Textarea id={id} placeholder={placeholder} value={value} onChange={handleChange} rows={rows} />
}

function SegmentBadge({
  segment,
  index,
  onRemoveSegment,
}: {
  segment: string
  index: number
  onRemoveSegment: (index: number) => void
}) {
  const handleRemove = useCallback(() => {
    onRemoveSegment(index)
  }, [onRemoveSegment, index])

  return (
    <Badge key={segment} variant="secondary" className="gap-1 rounded-lg">
      {segment}
      <button type="button" onClick={handleRemove} className="ml-0.5 hover:text-destructive" aria-label={`Remove segment: ${segment}`}>
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

function InterestBadge({
  interest,
  onAddInterest,
}: {
  interest: string
  onAddInterest: (interest: string) => void
}) {
  const handleClick = useCallback(() => {
    onAddInterest(interest)
  }, [interest, onAddInterest])

  return (
    <Badge variant="outline" asChild>
      <button
        type="button"
        onClick={handleClick}
        className="cursor-pointer rounded-lg transition-colors hover:border-primary hover:bg-primary/10"
        aria-label={`Add interest: ${interest}`}
      >
        <Plus className="mr-1 h-3 w-3" aria-hidden />
        {interest}
      </button>
    </Badge>
  )
}

function SelectedInterestBadge({
  interest,
  onRemoveInterest,
}: {
  interest: string
  onRemoveInterest: (interest: string) => void
}) {
  const handleRemove = useCallback(() => {
    onRemoveInterest(interest)
  }, [interest, onRemoveInterest])

  return (
    <Badge className="gap-1 rounded-lg">
      {interest}
      <button type="button" onClick={handleRemove} className="ml-0.5 hover:text-destructive" aria-label={`Remove interest: ${interest}`}>
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

function AgePresetButton({
  active,
  onAgePreset,
  preset,
}: {
  active: boolean
  onAgePreset: (min: number, max: number) => void
  preset: { label: string; min: number; max: number }
}) {
  const handleClick = useCallback(() => {
    onAgePreset(preset.min, preset.max)
  }, [onAgePreset, preset.max, preset.min])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
      )}
      aria-label={`Select age range: ${preset.label}`}
      aria-pressed={active}
    >
      {preset.label}
    </button>
  )
}

function GenderButton({
  formData,
  gender,
  onGenderToggle,
  onResetGenders,
}: {
  formData: AudienceFormData
  gender: 'Male' | 'Female' | 'All'
  onGenderToggle: (gender: string) => void
  onResetGenders: () => void
}) {
  const handleClick = useCallback(() => {
    if (gender === 'All') {
      onResetGenders()
    } else {
      onGenderToggle(gender.toLowerCase())
    }
  }, [gender, onGenderToggle, onResetGenders])

  const isSelected = gender === 'All' ? formData.genders.length === 0 : formData.genders.includes(gender.toLowerCase())

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        gender === 'All' && formData.genders.length === 0
          ? 'border-primary bg-primary text-primary-foreground'
          : isSelected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'hover:bg-muted',
      )}
      aria-label={`Select gender: ${gender}`}
      aria-pressed={isSelected}
    >
      {gender}
    </button>
  )
}

export function AudienceBuilderDialogHeader({
  activeTab,
  completionSteps,
  onSelectStep,
  providerId,
}: {
  activeTab: string
  completionSteps: CompletionStep[]
  onSelectStep: (tab: string) => void
  providerId: string
}) {
  return (
    <DialogHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent p-6 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <DialogTitle className="text-lg">Build New Audience</DialogTitle>
          <DialogDescription>Create a custom audience for {providerId} campaigns</DialogDescription>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {completionSteps.map((step, index) => (
          <AudienceStepButton
            key={step.id}
            activeTab={activeTab}
            index={index}
            onSelectStep={onSelectStep}
            step={step}
            totalSteps={completionSteps.length}
          />
        ))}
      </div>
    </DialogHeader>
  )
}

export function AudienceBuilderDialogTabs({
  activeTab,
  formData,
  newInterest,
  newSegment,
  onAddInterest,
  onAddSegment,
  onAgePreset,
  onDescriptionChange,
  onGenderToggle,
  onInterestInputChange,
  onLocationRemove,
  onLocationSelect,
  onNameChange,
  onRemoveInterest,
  onRemoveSegment,
  onResetGenders,
  onSegmentInputChange,
  providerId,
  setActiveTab,
}: {
  activeTab: string
  formData: AudienceFormData
  newInterest: string
  newSegment: string
  onAddInterest: (interest: string) => void
  onAddSegment: () => void
  onAgePreset: (min: number, max: number) => void
  onDescriptionChange: (value: string) => void
  onGenderToggle: (gender: string) => void
  onInterestInputChange: (value: string) => void
  onLocationRemove: (locationId: string) => void
  onLocationSelect: (location: LocationMarker) => void
  onNameChange: (value: string) => void
  onRemoveInterest: (interest: string) => void
  onRemoveSegment: (index: number) => void
  onResetGenders: () => void
  onSegmentInputChange: (value: string) => void
  providerId: string
  setActiveTab: (tab: string) => void
}) {
  const handleAddInterest = useCallback(() => {
    onAddInterest(newInterest)
  }, [newInterest, onAddInterest])

  return (
    <ScrollArea className="max-h-[50vh] flex-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="basics" className="m-0 space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="aud-name" className="flex items-center gap-1">
              Audience Name <span className="text-destructive">*</span>
            </Label>
            <AudienceInput
              id="aud-name"
              placeholder="e.g. Website Visitors - Last 30 Days"
              value={formData.name}
              onValueChange={onNameChange}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aud-desc">Description</Label>
            <AudienceTextarea
              id="aud-desc"
              placeholder="Describe your target audience and campaign goals…"
              value={formData.description}
              onValueChange={onDescriptionChange}
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="locations" className="m-0 space-y-4 p-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />Target Locations
            </Label>
            <p className="text-xs text-muted-foreground">Search and select locations to target with your audience</p>
          </div>
          <LocationMap
            selectedLocations={formData.locations}
            onLocationSelect={onLocationSelect}
            onLocationRemove={onLocationRemove}
            height="280px"
            interactive={true}
            showSearch={true}
            showSelectedList={true}
          />
        </TabsContent>

        <TabsContent value="targeting" className="m-0 space-y-6 p-6">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />Custom Segments
            </Label>
            <div className="flex gap-2">
              <AudienceInput
                placeholder={providerId === 'linkedin' ? 'Enter job title or skill' : 'Enter interest or keyword'}
                value={newSegment}
                onValueChange={onSegmentInputChange}
                onEnter={onAddSegment}
                className="h-10"
              />
              <Button type="button" size="sm" onClick={onAddSegment} className="h-10 px-4" aria-label="Add segment">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex min-h-[32px] flex-wrap gap-1.5">
              {formData.segments.length === 0 ? (
                <p className="py-1 text-xs italic text-muted-foreground">No segments added yet</p>
              ) : (
                formData.segments.map((segment, index) => (
                  <SegmentBadge key={segment} segment={segment} index={index} onRemoveSegment={onRemoveSegment} />
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4" />Interests
            </Label>
            <div className="flex gap-2">
              <AudienceInput
                placeholder="Add custom interest…"
                value={newInterest}
                onValueChange={onInterestInputChange}
                onEnter={handleAddInterest}
                className="h-10"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddInterest}
                disabled={!newInterest.trim()}
                className="h-10 px-4"
                aria-label="Add interest"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />Suggested interests
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_INTERESTS.filter((interest) => !formData.interests.includes(interest)).map((interest) => (
                  <InterestBadge key={interest} interest={interest} onAddInterest={onAddInterest} />
                ))}
              </div>
            </div>

            {formData.interests.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 rounded-lg border bg-muted/30 p-3">
                {formData.interests.map((interest) => (
                  <SelectedInterestBadge key={interest} interest={interest} onRemoveInterest={onRemoveInterest} />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />Age Range
            </Label>
            <div className="flex flex-wrap gap-2">
              {AGE_PRESETS.map((preset) => (
                <AgePresetButton
                  key={preset.label}
                  preset={preset}
                  active={formData.ageMin === preset.min && formData.ageMax === preset.max}
                  onAgePreset={onAgePreset}
                />
              ))}
            </div>
            {formData.ageMin || formData.ageMax ? (
              <p className="text-sm text-muted-foreground">
                Selected: {formData.ageMin}-{formData.ageMax === 100 ? '65+' : formData.ageMax} years old
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <Label>Gender</Label>
            <div className="flex gap-2">
              {(['Male', 'Female', 'All'] as const).map((gender) => (
                <GenderButton
                  key={gender}
                  gender={gender}
                  formData={formData}
                  onGenderToggle={onGenderToggle}
                  onResetGenders={onResetGenders}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ScrollArea>
  )
}

export function AudienceBuilderDialogFooter({
  completedCount,
  loading,
  onCancel,
  onCreate,
  totalSteps,
}: {
  completedCount: number
  loading: boolean
  onCancel: () => void
  onCreate: () => void
  totalSteps: number
}) {
  return (
    <DialogFooter className="border-t bg-muted/30 p-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
              completedCount >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted',
            )}
          >
            {completedCount}
          </div>
          <span>
            of {totalSteps} sections completed
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onCreate} disabled={loading}>
            {loading ? 'Creating…' : 'Create Audience'}
          </Button>
        </div>
      </div>
    </DialogFooter>
  )
}