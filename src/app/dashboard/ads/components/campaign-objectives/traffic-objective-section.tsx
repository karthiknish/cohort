// =============================================================================
// TRAFFIC OBJECTIVE SECTION - Drive traffic to destinations
// =============================================================================

'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Globe, MessageCircle } from 'lucide-react'
import { DESTINATION_TYPES, ObjectiveComponentProps } from './types'

export function TrafficObjectiveSection({ formData, onChange, disabled }: ObjectiveComponentProps) {
  return (
    <div className="space-y-6">
      {/* Destination Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="w-4 h-4 text-amber-500" />
            Traffic Destination
          </CardTitle>
          <CardDescription>
            Choose where you want to send people when they click your ad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Destination Type */}
          <div className="space-y-2">
            <Label htmlFor="destination-type">Destination Type</Label>
            <Select
              value={formData.destinationType}
              onValueChange={(value) => onChange({ destinationType: value as any })}
              disabled={disabled}
            >
              <SelectTrigger id="destination-type">
                <SelectValue placeholder="Select destination type" />
              </SelectTrigger>
              <SelectContent>
                {DESTINATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.value === 'WEBSITE' && <Globe className="w-4 h-4" />}
                      {type.value === 'MESSENGER' && <MessageCircle className="w-4 h-4" />}
                      {type.value === 'WHATSAPP' && <MessageCircle className="w-4 h-4" />}
                      <div className="flex flex-col items-start">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL Input */}
          {(formData.destinationType === 'WEBSITE' || formData.destinationType === 'APP') && (
            <div className="space-y-2">
              <Label htmlFor="destination-url">
                {formData.destinationType === 'APP' ? 'App Deep Link' : 'Website URL'}
              </Label>
              <Input
                id="destination-url"
                type="url"
                placeholder={
                  formData.destinationType === 'APP'
                    ? 'e.g., myapp://product/123'
                    : 'https://example.com/landing-page'
                }
                value={formData.destinationUrl || ''}
                onChange={(e) => onChange({ destinationUrl: e.target.value })}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                {formData.destinationType === 'APP'
                  ? 'Deep link that opens your app to a specific screen'
                  : 'Use a dedicated landing page for best results'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Optimization Settings</CardTitle>
          <CardDescription>
            Choose how you want to optimize your traffic campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="optimization-goal">Optimization Goal</Label>
            <Select
              value={formData.optimizationGoal}
              onValueChange={(value) => onChange({ optimizationGoal: value })}
              disabled={disabled}
            >
              <SelectTrigger id="optimization-goal">
                <SelectValue placeholder="Select optimization goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LINK_CLICKS">Link Clicks (Most traffic)</SelectItem>
                <SelectItem value="LANDING_PAGE_VIEWS">Landing Page Views (Higher quality)</SelectItem>
                <SelectItem value="REACH">Reach (Unique users)</SelectItem>
                <SelectItem value="IMPRESSIONS">Impressions (Most impressions)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <ExternalLink className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Traffic Campaign Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use landing pages that match your ad messaging</li>
                <li>Ensure your website loads quickly (under 3 seconds)</li>
                <li>Set up the Meta Pixel to track visitor behavior</li>
                <li>Use UTM parameters to track traffic sources</li>
                <li>Test different audiences to find the most engaged visitors</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
