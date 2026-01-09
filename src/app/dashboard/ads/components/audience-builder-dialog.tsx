'use client'

import { useState, useCallback } from 'react'
import { Plus, X, Users, MapPin, Tag, Heart, Globe, Sparkles, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { LocationMap, type LocationMarker } from '@/components/ui/location-map'

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  providerId: string
}

type AudienceFormData = {
  name: string
  description: string
  segments: string[]
  locations: LocationMarker[]
  interests: string[]
  ageMin?: number
  ageMax?: number
  genders: string[]
}

const SUGGESTED_INTERESTS = [
  'Technology', 'Fashion', 'Sports', 'Travel', 'Food & Dining',
  'Health & Fitness', 'Business', 'Entertainment', 'Education', 'Finance'
]

const AGE_PRESETS = [
  { label: '18-24', min: 18, max: 24 },
  { label: '25-34', min: 25, max: 34 },
  { label: '35-44', min: 35, max: 44 },
  { label: '45-54', min: 45, max: 54 },
  { label: '55-64', min: 55, max: 64 },
  { label: '65+', min: 65, max: 100 },
]

export function AudienceBuilderDialog({ isOpen, onOpenChange, providerId }: Props) {
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

  const handleAddSegment = () => {
    if (!newSegment.trim()) return
    setFormData(prev => ({
      ...prev,
      segments: [...prev.segments, newSegment.trim()]
    }))
    setNewSegment('')
  }

  const handleRemoveSegment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      segments: prev.segments.filter((_, i) => i !== index)
    }))
  }

  const handleAddInterest = (interest: string) => {
    if (formData.interests.includes(interest)) return
    setFormData(prev => ({
      ...prev,
      interests: [...prev.interests, interest]
    }))
    setNewInterest('')
  }

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

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

  const handleGenderToggle = (gender: string) => {
    setFormData(prev => ({
      ...prev,
      genders: prev.genders.includes(gender)
        ? prev.genders.filter(g => g !== gender)
        : [...prev.genders, gender]
    }))
  }

  const handleAgePreset = (min: number, max: number) => {
    setFormData(prev => ({
      ...prev,
      ageMin: min,
      ageMax: max
    }))
  }

  const handleCreate = async () => {
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
    try {
      const response = await fetch('/api/integrations/audiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          name: formData.name,
          description: formData.description,
          segments: formData.segments,
          locations: formData.locations.map(l => ({ id: l.id, name: l.name, lat: l.lat, lng: l.lng })),
          interests: formData.interests,
          demographics: {
            ageMin: formData.ageMin,
            ageMax: formData.ageMax,
            genders: formData.genders,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to create audience')
      
      const result = await response.json()
      
      toast({
        title: 'Success',
        description: result.message || `Audience "${formData.name}" created successfully.`,
      })
      
      onOpenChange(false)
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create audience.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      segments: [],
      locations: [],
      interests: [],
      genders: [],
    })
    setActiveTab('basics')
  }

  const completionSteps = [
    { id: 'basics', label: 'Basics', complete: Boolean(formData.name) },
    { id: 'locations', label: 'Locations', complete: formData.locations.length > 0 },
    { id: 'targeting', label: 'Targeting', complete: formData.segments.length > 0 || formData.interests.length > 0 },
    { id: 'demographics', label: 'Demographics', complete: Boolean(formData.ageMin || formData.genders.length > 0) },
  ]

  const completedCount = completionSteps.filter(s => s.complete).length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Build New Audience</DialogTitle>
              <DialogDescription>
                Create a custom audience for {providerId} campaigns
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {completionSteps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab(step.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    activeTab === step.id
                      ? "bg-primary text-primary-foreground"
                      : step.complete
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  <span className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                    step.complete ? "bg-primary/20" : "bg-muted-foreground/20"
                  )}>
                    {i + 1}
                  </span>
                  {step.label}
                </button>
                {i < completionSteps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[50vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="basics" className="m-0 p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aud-name" className="flex items-center gap-1">
                  Audience Name <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="aud-name" 
                  placeholder="e.g. Website Visitors - Last 30 Days" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aud-desc">Description</Label>
                <Textarea 
                  id="aud-desc" 
                  placeholder="Describe your target audience and campaign goals..." 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="locations" className="m-0 p-6 space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Target Locations
                </Label>
                <p className="text-xs text-muted-foreground">
                  Search and select locations to target with your audience
                </p>
              </div>

              <LocationMap
                selectedLocations={formData.locations}
                onLocationSelect={handleLocationSelect}
                onLocationRemove={handleLocationRemove}
                height="280px"
                interactive={true}
                showSearch={true}
                showSelectedList={true}
              />
            </TabsContent>

            <TabsContent value="targeting" className="m-0 p-6 space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Custom Segments
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder={providerId === 'linkedin' ? 'Enter job title or skill' : 'Enter interest or keyword'} 
                    value={newSegment}
                    onChange={(e) => setNewSegment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSegment())}
                    className="h-10"
                  />
                  <Button type="button" size="sm" onClick={handleAddSegment} className="h-10 px-4">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {formData.segments.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-1">No segments added yet</p>
                  ) : (
                    formData.segments.map((s, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 rounded-lg">
                        {s}
                        <button 
                          type="button"
                          onClick={() => handleRemoveSegment(i)} 
                          className="hover:text-destructive ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Interests
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add custom interest..." 
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest(newInterest))}
                    className="h-10"
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => handleAddInterest(newInterest)} 
                    disabled={!newInterest.trim()}
                    className="h-10 px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Suggested interests
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_INTERESTS.filter(i => !formData.interests.includes(i)).map((interest) => (
                      <Badge 
                        key={interest} 
                        variant="outline" 
                        className="cursor-pointer rounded-lg hover:bg-primary/10 hover:border-primary transition-colors"
                        onClick={() => handleAddInterest(interest)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {formData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-muted/30 border">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} className="gap-1 rounded-lg">
                        {interest}
                        <button 
                          type="button"
                          onClick={() => handleRemoveInterest(interest)} 
                          className="hover:text-destructive ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="demographics" className="m-0 p-6 space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Age Range
                </Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleAgePreset(preset.min, preset.max)}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                        formData.ageMin === preset.min && formData.ageMax === preset.max
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {(formData.ageMin || formData.ageMax) && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.ageMin}-{formData.ageMax === 100 ? '65+' : formData.ageMax} years old
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Gender</Label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'All'].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => {
                        if (gender === 'All') {
                          setFormData(prev => ({ ...prev, genders: [] }))
                        } else {
                          handleGenderToggle(gender.toLowerCase())
                        }
                      }}
                      className={cn(
                        "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                        gender === 'All' && formData.genders.length === 0
                          ? "bg-primary text-primary-foreground border-primary"
                          : formData.genders.includes(gender.toLowerCase())
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted"
                      )}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-muted/30">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                completedCount >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {completedCount}
              </div>
              <span>of {completionSteps.length} sections completed</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? 'Creating...' : 'Create Audience'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
