'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { User, CreditCard, Shield } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'

import {
  ProfileCard,
  NotificationPreferencesCard,
  RegionalPreferencesCard,
  ClientBillingCard,
  AdminBillingCard,
  SubscriptionOverviewCard,
  PlanSelectionSection,
  InvoiceHistorySection,
  DataExportCard,
  PrivacySettingsCard,
  DeleteAccountCard,
  type PlanSummary,
  type SubscriptionSummary,
  type InvoiceSummary,
  type UpcomingInvoiceSummary,
  type BillingStatusResponse,
  type NotificationPreferencesResponse,
} from './components'

export default function SettingsPage() {
  const { user, getIdToken } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.role === 'admin'

  // Mount tracking
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Billing state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<PlanSummary[]>([])
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null)
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoiceSummary | null>(null)
  const [actionState, setActionState] = useState<string | null>(null)

  // Notification preferences state
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationError, setNotificationError] = useState<string | null>(null)
  const [whatsappTasksEnabled, setWhatsappTasksEnabled] = useState(false)
  const [whatsappCollaborationEnabled, setWhatsappCollaborationEnabled] = useState(false)
  const [emailAdAlertsEnabled, setEmailAdAlertsEnabled] = useState(true)
  const [emailPerformanceDigestEnabled, setEmailPerformanceDigestEnabled] = useState(true)
  const [emailTaskActivityEnabled, setEmailTaskActivityEnabled] = useState(true)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber ?? '')

  // Update phone when user changes
  useEffect(() => {
    setProfilePhone(user?.phoneNumber ?? '')
  }, [user?.phoneNumber])

  // Clear notification error when phone length is valid
  useEffect(() => {
    if (profilePhone.trim().length >= 6) {
      setNotificationError(null)
    }
  }, [profilePhone])

  const currentPlanId = subscription?.plan?.id ?? null

  // Fetch notification preferences
  const fetchNotificationPreferences = useCallback(async () => {
    if (!user) {
      if (isMountedRef.current) {
        setNotificationsLoading(false)
        setWhatsappTasksEnabled(false)
        setWhatsappCollaborationEnabled(false)
        setNotificationError(null)
      }
      return
    }

    if (isMountedRef.current) {
      setNotificationsLoading(true)
      setNotificationError(null)
    }

    try {
      const token = await getIdToken()
      const response = await fetch('/api/settings/notifications', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null

      if (!response.ok || !payload) {
        const message = payload && typeof payload.error === 'string' ? payload.error : 'Unable to load notification preferences'
        throw new Error(message)
      }

      const preferences: NotificationPreferencesResponse = {
        whatsappTasks: Boolean(payload.whatsappTasks),
        whatsappCollaboration: Boolean(payload.whatsappCollaboration),
        emailAdAlerts: Boolean(payload.emailAdAlerts),
        emailPerformanceDigest: Boolean(payload.emailPerformanceDigest),
        emailTaskActivity: Boolean(payload.emailTaskActivity),
        phoneNumber: typeof payload.phoneNumber === 'string' ? payload.phoneNumber : null,
      }

      if (isMountedRef.current) {
        setWhatsappTasksEnabled(preferences.whatsappTasks)
        setWhatsappCollaborationEnabled(preferences.whatsappCollaboration)
        setEmailAdAlertsEnabled(preferences.emailAdAlerts)
        setEmailPerformanceDigestEnabled(preferences.emailPerformanceDigest)
        setEmailTaskActivityEnabled(preferences.emailTaskActivity)
        setNotificationError(null)
        setNotificationsLoading(false)

        if ((!user.phoneNumber || user.phoneNumber.length === 0) && preferences.phoneNumber) {
          setProfilePhone(preferences.phoneNumber)
        }
      }
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Failed to load notification preferences'
      console.error('[settings/notifications] load failed', fetchError)
      if (isMountedRef.current) {
        setNotificationError(message)
        setNotificationsLoading(false)
      }
    }
  }, [getIdToken, user])

  useEffect(() => {
    void fetchNotificationPreferences()
  }, [fetchNotificationPreferences])

  // Save notification preferences
  const saveNotificationPreferences = useCallback(
    async (
      input: {
        tasks: boolean
        collaboration: boolean
        emailAdAlerts?: boolean
        emailPerformanceDigest?: boolean
        emailTaskActivity?: boolean
      },
      options: { silent?: boolean } = {}
    ): Promise<NotificationPreferencesResponse | null> => {
      if (!user) {
        return null
      }

      const trimmedPhone = profilePhone.trim()
      const requiresPhone = input.tasks || input.collaboration

      if (requiresPhone && trimmedPhone.length < 6) {
        const message = 'Add a valid phone number before enabling WhatsApp notifications.'
        if (!options.silent) {
          toast({ title: 'Phone number required', description: message, variant: 'destructive' })
        }
        if (isMountedRef.current) {
          setNotificationError(message)
        }
        return null
      }

      if (isMountedRef.current) {
        setSavingPreferences(true)
        setNotificationError(null)
      }

      try {
        const token = await getIdToken()
        const response = await fetch('/api/settings/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            whatsappTasks: input.tasks,
            whatsappCollaboration: input.collaboration,
            emailAdAlerts: input.emailAdAlerts,
            emailPerformanceDigest: input.emailPerformanceDigest,
            emailTaskActivity: input.emailTaskActivity,
            phoneNumber: trimmedPhone.length ? trimmedPhone : null,
          }),
        })

        const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null

        if (!response.ok || !payload) {
          const message = payload && typeof payload.error === 'string' ? payload.error : 'Failed to update notification preferences'
          throw new Error(message)
        }

        const preferences: NotificationPreferencesResponse = {
          whatsappTasks: Boolean(payload.whatsappTasks),
          whatsappCollaboration: Boolean(payload.whatsappCollaboration),
          emailAdAlerts: Boolean(payload.emailAdAlerts),
          emailPerformanceDigest: Boolean(payload.emailPerformanceDigest),
          emailTaskActivity: Boolean(payload.emailTaskActivity),
          phoneNumber: typeof payload.phoneNumber === 'string' ? payload.phoneNumber : null,
        }

        if (isMountedRef.current) {
          setWhatsappTasksEnabled(preferences.whatsappTasks)
          setWhatsappCollaborationEnabled(preferences.whatsappCollaboration)
          setEmailAdAlertsEnabled(preferences.emailAdAlerts)
          setEmailPerformanceDigestEnabled(preferences.emailPerformanceDigest)
          setEmailTaskActivityEnabled(preferences.emailTaskActivity)
          if (preferences.phoneNumber && preferences.phoneNumber !== profilePhone) {
            setProfilePhone(preferences.phoneNumber)
          }
        }

        if (!options.silent) {
          toast({ title: 'Notification preferences updated', description: 'WhatsApp alerts have been updated.' })
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
    [getIdToken, profilePhone, toast, user]
  )

  // Toggle notification preference
  const handlePreferenceToggle = useCallback(
    async (
      type: 'tasks' | 'collaboration' | 'emailAdAlerts' | 'emailPerformanceDigest' | 'emailTaskActivity',
      checked: boolean
    ) => {
      if (notificationsLoading || savingPreferences) {
        return
      }

      const current = {
        tasks: whatsappTasksEnabled,
        collaboration: whatsappCollaborationEnabled,
        emailAdAlerts: emailAdAlertsEnabled,
        emailPerformanceDigest: emailPerformanceDigestEnabled,
        emailTaskActivity: emailTaskActivityEnabled,
      }

      const next = {
        tasks: type === 'tasks' ? checked : current.tasks,
        collaboration: type === 'collaboration' ? checked : current.collaboration,
        emailAdAlerts: type === 'emailAdAlerts' ? checked : current.emailAdAlerts,
        emailPerformanceDigest: type === 'emailPerformanceDigest' ? checked : current.emailPerformanceDigest,
        emailTaskActivity: type === 'emailTaskActivity' ? checked : current.emailTaskActivity,
      }

      if (
        next.tasks === current.tasks &&
        next.collaboration === current.collaboration &&
        next.emailAdAlerts === current.emailAdAlerts &&
        next.emailPerformanceDigest === current.emailPerformanceDigest &&
        next.emailTaskActivity === current.emailTaskActivity
      ) {
        return
      }

      if (isMountedRef.current) {
        setWhatsappTasksEnabled(next.tasks)
        setWhatsappCollaborationEnabled(next.collaboration)
        setEmailAdAlertsEnabled(next.emailAdAlerts)
        setEmailPerformanceDigestEnabled(next.emailPerformanceDigest)
        setEmailTaskActivityEnabled(next.emailTaskActivity)
      }

      const result = await saveNotificationPreferences(next)

      if (!result && isMountedRef.current) {
        setWhatsappTasksEnabled(current.tasks)
        setWhatsappCollaborationEnabled(current.collaboration)
        setEmailAdAlertsEnabled(current.emailAdAlerts)
        setEmailPerformanceDigestEnabled(current.emailPerformanceDigest)
        setEmailTaskActivityEnabled(current.emailTaskActivity)
      }
    },
    [
      notificationsLoading,
      saveNotificationPreferences,
      savingPreferences,
      whatsappCollaborationEnabled,
      whatsappTasksEnabled,
      emailAdAlertsEnabled,
      emailPerformanceDigestEnabled,
      emailTaskActivityEnabled,
    ]
  )

  // Fetch billing data
  const refreshBilling = useCallback(async () => {
    if (!user || user.role === 'admin') {
      if (isMountedRef.current) {
        setPlans([])
        setSubscription(null)
        setInvoices([])
        setUpcomingInvoice(null)
        setError(null)
        setLoading(false)
      }
      return
    }

    if (isMountedRef.current) {
      setLoading(true)
      setError(null)
    }

    try {
      const token = await getIdToken()
      const response = await fetch('/api/billing/status', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error ?? 'Failed to load billing data')
      }

      const payload = (await response.json()) as BillingStatusResponse

      if (isMountedRef.current) {
        setPlans(payload.plans ?? [])
        setSubscription(payload.subscription ?? null)
        setInvoices(payload.invoices ?? [])
        setUpcomingInvoice(payload.upcomingInvoice ?? null)
      }
    } catch (fetchError) {
      console.error('[settings/billing] Failed to fetch billing overview', fetchError)
      if (isMountedRef.current) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load billing data')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [getIdToken, user])

  useEffect(() => {
    void refreshBilling()
  }, [refreshBilling])

  // Handle checkout
  const handleCheckout = useCallback(
    async (planId: string) => {
      if (!user) return

      setActionState(`checkout:${planId}`)
      setError(null)

      try {
        const token = await getIdToken()
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planId }),
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string }
          throw new Error(payload.error ?? 'Unable to start checkout session')
        }

        const payload = (await response.json()) as { url?: string }
        if (!payload.url) {
          throw new Error('Checkout session did not return a redirect URL')
        }

        window.location.href = payload.url
      } catch (checkoutError) {
        console.error('[settings/billing] Checkout error', checkoutError)
        setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start checkout')
      } finally {
        setActionState(null)
      }
    },
    [getIdToken, user],
  )

  // Handle billing portal
  const handleBillingPortal = useCallback(async () => {
    if (!user) return

    setActionState('portal')
    setError(null)

    try {
      const token = await getIdToken()
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ returnUrl: '/settings?portal=return' }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error ?? 'Unable to open billing portal')
      }

      const payload = (await response.json()) as { url?: string }
      if (!payload.url) {
        throw new Error('Billing portal session missing redirect URL')
      }

      window.location.href = payload.url
    } catch (portalError) {
      console.error('[settings/billing] Portal error', portalError)
      setError(portalError instanceof Error ? portalError.message : 'Unable to open billing portal')
    } finally {
      setActionState(null)
    }
  }, [getIdToken, user])

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, billing details, and account preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" /> Billing
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <Shield className="h-4 w-4" /> Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileCard
            onPhoneChange={setProfilePhone}
            whatsappTasksEnabled={whatsappTasksEnabled}
            whatsappCollaborationEnabled={whatsappCollaborationEnabled}
            saveNotificationPreferences={saveNotificationPreferences}
          />

          <NotificationPreferencesCard
            notificationsLoading={notificationsLoading}
            notificationError={notificationError}
            whatsappTasksEnabled={whatsappTasksEnabled}
            whatsappCollaborationEnabled={whatsappCollaborationEnabled}
            emailAdAlertsEnabled={emailAdAlertsEnabled}
            emailPerformanceDigestEnabled={emailPerformanceDigestEnabled}
            emailTaskActivityEnabled={emailTaskActivityEnabled}
            savingPreferences={savingPreferences}
            profilePhone={profilePhone}
            onPreferenceToggle={handlePreferenceToggle}
          />

          <RegionalPreferencesCard />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {isAdmin ? (
            <AdminBillingCard />
          ) : (
            <>
              <ClientBillingCard />

              <SubscriptionOverviewCard
                loading={loading}
                subscription={subscription}
                upcomingInvoice={upcomingInvoice}
                actionState={actionState}
                refreshBilling={refreshBilling}
                handleBillingPortal={handleBillingPortal}
              />

              <PlanSelectionSection
                loading={loading}
                plans={plans}
                currentPlanId={currentPlanId}
                actionState={actionState}
                handleCheckout={handleCheckout}
              />

              <InvoiceHistorySection
                loading={loading}
                invoices={invoices}
              />

              {error ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
            </>
          )}
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
