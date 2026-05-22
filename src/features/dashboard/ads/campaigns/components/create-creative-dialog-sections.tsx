'use client'

import { useCallback } from 'react'

import type { ChangeEvent, FormEvent } from 'react'

import { AlertCircle, Loader2 } from 'lucide-react'

import { CreativeMediaField } from '@/features/dashboard/ads/components/creative-media-field'
import { Button } from '@/shared/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { FormField } from '@/shared/ui/form-field'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

export type CreativeObjectType = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'DYNAMIC'
export type CreativeStatus = 'ACTIVE' | 'PAUSED'

export type MetaPageActorOption = {
  id: string
  name: string
  tasks: string[]
  instagramBusinessAccountId: string | null
  instagramBusinessAccountName: string | null
  instagramUsername: string | null
}

const CTA_OPTIONS = [
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'SHOP_NOW', label: 'Shop Now' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'CONTACT_US', label: 'Contact Us' },
  { value: 'GET_QUOTE', label: 'Get Quote' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'BOOK_NOW', label: 'Book Now' },
  { value: 'GET_OFFER', label: 'Get Offer' },
  { value: 'SEE_MORE', label: 'See More' },
  { value: 'BUY_NOW', label: 'Buy Now' },
  { value: 'DONATE_NOW', label: 'Donate Now' },
  { value: 'APPLY_NOW', label: 'Apply Now' },
  { value: 'GET_DIRECTIONS', label: 'Get Directions' },
  { value: 'LIKE_PAGE', label: 'Like Page' },
  { value: 'WATCH_MORE', label: 'Watch More' },
  { value: 'LISTEN_NOW', label: 'Listen Now' },
  { value: 'UPDATE_APP', label: 'Update App' },
]

function createTextChangeHandler(onChange: (value: string) => void) {
  return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(event.target.value)
  }
}

function createSelectChangeHandler<T extends string>(onChange: (value: T) => void) {
  return (value: string) => {
    onChange(value as T)
  }
}

function createOptionalSelectChangeHandler(
  onChange: (value: string) => void,
  emptyValue: string,
) {
  return (value: string) => {
    onChange(value === emptyValue ? '' : value)
  }
}

export function CreateCreativeDialogHeader({ providerId }: { providerId: string }) {
  return (
    <DialogHeader>
      <DialogTitle>Create New Ad Creative</DialogTitle>
      <DialogDescription>
        Create a new ad creative for your {providerId === 'facebook' ? 'Meta' : providerId} campaign.
      </DialogDescription>
    </DialogHeader>
  )
}

type CreateCreativeDialogFormProps = {
  availableAdSets?: Array<{ id: string; name: string }>
  body: string
  callToActionType: string
  description: string
  imageHash: string
  imagePreviewSrc?: string | null
  imageUrl: string
  onClearImage?: () => void
  instagramActorId: string
  instagramActorOptions: Array<{ id: string; label: string }>
  isMeta: boolean
  linkUrl: string
  loading: boolean
  loadingPageActors: boolean
  metaPageActors: MetaPageActorOption[]
  name: string
  objectType: CreativeObjectType
  onBodyChange: (value: string) => void
  onCallToActionTypeChange: (value: string) => void
  onClose: () => void
  onDescriptionChange: (value: string) => void
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageUrlChange: (value: string) => void
  onClearVideo?: () => void
  videoPreviewSrc?: string | null
  videoId: string
  uploadingVideo: boolean
  onInstagramActorIdChange: (value: string) => void
  onLinkUrlChange: (value: string) => void
  onNameChange: (value: string) => void
  onObjectTypeChange: (value: CreativeObjectType) => void
  onPageIdChange: (value: string) => void
  onSelectedAdSetIdChange: (value: string) => void
  onStatusChange: (value: CreativeStatus) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onTitleChange: (value: string) => void
  onVideoIdChange: (value: string) => void
  pageId: string
  selectedAdSetId?: string
  selectedPage: MetaPageActorOption | null
  status: CreativeStatus
  title: string
  uploadingImage: boolean
}

export function CreateCreativeDialogForm({
  availableAdSets,
  body,
  callToActionType,
  description,
  imageHash,
  imagePreviewSrc,
  imageUrl,
  onClearImage,
  instagramActorId,
  instagramActorOptions,
  isMeta,
  linkUrl,
  loading,
  loadingPageActors,
  metaPageActors,
  name,
  objectType,
  onBodyChange,
  onCallToActionTypeChange,
  onClose,
  onDescriptionChange,
  onImageUpload,
  onVideoUpload,
  onImageUrlChange,
  onClearVideo,
  videoPreviewSrc,
  videoId,
  uploadingVideo,
  onInstagramActorIdChange,
  onLinkUrlChange,
  onNameChange,
  onObjectTypeChange,
  onPageIdChange,
  onSelectedAdSetIdChange,
  onStatusChange,
  onSubmit,
  onTitleChange,
  onVideoIdChange,
  pageId,
  selectedAdSetId,
  selectedPage,
  status,
  title,
  uploadingImage,
}: CreateCreativeDialogFormProps) {
  const handleInstagramActorIdChange = useCallback(
    (value: string) => {
      onInstagramActorIdChange(value === '__none__' ? '' : value)
    },
    [onInstagramActorIdChange],
  )

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField id="name" label="Creative Name *">
        <Input id="name" placeholder="Summer Sale Ad - Variant A" value={name} onChange={createTextChangeHandler(onNameChange)} disabled={loading} />
      </FormField>
      <FormField id="objectType" label="Ad Format">
        <Select value={objectType} onValueChange={createSelectChangeHandler<CreativeObjectType>(onObjectTypeChange)} disabled={loading}>
          <SelectTrigger id="objectType"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="IMAGE">Image Ad</SelectItem>
            <SelectItem value="VIDEO">Video Ad</SelectItem>
            <SelectItem value="CAROUSEL">Carousel Ad</SelectItem>
            <SelectItem value="DYNAMIC">Dynamic Ad</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {availableAdSets?.length ? (
        <FormField id="adSet" label="Ad Set" description="The ad will be created in the selected ad set.">
          <Select value={selectedAdSetId} onValueChange={onSelectedAdSetIdChange} disabled={loading}>
            <SelectTrigger id="adSet"><SelectValue placeholder="Select an ad set" /></SelectTrigger>
            <SelectContent>
              {availableAdSets.map((adSet) => (
                <SelectItem key={adSet.id} value={adSet.id}>{adSet.name || adSet.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      ) : null}

      {isMeta && !selectedAdSetId && !availableAdSets?.length ? (
        <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 text-warning" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium text-warning">No Ad Set Available</p>
            <p className="text-xs text-warning/80">You need to create an ad set before creating ads. Please create an ad set first.</p>
          </div>
        </div>
      ) : null}

      <FormField id="body" label="Primary Text" description={`${body.length}/2200 characters`}>
        <Textarea id="body" placeholder="Enter your main ad copy here…" value={body} onChange={createTextChangeHandler(onBodyChange)} disabled={loading} rows={3} maxLength={2200} />
      </FormField>
      <FormField id="title" label="Headline" description={`${title.length}/40 characters`}>
        <Input id="title" placeholder="50% Off Everything" value={title} onChange={createTextChangeHandler(onTitleChange)} disabled={loading} maxLength={40} />
      </FormField>
      <FormField id="description" label="Description" description={`${description.length}/30 characters`}>
        <Input id="description" placeholder="Limited time offer" value={description} onChange={createTextChangeHandler(onDescriptionChange)} disabled={loading} maxLength={30} />
      </FormField>
      <FormField id="cta" label="Call to Action">
        <Select value={callToActionType} onValueChange={onCallToActionTypeChange} disabled={loading}>
          <SelectTrigger id="cta"><SelectValue placeholder="Select a call to action" /></SelectTrigger>
          <SelectContent>
            {CTA_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField id="linkUrl" label="Destination URL">
        <Input id="linkUrl" type="url" placeholder="https://yourwebsite.com/offer" value={linkUrl} onChange={createTextChangeHandler(onLinkUrlChange)} disabled={loading} />
      </FormField>

      {objectType === 'IMAGE' ? (
        <FormField
          id="image"
          label="Creative Image"
          description={imageHash ? 'Uploaded to Meta — safe to create your ad.' : 'Upload the image Meta will serve in the feed.'}
        >
          <CreativeMediaField
            previewSrc={imagePreviewSrc}
            imageUrl={imageUrl}
            imageHash={imageHash}
            uploading={uploadingImage}
            disabled={loading}
            onImageUrlChange={onImageUrlChange}
            onFileSelect={onImageUpload}
            onClear={onClearImage}
          />
        </FormField>
      ) : null}
      {objectType === 'VIDEO' ? (
        <FormField
          id="video"
          label="Creative Video"
          description={videoId ? 'Uploaded to Meta — safe to create your ad.' : 'Upload the video Meta will serve in the feed.'}
        >
          <CreativeMediaField
            mode="video"
            previewSrc={videoPreviewSrc}
            imageUrl=""
            videoId={videoId}
            uploading={uploadingVideo}
            disabled={loading}
            onImageUrlChange={() => {}}
            onFileSelect={onVideoUpload}
            onClear={onClearVideo}
          />
          <div className="mt-2 space-y-1.5">
            <Label htmlFor="videoId" className="text-xs text-muted-foreground">
              Or paste Meta video ID
            </Label>
            <Input
              id="videoId"
              placeholder="Meta video ID"
              value={videoId}
              onChange={createTextChangeHandler(onVideoIdChange)}
              disabled={loading || uploadingVideo}
            />
          </div>
        </FormField>
      ) : null}

      <FormField
        id="pageId"
        label="Facebook Page *"
        description={
          !loadingPageActors && metaPageActors.length === 0
            ? 'No Facebook Pages found for this integration token.'
            : undefined
        }
      >
        <Select value={pageId || undefined} onValueChange={onPageIdChange} disabled={loading || loadingPageActors}>
          <SelectTrigger id="pageId">
            <SelectValue placeholder={loadingPageActors ? 'Loading pages...' : 'Select a Facebook Page'} />
          </SelectTrigger>
          <SelectContent>
            {metaPageActors.map((actor) => (
              <SelectItem key={actor.id} value={actor.id}>{actor.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField
        id="instagramActorId"
        label="Instagram Business Account"
        description={
          selectedPage?.instagramBusinessAccountId
            ? 'Linked Instagram account for selected page is preselected.'
            : 'Selected page has no linked Instagram business account.'
        }
      >
        <Select value={instagramActorId || '__none__'} onValueChange={handleInstagramActorIdChange} disabled={loading || loadingPageActors || instagramActorOptions.length === 0}>
          <SelectTrigger id="instagramActorId"><SelectValue placeholder="No linked Instagram account" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No Instagram account</SelectItem>
            {instagramActorOptions.map((actor) => (
              <SelectItem key={actor.id} value={actor.id}>{actor.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField id="status" label="Initial Status">
        <Select value={status} onValueChange={createSelectChangeHandler<CreativeStatus>(onStatusChange)} disabled={loading}>
          <SelectTrigger id="status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PAUSED">Paused (recommended for review)</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading || !name.trim()}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{loading ? 'Creating…' : 'Create Ad'}</Button>
      </DialogFooter>
    </form>
  )
}
