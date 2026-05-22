'use client'

import { useMemo } from 'react'

import {
  Briefcase,
  Facebook,
  Globe,
  Instagram,
  MessageCircle,
  Smartphone,
  Tag,
  UserCheck,
  Zap,
} from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { cn } from '@/lib/utils'

import type { AggregatedTargetingData } from './audience-control-types'
import { TargetingCollapsiblePanel } from './targeting-collapsible-panel'

type AudienceDisplaySectionProps = {
  aggregatedData: AggregatedTargetingData
  expandedSections: Set<string>
  toggleSection: (section: string) => void
  interestSection?: React.ReactNode
}

export function AudienceDisplaySection({
  aggregatedData,
  expandedSections,
  toggleSection,
  interestSection,
}: AudienceDisplaySectionProps) {
  const sectionToggleHandlers = useMemo(
    () => ({
      audiences: () => toggleSection('audiences'),
      keywords: () => toggleSection('keywords'),
      devices: () => toggleSection('devices'),
      placements: () => toggleSection('placements'),
      professional: () => toggleSection('professional'),
    }),
    [toggleSection],
  )

  const otherPlacements = aggregatedData.placements.filter(
    (placement) =>
      !['facebook', 'instagram', 'audience_network', 'messenger'].includes(placement.toLowerCase()),
  )

  return (
    <>
      {aggregatedData.audiences.included.length > 0 ? (
        <TargetingCollapsiblePanel
          sectionId="audiences"
          icon={UserCheck}
          title="Custom audiences"
          count={aggregatedData.audiences.included.length}
          expanded={expandedSections.has('audiences')}
          onToggle={sectionToggleHandlers.audiences}
        >
          <div className="flex flex-wrap gap-1.5">
            {aggregatedData.audiences.included.map((audience) => (
              <Badge key={audience.id} variant="secondary" className="text-xs">
                {audience.name}
              </Badge>
            ))}
          </div>
        </TargetingCollapsiblePanel>
      ) : null}

      {interestSection}

      {aggregatedData.keywords.length > 0 ? (
        <TargetingCollapsiblePanel
          sectionId="keywords"
          icon={Tag}
          title="Keywords"
          count={aggregatedData.keywords.length}
          expanded={expandedSections.has('keywords')}
          onToggle={sectionToggleHandlers.keywords}
        >
          <div className="flex flex-wrap gap-1.5">
            {aggregatedData.keywords.map((keyword) => (
              <Badge
                key={`${keyword.text}-${keyword.matchType ?? 'default'}`}
                variant="secondary"
                className="text-xs"
              >
                {keyword.text}
                {keyword.matchType ? (
                  <span className="ml-1 opacity-60">({keyword.matchType})</span>
                ) : null}
              </Badge>
            ))}
          </div>
        </TargetingCollapsiblePanel>
      ) : null}

      {aggregatedData.devices.length > 0 ? (
        <TargetingCollapsiblePanel
          sectionId="devices"
          icon={Smartphone}
          title="Devices"
          count={aggregatedData.devices.length}
          expanded={expandedSections.has('devices')}
          onToggle={sectionToggleHandlers.devices}
        >
          <div className="flex flex-wrap gap-1.5">
            {aggregatedData.devices.map((device) => (
              <Badge key={device} variant="outline" className="text-xs capitalize">
                {device.toLowerCase()}
              </Badge>
            ))}
          </div>
        </TargetingCollapsiblePanel>
      ) : null}

      {aggregatedData.placements.length > 0 ? (
        <TargetingCollapsiblePanel
          sectionId="placements"
          icon={Globe}
          title="Placements & platforms"
          count={aggregatedData.placements.length}
          expanded={expandedSections.has('placements')}
          onToggle={sectionToggleHandlers.placements}
        >
          <div className="space-y-4">
            {aggregatedData.metaPlacements.facebook.length > 0 ? (
              <PlacementGroup
                icon={Facebook}
                label="Facebook"
                toneClass="text-info"
                placements={aggregatedData.metaPlacements.facebook}
                keyPrefix="facebook"
              />
            ) : null}

            {aggregatedData.metaPlacements.instagram.length > 0 ? (
              <PlacementGroup
                icon={Instagram}
                label="Instagram"
                toneClass="text-accent"
                placements={aggregatedData.metaPlacements.instagram}
                keyPrefix="instagram"
              />
            ) : null}

            {aggregatedData.metaPlacements.messenger.length > 0 ? (
              <PlacementGroup
                icon={MessageCircle}
                label="Messenger"
                toneClass="text-info"
                placements={aggregatedData.metaPlacements.messenger}
                keyPrefix="messenger"
              />
            ) : null}

            {aggregatedData.metaPlacements.audienceNetwork.length > 0 ? (
              <PlacementGroup
                icon={Zap}
                label="Audience Network"
                toneClass="text-muted-foreground"
                placements={aggregatedData.metaPlacements.audienceNetwork}
                keyPrefix="audience-network"
              />
            ) : null}

            {otherPlacements.length > 0 ? (
              <PlacementGroup
                icon={Globe}
                label="Other platforms"
                toneClass="text-muted-foreground"
                placements={otherPlacements}
                keyPrefix="other"
              />
            ) : null}
          </div>
        </TargetingCollapsiblePanel>
      ) : null}

      {aggregatedData.professional.industries.length > 0 ||
      aggregatedData.professional.jobTitles.length > 0 ? (
        <TargetingCollapsiblePanel
          sectionId="professional"
          icon={Briefcase}
          title="Professional"
          count={
            aggregatedData.professional.industries.length +
            aggregatedData.professional.jobTitles.length
          }
          expanded={expandedSections.has('professional')}
          onToggle={sectionToggleHandlers.professional}
        >
          <div className="space-y-3">
            {aggregatedData.professional.industries.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Industries</p>
                <div className="flex flex-wrap gap-1.5">
                  {aggregatedData.professional.industries.map((industry) => (
                    <Badge key={industry.id} variant="outline" className="text-xs">
                      {industry.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {aggregatedData.professional.jobTitles.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Job titles</p>
                <div className="flex flex-wrap gap-1.5">
                  {aggregatedData.professional.jobTitles.map((job) => (
                    <Badge key={job.id} variant="outline" className="text-xs">
                      {job.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </TargetingCollapsiblePanel>
      ) : null}
    </>
  )
}

function PlacementGroup({
  icon: Icon,
  label,
  toneClass,
  placements,
  keyPrefix,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  toneClass: string
  placements: string[]
  keyPrefix: string
}) {
  return (
    <div className="space-y-2">
      <div className={cn('flex items-center gap-2', toneClass)}>
        <Icon className="h-4 w-4" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-1">
        {placements.map((placement) => (
          <Badge
            key={`${keyPrefix}-${placement}`}
            variant="outline"
            className="bg-background/50 px-2 py-0.5 text-[10px] capitalize"
          >
            {placement.replace(/_/g, ' ')}
          </Badge>
        ))}
      </div>
    </div>
  )
}
