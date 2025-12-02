'use client'

import { Loader2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface NotificationPreferencesCardProps {
  notificationsLoading: boolean
  notificationError: string | null
  whatsappTasksEnabled: boolean
  whatsappCollaborationEnabled: boolean
  savingPreferences: boolean
  profilePhone: string
  onPreferenceToggle: (type: 'tasks' | 'collaboration', checked: boolean) => void
}

export function NotificationPreferencesCard({
  notificationsLoading,
  notificationError,
  whatsappTasksEnabled,
  whatsappCollaborationEnabled,
  savingPreferences,
  profilePhone,
  onPreferenceToggle,
}: NotificationPreferencesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>Control WhatsApp alerts for tasks and collaboration updates.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading notification preferences...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Task updates</p>
                <p className="text-sm text-muted-foreground">Send WhatsApp alerts when new tasks are created.</p>
              </div>
              <Checkbox
                checked={whatsappTasksEnabled}
                onChange={(event) => {
                  onPreferenceToggle('tasks', event.target.checked)
                }}
                disabled={notificationsLoading || savingPreferences}
                aria-label="Toggle WhatsApp alerts for new tasks"
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Collaboration activity</p>
                <p className="text-sm text-muted-foreground">Receive WhatsApp notifications for new collaboration messages.</p>
              </div>
              <Checkbox
                checked={whatsappCollaborationEnabled}
                onChange={(event) => {
                  onPreferenceToggle('collaboration', event.target.checked)
                }}
                disabled={notificationsLoading || savingPreferences}
                aria-label="Toggle WhatsApp alerts for collaboration messages"
              />
            </div>
          </div>
        )}
        {notificationError ? <p className="text-sm text-destructive">{notificationError}</p> : null}
        {!notificationsLoading && profilePhone.trim().length < 6 ? (
          <p className="text-xs text-muted-foreground">Add a phone number above to enable WhatsApp notifications.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
