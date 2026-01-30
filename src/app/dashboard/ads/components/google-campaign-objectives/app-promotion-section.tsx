// =============================================================================
// GOOGLE ADS APP PROMOTION SECTION
// =============================================================================

'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Store, Play } from 'lucide-react'
import { GoogleObjectiveComponentProps, GOOGLE_BIDDING_STRATEGIES, APP_CAMPAIGN_SUBTYPES, APP_STORES } from './types'

export function GoogleAppPromotionSection({ formData, onChange, disabled }: GoogleObjectiveComponentProps) {
  const biddingStrategies = GOOGLE_BIDDING_STRATEGIES['APP_PROMOTION'] || []

  return (
    <div className="space-y-6">
      {/* App Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="w-4 h-4 text-cyan-500" />
            App Information
          </CardTitle>
          <CardDescription>
            Configure your app for the campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* App Store */}
          <div className="space-y-2">
            <Label htmlFor="app-store">App Store</Label>
            <Select
              value={formData.appStore}
              onValueChange={(value) => onChange({ appStore: value as any })}
              disabled={disabled}
            >
              <SelectTrigger id="app-store">
                <SelectValue placeholder="Select app store" />
              </SelectTrigger>
              <SelectContent>
                {APP_STORES.map((store) => (
                  <SelectItem key={store.value} value={store.value}>
                    <div className="flex items-center gap-2">
                      {store.value === 'GOOGLE_PLAY' ? (
                        <Play className="w-4 h-4" />
                      ) : (
                        <Store className="w-4 h-4" />
                      )}
                      <div className="flex flex-col items-start">
                        <span>{store.label}</span>
                        <span className="text-xs text-muted-foreground">{store.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* App ID */}
          <div className="space-y-2">
            <Label htmlFor="app-id">App ID</Label>
            <Input
              id="app-id"
              placeholder={formData.appStore === 'APPLE_APP_STORE' ? '1234567890' : 'com.example.app'}
              value={formData.appId || ''}
              onChange={(e) => onChange({ appId: e.target.value })}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              {formData.appStore === 'APPLE_APP_STORE' 
                ? 'App Store ID (numeric)' 
                : 'Package name (e.g., com.example.app)'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Subtype */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Campaign Objective</CardTitle>
          <CardDescription>
            What do you want to achieve with your app campaign?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="campaign-subtype">Campaign Type</Label>
            <Select
              value={formData.appCampaignSubtype}
              onValueChange={(value) => onChange({ appCampaignSubtype: value })}
              disabled={disabled}
            >
              <SelectTrigger id="campaign-subtype">
                <SelectValue placeholder="Select campaign type" />
              </SelectTrigger>
              <SelectContent>
                {APP_CAMPAIGN_SUBTYPES.map((subtype) => (
                  <SelectItem key={subtype.value} value={subtype.value}>
                    <div className="flex flex-col items-start">
                      <span>{subtype.label}</span>
                      <span className="text-xs text-muted-foreground">{subtype.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bidding Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Bidding Strategy</CardTitle>
          <CardDescription>
            Choose how you want to bid for your app campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
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

      {/* Tips */}
      <Card className="border-cyan-500/20 bg-cyan-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Smartphone className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">App Campaign Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Implement the Google Play Install Referrer API for accurate attribution</li>
                <li>Set up in-app event tracking with Firebase or Google Analytics</li>
                <li>Upload at least 10 images and 5 videos for best performance</li>
                <li>Use the "App Engagement" subtype to re-engage existing users</li>
                <li>Test different bidding strategies to find your optimal cost per install</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
