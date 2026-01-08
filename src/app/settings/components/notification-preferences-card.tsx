'use client'

import { LoaderCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface NotificationPreferencesCardProps {
  notificationsLoading: boolean
  notificationError: string | null
  whatsappTasksEnabled: boolean
  whatsappCollaborationEnabled: boolean
  emailAdAlertsEnabled: boolean
  emailPerformanceDigestEnabled: boolean
  emailTaskActivityEnabled: boolean
  savingPreferences: boolean
  profilePhone: string
  onPreferenceToggle: (
    type: 'tasks' | 'collaboration' | 'emailAdAlerts' | 'emailPerformanceDigest' | 'emailTaskActivity',
    checked: boolean
  ) => void
}

export function NotificationPreferencesCard({
  notificationsLoading,
  notificationError,
  whatsappTasksEnabled,
  whatsappCollaborationEnabled,
  emailAdAlertsEnabled,
  emailPerformanceDigestEnabled,
  emailTaskActivityEnabled,
  savingPreferences,
  profilePhone,
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
                  <p className="text-sm font-medium text-foreground">Tasks & Collaboration</p>
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
            </div>

            <div className="space-y-4 border-t pt-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp Alerts</h4>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Task updates</p>
                  <p className="text-sm text-muted-foreground">Send WhatsApp alerts when new tasks are created.</p>
                </div>
                <Checkbox
                  checked={whatsappTasksEnabled}
                  onChange={(e) => {
                    onPreferenceToggle('tasks', e.target.checked)
                  }}
                  disabled={notificationsLoading || savingPreferences || profilePhone.trim().length < 6}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Collaboration activity</p>
                  <p className="text-sm text-muted-foreground">Receive WhatsApp notifications for new collaboration messages.</p>
                </div>
                <Checkbox
                  checked={whatsappCollaborationEnabled}
                  onChange={(e) => {
                    onPreferenceToggle('collaboration', e.target.checked)
                  }}
                  disabled={notificationsLoading || savingPreferences || profilePhone.trim().length < 6}
                />
              </div>

              {profilePhone.trim().length < 6 ? (
                <p className="text-xs text-amber-600">Add a phone number above to enable WhatsApp notifications.</p>
              ) : null}
            </div>
          </div>
        )}
        {notificationError ? <p className="text-sm text-destructive">{notificationError}</p> : null}
      </CardContent>
    </Card>
  )
}
