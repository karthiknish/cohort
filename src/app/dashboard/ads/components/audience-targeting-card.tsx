'use client'

import { useCallback, useState } from 'react'
import { RefreshCw, Users, MapPin, Target, Briefcase, ChevronDown, ChevronUp, Plus, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { AudienceBuilderDialog } from './audience-builder-dialog'
import { useClientContext } from '@/contexts/client-context'

// =============================================================================
// TYPES
// =============================================================================

type TargetingData = {
  providerId: string
  entityId: string
  entityName?: string
  entityType: 'adGroup' | 'campaign'
  demographics: {
    ageRanges: string[]
    genders: string[]
    languages: string[]
  }
  audiences: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  }
  locations: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  }
  interests: Array<{ id: string; name: string; category?: string }>
  keywords: Array<{ text: string; matchType?: string }>
  devices: string[]
  placements: string[]
  professional?: {
    industries: Array<{ id: string; name: string }>
    jobTitles: Array<{ id: string; name: string }>
    companySizes: string[]
    seniorities: string[]
  }
}

type Insights = {
  totalEntities: number
  demographicCoverage: {
    hasAgeTargeting: boolean
    hasGenderTargeting: boolean
    hasLocationTargeting: boolean
  }
  audienceStats: {
    totalAudiences: number
    hasCustomAudiences: boolean
    hasRemarketingLists: boolean
  }
  interestStats: {
    totalInterests: number
    totalKeywords: number
  }
}

type Props = {
  providerId: string
  providerName: string
  isConnected: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AudienceTargetingCard({ providerId, providerName, isConnected }: Props) {
  const { selectedClientId } = useClientContext()
  const [targeting, setTargeting] = useState<TargetingData[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [builderOpen, setBuilderOpen] = useState(false)

  const fetchTargeting = useCallback(async () => {
    if (!isConnected) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({ providerId })
      if (selectedClientId) params.set('clientId', selectedClientId)
      const response = await fetch(`/api/integrations/targeting?${params.toString()}`)
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || error.message || 'Failed to fetch targeting')
      }
      const payload = await response.json().catch(() => ({})) as any
      const data = payload?.data ?? payload
      setTargeting(data?.targeting || [])
      setInsights(data?.insights || null)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load audience targeting data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [providerId, isConnected, selectedClientId])

  const formatAgeRange = (range: string) => {
    return range.replace(/_/g, '-').replace('AGE', '').replace('RANGE', '').trim()
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Audience Targeting
          </CardTitle>
          <CardDescription>Connect {providerName} to view targeting criteria</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Audience Targeting
          </CardTitle>
          <CardDescription>
            {insights ? `${insights.totalEntities} targeting configs` : `View ${providerName} audience targeting`}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setBuilderOpen(true)} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Create Audience
          </Button>
          <Button variant="outline" size="sm" onClick={fetchTargeting} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Load Targeting
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {targeting.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Click &quot;Load Targeting&quot; to view audience targeting data.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Insights Summary */}
            {insights && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{insights.audienceStats.totalAudiences}</p>
                    <p className="text-xs text-muted-foreground">Audiences</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {insights.demographicCoverage.hasLocationTargeting ? 'Yes' : 'No'}
                    </p>
                    <p className="text-xs text-muted-foreground">Geo Targeting</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{insights.interestStats.totalInterests}</p>
                    <p className="text-xs text-muted-foreground">Interests</p>
                  </div>
                </div>
              </div>
            )}

            {/* Targeting List */}
            <div className="space-y-2 max-h-[400px] overflow-auto">
              {targeting.map((t) => (
                <div key={t.entityId} className="border rounded-lg">
                  <button
                    className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedId(expandedId === t.entityId ? null : t.entityId)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.entityName || t.entityId}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {t.entityType}
                      </Badge>
                    </div>
                    {expandedId === t.entityId ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle Edit
                          }}
                        >
                          <Settings2 className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                  
                  {expandedId === t.entityId && (
                    <div className="p-4 pt-0 space-y-3 text-sm">
                      {/* Demographics */}
                      {(t.demographics.ageRanges.length > 0 || t.demographics.genders.length > 0) && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Demographics</p>
                          <div className="flex flex-wrap gap-1">
                            {t.demographics.ageRanges.map((age, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {formatAgeRange(age)}
                              </Badge>
                            ))}
                            {t.demographics.genders.map((gender, i) => (
                              <Badge key={i} variant="secondary" className="text-xs capitalize">
                                {gender.toLowerCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Locations */}
                      {t.locations.included.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Locations</p>
                          <div className="flex flex-wrap gap-1">
                            {t.locations.included.slice(0, 5).map((loc, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {loc.name}
                              </Badge>
                            ))}
                            {t.locations.included.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{t.locations.included.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Audiences */}
                      {t.audiences.included.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Audiences</p>
                          <div className="flex flex-wrap gap-1">
                            {t.audiences.included.slice(0, 5).map((aud, i) => (
                              <Badge key={i} className="text-xs">
                                {aud.name}
                              </Badge>
                            ))}
                            {t.audiences.included.length > 5 && (
                              <Badge className="text-xs">
                                +{t.audiences.included.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Professional (LinkedIn) */}
                      {t.professional && (t.professional.industries.length > 0 || t.professional.jobTitles.length > 0) && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Professional</p>
                          <div className="flex flex-wrap gap-1">
                            {t.professional.industries.slice(0, 3).map((ind, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {ind.name}
                              </Badge>
                            ))}
                            {t.professional.jobTitles.slice(0, 3).map((job, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {job.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <AudienceBuilderDialog 
        isOpen={builderOpen} 
        onOpenChange={setBuilderOpen} 
        providerId={providerId} 
      />
    </Card>
  )
}
