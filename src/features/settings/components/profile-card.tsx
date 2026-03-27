'use client'

import { type ChangeEvent, type FormEvent, useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { LoaderCircle, ImagePlus, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useConvex } from 'convex/react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { useToast } from '@/shared/ui/use-toast'
import { settingsApi, filesApi } from '@/lib/convex-api'
import { getAvatarInitials } from './utils'
import { validateFile } from '@/lib/utils'

function isPhoneValid(phone: string): boolean {
  const trimmed = phone.trim()
  if (!trimmed) return true // optional field
  // Accepts formats: +1 (555) 555-5555, 555-555-5555, +44 7911 123456, etc.
  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/.test(trimmed)
}

interface ProfileCardProps {
  onPhoneChange?: (phone: string) => void
}

export function ProfileCard({
  onPhoneChange,
}: ProfileCardProps) {
  const { toast } = useToast()
  const convex = useConvex()
  const profile = useQuery(settingsApi.getMyProfile)
  const updateMyProfile = useMutation(settingsApi.updateMyProfile)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)

  const user = profile

  const [profileNameDraft, setProfileNameDraft] = useState<string | null>(null)
  const [profilePhoneDraft, setProfilePhoneDraft] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarPreviewOverride, setAvatarPreviewOverride] = useState<string | null | undefined>(undefined)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const tempAvatarUrlRef = useRef<string | null>(null)

  const profileName = profileNameDraft ?? (user?.name ?? '')
  const profilePhone = profilePhoneDraft ?? (user?.phoneNumber ?? '')
  const avatarPreview = avatarPreviewOverride === undefined ? (user?.photoUrl ?? null) : avatarPreviewOverride

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
  const canSaveProfile = Boolean(user) && hasProfileChanges && isProfileNameValid && !phoneError && !savingProfile

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

      if (!isPhoneValid(nextPhone)) {
        setPhoneError('Enter a valid phone number (e.g. +1 555 000 1234).')
        return
      }

      setSavingProfile(true)
      setProfileError(null)

      await updateMyProfile({
        name: nextName,
        phoneNumber: nextPhone.length ? nextPhone : null,
      })
        .then(() => {
          setProfileNameDraft(nextName)
          setProfilePhoneDraft(nextPhone)
          toast({ title: 'Profile updated', description: 'Your changes were saved.' })
        })
        .catch((submitError) => {
          const message = submitError instanceof Error ? submitError.message : 'Failed to update profile'
          setProfileError(message)
          toast({ title: 'Profile update failed', description: message, variant: 'destructive' })
        })
        .finally(() => {
          setSavingProfile(false)
        })
    },
    [profileName, profilePhone, toast, updateMyProfile, user],
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

    await updateMyProfile({ photoUrl: null })
      .then(() => {
        setAvatarPreviewOverride(null)
        toast({ title: 'Profile photo removed', description: 'We removed your avatar.' })
      })
      .catch((removeError) => {
        console.error('[settings/profile] avatar remove failed', removeError)
        setAvatarError('Failed to remove profile photo. Try again.')
        toast({ title: 'Remove failed', description: 'Unable to remove your photo right now.', variant: 'destructive' })
      })
      .finally(() => {
        setAvatarUploading(false)
      })
  }, [toast, updateMyProfile, user])

  const handleAvatarButtonClick = useCallback(() => {
    setAvatarError(null)
    avatarInputRef.current?.click()
  }, [])

  const uploadAvatarImage = useCallback(async (file: File): Promise<string> => {
    const { url: uploadUrl } = await generateUploadUrl()

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'image/jpeg',
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file (${uploadResponse.status})`)
    }

    const json = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null
    if (!json?.storageId) {
      throw new Error('Upload did not return storageId')
    }

    const publicUrl = await convex.query(filesApi.getPublicUrl, { storageId: json.storageId })

    if (!publicUrl?.url) {
      throw new Error('Unable to resolve uploaded file URL')
    }

    return publicUrl.url
  }, [generateUploadUrl, convex])

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
      setAvatarPreviewOverride(objectUrl)

      await uploadAvatarImage(file)
        .then(async (photoUrl) => {
          await updateMyProfile({ photoUrl })
          setAvatarPreviewOverride(photoUrl)
          toast({ title: 'Photo uploaded', description: 'Your profile photo has been updated.' })
        })
        .catch((uploadError) => {
          console.error('[settings/profile] avatar upload failed', uploadError)
          setAvatarError('Failed to upload image. Try again.')
          setAvatarPreviewOverride(previousUrl ?? null)
          toast({ title: 'Upload failed', description: 'Unable to update your profile photo right now.', variant: 'destructive' })
        })
        .finally(() => {
          setAvatarUploading(false)
          if (tempAvatarUrlRef.current) {
            URL.revokeObjectURL(tempAvatarUrlRef.current)
            tempAvatarUrlRef.current = null
          }
          event.target.value = ''
        })
    },
    [avatarPreview, toast, updateMyProfile, user, uploadAvatarImage],
  )

  const handleProfileNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setProfileNameDraft(event.target.value)
    setProfileError(null)
  }, [])

  const handleProfilePhoneChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setProfilePhoneDraft(event.target.value)
    setPhoneError(null)
    setProfileError(null)
  }, [])

  const handleProfilePhoneBlur = useCallback(() => {
    if (profilePhone.trim() && !isPhoneValid(profilePhone)) {
      setPhoneError('Enter a valid phone number (e.g. +1 555 000 1234).')
    } else {
      setPhoneError(null)
    }
  }, [profilePhone])

  const handleAvatarRemoveClick = useCallback(() => {
    void handleAvatarRemove()
  }, [handleAvatarRemove])

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
            onChange={handleAvatarFileChange}
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
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="mr-2 h-4 w-4" />
                  )}
                  {avatarUploading ? 'Uploading…' : avatarPreview ? 'Change photo' : 'Upload photo'}
                </Button>
                {avatarPreview ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAvatarRemoveClick}
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
                onChange={handleProfileNameChange}
                placeholder="e.g. Jordan Michaels"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone number</Label>
              <Input
                id="profile-phone"
                value={profilePhone}
                onChange={handleProfilePhoneChange}
                onBlur={handleProfilePhoneBlur}
                placeholder="+1 555 000 1234"
                autoComplete="tel"
                aria-describedby={phoneError ? 'phone-error' : 'phone-hint'}
                aria-invalid={phoneError ? true : undefined}
                className={phoneError ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {phoneError ? (
                <p id="phone-error" className="text-xs text-destructive">{phoneError}</p>
              ) : (
                <p id="phone-hint" className="text-xs text-muted-foreground">Include country code for international numbers.</p>
              )}
            </div>
          </div>
          {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              We use this information across proposals and automated notifications.
            </p>
            <Button type="submit" disabled={!canSaveProfile}>
              {savingProfile ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
