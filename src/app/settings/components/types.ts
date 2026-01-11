// Settings page TypeScript types and interfaces

export interface PlanSummary {
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

export interface SubscriptionSummary {
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

export interface InvoiceSummary {
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

export interface UpcomingInvoiceSummary {
  amountDue: number
  currency: string | null
  nextPaymentAttempt: string | null
  dueDate: string | null
  status: string | null
}

export interface BillingStatusResponse {
  plans: PlanSummary[]
  subscription: SubscriptionSummary | null
  invoices: InvoiceSummary[]
  upcomingInvoice: UpcomingInvoiceSummary | null
}

export interface NotificationPreferencesResponse {
  whatsappTasks: boolean
  whatsappCollaboration: boolean
  emailAdAlerts: boolean
  emailPerformanceDigest: boolean
  emailTaskActivity: boolean
  phoneNumber: string | null
}

// Profile tab props
export interface ProfileCardProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    phoneNumber?: string | null
    photoURL?: string | null
    role?: string
  } | null
  profileName: string
  setProfileName: (value: string) => void
  profilePhone: string
  setProfilePhone: (value: string) => void
  profileError: string | null
  setProfileError: (value: string | null) => void
  savingProfile: boolean
  canSaveProfile: boolean
  avatarPreview: string | null
  setAvatarPreview: (value: string | null) => void
  avatarError: string | null
  setAvatarError: (value: string | null) => void
  avatarUploading: boolean
  setAvatarUploading: (value: boolean) => void
  avatarInputRef: React.RefObject<HTMLInputElement | null>
  tempAvatarUrlRef: React.MutableRefObject<string | null>
  handleProfileSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  updateProfile: (data: { name?: string; phoneNumber?: string | null; photoURL?: string | null }) => Promise<void>
  toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void
}

export interface NotificationPreferencesCardProps {
  notificationsLoading: boolean
  notificationError: string | null
  whatsappTasksEnabled: boolean
  whatsappCollaborationEnabled: boolean
  savingPreferences: boolean
  profilePhone: string
  handlePreferenceToggle: (type: 'tasks' | 'collaboration', checked: boolean) => Promise<void>
}

export interface RegionalPreferencesCardProps {
  preferences: { currency: string }
  preferencesLoading: boolean
  savingCurrency: boolean
  setSavingCurrency: (value: boolean) => void
  updateCurrency: (value: string) => Promise<void>
  toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void
}

// Billing tab props
export interface ClientBillingCardProps {
  selectedClient: {
    name: string
    lastInvoiceStatus?: string | null
    lastInvoiceAmount?: number | null
    lastInvoiceCurrency?: string | null
    lastInvoiceNumber?: string | null
    lastInvoiceUrl?: string | null
    lastInvoiceIssuedAt?: string | null
    billingEmail?: string | null
  } | null
}

export interface SubscriptionOverviewCardProps {
  loading: boolean
  subscription: SubscriptionSummary | null
  upcomingInvoice: UpcomingInvoiceSummary | null
  actionState: string | null
  refreshBilling: () => Promise<void>
  handleBillingPortal: () => Promise<void>
}

export interface PlanSelectionSectionProps {
  loading: boolean
  plans: PlanSummary[]
  currentPlanId: string | null
  actionState: string | null
  handleCheckout: (planId: string) => Promise<void>
}

export interface InvoiceHistorySectionProps {
  loading: boolean
  invoices: InvoiceSummary[]
}

// Account tab props
export interface DataExportCardProps {
  exportingData: boolean
  exportError: string | null
  handleExportData: () => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PrivacySettingsCardProps {}

export interface DeleteAccountCardProps {
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (value: boolean) => void
}

export interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  user: { id: string } | null
  deleteAccount: () => Promise<void>
  toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void
  router: { push: (path: string) => void }
}
