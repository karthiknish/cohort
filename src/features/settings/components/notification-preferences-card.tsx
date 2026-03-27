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
  const handleAdAlertsChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onPreferenceToggle('emailAdAlerts', event.target.checked)
  }, [onPreferenceToggle])

  const handlePerformanceDigestChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onPreferenceToggle('emailPerformanceDigest', event.target.checked)
  }, [onPreferenceToggle])

  const handleTaskActivityChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onPreferenceToggle('emailTaskActivity', event.target.checked)
  }, [onPreferenceToggle])

  const handleCollaborationChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onPreferenceToggle('emailCollaboration', event.target.checked)
  }, [onPreferenceToggle])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>Control how and when you receive alerts from Cohorts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading notification preferences...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Email Notifications</h4>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Ad Performance Alerts</p>
                  <p className="text-sm text-muted-foreground">Automated alerts for ROAS drops, high spend, and efficiency issues.</p>
                </div>
                <Checkbox
                  checked={emailAdAlertsEnabled}
                  onChange={handleAdAlertsChange}
                  disabled={notificationsLoading || savingPreferences}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Weekly Performance Digest</p>
                  <p className="text-sm text-muted-foreground">Summary reports of your workspace performance across all platforms.</p>
                </div>
                <Checkbox
                  checked={emailPerformanceDigestEnabled}
                  onChange={handlePerformanceDigestChange}
                  disabled={notificationsLoading || savingPreferences}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Tasks & Activity</p>
                  <p className="text-sm text-muted-foreground">Emails for task updates, comments, and mentions.</p>
                </div>
                <Checkbox
                  checked={emailTaskActivityEnabled}
                  onChange={handleTaskActivityChange}
                  disabled={notificationsLoading || savingPreferences}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Collaboration Messages</p>
                  <p className="text-sm text-muted-foreground">Receive email notifications for new collaboration chat messages.</p>
                </div>
                <Checkbox
                  checked={emailCollaborationEnabled}
                  onChange={handleCollaborationChange}
                  disabled={notificationsLoading || savingPreferences}
                />
              </div>
            </div>
          </div>
        )}
        {notificationError ? <p className="text-sm text-destructive">{notificationError}</p> : null}
      </CardContent>
    </Card>
  )
}
