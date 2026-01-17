'use client'

import {
  Briefcase,
  ChevronDown,
  Facebook,
  Globe,
  Instagram,
  MessageCircle,
  Smartphone,
  Tag,
  UserCheck,
  Zap,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

import type { AggregatedTargetingData } from './audience-control-types'

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
  return (
    <>
      {aggregatedData.audiences.included.length > 0 && (
        <Collapsible
          open={expandedSections.has('audiences')}
          onOpenChange={() => toggleSection('audiences')}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Audiences</span>
              <Badge variant="secondary" className="text-xs">
                {aggregatedData.audiences.included.length}
              </Badge>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expandedSections.has('audiences') && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/20">
              {aggregatedData.audiences.included.map((audience) => (
                <Badge key={audience.id} variant="secondary" className="text-xs">
                  {audience.name}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {interestSection}

      {aggregatedData.keywords.length > 0 && (
        <Collapsible
          open={expandedSections.has('keywords')}
          onOpenChange={() => toggleSection('keywords')}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Keywords</span>
              <Badge variant="secondary" className="text-xs">
                {aggregatedData.keywords.length}
              </Badge>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expandedSections.has('keywords') && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/20">
              {aggregatedData.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword.text}
                  {keyword.matchType && (
                    <span className="ml-1 opacity-60">({keyword.matchType})</span>
                  )}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {aggregatedData.devices.length > 0 && (
        <Collapsible
          open={expandedSections.has('devices')}
          onOpenChange={() => toggleSection('devices')}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Devices</span>
              <Badge variant="secondary" className="text-xs">
                {aggregatedData.devices.length}
              </Badge>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expandedSections.has('devices') && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-muted/20">
              {aggregatedData.devices.map((device, index) => (
                <Badge key={index} variant="outline" className="text-xs capitalize">
                  {device.toLowerCase()}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {aggregatedData.placements.length > 0 && (
        <Collapsible
          open={expandedSections.has('placements')}
          onOpenChange={() => toggleSection('placements')}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Placements & Platforms</span>
              <Badge variant="secondary" className="text-xs">
                {aggregatedData.placements.length}
              </Badge>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expandedSections.has('placements') && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
              {aggregatedData.metaPlacements.facebook.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Facebook className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Facebook</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {aggregatedData.metaPlacements.facebook.map((placement, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-[10px] capitalize bg-background/50 py-0.5 px-2"
                      >
                        {placement.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {aggregatedData.metaPlacements.instagram.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-pink-600">
                    <Instagram className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Instagram</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {aggregatedData.metaPlacements.instagram.map((placement, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-[10px] capitalize bg-background/50 py-0.5 px-2"
                      >
                        {placement.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {aggregatedData.metaPlacements.messenger.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-400">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Messenger</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {aggregatedData.metaPlacements.messenger.map((placement, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-[10px] capitalize bg-background/50 py-0.5 px-2"
                      >
                        {placement.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {aggregatedData.metaPlacements.audienceNetwork.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Audience Network</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {aggregatedData.metaPlacements.audienceNetwork.map((placement, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-[10px] capitalize bg-background/50 py-0.5 px-2"
                      >
                        {placement.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {aggregatedData.placements.filter(
                (placement) =>
                  !['facebook', 'instagram', 'audience_network', 'messenger'].includes(
                    placement.toLowerCase()
                  )
              ).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Other Platforms</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-6">
                    {aggregatedData.placements
                      .filter(
                        (placement) =>
                          !['facebook', 'instagram', 'audience_network', 'messenger'].includes(
                            placement.toLowerCase()
                          )
                      )
                      .map((placement, index) => (
                        <Badge key={index} variant="secondary" className="text-[10px] capitalize">
                          {placement.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {(aggregatedData.professional.industries.length > 0 ||
        aggregatedData.professional.jobTitles.length > 0) && (
        <Collapsible
          open={expandedSections.has('professional')}
          onOpenChange={() => toggleSection('professional')}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Professional</span>
              <Badge variant="secondary" className="text-xs">
                {aggregatedData.professional.industries.length +
                  aggregatedData.professional.jobTitles.length}
              </Badge>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                expandedSections.has('professional') && 'rotate-180'
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2">
            {aggregatedData.professional.industries.length > 0 && (
              <div className="p-3 rounded-lg border bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2">Industries</p>
                <div className="flex flex-wrap gap-1.5">
                  {aggregatedData.professional.industries.map((industry) => (
                    <Badge key={industry.id} variant="outline" className="text-xs">
                      {industry.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {aggregatedData.professional.jobTitles.length > 0 && (
              <div className="p-3 rounded-lg border bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2">Job Titles</p>
                <div className="flex flex-wrap gap-1.5">
                  {aggregatedData.professional.jobTitles.map((job) => (
                    <Badge key={job.id} variant="outline" className="text-xs">
                      {job.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </>
  )
}
