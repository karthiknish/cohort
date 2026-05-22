'use client'

import { useCallback, useMemo, useState } from 'react'
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
import { MetaTargetingSearchCombobox } from '@/features/dashboard/ads/components/meta-targeting-search-combobox'
import { TargetingCollapsiblePanel } from './targeting-collapsible-panel'

type AudienceEditorSectionProps = {
  aggregatedData: AggregatedTargetingData
  expandedSections: Set<string>
  toggleSection: (section: string) => void
  editingSection: string | null
  onToggleEditing: (section: string) => void
  canEditTargeting?: boolean
  workspaceId?: string | null
  clientId?: string | null
  onAddInterest?: (interest: { id: string; name: string }) => void
  onRemoveInterest?: (interestName: string) => void
  onSaveTargeting?: () => void | Promise<void>
  savingTargeting?: boolean
}

export function AudienceEditorSection({
  aggregatedData,
  expandedSections,
  toggleSection,
  editingSection,
  onToggleEditing,
  canEditTargeting,
  workspaceId,
  clientId,
  onAddInterest,
  onRemoveInterest,
  onSaveTargeting,
  savingTargeting,
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
    if (onAddInterest) {
      onAddInterest({ id: newInterest.trim(), name: newInterest.trim() })
      setNewInterest('')
      return
    }
    toast({
      title: 'Interest would be added',
      description: `"${newInterest}" — editing is only available for Meta ad sets.`,
    })
    setNewInterest('')
  }, [newInterest, onAddInterest])

  const handleRemoveInterest = useCallback((interestName: string) => {
    if (onRemoveInterest) {
      onRemoveInterest(interestName)
      return
    }
    toast({
      title: 'Interest would be removed',
      description: `"${interestName}" removal requires API integration`,
    })
  }, [onRemoveInterest])

  const handleMetaInterestSelect = useCallback(
    (item: { id: string; name: string }) => {
      if (onAddInterest) {
        onAddInterest({ id: item.id, name: item.name })
      }
    },
    [onAddInterest],
  )

  const handleSaveTargetingClick = useCallback(() => {
    void onSaveTargeting?.()
  }, [onSaveTargeting])

  const editButton = useMemo(
    () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isEditing ? 'default' : 'ghost'}
              size="icon"
              className="size-8"
              onClick={handleEditInterests}
              aria-pressed={isEditing}
              aria-label="Edit interests"
            >
              <Edit2 className="size-3.5" aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isEditing ? 'Exit interest editing' : 'Edit interests'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    [handleEditInterests, isEditing],
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
          canEditTargeting && workspaceId ? (
            <MetaTargetingSearchCombobox
              workspaceId={workspaceId}
              clientId={clientId}
              mode="interests"
              disabled={savingTargeting}
              onSelect={handleMetaInterestSelect}
            />
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Add interest (ID or name)…"
                value={newInterest}
                onChange={handleNewInterestChange}
                className="h-9 flex-1 text-sm"
              />
              <Button size="sm" className="h-9 shrink-0 px-3" onClick={handleAddInterest}>
                <Plus className="size-4" aria-hidden />
                <span className="sr-only">Add interest</span>
              </Button>
            </div>
          )
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

        {isEditing && onSaveTargeting ? (
          <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
            {canEditTargeting ? (
              <p className="text-xs text-muted-foreground">
                Search Meta interests above, then save to the selected ad set.
              </p>
            ) : null}
            <Button
              size="sm"
              className="w-full sm:w-auto"
              disabled={savingTargeting}
              onClick={handleSaveTargetingClick}
            >
              {savingTargeting ? 'Saving…' : 'Save to ad set'}
            </Button>
          </div>
        ) : null}
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
      <Heart className="mr-1 size-3 text-accent" aria-hidden />
      {name}
      {removable ? (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 rounded-sm opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          aria-label={`Remove ${name}`}
        >
          <X className="size-3" aria-hidden />
        </button>
      ) : null}
    </Badge>
  )
}
