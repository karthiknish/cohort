// =============================================================================
// GOOGLE ADS BRAND AWARENESS SECTION
// =============================================================================

'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Target } from 'lucide-react'
import { GoogleObjectiveComponentProps } from './types'

const IMPRESSION_SHARE_TARGETS = [
  { value: 'ABSOLUTE_TOP_OF_PAGE', label: 'Absolute Top of Page', description: 'Position 1 on search results' },
  { value: 'TOP_OF_PAGE', label: 'Top of Page', description: 'Top positions on search results' },
  { value: 'ANYWHERE_ON_PAGE', label: 'Anywhere on Page', description: 'Any position on search results' },
]

const FREQUENCY_CAP_TIME_UNITS = [
  { value: 'DAY', label: 'Per Day' },
  { value: 'WEEK', label: 'Per Week' },
  { value: 'MONTH', label: 'Per Month' },
]

export function GoogleBrandAwarenessSection({ formData, onChange, disabled }: GoogleObjectiveComponentProps) {
  return (
    <div className="space-y-6">
      {/* Target Impression Share */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4 text-purple-500" />
            Target Impression Share
          </CardTitle>
          <CardDescription>
            Choose where you want your ads to appear
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="impression-share-target">Target Location</Label>
            <Select
              value={formData.targetImpressionShareLocation}
              onValueChange={(value) => onChange({ targetImpressionShareLocation: value })}
              disabled={disabled}
            >
              <SelectTrigger id="impression-share-target">
                <SelectValue placeholder="Select target location" />
              </SelectTrigger>
              <SelectContent>
                {IMPRESSION_SHARE_TARGETS.map((target) => (
                  <SelectItem key={target.value} value={target.value}>
                    <div className="flex flex-col items-start">
                      <span>{target.label}</span>
                      <span className="text-xs text-muted-foreground">{target.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Target Percentage</Label>
              <span className="text-sm font-medium">{formData.targetImpressionSharePercentage || 80}%</span>
            </div>
            <Slider
              value={[formData.targetImpressionSharePercentage || 80]}
              onValueChange={([value]) => onChange({ targetImpressionSharePercentage: value })}
              min={1}
              max={100}
              step={1}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Percentage of eligible impressions you want to capture
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Frequency Cap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Frequency Cap</CardTitle>
          <CardDescription>
            Limit how often the same user sees your ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="frequency-cap">Enable Frequency Cap</Label>
              <p className="text-xs text-muted-foreground">
                Prevent ad fatigue
              </p>
            </div>
            <Switch
              id="frequency-cap"
              checked={!!formData.frequencyCapLevel}
              onCheckedChange={(checked) => 
                onChange({ 
                  frequencyCapLevel: checked ? 'CAMPAIGN' : undefined,
                  frequencyCapEvents: checked ? 3 : undefined,
                  frequencyCapTimeUnit: checked ? 'WEEK' : undefined,
                })
              }
              disabled={disabled}
            />
          </div>

          {formData.frequencyCapLevel && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Max Impressions</Label>
                  <span className="text-sm font-medium">{formData.frequencyCapEvents || 3}</span>
                </div>
                <Slider
                  value={[formData.frequencyCapEvents || 3]}
                  onValueChange={([value]) => onChange({ frequencyCapEvents: value })}
                  min={1}
                  max={20}
                  step={1}
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-unit">Time Period</Label>
                <Select
                  value={formData.frequencyCapTimeUnit}
                  onValueChange={(value) => onChange({ frequencyCapTimeUnit: value as any })}
                  disabled={disabled}
                >
                  <SelectTrigger id="time-unit">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_CAP_TIME_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Eye className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Brand Awareness Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use video ads for higher recall and engagement</li>
                <li>Target broadly to reach new potential customers</li>
                <li>Use frequency capping to prevent ad fatigue</li>
                <li>Run campaigns for at least 2-4 weeks for measurable impact</li>
                <li>Measure brand lift with Google Surveys</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
