'use client'

import { notifyFailure } from '@/lib/notifications'
import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { LoaderCircle, ImagePlus, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useConvex } from 'convex/react'

import { Button } from '@/shared/ui/button'
import { usePreview } from '@/shared/contexts/preview-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { useToast } from '@/shared/ui/use-toast'
import { settingsApi, filesApi } from '@/lib/convex-api'
import { getPreviewSettingsProfile } from '@/lib/preview-data'
import { getAvatarInitials } from './utils'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { validateFile } from '@/lib/utils'

function isPhoneValid(phone: string): boolean {
  const trimmed = phone.trim()
  if (!trimmed) return true // optional field
  // Accepts formats: +1 (555) 555-5555, 555-555-5555, +44 7911 123456, etc.
  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,14}$/.test(trimmed)
}

type ProfileEditState = {
  profileNameDraft: string | null
  profilePhoneDraft: string | null
  profileError: string | null
  phoneError: string | null
  savingProfile: boolean
  avatarPreviewOverride: string | null | undefined
  avatarError: string | null
  avatarUploading: boolean
}

type ProfileEditAction =
  | { type: 'setProfileNameDraft'; value: string }
  | { type: 'setProfilePhoneDraft'; value: string }
  | { type: 'setProfileError'; value: string | null }
  | { type: 'setPhoneError'; value: string | null }
  | { type: 'setSavingProfile'; value: boolean }
  | { type: 'setAvatarPreviewOverride'; value: string | null | undefined }
  | { type: 'setAvatarError'; value: string | null }
  | { type: 'setAvatarUploading'; value: boolean }
  | { type: 'clearProfileErrors' }
  | { type: 'clearPhoneErrors' }
  | { type: 'commitProfileDraft'; name: string; phone: string }

function createInitialProfileEditState(): ProfileEditState {
  return {
    profileNameDraft: null,
    profilePhoneDraft: null,
    profileError: null,
    phoneError: null,
    savingProfile: false,
    avatarPreviewOverride: undefined,
    avatarError: null,
    avatarUploading: false,
  }
}

function profileEditReducer(state: ProfileEditState, action: ProfileEditAction): ProfileEditState {
  switch (action.type) {
    case 'setProfileNameDraft':
      return { ...state, profileNameDraft: action.value, profileError: null }
    case 'setProfilePhoneDraft':
      return { ...state, profilePhoneDraft: action.value, phoneError: null, profileError: null }
    case 'setProfileError':
      return { ...state, profileError: action.value }
    case 'setPhoneError':
      return { ...state, phoneError: action.value }
    case 'setSavingProfile':
      return { ...state, savingProfile: action.value }
    case 'setAvatarPreviewOverride':
      return { ...state, avatarPreviewOverride: action.value }
    case 'setAvatarError':
      return { ...state, avatarError: action.value }
    case 'setAvatarUploading':
      return { ...state, avatarUploading: action.value }
    case 'clearProfileErrors':
      return { ...state, profileError: null }
    case 'clearPhoneErrors':
      return { ...state, phoneError: null }
    case 'commitProfileDraft':
      return {
        ...state,
        profileNameDraft: action.name,
        profilePhoneDraft: action.phone,
      }
    default:
      return state
  }
}

export function ProfileCard() {
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
  const convex = useConvex()
  const profile = useQuery(settingsApi.getMyProfile)
  const updateMyProfile = useMutation(settingsApi.updateMyProfile)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const [previewUser, setPreviewUser] = useState(() => getPreviewSettingsProfile())
  const [editState, dispatch] = useReducer(profileEditReducer, undefined, createInitialProfileEditState)

  const user = isPreviewMode ? previewUser : profile

  const {
    profileNameDraft,
    profilePhoneDraft,
    profileError,
    phoneError,
    savingProfile,
    avatarPreviewOverride,
    avatarError,
    avatarUploading,
  } = editState

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

  const hasProfileChanges = useMemo(() => {
    const originalName = user?.name ?? ''
    const originalPhone = user?.phoneNumber ?? ''
    return profileName.trim() !== originalName || profilePhone.trim() !== originalPhone
  }, [profileName, profilePhone, user?.name, user?.phoneNumber])

  const avatarInitials = useMemo(() => {
    return getAvatarInitials(profileName.trim() || user?.name, user?.email)
  }, [profileName, user?.email, user?.name])

  const isProfileNameValid = profileName.trim().length >= 2
  const canSaveProfile = (isPreviewMode || Boolean(user)) && hasProfileChanges && isProfileNameValid && !phoneError && !savingProfile

  const handleProfileSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!user && !isPreviewMode) {
        dispatch({ type: 'setProfileError', value: 'You must be signed in to update your profile.' })
        return
      }

      const nextName = profileName.trim()
      const nextPhone = profilePhone.trim()

      if (nextName.length < 2) {
        dispatch({ type: 'setProfileError', value: 'Enter a name with at least two characters.' })
        return
      }

      if (!isPhoneValid(nextPhone)) {
        dispatch({ type: 'setPhoneError', value: 'Enter a valid phone number (e.g. +1 555 000 1234).' })
        return
      }

      dispatch({ type: 'setSavingProfile', value: true })
      dispatch({ type: 'clearProfileErrors' })

      if (isPreviewMode) {
        setPreviewUser((current) => ({
          ...current,
          name: nextName,
          phoneNumber: nextPhone.length ? nextPhone : null,
        }))
        dispatch({ type: 'commitProfileDraft', name: nextName, phone: nextPhone })
        dispatch({ type: 'setSavingProfile', value: false })
        toast({
          title: 'Preview mode',
          description: 'Profile changes were applied locally for this session.',
        })
        return
      }

      await updateMyProfile({
        name: nextName,
        phoneNumber: nextPhone.length ? nextPhone : null,
      })
        .then(() => {
          dispatch({ type: 'commitProfileDraft', name: nextName, phone: nextPhone })
          toast({ title: 'Profile updated', description: 'Your changes were saved.' })
        })
        .catch((submitError) => {
          const message = submitError instanceof Error ? submitError.message : 'Failed to update profile'
          dispatch({ type: 'setProfileError', value: message })
          notifyFailure({
        title: 'Profile update failed',
        message: message,
      })
        })
        .finally(() => {
          dispatch({ type: 'setSavingProfile', value: false })
        })
    },
    [isPreviewMode, profileName, profilePhone, toast, updateMyProfile, user],
  )

  const handleAvatarRemove = useCallback(async () => {
    if (isPreviewMode) {
      if (tempAvatarUrlRef.current) {
        URL.revokeObjectURL(tempAvatarUrlRef.current)
        tempAvatarUrlRef.current = null
      }
      dispatch({ type: 'setAvatarPreviewOverride', value: null })
      setPreviewUser((current) => ({ ...current, photoUrl: null }))
      toast({
        title: 'Preview mode',
        description: 'Sample profile photo removed locally for this session.',
      })
      return
    }

    if (!user) {
      dispatch({ type: 'setAvatarError', value: 'You must be signed in to update your avatar.' })
      return
    }

    dispatch({ type: 'setAvatarUploading', value: true })
    dispatch({ type: 'setAvatarError', value: null })

    if (tempAvatarUrlRef.current) {
      URL.revokeObjectURL(tempAvatarUrlRef.current)
      tempAvatarUrlRef.current = null
    }

    await updateMyProfile({ photoUrl: null })
      .then(() => {
        dispatch({ type: 'setAvatarPreviewOverride', value: null })
        toast({ title: 'Profile photo removed', description: 'We removed your avatar.' })
      })
      .catch((removeError) => {
        logError(removeError, 'ProfileCard:removeAvatar')
        const msg = asErrorMessage(removeError)
        dispatch({ type: 'setAvatarError', value: msg })
        notifyFailure({
        title: 'Remove failed',
        message: msg,
      })
      })
      .finally(() => {
        dispatch({ type: 'setAvatarUploading', value: false })
      })
  }, [isPreviewMode, toast, updateMyProfile, user])

  const handleAvatarButtonClick = useCallback(() => {
    dispatch({ type: 'setAvatarError', value: null })
    avatarInputRef.current?.click()
  }, [])

  const uploadAvatarImage = useCallback(async (file: File): Promise<string> => {
    const { url: uploadUrl } = await generateUploadUrl({})

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

      if (!user && !isPreviewMode) {
        dispatch({ type: 'setAvatarError', value: 'You must be signed in to update your avatar.' })
        event.target.value = ''
        return
      }

      const validation = validateFile(file, {
        allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        maxSizeMb: 5,
      })

      if (!validation.valid) {
        dispatch({ type: 'setAvatarError', value: validation.error || 'Invalid image file.' })
        event.target.value = ''
        return
      }

      const previousUrl = avatarPreview

      if (isPreviewMode) {
        if (tempAvatarUrlRef.current) {
          URL.revokeObjectURL(tempAvatarUrlRef.current)
          tempAvatarUrlRef.current = null
        }

        const objectUrl = URL.createObjectURL(file)
        tempAvatarUrlRef.current = objectUrl
        dispatch({ type: 'setAvatarPreviewOverride', value: objectUrl })
        setPreviewUser((current) => ({ ...current, photoUrl: objectUrl }))
        toast({
          title: 'Preview mode',
          description: 'Sample profile photo updated locally for this session.',
        })
        event.target.value = ''
        return
      }

      dispatch({ type: 'setAvatarUploading', value: true })
      dispatch({ type: 'setAvatarError', value: null })

      if (tempAvatarUrlRef.current) {
        URL.revokeObjectURL(tempAvatarUrlRef.current)
        tempAvatarUrlRef.current = null
      }

      const objectUrl = URL.createObjectURL(file)
      tempAvatarUrlRef.current = objectUrl
      dispatch({ type: 'setAvatarPreviewOverride', value: objectUrl })

      await uploadAvatarImage(file)
        .then(async (photoUrl) => {
          await updateMyProfile({ photoUrl })
          dispatch({ type: 'setAvatarPreviewOverride', value: photoUrl })
          toast({ title: 'Photo uploaded', description: 'Your profile photo has been updated.' })
        })
        .catch((uploadError) => {
          logError(uploadError, 'ProfileCard:uploadAvatar')
          const msg = asErrorMessage(uploadError)
          dispatch({ type: 'setAvatarError', value: msg })
          dispatch({ type: 'setAvatarPreviewOverride', value: previousUrl ?? null })
          notifyFailure({
        title: 'Upload failed',
        message: msg,
      })
        })
        .finally(() => {
          dispatch({ type: 'setAvatarUploading', value: false })
          if (tempAvatarUrlRef.current) {
            URL.revokeObjectURL(tempAvatarUrlRef.current)
            tempAvatarUrlRef.current = null
          }
          event.target.value = ''
        })
    },
    [avatarPreview, isPreviewMode, toast, updateMyProfile, user, uploadAvatarImage],
  )

  const handleProfileNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setProfileNameDraft', value: event.target.value })
  }, [])

  const handleProfilePhoneChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setProfilePhoneDraft', value: event.target.value })
  }, [])

  const handleProfilePhoneBlur = useCallback(() => {
    if (profilePhone.trim() && !isPhoneValid(profilePhone)) {
      dispatch({ type: 'setPhoneError', value: 'Enter a valid phone number (e.g. +1 555 000 1234).' })
    } else {
      dispatch({ type: 'clearPhoneErrors' })
    }
  }, [profilePhone])

  const handleAvatarRemoveClick = useCallback(() => {
    void handleAvatarRemove()
  }, [handleAvatarRemove])

  if (!isPreviewMode && profile === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update the contact details that appear in proposals and client-facing emails.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            Loading profile…
          </div>
        </CardContent>
      </Card>
    )
  }

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
            <Avatar className="size-16">
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
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="mr-2 size-4" />
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
                    <Trash2 className="mr-2 size-4" />
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
              {savingProfile ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
