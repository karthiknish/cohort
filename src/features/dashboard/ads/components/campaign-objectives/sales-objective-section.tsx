// =============================================================================
// SALES OBJECTIVE SECTION - Conversion optimization for sales
// =============================================================================

'use client'

import { useCallback, type ChangeEvent } from 'react'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { AlertCircle, TrendingUp } from 'lucide-react'
import { CONVERSION_EVENTS } from './types'
import type { ObjectiveComponentProps } from './types'

export function SalesObjectiveSection({ formData, onChange, disabled }: ObjectiveComponentProps) {
  const handleConversionEventChange = useCallback(
    (value: string) => onChange({ conversionEvent: value }),
    [onChange],
  )

  const handlePixelIdChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onChange({ pixelId: event.target.value }),
    [onChange],
  )

  return (
    <div className="space-y-6">
      {/* Conversion Event Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-success" />
            Conversion Event
          </CardTitle>
          <CardDescription>
            Select the event you want to optimize for. This should be your primary business goal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conversion-event">Optimization Event</Label>
            <Select
              value={formData.conversionEvent}
              onValueChange={handleConversionEventChange}
              disabled={disabled}
            >
              <SelectTrigger id="conversion-event">
                <SelectValue placeholder="Select conversion event" />
              </SelectTrigger>
              <SelectContent>
                {CONVERSION_EVENTS.map((event) => (
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

          {/* Pixel ID */}
          <div className="space-y-2">
            <Label htmlFor="pixel-id">Facebook Pixel ID (Optional)</Label>
            <Input
              id="pixel-id"
              placeholder="e.g., 123456789012345"
              value={formData.pixelId || ''}
              onChange={handlePixelIdChange}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Your pixel should be installed on your website to track conversions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sales Campaign Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use high-quality product images or videos</li>
                <li>Include clear pricing and offers in your creatives</li>
                <li>Set up retargeting for cart abandoners</li>
                <li>Test different audiences: lookalikes, interests, and custom audiences</li>
                <li>Monitor your ROAS and adjust budget accordingly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
