'use client'

import { notifyFailure } from '@/lib/notifications'
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { useMutation, useConvex } from 'convex/react'

import { useToast } from '@/shared/ui/use-toast'
import { settingsApi, filesApi } from '@/lib/convex-api'
import { uploadStorageFile } from '@/lib/upload-storage-file'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { validateFile } from '@/lib/utils'
import type { ProfileEditAction, ProfileUser } from './profile-card-state'

export function useProfileAvatarUpload({
  isPreviewMode,
  user,
  avatarPreview,
  dispatch,
  setPreviewUser,
}: {
  isPreviewMode: boolean
  user: ProfileUser | null | undefined
  avatarPreview: string | null
  dispatch: Dispatch<ProfileEditAction>
  setPreviewUser: Dispatch<SetStateAction<ProfileUser>>
}) {
  const { toast } = useToast()
  const convex = useConvex()
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const syncMetadata = useMutation(filesApi.syncMetadata)
  const updateMyProfile = useMutation(settingsApi.updateMyProfile)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const tempAvatarUrlRef = useRef<string | null>(null)

  useEffect(() => {
    const avatarUrlRef = tempAvatarUrlRef
    return () => {
      if (avatarUrlRef.current) {
        URL.revokeObjectURL(avatarUrlRef.current)
        avatarUrlRef.current = null
      }
    }
  }, [])

  const uploadAvatarImage = useCallback(
    async (file: File): Promise<string> => {
      const storageId = await uploadStorageFile({
        file,
        contentType: file.type || 'image/jpeg',
        generateUploadUrl: () => generateUploadUrl({}),
        syncMetadata: (args) => syncMetadata(args),
      })

      const publicUrl = await convex.query(filesApi.getPublicUrl, { storageId })

      if (!publicUrl?.url) {
        throw new Error('Unable to resolve uploaded file URL')
      }

      return publicUrl.url
    },
    [convex, generateUploadUrl, syncMetadata],
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
  }, [dispatch, isPreviewMode, setPreviewUser, toast, updateMyProfile, user])

  const handleAvatarButtonClick = useCallback(() => {
    dispatch({ type: 'setAvatarError', value: null })
    avatarInputRef.current?.click()
  }, [dispatch])

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
    [
      avatarPreview,
      dispatch,
      isPreviewMode,
      setPreviewUser,
      toast,
      updateMyProfile,
      uploadAvatarImage,
      user,
    ],
  )

  const handleAvatarRemoveClick = useCallback(() => {
    void handleAvatarRemove()
  }, [handleAvatarRemove])

  return {
    avatarInputRef,
    handleAvatarButtonClick,
    handleAvatarFileChange,
    handleAvatarRemoveClick,
  }
}

