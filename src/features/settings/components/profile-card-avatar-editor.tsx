'use client'

import { type ChangeEvent, type RefObject } from 'react'
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'

export function ProfileAvatarEditor({
  avatarPreview,
  avatarInitials,
  avatarUploading,
  avatarError,
  avatarInputRef,
  onAvatarButtonClick,
  onAvatarFileChange,
  onAvatarRemoveClick,
  disabled,
}: {
  avatarPreview: string | null
  avatarInitials: string
  avatarUploading: boolean
  avatarError: string | null
  avatarInputRef: RefObject<HTMLInputElement | null>
  onAvatarButtonClick: () => void
  onAvatarFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onAvatarRemoveClick: () => void
  disabled: boolean
}) {
  return (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        aria-label="Upload profile photo"
        className="hidden"
        onChange={onAvatarFileChange}
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
            <Button type="button" variant="outline" onClick={onAvatarButtonClick} disabled={avatarUploading}>
              {avatarUploading ? (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 size-4" />
              )}
              {avatarUploading ? 'Uploading…' : avatarPreview ? 'Change photo' : 'Upload photo'}
            </Button>
            {avatarPreview ? (
              <Button type="button" variant="ghost" onClick={onAvatarRemoveClick} disabled={avatarUploading}>
                <Trash2 className="mr-2 size-4" />
                Remove
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">Use a square image (PNG, JPG, or WebP) under 5MB.</p>
          {avatarError ? <p className="text-xs text-destructive">{avatarError}</p> : null}
        </div>
      </div>
    </>
  )
}
