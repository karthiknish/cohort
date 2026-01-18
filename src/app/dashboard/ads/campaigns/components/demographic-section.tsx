'use client'

import { ChevronDown, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

import type { AggregatedTargetingData } from './audience-control-types'

type DemographicSectionProps = {
  aggregatedData: AggregatedTargetingData
  expandedSections: Set<string>
  toggleSection: (section: string) => void
}

function formatAgeRange(range: string) {
  return range.replace(/_/g, '-').replace('AGE', '').replace('RANGE', '').trim()
}

export function DemographicSection({
  aggregatedData,
  expandedSections,
  toggleSection,
}: DemographicSectionProps) {
  if (
    aggregatedData.demographics.ageRanges.length === 0 &&
    aggregatedData.demographics.genders.length === 0 &&
    aggregatedData.demographics.languages.length === 0
  ) {
    return null
  }

  return (
    <Collapsible
      open={expandedSections.has('demographics')}
      onOpenChange={() => toggleSection('demographics')}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Demographics</span>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            expandedSections.has('demographics') && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/20">
          {aggregatedData.demographics.ageRanges.map((age, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {formatAgeRange(age)}
            </Badge>
          ))}
          {aggregatedData.demographics.genders.map((gender, index) => (
            <Badge key={index} variant="outline" className="text-xs capitalize">
              {gender.toLowerCase()}
            </Badge>
          ))}
          {aggregatedData.demographics.languages.map((lang, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {lang}
            </Badge>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
