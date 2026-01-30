// =============================================================================
// GOOGLE ADS SALES SECTION
// =============================================================================

'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign } from 'lucide-react'
import { GoogleObjectiveComponentProps, GOOGLE_BIDDING_STRATEGIES, CONVERSION_GOALS } from './types'

export function GoogleSalesSection({ formData, onChange, disabled }: GoogleObjectiveComponentProps) {
  const biddingStrategies = GOOGLE_BIDDING_STRATEGIES['SALES'] || []

  return (
    <div className="space-y-6">
      {/* Bidding Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-4 h-4 text-green-500" />
            Bidding Strategy
          </CardTitle>
          <CardDescription>
            Choose how you want to bid for your sales campaign
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

          {/* Target ROAS/CPA fields based on bidding strategy */}
          {formData.biddingStrategyType === 'TARGET_ROAS' && (
            <div className="space-y-2">
              <Label htmlFor="target-roas">Target ROAS (%)</Label>
              <input
                id="target-roas"
                type="number"
                min="1"
                max="1000"
                placeholder="400"
                value={formData.targetRoas || ''}
                onChange={(e) => onChange({ targetRoas: parseFloat(e.target.value) })}
                disabled={disabled}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Target return on ad spend. For example, 400 means $4 in sales for every $1 spent.
              </p>
            </div>
          )}

          {(formData.biddingStrategyType === 'TARGET_CPA' || formData.biddingStrategyType === 'MAXIMIZE_CONVERSIONS') && (
            <div className="space-y-2">
              <Label htmlFor="target-cpa">Target CPA ($)</Label>
              <input
                id="target-cpa"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="25.00"
                value={formData.targetCpa || ''}
                onChange={(e) => onChange({ targetCpa: parseFloat(e.target.value) })}
                disabled={disabled}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Target cost per acquisition/conversion
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Goal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Conversion Goal
          </CardTitle>
          <CardDescription>
            Select the primary conversion action you want to optimize for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="conversion-goal">Primary Conversion Goal</Label>
            <Select
              value={formData.conversionGoal}
              onValueChange={(value) => onChange({ conversionGoal: value })}
              disabled={disabled}
            >
              <SelectTrigger id="conversion-goal">
                <SelectValue placeholder="Select conversion goal" />
              </SelectTrigger>
              <SelectContent>
                {CONVERSION_GOALS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    <div className="flex flex-col items-start">
                      <span>{goal.label}</span>
                      <span className="text-xs text-muted-foreground">{goal.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sales Campaign Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use Performance Max for maximum reach across all Google channels</li>
                <li>Set up conversion tracking with the Google tag (gtag.js) or Google Tag Manager</li>
                <li>Start with Target ROAS if you have historical conversion data</li>
                <li>Use audience signals in Performance Max to guide machine learning</li>
                <li>Include high-quality images and videos in your asset groups</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
