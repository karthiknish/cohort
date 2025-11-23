'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Check, CreditCard, ImagePlus, Trash2, User, Bell, Shield } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { storage } from '@/lib/firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

interface PlanSummary {
  id: string
  name: string
  description: string
  priceId: string
  unitAmount: number | null
  currency: string | null
  interval: string | null
  badge?: string
  features: string[]
  productName: string | null
}

interface SubscriptionSummary {
  id: string
  status: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  currentPeriodStart: string | null
  price: {
    id: string
    currency: string | null
    unitAmount: number | null
    interval: string | null
    nickname: string | null
  } | null
  plan: {
    id: string
    name: string
  } | null
  isManagedByApp: boolean
}

interface InvoiceSummary {
  id: string
  number: string | null
  status: string | null
  amountPaid: number
  total: number
  currency: string | null
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
  createdAt: string | null
}

interface UpcomingInvoiceSummary {
  amountDue: number
  currency: string | null
  nextPaymentAttempt: string | null
  dueDate: string | null
  status: string | null
}

interface BillingStatusResponse {
  plans: PlanSummary[]
  subscription: SubscriptionSummary | null
  invoices: InvoiceSummary[]
  upcomingInvoice: UpcomingInvoiceSummary | null
}

interface NotificationPreferencesResponse {
  whatsappTasks: boolean
  whatsappCollaboration: boolean
  phoneNumber: string | null
}

const subscriptionStatusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  trialing: 'bg-blue-100 text-blue-700',
  past_due: 'bg-amber-100 text-amber-700',
  canceled: 'bg-muted text-muted-foreground border border-border/50',
  unpaid: 'bg-red-100 text-red-700',
  incomplete: 'bg-amber-100 text-amber-700',
  incomplete_expired: 'bg-gray-200 text-gray-600',
  paused: 'bg-slate-200 text-slate-700',
}

export default function SettingsPage() {
  const { user, getIdToken, updateProfile, deleteAccount } = useAuth()
  const { toast } = useToast()
  const { selectedClient } = useClientContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<PlanSummary[]>([])
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null)
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [upcomingInvoice, setUpcomingInvoice] = useState<UpcomingInvoiceSummary | null>(null)
  const [actionState, setActionState] = useState<string | null>(null)
  const [profileName, setProfileName] = useState(user?.name ?? '')
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber ?? '')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationError, setNotificationError] = useState<string | null>(null)
  const [whatsappTasksEnabled, setWhatsappTasksEnabled] = useState(false)
  const [whatsappCollaborationEnabled, setWhatsappCollaborationEnabled] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false)
  const isMountedRef = useRef(true)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const tempAvatarUrlRef = useRef<string | null>(null)
  const isAdmin = user?.role === 'admin'
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoURL ?? null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const outstandingInvoiceStatus = selectedClient?.lastInvoiceStatus ?? null
  const outstandingInvoiceAmount = typeof selectedClient?.lastInvoiceAmount === 'number' ? selectedClient.lastInvoiceAmount : null
  const outstandingInvoiceCurrency = selectedClient?.lastInvoiceCurrency ?? 'usd'
  const outstandingInvoiceNumber = selectedClient?.lastInvoiceNumber ?? null
  const outstandingInvoiceUrl = selectedClient?.lastInvoiceUrl ?? null
  const outstandingInvoiceIssuedAt = selectedClient?.lastInvoiceIssuedAt ?? null
  const outstandingInvoiceEmail = selectedClient?.billingEmail ?? null

  const invoiceStatusIsOutstanding = outstandingInvoiceStatus === 'open' || outstandingInvoiceStatus === 'uncollectible'
  const hasClientInvoice = outstandingInvoiceAmount !== null || outstandingInvoiceStatus !== null || outstandingInvoiceNumber !== null

  const formattedInvoiceIssuedAtRaw = outstandingInvoiceIssuedAt ? formatDate(outstandingInvoiceIssuedAt) : null
  const formattedInvoiceIssuedAt = formattedInvoiceIssuedAtRaw && formattedInvoiceIssuedAtRaw !== 'Date unavailable' ? formattedInvoiceIssuedAtRaw : null

  const invoiceBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = invoiceStatusIsOutstanding
    ? 'destructive'
    : outstandingInvoiceStatus === 'paid'
      ? 'secondary'
      : 'outline'

  const invoiceHeaderLabel = invoiceStatusIsOutstanding ? 'Outstanding balance' : 'Latest invoice'
  const invoiceStatusLabel = outstandingInvoiceStatus ? outstandingInvoiceStatus.replace(/_/g, ' ') : null
  const invoiceContainerClass = cn(
    'rounded-lg border p-4 transition-colors',
    invoiceStatusIsOutstanding ? 'border-destructive/40 bg-destructive/10 text-destructive-foreground' : 'border-muted/60 bg-muted/20 text-foreground'
  )

  let displayInvoiceAmount: string | null = null
  if (outstandingInvoiceAmount !== null) {
    try {
      displayInvoiceAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: (outstandingInvoiceCurrency || 'usd').toUpperCase(),
        minimumFractionDigits: 2,
      }).format(outstandingInvoiceAmount)
    } catch {
      displayInvoiceAmount = `$${outstandingInvoiceAmount.toFixed(2)}`
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (tempAvatarUrlRef.current) {
        URL.revokeObjectURL(tempAvatarUrlRef.current)
        tempAvatarUrlRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    setProfileName(user?.name ?? '')
    setProfilePhone(user?.phoneNumber ?? '')
    setProfileError(null)
  }, [user?.name, user?.phoneNumber])

  useEffect(() => {
    setAvatarPreview(user?.photoURL ?? null)
  }, [user?.photoURL])

  useEffect(() => {
    if (!deleteDialogOpen) {
      setDeleteConfirm('')
      setDeleteAccountError(null)
      setDeleteAccountLoading(false)
    }
  }, [deleteDialogOpen])

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
        phoneNumber: typeof payload.phoneNumber === 'string' ? payload.phoneNumber : null,
      }

      if (isMountedRef.current) {
        setWhatsappTasksEnabled(preferences.whatsappTasks)
        setWhatsappCollaborationEnabled(preferences.whatsappCollaboration)
        setNotificationError(null)
        setNotificationsLoading(false)

        if ((!user.phoneNumber || user.phoneNumber.length === 0) && preferences.phoneNumber) {
          setProfilePhone(preferences.phoneNumber)
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load notification preferences'
      console.error('[settings/notifications] load failed', error)
      if (isMountedRef.current) {
        setNotificationError(message)
        setNotificationsLoading(false)
      }
    }
  }, [getIdToken, user])

  useEffect(() => {
    void fetchNotificationPreferences()
  }, [fetchNotificationPreferences])

  useEffect(() => {
    if (profilePhone.trim().length >= 6) {
      setNotificationError(null)
    }
  }, [profilePhone])

  const hasProfileChanges = useMemo(() => {
    const originalName = user?.name ?? ''
    const originalPhone = user?.phoneNumber ?? ''
    return profileName.trim() !== originalName || profilePhone.trim() !== originalPhone
  }, [profileName, profilePhone, user?.name, user?.phoneNumber])

  const avatarInitials = useMemo(() => {
    const source = profileName.trim() || user?.name?.trim() || user?.email?.trim() || 'C'
    const parts = source.split(/\s+/).filter(Boolean)
    if (parts.length === 0) {
      return 'C'
    }
    const first = parts[0]?.[0] ?? ''
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
    const value = `${first}${last}`.toUpperCase()
    return value || 'C'
  }, [profileName, user?.email, user?.name])

  const isProfileNameValid = profileName.trim().length >= 2
  const canSaveProfile = Boolean(user) && hasProfileChanges && isProfileNameValid && !savingProfile

  const saveNotificationPreferences = useCallback(
    async (
      input: { tasks: boolean; collaboration: boolean },
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
          phoneNumber: typeof payload.phoneNumber === 'string' ? payload.phoneNumber : null,
        }

        if (isMountedRef.current) {
          setWhatsappTasksEnabled(preferences.whatsappTasks)
          setWhatsappCollaborationEnabled(preferences.whatsappCollaboration)
          if (preferences.phoneNumber && preferences.phoneNumber !== profilePhone) {
            setProfilePhone(preferences.phoneNumber)
          }
        }

        if (!options.silent) {
          toast({ title: 'Notification preferences updated', description: 'WhatsApp alerts have been updated.' })
        }

        return preferences
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update notification preferences'
        console.error('[settings/notifications] update failed', error)
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

  const handlePreferenceToggle = useCallback(
    async (type: 'tasks' | 'collaboration', checked: boolean) => {
      if (notificationsLoading || savingPreferences) {
        return
      }

      const current = {
        tasks: whatsappTasksEnabled,
        collaboration: whatsappCollaborationEnabled,
      }

      const next = {
        tasks: type === 'tasks' ? checked : current.tasks,
        collaboration: type === 'collaboration' ? checked : current.collaboration,
      }

      if (next.tasks === current.tasks && next.collaboration === current.collaboration) {
        return
      }

      if (isMountedRef.current) {
        setWhatsappTasksEnabled(next.tasks)
        setWhatsappCollaborationEnabled(next.collaboration)
      }

      const result = await saveNotificationPreferences(next)

      if (!result && isMountedRef.current) {
        setWhatsappTasksEnabled(current.tasks)
        setWhatsappCollaborationEnabled(current.collaboration)
      }
    },
    [notificationsLoading, saveNotificationPreferences, savingPreferences, whatsappCollaborationEnabled, whatsappTasksEnabled]
  )

  const handleProfileSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!user) {
        setProfileError('You must be signed in to update your profile.')
        return
      }

      const nextName = profileName.trim()
      const nextPhone = profilePhone.trim()

      if (nextName.length < 2) {
        setProfileError('Enter a name with at least two characters.')
        return
      }

      setSavingProfile(true)
      setProfileError(null)

      try {
        await updateProfile({
          name: nextName,
          phoneNumber: nextPhone.length ? nextPhone : null,
        })
        setProfileName(nextName)
        setProfilePhone(nextPhone)
        toast({ title: 'Profile updated', description: 'Your changes were saved.' })

        if (whatsappTasksEnabled || whatsappCollaborationEnabled) {
          void saveNotificationPreferences(
            { tasks: whatsappTasksEnabled, collaboration: whatsappCollaborationEnabled },
            { silent: true }
          )
        }
      } catch (submitError) {
        const message = submitError instanceof Error ? submitError.message : 'Failed to update profile'
        setProfileError(message)
        toast({ title: 'Profile update failed', description: message, variant: 'destructive' })
      } finally {
        setSavingProfile(false)
      }
    },
    [profileName, profilePhone, saveNotificationPreferences, toast, updateProfile, user, whatsappCollaborationEnabled, whatsappTasksEnabled],
  )

  const handleAvatarButtonClick = useCallback(() => {
    setAvatarError(null)
    avatarInputRef.current?.click()
  }, [])

  const handleAvatarFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) {
        return
      }

      if (!user) {
        setAvatarError('You must be signed in to update your avatar.')
        event.target.value = ''
        return
      }

      if (!file.type.startsWith('image/')) {
        setAvatarError('Select an image file (PNG, JPG, or WebP).')
        event.target.value = ''
        return
      }

      const maxFileSize = 5 * 1024 * 1024
      if (file.size > maxFileSize) {
        setAvatarError('Choose an image under 5MB.')
        event.target.value = ''
        return
      }

      const previousUrl = avatarPreview
      setAvatarUploading(true)
      setAvatarError(null)

      if (tempAvatarUrlRef.current) {
        URL.revokeObjectURL(tempAvatarUrlRef.current)
        tempAvatarUrlRef.current = null
      }

      const objectUrl = URL.createObjectURL(file)
      tempAvatarUrlRef.current = objectUrl
      setAvatarPreview(objectUrl)

      try {
        const storageKey = `users/${user.id}/avatar/${Date.now()}-${file.name}`
        const fileRef = ref(storage, storageKey)
        await uploadBytes(fileRef, file, { contentType: file.type })
        const downloadUrl = await getDownloadURL(fileRef)

        await updateProfile({ photoURL: downloadUrl })
        setAvatarPreview(downloadUrl)
        toast({ title: 'Profile photo updated', description: 'Your avatar has been saved.' })
      } catch (uploadError) {
        console.error('[settings/profile] avatar upload failed', uploadError)
        setAvatarError('Failed to upload image. Try again.')
        setAvatarPreview(previousUrl ?? null)
        toast({ title: 'Upload failed', description: 'Unable to update your profile photo right now.', variant: 'destructive' })
      } finally {
        setAvatarUploading(false)
        if (tempAvatarUrlRef.current) {
          URL.revokeObjectURL(tempAvatarUrlRef.current)
          tempAvatarUrlRef.current = null
        }
        event.target.value = ''
      }
    },
    [avatarPreview, toast, updateProfile, user],
  )

  const handleAvatarRemove = useCallback(async () => {
    if (!user) {
      setAvatarError('You must be signed in to update your avatar.')
      return
    }

    setAvatarUploading(true)
    setAvatarError(null)

    if (tempAvatarUrlRef.current) {
      URL.revokeObjectURL(tempAvatarUrlRef.current)
      tempAvatarUrlRef.current = null
    }

    try {
      await updateProfile({ photoURL: null })
      setAvatarPreview(null)
      toast({ title: 'Profile photo removed', description: 'We removed your avatar.' })
    } catch (removeError) {
      console.error('[settings/profile] avatar remove failed', removeError)
      setAvatarError('Failed to remove profile photo. Try again.')
      toast({ title: 'Remove failed', description: 'Unable to remove your photo right now.', variant: 'destructive' })
    } finally {
      setAvatarUploading(false)
    }
  }, [toast, updateProfile, user])

  const currentPlanId = subscription?.plan?.id ?? null
  const statusBadgeClass = subscription ? subscriptionStatusStyles[subscription.status] ?? 'bg-muted text-muted-foreground' : ''

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0
      return bTime - aTime
    })
  }, [invoices])

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

  const handleAccountDeletion = useCallback(async () => {
    if (!user) {
      setDeleteAccountError('You must be signed in to delete your account.')
      return
    }

    if (deleteConfirm.trim().toLowerCase() !== 'delete') {
      setDeleteAccountError('Type DELETE to confirm this action.')
      return
    }

    setDeleteAccountLoading(true)
    setDeleteAccountError(null)

    try {
      await deleteAccount()
      toast({ title: 'Account deleted', description: 'Your account and associated data have been removed.' })
      setDeleteDialogOpen(false)
      router.push('/auth')
    } catch (accountError) {
      const message = accountError instanceof Error ? accountError.message : 'Failed to delete account'
      setDeleteAccountError(message)
      toast({ title: 'Account deletion failed', description: message, variant: 'destructive' })
    } finally {
      setDeleteAccountLoading(false)
    }
  }, [deleteAccount, deleteConfirm, router, toast, user])

  const loadingView = (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading billing details...
      </div>
    </div>
  )

  const subscriptionView = subscription ? (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge className={cn('capitalize', statusBadgeClass)}>{subscription.status.replace(/_/g, ' ')}</Badge>
            {subscription.plan ? (
              <span className="text-sm font-medium text-foreground">
                {subscription.plan.name}
              </span>
            ) : null}
          </div>
          {subscription.currentPeriodEnd ? (
            <p className="text-sm text-muted-foreground">
              Renews on {formatDate(subscription.currentPeriodEnd)}
              {subscription.cancelAtPeriodEnd ? ' • Cancellation scheduled' : ''}
            </p>
          ) : null}
          {!subscription.isManagedByApp ? (
            <p className="mt-2 text-sm text-muted-foreground">
              This subscription was created outside Cohorts. Manage changes directly in Stripe.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void refreshBilling()}>
            Refresh status
          </Button>
          <Button
            onClick={() => void handleBillingPortal()}
            disabled={actionState === 'portal'}
          >
            {actionState === 'portal' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Manage billing
          </Button>
        </div>
      </div>

      {upcomingInvoice ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">Upcoming invoice</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(upcomingInvoice.amountDue, upcomingInvoice.currency)} scheduled for {formatDate(upcomingInvoice.nextPaymentAttempt ?? upcomingInvoice.dueDate)}
          </p>
        </div>
      ) : null}
    </div>
  ) : (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          No active subscription
        </Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a plan below to unlock forecasting, automations, and premium reporting.
        </p>
      </div>
      <Button variant="outline" onClick={() => void refreshBilling()}>
        Refresh status
      </Button>
    </div>
  )

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
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update the contact details that appear in proposals and client-facing emails.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    void handleAvatarFileChange(event)
                  }}
                />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar className="h-16 w-16">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Profile photo" />
                    ) : (
                      <AvatarFallback>{avatarInitials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAvatarButtonClick}
                        disabled={avatarUploading}
                      >
                        {avatarUploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="mr-2 h-4 w-4" />
                        )}
                        {avatarUploading ? 'Uploading...' : avatarPreview ? 'Change photo' : 'Upload photo'}
                      </Button>
                      {avatarPreview ? (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            void handleAvatarRemove()
                          }}
                          disabled={avatarUploading}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use a square image (PNG, JPG, or WebP) under 5MB.
                    </p>
                    {avatarError ? <p className="text-xs text-destructive">{avatarError}</p> : null}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Display name</Label>
                    <Input
                      id="profile-name"
                      value={profileName}
                      onChange={(event) => {
                        setProfileName(event.target.value)
                        setProfileError(null)
                      }}
                      placeholder="e.g. Jordan Michaels"
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone number</Label>
                    <Input
                      id="profile-phone"
                      value={profilePhone}
                      onChange={(event) => {
                        setProfilePhone(event.target.value)
                        setProfileError(null)
                      }}
                      placeholder="Add a contact number"
                      autoComplete="tel"
                    />
                  </div>
                </div>
                {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    We use this information across proposals, invoices, and automated notifications.
                  </p>
                  <Button type="submit" disabled={!canSaveProfile}>
                    {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

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
                        void handlePreferenceToggle('tasks', event.target.checked)
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
                        void handlePreferenceToggle('collaboration', event.target.checked)
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
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Client invoicing</CardTitle>
                <CardDescription>Send Stripe invoices and review payment status from the admin clients workspace.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Head to the admin clients dashboard whenever you need to raise a new invoice or confirm a payment.
                </p>
                <Button asChild>
                  <Link href="/admin/clients">Open admin clients</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Client billing</CardTitle>
                  <CardDescription>
                    {selectedClient ? `Latest invoice for ${selectedClient.name}.` : 'Select a client workspace to view outstanding balances.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedClient ? (
                    hasClientInvoice ? (
                      <div className={invoiceContainerClass}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{invoiceHeaderLabel}</span>
                          {invoiceStatusLabel ? (
                            <Badge variant={invoiceBadgeVariant} className="capitalize">
                              {invoiceStatusLabel}
                            </Badge>
                          ) : null}
                        </div>
                        {displayInvoiceAmount ? (
                          <p className="mt-2 text-xl font-semibold">{displayInvoiceAmount}</p>
                        ) : (
                          <p className="mt-2 text-sm">No amount on record for the latest invoice.</p>
                        )}
                        {outstandingInvoiceNumber ? (
                          <p className="mt-2 text-xs text-muted-foreground">Invoice {outstandingInvoiceNumber}</p>
                        ) : null}
                        {formattedInvoiceIssuedAt ? (
                          <p className="text-xs text-muted-foreground">Sent {formattedInvoiceIssuedAt}</p>
                        ) : null}
                        {outstandingInvoiceEmail ? (
                          <p className="text-xs text-muted-foreground">Delivered to {outstandingInvoiceEmail}</p>
                        ) : null}
                        {outstandingInvoiceUrl ? (
                          <Button asChild size="sm" variant="outline" className="mt-3 w-fit">
                            <a href={outstandingInvoiceUrl} target="_blank" rel="noreferrer">
                              View invoice
                            </a>
                          </Button>
                        ) : null}
                        {invoiceStatusIsOutstanding ? (
                          <p className="mt-3 text-xs font-medium">
                            Please settle this balance to keep services running smoothly.
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No invoices have been issued for this client yet. New invoices will appear here as soon as they are sent.
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a client workspace from the sidebar to view invoice details and payment status.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription overview</CardTitle>
                  <CardDescription>Track your current plan, renewal date, and upcoming invoices.</CardDescription>
                </CardHeader>
                <CardContent>{loading ? loadingView : subscriptionView}</CardContent>
              </Card>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Choose your plan</h2>
                    <p className="text-sm text-muted-foreground">
                      Upgrade anytime. Changes take effect immediately and prorate automatically.
                    </p>
                  </div>
                </div>

                {loading && !plans.length ? (
                  loadingView
                ) : plans.length ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {plans.map((plan) => {
                      const isCurrentPlan = currentPlanId === plan.id
                      const disabled = actionState !== null || isCurrentPlan || plan.unitAmount === null || !plan.currency

                      return (
                        <Card key={plan.id} className={cn('flex flex-col justify-between border border-border/60', isCurrentPlan ? 'ring-2 ring-primary/60' : '')}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <CardTitle className="text-base font-semibold text-foreground">
                                  {plan.name}
                                </CardTitle>
                                <CardDescription className="mt-1 text-sm text-muted-foreground">
                                  {plan.description}
                                </CardDescription>
                              </div>
                              {plan.badge ? (
                                <Badge variant="secondary" className="uppercase tracking-wide">
                                  {plan.badge}
                                </Badge>
                              ) : null}
                            </div>
                            <div className="mt-4">
                              <span className="text-2xl font-semibold text-foreground">
                                {formatCurrency(plan.unitAmount, plan.currency)}
                              </span>
                              {plan.interval ? (
                                <span className="ml-1 text-sm text-muted-foreground">/ {plan.interval}</span>
                              ) : null}
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-foreground">
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button
                              className="w-full"
                              variant={isCurrentPlan ? 'secondary' : 'default'}
                              disabled={disabled}
                              onClick={() => void handleCheckout(plan.id)}
                            >
                              {isCurrentPlan ? 'Current plan' : 'Choose plan'}
                              {actionState === `checkout:${plan.id}` ? (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              ) : null}
                            </Button>
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
                    No billing plans are currently configured. Add Stripe price IDs to enable plan selection.
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Invoice history</h2>
                  <p className="text-sm text-muted-foreground">Download receipts for bookkeeping or click through to Stripe-hosted invoices.</p>
                </div>

                {loading && !sortedInvoices.length ? (
                  loadingView
                ) : sortedInvoices.length ? (
                  <div className="divide-y divide-border/60 rounded-lg border border-border/60">
                    {sortedInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-foreground">
                              {invoice.number ?? invoice.id}
                            </span>
                            {invoice.status ? (
                              <Badge variant="outline" className="capitalize">
                                {invoice.status.replace(/_/g, ' ')}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {invoice.createdAt ? formatDate(invoice.createdAt) : 'Date unavailable'}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-foreground md:flex-row md:items-center md:gap-4">
                          <span className="font-medium">
                            {formatCurrency(invoice.total || invoice.amountPaid, invoice.currency)}
                          </span>
                          <div className="flex gap-2">
                            {invoice.hostedInvoiceUrl ? (
                              <Button variant="outline" asChild size="sm">
                                <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer">
                                  View invoice
                                </a>
                              </Button>
                            ) : null}
                            {invoice.invoicePdf ? (
                              <Button variant="ghost" asChild size="sm">
                                <a href={invoice.invoicePdf} target="_blank" rel="noreferrer">
                                  Download PDF
                                </a>
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
                    No invoices to show yet. Once you subscribe you will see receipts and payment history here.
                  </div>
                )}
              </section>

              {error ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
            </>
          )}
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle>Delete account</CardTitle>
              <CardDescription>Remove your account and associated marketing data. This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Deleting your account will revoke access across all connected workspaces, stop integrations, and permanently erase stored reports. Export any information you need before proceeding.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>Delete account</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm account deletion</DialogTitle>
            <DialogDescription>
              This will permanently remove your account, integrations, and stored analytics. Type <span className="font-semibold">DELETE</span> to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={deleteConfirm}
              onChange={(event) => {
                setDeleteConfirm(event.target.value)
                setDeleteAccountError(null)
              }}
              placeholder="Type DELETE to confirm"
              autoFocus
            />
            {deleteAccountError ? <p className="text-sm text-destructive">{deleteAccountError}</p> : null}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={deleteAccountLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleAccountDeletion()}
              disabled={deleteConfirm.trim().toLowerCase() !== 'delete' || deleteAccountLoading}
            >
              {deleteAccountLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatCurrency(amountInMinorUnits: number | null | undefined, currency: string | null): string {
  if (!currency || amountInMinorUnits === null || amountInMinorUnits === undefined) {
    return 'Configure pricing'
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  })

  return formatter.format(amountInMinorUnits / 100)
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
