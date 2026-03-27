// =============================================================================
// APP PROMOTION OBJECTIVE SECTION - App installs and engagement
// =============================================================================

'use client'

import { useCallback } from 'react'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Smartphone, Store, AppWindow, Play } from 'lucide-react'
import type { ObjectiveComponentProps } from './types'
import { APP_EVENT_TYPES } from './types'

export function AppPromotionSection({ formData, onChange, disabled }: ObjectiveComponentProps) {
  const handleDestinationTypeChange = useCallback((value: string) => {
    onChange({ destinationType: value as 'WEBSITE' | 'APP' | 'MESSENGER' })
  }, [onChange])

  const handleAppIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ appId: event.target.value })
  }, [onChange])

  const handleAppStoreUrlChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ appStoreUrl: event.target.value })
  }, [onChange])

  const handleDestinationUrlChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ destinationUrl: event.target.value })
  }, [onChange])

  const handleAppEventTypeChange = useCallback((value: string) => {
    onChange({ appEventType: value })
  }, [onChange])

  return (
    <div className="space-y-6">
      {/* App Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AppWindow className="w-4 h-4 text-secondary" />
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
              onValueChange={handleDestinationTypeChange}
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
              onChange={handleAppIdChange}
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
              onChange={handleAppStoreUrlChange}
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
              onValueChange={handleAppEventTypeChange}
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
              onChange={handleDestinationUrlChange}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              If the app is installed, users will go directly to this screen
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Smartphone className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">App Promotion Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Implement the Facebook SDK for accurate tracking</li>
                <li>Use app event optimization for quality users</li>
                <li>Create compelling app store listings</li>
                <li>Use playable ads to let users try before installing</li>
                <li>Set up deep linking for better user experience</li>
                <li>Retarget users who installed but have not opened the app</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
