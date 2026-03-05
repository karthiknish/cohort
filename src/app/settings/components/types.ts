// Settings page TypeScript types and interfaces

export interface NotificationPreferencesResponse {
  emailAdAlerts: boolean
  emailPerformanceDigest: boolean
  emailTaskActivity: boolean
  emailCollaboration: boolean
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
  emailAdAlertsEnabled: boolean
  emailPerformanceDigestEnabled: boolean
  emailTaskActivityEnabled: boolean
  emailCollaborationEnabled: boolean
  savingPreferences: boolean
  handlePreferenceToggle: (
    type: 'emailAdAlerts' | 'emailPerformanceDigest' | 'emailTaskActivity' | 'emailCollaboration',
    checked: boolean
  ) => Promise<void>
}

export interface RegionalPreferencesCardProps {
  preferences: { currency: string }
  preferencesLoading: boolean
  savingCurrency: boolean
  setSavingCurrency: (value: boolean) => void
  updateCurrency: (value: string) => Promise<void>
  toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void
}

// Account tab props
export interface DataExportCardProps {
  exportingData: boolean
  exportError: string | null
  handleExportData: () => Promise<void>
}

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
