'use client'

import { useCallback } from 'react'
import { Users } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'

import type { AggregatedTargetingData } from './audience-control-types'
import { TargetingCollapsiblePanel } from './targeting-collapsible-panel'

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
  const handleToggleDemographics = useCallback(() => {
    toggleSection('demographics')
  }, [toggleSection])

  const ageCount = aggregatedData.demographics.ageRanges.length
  const genderCount = aggregatedData.demographics.genders.length
  const langCount = aggregatedData.demographics.languages.length
  const totalCount = ageCount + genderCount + langCount

  if (totalCount === 0) {
    return null
  }

  return (
    <TargetingCollapsiblePanel
      sectionId="demographics"
      icon={Users}
      title="Demographics"
      count={totalCount}
      expanded={expandedSections.has('demographics')}
      onToggle={handleToggleDemographics}
    >
      <div className="space-y-3">
        {ageCount > 0 ? (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Age ranges</p>
            <div className="flex flex-wrap gap-1.5">
              {aggregatedData.demographics.ageRanges.map((age) => (
                <Badge key={`age-${age}`} variant="secondary" className="text-xs tabular-nums">
                  {formatAgeRange(age)}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
        {genderCount > 0 ? (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Gender</p>
            <div className="flex flex-wrap gap-1.5">
              {aggregatedData.demographics.genders.map((gender) => (
                <Badge key={`gender-${gender}`} variant="outline" className="text-xs capitalize">
                  {gender.toLowerCase()}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
        {langCount > 0 ? (
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {aggregatedData.demographics.languages.map((lang) => (
                <Badge key={`lang-${lang}`} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </TargetingCollapsiblePanel>
  )
}
