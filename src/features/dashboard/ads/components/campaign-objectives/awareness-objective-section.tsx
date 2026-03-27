// =============================================================================
// AWARENESS OBJECTIVE SECTION - Brand awareness and reach
// =============================================================================

'use client'

import { useCallback } from 'react'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Slider } from '@/shared/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Eye, Target, Zap } from 'lucide-react'
import type { ObjectiveComponentProps } from './types'

export function AwarenessObjectiveSection({ formData, onChange, disabled }: ObjectiveComponentProps) {
  const handleReachClick = useCallback(() => onChange({ optimizationGoal: 'REACH' }), [onChange])
  const handleImpressionsClick = useCallback(() => onChange({ optimizationGoal: 'IMPRESSIONS' }), [onChange])
  const handleAdRecallLiftClick = useCallback(() => onChange({ optimizationGoal: 'AD_RECALL_LIFT' }), [onChange])

  const optimizationGoalButtons = [
    {
      value: 'REACH' as const,
      label: 'Reach',
      desc: 'Maximize unique users who see your ad',
      icon: Target,
      onClick: handleReachClick,
    },
    {
      value: 'IMPRESSIONS' as const,
      label: 'Impressions',
      desc: 'Maximize total ad views (may reach same users multiple times)',
      icon: Eye,
      onClick: handleImpressionsClick,
    },
    {
      value: 'AD_RECALL_LIFT' as const,
      label: 'Ad Recall Lift',
      desc: 'Optimize for people likely to remember your ad (requires larger budget)',
      icon: Zap,
      onClick: handleAdRecallLiftClick,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Awareness Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="w-4 h-4 text-info" />
            Awareness Strategy
          </CardTitle>
          <CardDescription>
            Configure how you want to build brand awareness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Optimization Goal */}
          <div className="space-y-2">
            <Label htmlFor="awareness-goal">Optimization Goal</Label>
            <div className="grid grid-cols-1 gap-2">
              {optimizationGoalButtons.map((option) => (
                <OptimizationGoalButton
                  key={option.value}
                  active={formData.optimizationGoal === option.value}
                  disabled={Boolean(disabled)}
                  icon={option.icon}
                  label={option.label}
                  description={option.desc}
                  onClick={option.onClick}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frequency Cap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Frequency Cap</CardTitle>
          <CardDescription>
            Limit how often the same person sees your ad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="frequency-cap">Enable Frequency Cap</Label>
              <p className="text-xs text-muted-foreground">
                Prevent ad fatigue by limiting impressions per user
              </p>
            </div>
            <Switch
              id="frequency-cap"
              defaultChecked
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Impressions per user per week</Label>
              <span className="text-sm font-medium">3</span>
            </div>
            <Slider
              defaultValue={[3]}
              min={1}
              max={10}
              step={1}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 2-4 impressions per week for awareness campaigns
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Brand Lift Study */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Brand Lift Study</CardTitle>
          <CardDescription>
            Measure the impact of your ads on brand awareness.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="brand-lift">Enable Brand Lift Study</Label>
              <p className="text-xs text-muted-foreground">
                Requires minimum $30,000 spend over 30 days
              </p>
            </div>
            <Switch
              id="brand-lift"
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-info/20 bg-info/10">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Eye className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Awareness Campaign Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use memorable visuals that represent your brand</li>
                <li>Keep messaging simple and clear</li>
                <li>Target broadly to reach new audiences</li>
                <li>Use video to increase recall</li>
                <li>Measure brand lift with surveys</li>
                <li>Run campaigns for at least 2-4 weeks for impact</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OptimizationGoalButton({
  active,
  disabled,
  icon: Icon,
  label,
  description,
  onClick,
}: {
  active: boolean
  disabled: boolean
  icon: typeof Eye
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] ${
        active ? 'border-info/20 bg-info/10' : 'border-border hover:border-info/50'
      }`}
    >
      <Icon className="mt-0.5 h-5 w-5 text-info" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
