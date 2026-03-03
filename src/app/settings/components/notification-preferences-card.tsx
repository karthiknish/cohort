'use client'

import { LoaderCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

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
                  onChange={(e) => {
                    onPreferenceToggle('emailAdAlerts', e.target.checked)
                  }}
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
                  onChange={(e) => {
                    onPreferenceToggle('emailPerformanceDigest', e.target.checked)
                  }}
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
                  onChange={(e) => {
                    onPreferenceToggle('emailTaskActivity', e.target.checked)
                  }}
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
                  onChange={(e) => {
                    onPreferenceToggle('emailCollaboration', e.target.checked)
                  }}
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
