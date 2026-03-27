'use client'

import { useCallback, useState } from 'react'
import { ChevronDown, Edit2, Heart, Plus, X } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import { Input } from '@/shared/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { toast } from '@/shared/ui/use-toast'
import { cn } from '@/lib/utils'

import type { AggregatedTargetingData } from './audience-control-types'

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
  const handleToggleInterests = useCallback(() => {
    toggleSection('interests')
  }, [toggleSection])

  const handleEditInterests = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onToggleEditing('interests')
  }, [onToggleEditing])

  const handleNewInterestChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewInterest(event.target.value)
  }, [])

  const handleAddInterest = useCallback(() => {
    if (!newInterest.trim()) return

    toast({
      title: 'Interest would be added',
      description: `"${newInterest}" - Requires API integration`,
    })
    setNewInterest('')
  }, [newInterest])

  const handleRemoveInterest = useCallback((interestName: string) => {
    toast({
      title: 'Interest would be removed',
      description: `"${interestName}" removal requires API integration`,
    })
  }, [])

  return (
    <Collapsible
      open={expandedSections.has('interests')}
      onOpenChange={handleToggleInterests}
    >
      <div className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
        <CollapsibleTrigger asChild>
          <div className="flex flex-1 items-center gap-2 cursor-pointer">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Interests</span>
            <Badge variant="secondary" className="text-xs">
              {aggregatedData.interests.length}
            </Badge>
          </div>
        </CollapsibleTrigger>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleEditInterests}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit interests</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Toggle interests section">
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  expandedSections.has('interests') && 'rotate-180'
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent className="pt-2">
        <div className="p-3 rounded-lg border bg-muted/20 space-y-3">
          {editingSection === 'interests' && (
            <div className="flex gap-2">
              <Input
                placeholder="Add new interest…"
                value={newInterest}
                onChange={handleNewInterestChange}
                className="flex-1 h-8 text-sm"
              />
              <Button
                size="sm"
                className="h-8"
                onClick={handleAddInterest}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          {aggregatedData.interests.length > 0 ? (
            <>
              {(() => {
                const categorized = aggregatedData.interests.reduce(
                  (acc, interest) => {
                    const category = interest.category || 'General'
                    if (!acc[category]) acc[category] = []
                    acc[category].push(interest)
                    return acc
                  },
                  {} as Record<string, typeof aggregatedData.interests>
                )

                const categories = Object.keys(categorized).sort((a, b) => {
                  if (a === 'interest') return -1
                  if (b === 'interest') return 1
                  if (a === 'behavior') return -1
                  if (b === 'behavior') return 1
                  return a.localeCompare(b)
                })

                if (
                  categories.length === 1 &&
                  (categories[0] === 'General' || categories[0] === 'interest')
                ) {
                  return (
                    <div className="flex flex-wrap gap-1.5">
                      {aggregatedData.interests.map((interest) => (
                        <AudienceInterestBadge
                          key={interest.id}
                          name={interest.name}
                          removable={editingSection === 'interests'}
                          onRemove={handleRemoveInterest}
                        />
                      ))}
                    </div>
                  )
                }

                return (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category}>
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">{category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {categorized[category]!.map((interest) => (
                            <AudienceInterestBadge
                              key={interest.id}
                              name={interest.name}
                              removable={editingSection === 'interests'}
                              onRemove={handleRemoveInterest}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              No interests configured. {editingSection === 'interests' && 'Add one above.'}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
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
      <Heart className="mr-1 h-3 w-3 text-accent" />
      {name}
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}
