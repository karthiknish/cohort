'use client'

import { LoaderCircle, RefreshCw } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import type { IntegrationStatus, ProviderAutomationFormState } from './types'
import {
  FREQUENCY_OPTIONS,
  TIMEFRAME_OPTIONS,
  DEFAULT_SYNC_FREQUENCY_MINUTES,
  DEFAULT_TIMEFRAME_DAYS,
  formatProviderName,
  formatRelativeTimestamp,
  getStatusBadgeVariant,
  getStatusLabel,
  describeFrequency,
  describeTimeframe,
} from './utils'

interface AutomationControlsCardProps {
  automationStatuses: IntegrationStatus[]
  automationDraft: Record<string, ProviderAutomationFormState>
  savingSettings: Record<string, boolean>
  settingsErrors: Record<string, string>
  expandedProviders: Record<string, boolean>
  syncingProvider: string | null
  onUpdateDraft: (providerId: string, updates: Partial<ProviderAutomationFormState>) => void
  onSaveAutomation: (providerId: string) => void
  onToggleAdvanced: (providerId: string) => void
  onRunManualSync: (providerId: string) => void
}

export function AutomationControlsCard({
  automationStatuses,
  automationDraft,
  savingSettings,
  settingsErrors,
  expandedProviders,
  syncingProvider,
  onUpdateDraft,
  onSaveAutomation,
  onToggleAdvanced,
  onRunManualSync,
}: AutomationControlsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-1">
        <CardTitle className="text-lg">Automation controls</CardTitle>
        <CardDescription>
          Toggle automatic syncs and adjust frequency for each connected provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {automationStatuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
            <p>Connect an ad platform to configure auto-sync preferences.</p>
          </div>
        ) : (
          automationStatuses.map((status) => {
            const draft = automationDraft[status.providerId] ?? {
              autoSyncEnabled: true,
              syncFrequencyMinutes: DEFAULT_SYNC_FREQUENCY_MINUTES,
              scheduledTimeframeDays: DEFAULT_TIMEFRAME_DAYS,
            }
            const saving = savingSettings[status.providerId] ?? false
            const errorMessage = settingsErrors[status.providerId]
            const isExpanded = expandedProviders[status.providerId] ?? false
            const frequencyLabel = describeFrequency(draft.syncFrequencyMinutes)
            const timeframeLabel = describeTimeframe(draft.scheduledTimeframeDays)
            const autoSyncSummary = draft.autoSyncEnabled
              ? `Auto-sync is on. Cohorts refresh ${frequencyLabel.toLowerCase()} covering the ${timeframeLabel.toLowerCase()}.`
              : 'Auto-sync is off. Turn it on to keep metrics current automatically.'

            return (
              <div
                key={status.providerId}
                className="space-y-4 rounded-lg border border-muted/60 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {formatProviderName(status.providerId)}
                      </p>
                      <Badge variant={getStatusBadgeVariant(status.status)}>
                        {getStatusLabel(status.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{autoSyncSummary}</p>
                    <p className="text-xs text-muted-foreground">
                      Last sync: {formatRelativeTimestamp(status.lastSyncedAt)} · Last
                      request: {formatRelativeTimestamp(status.lastSyncRequestedAt)}
                    </p>
                    {status.message ? (
                      <p className="text-xs text-muted-foreground">
                        Last message: {status.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => onToggleAdvanced(status.providerId)}
                      disabled={saving}
                    >
                      {isExpanded ? 'Hide advanced' : 'Adjust cadence'}
                    </Button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Checkbox
                    checked={draft.autoSyncEnabled}
                    onChange={(event) =>
                      onUpdateDraft(status.providerId, {
                        autoSyncEnabled: event.target.checked,
                      })
                    }
                    disabled={saving}
                  />
                  Enable automatic sync
                </label>

                {isExpanded && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Cadence
                      </span>
                      <Select
                        value={String(draft.syncFrequencyMinutes)}
                        onValueChange={(value) =>
                          onUpdateDraft(status.providerId, {
                            syncFrequencyMinutes: Number(value),
                          })
                        }
                        disabled={saving}
                      >
                        <SelectTrigger disabled={saving}>
                          <SelectValue placeholder="Select cadence" />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Data window
                      </span>
                      <Select
                        value={String(draft.scheduledTimeframeDays)}
                        onValueChange={(value) =>
                          onUpdateDraft(status.providerId, {
                            scheduledTimeframeDays: Number(value),
                          })
                        }
                        disabled={saving}
                      >
                        <SelectTrigger disabled={saving}>
                          <SelectValue placeholder="Select window" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEFRAME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  {errorMessage ? (
                    <p className="text-xs text-destructive">{errorMessage}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Changes apply to future scheduled syncs for this provider.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="inline-flex items-center gap-2"
                      onClick={() => onSaveAutomation(status.providerId)}
                      disabled={saving}
                    >
                      {saving ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {saving ? 'Saving…' : 'Save automation'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="inline-flex items-center gap-2"
                      onClick={() => onRunManualSync(status.providerId)}
                      disabled={syncingProvider === status.providerId}
                    >
                      <RefreshCw
                        className={cn(
                          'h-4 w-4',
                          syncingProvider === status.providerId && 'animate-spin'
                        )}
                      />
                      {syncingProvider === status.providerId ? 'Syncing…' : 'Run sync now'}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
