'use client'

import { notifyFailure } from '@/lib/notifications'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, ExternalLink, LoaderCircle, Moon } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'

import {
  applyPreferencesPatch,
  normalizePreferences,
  type NotificationCategory,
  type NotificationChannel,
  type NotificationPreferencesV2,
} from '@/lib/notifications/preferences'
import { settingsApi } from '@/lib/convex-api'
import { getPreviewSettingsNotificationPreferences } from '@/lib/preview-data'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { usePreview } from '@/shared/contexts/preview-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormField } from '@/shared/ui/form-field'
import { Switch } from '@/shared/ui/switch'
import { Input } from '@/shared/ui/input'
import { useToast } from '@/shared/ui/use-toast'

import { NotificationCategoryMatrix } from './notification-category-matrix'

const QUIET_HOURS_LABEL_PREFIX = (
  <Moon className="h-4 w-4 text-muted-foreground" aria-hidden />
)

export function NotificationPreferencesPanel() {
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
  const serverPrefs = useQuery(settingsApi.getMyNotificationPreferences)
  const updatePrefs = useMutation(settingsApi.updateMyNotificationPreferences)

  const [previewPrefs, setPreviewPrefs] = useState(() => getPreviewSettingsNotificationPreferences())
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferencesV2 | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (isPreviewMode) {
      setLocalPrefs(previewPrefs)
      setLoading(false)
      setError(null)
      return
    }

    if (serverPrefs === undefined) {
      setLoading(true)
      return
    }

    if (serverPrefs === null) {
      setLoading(false)
      setError('Unable to load notification preferences')
      return
    }

    setLocalPrefs(normalizePreferences(serverPrefs))
    setLoading(false)
    setError(null)
  }, [isPreviewMode, previewPrefs, serverPrefs])

  const persist = useCallback(
    async (patch: Parameters<typeof applyPreferencesPatch>[1], options?: { silent?: boolean }) => {
      if (!localPrefs) return null

      const previous = localPrefs
      const next = applyPreferencesPatch(localPrefs, patch)

      setLocalPrefs(next)
      setSaving(true)
      setError(null)

      try {
        if (isPreviewMode) {
          setPreviewPrefs(next)
          if (!options?.silent) {
            toast({
              title: 'Preview mode',
              description: 'Notification settings updated locally for this session.',
            })
          }
          return next
        }

        const updated = await updatePrefs({
          pauseAll: patch.pauseAll,
          quietHours: patch.quietHours,
          categories: patch.categories,
        })

        const normalized = normalizePreferences(updated)
        if (isMountedRef.current) {
          setLocalPrefs(normalized)
        }

        if (!options?.silent) {
          toast({ title: 'Notification preferences saved' })
        }

        return normalized
      } catch (saveError) {
        logError(saveError, 'NotificationPreferencesPanel:persist')
        const message = asErrorMessage(saveError)
        if (isMountedRef.current) {
          setLocalPrefs(previous)
          setError(message)
        }
        if (!options?.silent) {
          notifyFailure({
        title: 'Could not save preferences',
        message: message,
      })
        }
        return null
      } finally {
        if (isMountedRef.current) {
          setSaving(false)
        }
      }
    },
    [isPreviewMode, localPrefs, toast, updatePrefs],
  )

  const handlePauseAllChange = useCallback(
    (checked: boolean) => {
      void persist({ pauseAll: checked })
    },
    [persist],
  )

  const handleQuietHoursEnabledChange = useCallback(
    (checked: boolean) => {
      if (!localPrefs) return
      void persist({ quietHours: { ...localPrefs.quietHours, enabled: checked } })
    },
    [localPrefs, persist],
  )

  const handleQuietHoursTimeChange = useCallback(
    (field: 'start' | 'end', value: string) => {
      if (!localPrefs) return
      void persist({ quietHours: { ...localPrefs.quietHours, [field]: value } }, { silent: true })
    },
    [localPrefs, persist],
  )

  const handleChannelChange = useCallback(
    (category: NotificationCategory, channel: NotificationChannel, enabled: boolean) => {
      void persist({
        categories: {
          [category]: { [channel]: enabled },
        },
      })
    },
    [persist],
  )

  const handleQuietHoursStartChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleQuietHoursTimeChange('start', event.target.value)
    },
    [handleQuietHoursTimeChange],
  )

  const handleQuietHoursEndChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleQuietHoursTimeChange('end', event.target.value)
    },
    [handleQuietHoursTimeChange],
  )

  if (loading || !localPrefs) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground" role="status">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          Loading notification preferences…
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" aria-hidden />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose how you receive updates in the app and by email. Changes save automatically.
            </CardDescription>
          </div>
          <Link
            href="/dashboard/notifications"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Open notification center
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </CardHeader>
        <CardContent className="space-y-6">
          {saving ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </p>
          ) : null}

          <FormField
            id="pause-all-notifications"
            label="Pause all notifications"
            description="Temporarily stop in-app and email alerts. Your preferences are kept."
            orientation="horizontal"
            className="items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3"
          >
            <Switch
              id="pause-all-notifications"
              checked={localPrefs.pauseAll}
              disabled={saving}
              onCheckedChange={handlePauseAllChange}
            />
          </FormField>

          <div className="space-y-4 rounded-lg border border-border/60 p-4">
            <FormField
              id="quiet-hours-enabled"
              label="Quiet hours"
              description="Pause email notifications during a daily window (in-app still delivers)."
              labelPrefix={QUIET_HOURS_LABEL_PREFIX}
              orientation="horizontal"
              className="items-start justify-between"
            >
              <Switch
                id="quiet-hours-enabled"
                checked={localPrefs.quietHours.enabled}
                disabled={saving || localPrefs.pauseAll}
                onCheckedChange={handleQuietHoursEnabledChange}
              />
            </FormField>

            {localPrefs.quietHours.enabled ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="quiet-hours-start" label="From">
                  <Input
                    id="quiet-hours-start"
                    type="time"
                    value={localPrefs.quietHours.start}
                    disabled={saving || localPrefs.pauseAll}
                    onChange={handleQuietHoursStartChange}
                  />
                </FormField>
                <FormField id="quiet-hours-end" label="Until">
                  <Input
                    id="quiet-hours-end"
                    type="time"
                    value={localPrefs.quietHours.end}
                    disabled={saving || localPrefs.pauseAll}
                    onChange={handleQuietHoursEndChange}
                  />
                </FormField>
              </div>
            ) : null}
          </div>

          <NotificationCategoryMatrix
            preferences={localPrefs}
            disabled={saving}
            onChannelChange={handleChannelChange}
          />

          {error ? (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
