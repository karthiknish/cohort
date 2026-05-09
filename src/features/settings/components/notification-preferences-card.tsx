'use client'

import { useCallback, type ChangeEvent } from 'react'
import { LoaderCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'

interface NotificationPreferencesCardProps {
  notificationsLoading: boolean
  notificationError: string | null
  emailAdAlertsEnabled: boolean
  emailPerformanceDigestEnabled: boolean
  emailTaskActivityEnabled: boolean
  emailCollaborationEnabled: boolean
  savingPreferences: boolean
  onPreferenceToggle: (
    type: 'emailAdAlerts' | 'emailPerformanceDigest' | 'emailTaskActivity' | 'emailCollaboration',
    checked: boolean
  ) => void
}

export function NotificationPreferencesCard({
  notificationsLoading,
  notificationError,
  emailAdAlertsEnabled,
  emailPerformanceDigestEnabled,
  emailTaskActivityEnabled,
  emailCollaborationEnabled,
  savingPreferences,
  onPreferenceToggle,
}: NotificationPreferencesCardProps) {
  const handleAdAlertsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onPreferenceToggle('emailAdAlerts', event.target.checked)
    },
    [onPreferenceToggle]
  )

  const handlePerformanceDigestChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onPreferenceToggle('emailPerformanceDigest', event.target.checked)
    },
    [onPreferenceToggle]
  )

  const handleTaskActivityChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onPreferenceToggle('emailTaskActivity', event.target.checked)
    },
    [onPreferenceToggle]
  )

  const handleCollaborationChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onPreferenceToggle('emailCollaboration', event.target.checked)
    },
    [onPreferenceToggle]
  )

  const disabled = notificationsLoading || savingPreferences

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>Control how and when you receive alerts from Cohorts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            Loading notification preferences…
          </div>
        ) : (
          <div className="space-y-6">
            {savingPreferences ? (
              <div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                Saving preferences…
              </div>
            ) : null}

            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Email Notifications
              </h4>

              <div className="flex gap-3 sm:gap-4">
                <Checkbox
                  id="notif-email-ad-alerts"
                  checked={emailAdAlertsEnabled}
                  onChange={handleAdAlertsChange}
                  disabled={disabled}
                  className="mt-0.5 shrink-0"
                  aria-describedby="notif-email-ad-alerts-desc"
                />
                <label htmlFor="notif-email-ad-alerts" className="min-w-0 flex-1 cursor-pointer space-y-1">
                  <span className="block text-sm font-medium text-foreground">Ad Performance Alerts</span>
                  <span id="notif-email-ad-alerts-desc" className="block text-sm text-muted-foreground">
                    Automated alerts for ROAS drops, high spend, and efficiency issues.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <Checkbox
                  id="notif-email-performance-digest"
                  checked={emailPerformanceDigestEnabled}
                  onChange={handlePerformanceDigestChange}
                  disabled={disabled}
                  className="mt-0.5 shrink-0"
                  aria-describedby="notif-email-performance-digest-desc"
                />
                <label htmlFor="notif-email-performance-digest" className="min-w-0 flex-1 cursor-pointer space-y-1">
                  <span className="block text-sm font-medium text-foreground">Weekly Performance Digest</span>
                  <span id="notif-email-performance-digest-desc" className="block text-sm text-muted-foreground">
                    Summary reports of your workspace performance across all platforms.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <Checkbox
                  id="notif-email-task-activity"
                  checked={emailTaskActivityEnabled}
                  onChange={handleTaskActivityChange}
                  disabled={disabled}
                  className="mt-0.5 shrink-0"
                  aria-describedby="notif-email-task-activity-desc"
                />
                <label htmlFor="notif-email-task-activity" className="min-w-0 flex-1 cursor-pointer space-y-1">
                  <span className="block text-sm font-medium text-foreground">Tasks & Activity</span>
                  <span id="notif-email-task-activity-desc" className="block text-sm text-muted-foreground">
                    Emails for task updates, comments, and mentions.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <Checkbox
                  id="notif-email-collaboration"
                  checked={emailCollaborationEnabled}
                  onChange={handleCollaborationChange}
                  disabled={disabled}
                  className="mt-0.5 shrink-0"
                  aria-describedby="notif-email-collaboration-desc"
                />
                <label htmlFor="notif-email-collaboration" className="min-w-0 flex-1 cursor-pointer space-y-1">
                  <span className="block text-sm font-medium text-foreground">Collaboration Messages</span>
                  <span id="notif-email-collaboration-desc" className="block text-sm text-muted-foreground">
                    Receive email notifications for new collaboration chat messages.
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
        {notificationError ? (
          <p className="text-sm text-destructive" role="alert">
            {notificationError}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
