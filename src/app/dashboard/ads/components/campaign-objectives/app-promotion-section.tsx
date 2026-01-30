// =============================================================================
// APP PROMOTION OBJECTIVE SECTION - App installs and engagement
// =============================================================================

'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Store, AppWindow, Play } from 'lucide-react'
import { APP_EVENT_TYPES, ObjectiveComponentProps } from './types'

export function AppPromotionSection({ formData, onChange, disabled }: ObjectiveComponentProps) {
  return (
    <div className="space-y-6">
      {/* App Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AppWindow className="w-4 h-4 text-cyan-500" />
            App Configuration
          </CardTitle>
          <CardDescription>
            Configure your app for install or engagement campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* App Store */}
          <div className="space-y-2">
            <Label htmlFor="app-store">App Store</Label>
            <Select
              value={formData.destinationType}
              onValueChange={(value) => onChange({ destinationType: value as any })}
              disabled={disabled}
            >
              <SelectTrigger id="app-store">
                <SelectValue placeholder="Select app store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APP_STORE">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    <span>Apple App Store</span>
                  </div>
                </SelectItem>
                <SelectItem value="GOOGLE_PLAY">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>Google Play Store</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* App ID */}
          <div className="space-y-2">
            <Label htmlFor="app-id">App ID</Label>
            <Input
              id="app-id"
              placeholder="e.g., 1234567890"
              value={formData.appId || ''}
              onChange={(e) => onChange({ appId: e.target.value })}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Your app ID from the App Store or Google Play Console
            </p>
          </div>

          {/* App Store URL */}
          <div className="space-y-2">
            <Label htmlFor="app-url">App Store URL</Label>
            <Input
              id="app-url"
              type="url"
              placeholder="https://apps.apple.com/app/your-app"
              value={formData.appStoreUrl || ''}
              onChange={(e) => onChange({ appStoreUrl: e.target.value })}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Optimization Settings</CardTitle>
          <CardDescription>
            Choose what app event to optimize for.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app-event">App Event</Label>
            <Select
              value={formData.appEventType}
              onValueChange={(value) => onChange({ appEventType: value })}
              disabled={disabled}
            >
              <SelectTrigger id="app-event">
                <SelectValue placeholder="Select app event" />
              </SelectTrigger>
              <SelectContent>
                {APP_EVENT_TYPES.map((event) => (
                  <SelectItem key={event.value} value={event.value}>
                    <div className="flex flex-col items-start">
                      <span>{event.label}</span>
                      <span className="text-xs text-muted-foreground">{event.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deep Linking */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Deep Linking (Optional)</CardTitle>
          <CardDescription>
            Send users to specific content within your app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="deep-link">Deep Link URL</Label>
            <Input
              id="deep-link"
              placeholder="e.g., myapp://product/123"
              value={formData.destinationUrl || ''}
              onChange={(e) => onChange({ destinationUrl: e.target.value })}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              If the app is installed, users will go directly to this screen
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-cyan-500/20 bg-cyan-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Smartphone className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">App Promotion Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Implement the Facebook SDK for accurate tracking</li>
                <li>Use app event optimization for quality users</li>
                <li>Create compelling app store listings</li>
                <li>Use playable ads to let users try before installing</li>
                <li>Set up deep linking for better user experience</li>
                <li>Retarget users who installed but haven't opened the app</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
