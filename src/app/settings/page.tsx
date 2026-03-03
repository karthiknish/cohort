'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { User, Shield } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { settingsApi } from '@/lib/convex-api'

import {
  ProfileCard,
  NotificationPreferencesCard,
  RegionalPreferencesCard,
  DataExportCard,
  PrivacySettingsCard,
  DeleteAccountCard,
  type NotificationPreferencesResponse,
} from './components'

export default function SettingsPage() {
  const { toast } = useToast()
  const profile = useQuery(settingsApi.getMyProfile)
  const user = profile

  const notificationPrefs = useQuery(settingsApi.getMyNotificationPreferences) as
    | {
        emailAdAlerts: boolean
        emailPerformanceDigest: boolean
        emailTaskActivity: boolean
        emailCollaboration: boolean
        phoneNumber: string | null
      }
    | null
    | undefined

  const updateNotificationPrefs = useMutation(settingsApi.updateMyNotificationPreferences)

  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationError, setNotificationError] = useState<string | null>(null)
  const [emailAdAlertsEnabled, setEmailAdAlertsEnabled] = useState(true)
  const [emailPerformanceDigestEnabled, setEmailPerformanceDigestEnabled] = useState(true)
  const [emailTaskActivityEnabled, setEmailTaskActivityEnabled] = useState(true)
  const [emailCollaborationEnabled, setEmailCollaborationEnabled] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [profilePhone, setProfilePhone] = useState('')

  useEffect(() => {
    setProfilePhone('')
  }, [user?.legacyId])

  useEffect(() => {
    if (!user) {
      setNotificationsLoading(false)
      setEmailAdAlertsEnabled(true)
      setEmailPerformanceDigestEnabled(true)
      setEmailTaskActivityEnabled(true)
      setEmailCollaborationEnabled(false)
      setNotificationError(null)
      return
    }

    if (notificationPrefs === undefined) {
      setNotificationsLoading(true)
      return
    }

    if (notificationPrefs === null) {
      setNotificationsLoading(false)
      setNotificationError('Unable to load notification preferences')
      return
    }

    setEmailAdAlertsEnabled(Boolean(notificationPrefs.emailAdAlerts))
    setEmailPerformanceDigestEnabled(Boolean(notificationPrefs.emailPerformanceDigest))
    setEmailTaskActivityEnabled(Boolean(notificationPrefs.emailTaskActivity))
    setEmailCollaborationEnabled(Boolean(notificationPrefs.emailCollaboration))
    setNotificationError(null)
    setNotificationsLoading(false)

    if (!profilePhone.trim() && notificationPrefs.phoneNumber) {
      setProfilePhone(notificationPrefs.phoneNumber)
    }
  }, [notificationPrefs, profilePhone, user])

  const saveNotificationPreferences = useCallback(
    async (
      input: {
        emailAdAlerts?: boolean
        emailPerformanceDigest?: boolean
        emailTaskActivity?: boolean
        emailCollaboration?: boolean
      },
      options: { silent?: boolean } = {}
    ): Promise<NotificationPreferencesResponse | null> => {
      if (!user) return null

      if (isMountedRef.current) {
        setSavingPreferences(true)
        setNotificationError(null)
      }

      try {
        const trimmedPhone = profilePhone.trim()
        const updated = (await updateNotificationPrefs({
          emailAdAlerts: input.emailAdAlerts,
          emailPerformanceDigest: input.emailPerformanceDigest,
          emailTaskActivity: input.emailTaskActivity,
          emailCollaboration: input.emailCollaboration ?? emailCollaborationEnabled,
          phoneNumber: trimmedPhone.length ? trimmedPhone : null,
        })) as unknown

        const payload = updated && typeof updated === 'object' ? (updated as Record<string, unknown>) : {}

        const preferences: NotificationPreferencesResponse = {
          emailAdAlerts: Boolean(payload.emailAdAlerts),
          emailPerformanceDigest: Boolean(payload.emailPerformanceDigest),
          emailTaskActivity: Boolean(payload.emailTaskActivity),
          emailCollaboration: Boolean(payload.emailCollaboration),
          phoneNumber: typeof payload.phoneNumber === 'string' ? payload.phoneNumber : null,
        }

        if (isMountedRef.current) {
          setEmailAdAlertsEnabled(preferences.emailAdAlerts)
          setEmailPerformanceDigestEnabled(preferences.emailPerformanceDigest)
          setEmailTaskActivityEnabled(preferences.emailTaskActivity)
          setEmailCollaborationEnabled(preferences.emailCollaboration)
          if (preferences.phoneNumber && preferences.phoneNumber !== profilePhone) {
            setProfilePhone(preferences.phoneNumber)
          }
        }

        if (!options.silent) {
          toast({ title: 'Notification preferences updated', description: 'Email alerts have been updated.' })
        }

        return preferences
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : 'Failed to update notification preferences'
        console.error('[settings/notifications] update failed', saveError)
        if (isMountedRef.current) {
          setNotificationError(message)
        }
        if (!options.silent) {
          toast({ title: 'Notification update failed', description: message, variant: 'destructive' })
        }
        return null
      } finally {
        if (isMountedRef.current) {
          setSavingPreferences(false)
        }
      }
    },
    [emailCollaborationEnabled, profilePhone, toast, updateNotificationPrefs, user]
  )

  const handlePreferenceToggle = useCallback(
    async (
      type: 'emailAdAlerts' | 'emailPerformanceDigest' | 'emailTaskActivity' | 'emailCollaboration',
      checked: boolean
    ) => {
      if (notificationsLoading || savingPreferences) return

      const current = {
        emailAdAlerts: emailAdAlertsEnabled,
        emailPerformanceDigest: emailPerformanceDigestEnabled,
        emailTaskActivity: emailTaskActivityEnabled,
        emailCollaboration: emailCollaborationEnabled,
      }

      const next = {
        emailAdAlerts: type === 'emailAdAlerts' ? checked : current.emailAdAlerts,
        emailPerformanceDigest: type === 'emailPerformanceDigest' ? checked : current.emailPerformanceDigest,
        emailTaskActivity: type === 'emailTaskActivity' ? checked : current.emailTaskActivity,
        emailCollaboration: type === 'emailCollaboration' ? checked : current.emailCollaboration,
      }

      if (
        next.emailAdAlerts === current.emailAdAlerts &&
        next.emailPerformanceDigest === current.emailPerformanceDigest &&
        next.emailTaskActivity === current.emailTaskActivity &&
        next.emailCollaboration === current.emailCollaboration
      ) {
        return
      }

      if (isMountedRef.current) {
        setEmailAdAlertsEnabled(next.emailAdAlerts)
        setEmailPerformanceDigestEnabled(next.emailPerformanceDigest)
        setEmailTaskActivityEnabled(next.emailTaskActivity)
        setEmailCollaborationEnabled(next.emailCollaboration)
      }

      const result = await saveNotificationPreferences(next)

      if (!result && isMountedRef.current) {
        setEmailAdAlertsEnabled(current.emailAdAlerts)
        setEmailPerformanceDigestEnabled(current.emailPerformanceDigest)
        setEmailTaskActivityEnabled(current.emailTaskActivity)
        setEmailCollaborationEnabled(current.emailCollaboration)
      }
    },
    [
      emailAdAlertsEnabled,
      emailCollaborationEnabled,
      emailPerformanceDigestEnabled,
      emailTaskActivityEnabled,
      notificationsLoading,
      saveNotificationPreferences,
      savingPreferences,
    ]
  )

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and account preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Shield className="h-4 w-4" /> Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileCard onPhoneChange={setProfilePhone} />

          <NotificationPreferencesCard
            notificationsLoading={notificationsLoading}
            notificationError={notificationError}
            emailAdAlertsEnabled={emailAdAlertsEnabled}
            emailPerformanceDigestEnabled={emailPerformanceDigestEnabled}
            emailTaskActivityEnabled={emailTaskActivityEnabled}
            emailCollaborationEnabled={emailCollaborationEnabled}
            savingPreferences={savingPreferences}
            onPreferenceToggle={handlePreferenceToggle}
          />

          <RegionalPreferencesCard />
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <DataExportCard />
          <PrivacySettingsCard />
          <DeleteAccountCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
