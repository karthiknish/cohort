// =============================================================================
// GOOGLE ADS LEADS SECTION
// =============================================================================

'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Users, Phone, FileText } from 'lucide-react'
import { GoogleObjectiveComponentProps, GOOGLE_BIDDING_STRATEGIES } from './types'

export function GoogleLeadsSection({ formData, onChange, disabled }: GoogleObjectiveComponentProps) {
  const biddingStrategies = GOOGLE_BIDDING_STRATEGIES['LEADS'] || []

  return (
    <div className="space-y-6">
      {/* Bidding Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-blue-500" />
            Bidding Strategy
          </CardTitle>
          <CardDescription>
            Choose how you want to bid for your leads campaign
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

          {formData.biddingStrategyType === 'TARGET_CPA' && (
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
                Target cost per lead
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Form Extension */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-blue-500" />
            Lead Form Extension
          </CardTitle>
          <CardDescription>
            Collect leads directly from your ads with native lead forms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="lead-form">Enable Lead Form Extension</Label>
              <p className="text-xs text-muted-foreground">
                Users can submit their info without leaving Google
              </p>
            </div>
            <Switch
              id="lead-form"
              checked={formData.leadFormExtension === 'LEAD_FORM'}
              onCheckedChange={(checked) => 
                onChange({ leadFormExtension: checked ? 'LEAD_FORM' : undefined })
              }
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Call Extension */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="w-4 h-4 text-blue-500" />
            Call Extension
          </CardTitle>
          <CardDescription>
            Add click-to-call to drive phone leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            <Input
              id="phone-number"
              placeholder="+1 (555) 123-4567"
              value={formData.phoneNumber || ''}
              onChange={(e) => onChange({ phoneNumber: e.target.value })}
              disabled={disabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="call-reporting">Enable Call Reporting</Label>
              <p className="text-xs text-muted-foreground">
                Track calls as conversions
              </p>
            </div>
            <Switch
              id="call-reporting"
              checked={formData.callReporting}
              onCheckedChange={(checked) => onChange({ callReporting: checked })}
              disabled={disabled || !formData.phoneNumber}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Users className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Leads Campaign Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use lead form extensions to reduce friction</li>
                <li>Keep lead forms short - ask only essential questions</li>
                <li>Set up automated email responses for new leads</li>
                <li>Use call extensions for high-intent queries</li>
                <li>Import offline conversions to improve quality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
