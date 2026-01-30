// =============================================================================
// GOOGLE ADS WEBSITE TRAFFIC SECTION
// =============================================================================

'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Link2 } from 'lucide-react'
import { GoogleObjectiveComponentProps, GOOGLE_BIDDING_STRATEGIES } from './types'

export function GoogleTrafficSection({ formData, onChange, disabled }: GoogleObjectiveComponentProps) {
  const biddingStrategies = GOOGLE_BIDDING_STRATEGIES['WEBSITE_TRAFFIC'] || []

  return (
    <div className="space-y-6">
      {/* Bidding Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="w-4 h-4 text-amber-500" />
            Bidding Strategy
          </CardTitle>
          <CardDescription>
            Choose how you want to bid for your traffic campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bidding-strategy">Bidding Strategy</Label>
            <Select
              value={formData.biddingStrategyType}
              onValueChange={(value) => onChange({ biddingStrategyType: value })}
              disabled={disabled}
            >
              <SelectTrigger id="bidding-strategy">
                <SelectValue placeholder="Select bidding strategy" />
              </SelectTrigger>
              <SelectContent>
                {biddingStrategies.map((strategy) => (
                  <SelectItem key={strategy.value} value={strategy.value}>
                    <div className="flex flex-col items-start">
                      <span>{strategy.label}</span>
                      <span className="text-xs text-muted-foreground">{strategy.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Landing Page */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="w-4 h-4 text-amber-500" />
            Landing Page
          </CardTitle>
          <CardDescription>
            Where users will go when they click your ad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="landing-page">Final URL</Label>
            <Input
              id="landing-page"
              type="url"
              placeholder="https://example.com/landing-page"
              value={formData.landingPageUrl || ''}
              onChange={(e) => onChange({ landingPageUrl: e.target.value })}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Use a dedicated landing page that matches your ad messaging
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking-template">Tracking Template (Optional)</Label>
            <Input
              id="tracking-template"
              placeholder="{lpurl}?utm_source=google&utm_campaign={campaignid}"
              value={formData.trackingTemplate || ''}
              onChange={(e) => onChange({ trackingTemplate: e.target.value })}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Add UTM parameters or tracking values to your URLs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <ExternalLink className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Traffic Campaign Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use dedicated landing pages that match your ad copy</li>
                <li>Ensure your site loads quickly (under 3 seconds)</li>
                <li>Set up Google Analytics 4 for detailed tracking</li>
                <li>Use responsive search ads with multiple headlines</li>
                <li>Test different audiences to find the most engaged visitors</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
