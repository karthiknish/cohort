'use client'

import { useCallback, useState } from 'react'
import { Edit2, Heart, Plus, X } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { toast } from '@/shared/ui/use-toast'

import type { AggregatedTargetingData } from './audience-control-types'
import { TargetingCollapsiblePanel } from './targeting-collapsible-panel'

type AudienceEditorSectionProps = {
  aggregatedData: AggregatedTargetingData
  expandedSections: Set<string>
  toggleSection: (section: string) => void
  editingSection: string | null
  onToggleEditing: (section: string) => void
}

export function AudienceEditorSection({
  aggregatedData,
  expandedSections,
  toggleSection,
  editingSection,
  onToggleEditing,
}: AudienceEditorSectionProps) {
  const [newInterest, setNewInterest] = useState('')
  const isEditing = editingSection === 'interests'

  const handleToggleInterests = useCallback(() => {
    toggleSection('interests')
  }, [toggleSection])

  const handleEditInterests = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onToggleEditing('interests')
    },
    [onToggleEditing],
  )

  const handleNewInterestChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewInterest(event.target.value)
  }, [])

  const handleAddInterest = useCallback(() => {
    if (!newInterest.trim()) return

    toast({
      title: 'Interest would be added',
      description: `"${newInterest}" — requires API integration`,
    })
    setNewInterest('')
  }, [newInterest])

  const handleRemoveInterest = useCallback((interestName: string) => {
    toast({
      title: 'Interest would be removed',
      description: `"${interestName}" removal requires API integration`,
    })
  }, [])

  const editButton = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isEditing ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={handleEditInterests}
            aria-pressed={isEditing}
            aria-label="Edit interests"
          >
            <Edit2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isEditing ? 'Exit interest editing' : 'Edit interests'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <TargetingCollapsiblePanel
      sectionId="interests"
      icon={Heart}
      title="Interests"
      count={aggregatedData.interests.length}
      expanded={expandedSections.has('interests')}
      onToggle={handleToggleInterests}
      headerActions={editButton}
    >
      <div className="space-y-3">
        {isEditing ? (
          <div className="flex gap-2">
            <Input
              placeholder="Add interest…"
              value={newInterest}
              onChange={handleNewInterestChange}
              className="h-9 flex-1 text-sm"
            />
            <Button size="sm" className="h-9 shrink-0 px-3" onClick={handleAddInterest}>
              <Plus className="h-4 w-4" aria-hidden />
              <span className="sr-only">Add interest</span>
            </Button>
          </div>
        ) : null}

        {aggregatedData.interests.length > 0 ? (
          <InterestGroups
            interests={aggregatedData.interests}
            removable={isEditing}
            onRemove={handleRemoveInterest}
          />
        ) : (
          <p className="py-2 text-center text-xs text-muted-foreground">
            No interests configured.{isEditing ? ' Add one above.' : ''}
          </p>
        )}
      </div>
    </TargetingCollapsiblePanel>
  )
}

function InterestGroups({
  interests,
  removable,
  onRemove,
}: {
  interests: AggregatedTargetingData['interests']
  removable: boolean
  onRemove: (name: string) => void
}) {
  const categorized = interests.reduce(
    (acc, interest) => {
      const category = interest.category || 'General'
      if (!acc[category]) acc[category] = []
      acc[category].push(interest)
      return acc
    },
    {} as Record<string, typeof interests>,
  )

  const categories = Object.keys(categorized).sort((a, b) => {
    if (a === 'interest') return -1
    if (b === 'interest') return 1
    if (a === 'behavior') return -1
    if (b === 'behavior') return 1
    return a.localeCompare(b)
  })

  if (categories.length === 1 && (categories[0] === 'General' || categories[0] === 'interest')) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {interests.map((interest) => (
          <AudienceInterestBadge
            key={interest.id}
            name={interest.name}
            removable={removable}
            onRemove={onRemove}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div key={category}>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">{category}</p>
          <div className="flex flex-wrap gap-1.5">
            {categorized[category]!.map((interest) => (
              <AudienceInterestBadge
                key={interest.id}
                name={interest.name}
                removable={removable}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AudienceInterestBadge({
  name,
  removable,
  onRemove,
}: {
  name: string
  removable: boolean
  onRemove: (interestName: string) => void
}) {
  const handleRemove = useCallback(() => {
    onRemove(name)
  }, [name, onRemove])

  return (
    <Badge variant="outline" className="group text-xs">
      <Heart className="mr-1 h-3 w-3 text-accent" aria-hidden />
      {name}
      {removable ? (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 rounded-sm opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          aria-label={`Remove ${name}`}
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      ) : null}
    </Badge>
  )
}
