// =============================================================================
// ENGAGEMENT OBJECTIVE SECTION - Boost post and page engagement
// =============================================================================

'use client'

import { useCallback } from 'react'

import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Heart, Calendar, ThumbsUp } from 'lucide-react'
import { ENGAGEMENT_TYPES } from './types'
import type { ObjectiveComponentProps } from './types'

export function EngagementObjectiveSection({ formData, onChange, disabled }: ObjectiveComponentProps) {
  const handleEngagementTypeChange = useCallback(
    (value: string) => {
      onChange({ engagementType: value as 'POST_ENGAGEMENT' | 'PAGE_ENGAGEMENT' | 'EVENT_RESPONSES' })
    },
    [onChange]
  )

  return (
    <div className="space-y-6">
      {/* Engagement Type Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="size-4 text-primary" />
            Engagement Type
          </CardTitle>
          <CardDescription>
            Choose what type of engagement you want to drive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="engagement-type">Engagement Goal</Label>
            <Select
              value={formData.engagementType}
              onValueChange={handleEngagementTypeChange}
              disabled={disabled}
            >
              <SelectTrigger id="engagement-type">
                <SelectValue placeholder="Select engagement type" />
              </SelectTrigger>
              <SelectContent>
                {ENGAGEMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col items-start">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {formData.engagementType === 'POST_ENGAGEMENT' ? (
        <Alert>
          <AlertDescription className="text-xs">
            Post selection is not wired in Cohort yet. Create your engagement ad in Meta Ads Manager and select the post there, or use Page engagement below.
          </AlertDescription>
        </Alert>
      ) : null}

      {formData.engagementType === 'EVENT_RESPONSES' ? (
        <Alert>
          <AlertDescription className="text-xs">
            Event promotion requires selecting an event in Meta Ads Manager. Cohort does not list Page events via API in this flow yet.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Page Engagement */}
      {formData.engagementType === 'PAGE_ENGAGEMENT' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ThumbsUp className="size-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Page Engagement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This will promote your Facebook Page to get more likes, follows, and overall engagement. 
                  Your ads will be optimized to reach people most likely to engage with your page content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-accent/20 bg-accent/10">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Heart className="size-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Engagement Campaign Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use eye-catching visuals and videos</li>
                <li>Ask questions to encourage comments</li>
                <li>Post during peak engagement hours</li>
                <li>Respond to comments quickly</li>
                <li>Run contests or giveaways (follow platform rules)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
