'use client'

import { ChangeEvent, FormEvent, useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { Loader2, ImagePlus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { storage } from '@/lib/firebase'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { getAvatarInitials } from './utils'
import { validateFile } from '@/lib/utils'

interface ProfileCardProps {
  onPhoneChange?: (phone: string) => void
  whatsappTasksEnabled?: boolean
  whatsappCollaborationEnabled?: boolean
  saveNotificationPreferences?: (
    input: { tasks: boolean; collaboration: boolean },
    options?: { silent?: boolean }
  ) => Promise<unknown>
}

export function ProfileCard({
  onPhoneChange,
  whatsappTasksEnabled = false,
  whatsappCollaborationEnabled = false,
  saveNotificationPreferences,
}: ProfileCardProps) {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  
  const [profileName, setProfileName] = useState(user?.name ?? '')
  const [profilePhone, setProfilePhone] = useState(user?.phoneNumber ?? '')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.photoURL ?? null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const tempAvatarUrlRef = useRef<string | null>(null)

  useEffect(() => {
    setProfileName(user?.name ?? '')
    setProfilePhone(user?.phoneNumber ?? '')
    setProfileError(null)
  }, [user?.name, user?.phoneNumber])

  useEffect(() => {
    setAvatarPreview(user?.photoURL ?? null)
  }, [user?.photoURL])

  useEffect(() => {
    return () => {
      if (tempAvatarUrlRef.current) {
        URL.revokeObjectURL(tempAvatarUrlRef.current)
        tempAvatarUrlRef.current = null
      }
    }
  }, [])

  // Notify parent of phone changes
  useEffect(() => {
    onPhoneChange?.(profilePhone)
  }, [profilePhone, onPhoneChange])

  const hasProfileChanges = useMemo(() => {
    const originalName = user?.name ?? ''
    const originalPhone = user?.phoneNumber ?? ''
    return profileName.trim() !== originalName || profilePhone.trim() !== originalPhone
  }, [profileName, profilePhone, user?.name, user?.phoneNumber])

  const avatarInitials = useMemo(() => {
    return getAvatarInitials(profileName.trim() || user?.name, user?.email)
  }, [profileName, user?.email, user?.name])

  const isProfileNameValid = profileName.trim().length >= 2
  const canSaveProfile = Boolean(user) && hasProfileChanges && isProfileNameValid && !savingProfile

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

        if ((whatsappTasksEnabled || whatsappCollaborationEnabled) && saveNotificationPreferences) {
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
      if (!file) return

      if (!user) {
        setAvatarError('You must be signed in to update your avatar.')
        event.target.value = ''
        return
      }

      const validation = validateFile(file, {
        allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        maxSizeMb: 5,
      })

      if (!validation.valid) {
        setAvatarError(validation.error || 'Invalid image file.')
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

  return (
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
  )
}
