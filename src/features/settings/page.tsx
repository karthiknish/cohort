'use client'

import { Suspense, startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle, Shield, User } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'
import { settingsApi } from '@/lib/convex-api'
import { getPreviewSettingsNotificationPreferences, getPreviewSettingsProfile } from '@/lib/preview-data'

import {
  ProfileCard,
  NotificationPreferencesCard,
  RegionalPreferencesCard,
  DataExportCard,
  PrivacySettingsCard,
  DeleteAccountCard,
  type NotificationPreferencesResponse,
} from './components'

function SettingsPageFallback() {
  return (
    <div className="container mx-auto max-w-6xl py-10" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
        Loading settings…
      </div>
    </div>
  )
}

function SettingsPageInner() {
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
  const profile = useQuery(settingsApi.getMyProfile)
  const previewProfile = useMemo(() => getPreviewSettingsProfile(), [])
  const [previewNotificationPrefs, setPreviewNotificationPrefs] = useState(() => getPreviewSettingsNotificationPreferences())
  const user = isPreviewMode ? previewProfile : profile

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

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab') === 'account' ? 'account' : 'profile'
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>(tabFromUrl)

  useEffect(() => {
    const next = searchParams.get('tab') === 'account' ? 'account' : 'profile'
    setActiveTab(next)
  }, [searchParams])

  const handleSettingsTabChange = useCallback(
    (value: string) => {
      const next = value === 'account' ? 'account' : 'profile'
      startTransition(() => {
        setActiveTab(next)
        router.replace(`${pathname}?tab=${next}`, { scroll: false })
      })
    },
    [pathname, router]
  )

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setProfilePhone('')
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [user?.legacyId])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (isPreviewMode) {
        setEmailAdAlertsEnabled(Boolean(previewNotificationPrefs.emailAdAlerts))
        setEmailPerformanceDigestEnabled(Boolean(previewNotificationPrefs.emailPerformanceDigest))
        setEmailTaskActivityEnabled(Boolean(previewNotificationPrefs.emailTaskActivity))
        setEmailCollaborationEnabled(Boolean(previewNotificationPrefs.emailCollaboration))
        setNotificationError(null)
        setNotificationsLoading(false)

        if (!profilePhone.trim() && previewNotificationPrefs.phoneNumber) {
          setProfilePhone(previewNotificationPrefs.phoneNumber)
        }
        return
      }

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
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [isPreviewMode, notificationPrefs, previewNotificationPrefs, profilePhone, user])

  const saveNotificationPreferences = useCallback(
    (
      input: {
        emailAdAlerts?: boolean
        emailPerformanceDigest?: boolean
        emailTaskActivity?: boolean
        emailCollaboration?: boolean
      },
      options: { silent?: boolean } = {}
    ): Promise<NotificationPreferencesResponse | null> => {
      if (isPreviewMode) {
        const nextPreferences: NotificationPreferencesResponse = {
          emailAdAlerts: input.emailAdAlerts ?? emailAdAlertsEnabled,
          emailPerformanceDigest: input.emailPerformanceDigest ?? emailPerformanceDigestEnabled,
          emailTaskActivity: input.emailTaskActivity ?? emailTaskActivityEnabled,
          emailCollaboration: input.emailCollaboration ?? emailCollaborationEnabled,
          phoneNumber: profilePhone.trim().length ? profilePhone.trim() : null,
        }

        if (isMountedRef.current) {
          setSavingPreferences(true)
          setNotificationError(null)
        }

        return Promise.resolve()
          .then(() => {
            setPreviewNotificationPrefs(nextPreferences)

            if (!options.silent) {
              toast({
                title: 'Preview mode',
                description: 'Sample notification settings updated locally for this session.',
              })
            }

            return nextPreferences
          })
          .finally(() => {
            if (isMountedRef.current) {
              setSavingPreferences(false)
            }
          })
      }

      if (!user) return Promise.resolve(null)

      if (isMountedRef.current) {
        setSavingPreferences(true)
        setNotificationError(null)
      }

      const trimmedPhone = profilePhone.trim()
      return Promise.resolve(
        updateNotificationPrefs({
          emailAdAlerts: input.emailAdAlerts,
          emailPerformanceDigest: input.emailPerformanceDigest,
          emailTaskActivity: input.emailTaskActivity,
          emailCollaboration: input.emailCollaboration ?? emailCollaborationEnabled,
          phoneNumber: trimmedPhone.length ? trimmedPhone : null,
        })
      )
        .then((updated) => {
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
        })
        .catch((saveError) => {
          const message = 'Unable to update notification preferences. Please try again.'
          console.error('[settings/notifications] update failed', saveError)
          if (isMountedRef.current) {
            setNotificationError(message)
          }
          if (!options.silent) {
            toast({ title: 'Notification update failed', description: message, variant: 'destructive' })
          }
          return null
        })
        .finally(() => {
          if (isMountedRef.current) {
            setSavingPreferences(false)
          }
        })
    },
    [
      emailAdAlertsEnabled,
      emailCollaborationEnabled,
      emailPerformanceDigestEnabled,
      emailTaskActivityEnabled,
      isPreviewMode,
      profilePhone,
      toast,
      updateNotificationPrefs,
      user,
    ]
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
    <main id="settings-page" className="container mx-auto max-w-6xl py-10">
      <div className="mb-8 space-y-2">
        <h1 id="settings-heading" className="text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your profile and account preferences.
          {isPreviewMode ? ' Preview mode uses sample account data and local-only actions.' : ''}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleSettingsTabChange} className="space-y-6">
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" aria-hidden /> Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Shield className="h-4 w-4" aria-hidden /> Account
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
    </main>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageFallback />}>
      <SettingsPageInner />
    </Suspense>
  )
}
