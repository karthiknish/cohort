'use client'

import type { FormEvent } from 'react'

import { AlertCircle, Loader2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
  imageUrl: string
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
  onImageUrlChange: (value: string) => void
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
  videoId: string
}

export function CreateCreativeDialogForm({
  availableAdSets,
  body,
  callToActionType,
  description,
  imageHash,
  imageUrl,
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
  onImageUrlChange,
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
  videoId,
}: CreateCreativeDialogFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="name">Creative Name *</Label><Input id="name" placeholder="Summer Sale Ad - Variant A" value={name} onChange={(e) => onNameChange(e.target.value)} disabled={loading} /></div>
      <div className="space-y-2"><Label htmlFor="objectType">Ad Format</Label><Select value={objectType} onValueChange={(v) => onObjectTypeChange(v as CreativeObjectType)} disabled={loading}><SelectTrigger id="objectType"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IMAGE">Image Ad</SelectItem><SelectItem value="VIDEO">Video Ad</SelectItem><SelectItem value="CAROUSEL">Carousel Ad</SelectItem><SelectItem value="DYNAMIC">Dynamic Ad</SelectItem></SelectContent></Select></div>

      {availableAdSets?.length ? <div className="space-y-2"><Label htmlFor="adSet">Ad Set</Label><Select value={selectedAdSetId} onValueChange={onSelectedAdSetIdChange} disabled={loading}><SelectTrigger id="adSet"><SelectValue placeholder="Select an ad set" /></SelectTrigger><SelectContent>{availableAdSets.map((adSet) => <SelectItem key={adSet.id} value={adSet.id}>{adSet.name || adSet.id}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">The ad will be created in the selected ad set.</p></div> : null}

      {isMeta && !selectedAdSetId && !availableAdSets?.length ? <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 p-3"><AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" /><div className="flex-1"><p className="text-sm font-medium text-amber-700">No Ad Set Available</p><p className="text-xs text-amber-600">You need to create an ad set before creating ads. Please create an ad set first.</p></div></div> : null}

      <div className="space-y-2"><Label htmlFor="body">Primary Text</Label><Textarea id="body" placeholder="Enter your main ad copy here…" value={body} onChange={(e) => onBodyChange(e.target.value)} disabled={loading} rows={3} maxLength={2200} /><p className="text-right text-xs text-muted-foreground">{body.length}/2200</p></div>
      <div className="space-y-2"><Label htmlFor="title">Headline</Label><Input id="title" placeholder="50% Off Everything" value={title} onChange={(e) => onTitleChange(e.target.value)} disabled={loading} maxLength={40} /><p className="text-right text-xs text-muted-foreground">{title.length}/40</p></div>
      <div className="space-y-2"><Label htmlFor="description">Description</Label><Input id="description" placeholder="Limited time offer" value={description} onChange={(e) => onDescriptionChange(e.target.value)} disabled={loading} maxLength={30} /><p className="text-right text-xs text-muted-foreground">{description.length}/30</p></div>
      <div className="space-y-2"><Label htmlFor="cta">Call to Action</Label><Select value={callToActionType} onValueChange={onCallToActionTypeChange} disabled={loading}><SelectTrigger id="cta"><SelectValue placeholder="Select a call to action" /></SelectTrigger><SelectContent>{CTA_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="linkUrl">Destination URL</Label><Input id="linkUrl" type="url" placeholder="https://yourwebsite.com/offer" value={linkUrl} onChange={(e) => onLinkUrlChange(e.target.value)} disabled={loading} /></div>

      {objectType === 'IMAGE' ? <div className="space-y-2"><Label htmlFor="image">Creative Image</Label><div className="flex gap-2"><Input id="image" type="url" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={(e) => onImageUrlChange(e.target.value)} disabled={loading} className="flex-1" /><div className="relative"><Input id="imageUpload" type="file" accept="image/*" onChange={onImageUpload} disabled={loading || uploadingImage} className="absolute inset-0 cursor-pointer opacity-0" /><Button type="button" variant="outline" size="icon" disabled={loading || uploadingImage} aria-label="Upload creative image">{uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</Button></div></div>{imageHash ? <p className="text-xs text-green-600">Image uploaded successfully</p> : null}</div> : null}
      {objectType === 'VIDEO' ? <div className="space-y-2"><Label htmlFor="videoId">Video ID</Label><Input id="videoId" placeholder="Enter your Meta video ID" value={videoId} onChange={(e) => onVideoIdChange(e.target.value)} disabled={loading} /></div> : null}

      <div className="space-y-2"><Label htmlFor="pageId">Facebook Page *</Label><Select value={pageId || undefined} onValueChange={onPageIdChange} disabled={loading || loadingPageActors}><SelectTrigger id="pageId"><SelectValue placeholder={loadingPageActors ? 'Loading pages...' : 'Select a Facebook Page'} /></SelectTrigger><SelectContent>{metaPageActors.map((actor) => <SelectItem key={actor.id} value={actor.id}>{actor.name}</SelectItem>)}</SelectContent></Select>{!loadingPageActors && metaPageActors.length === 0 ? <p className="text-xs text-amber-600">No Facebook Pages found for this integration token.</p> : null}</div>
      <div className="space-y-2"><Label htmlFor="instagramActorId">Instagram Business Account</Label><Select value={instagramActorId || '__none__'} onValueChange={(value) => onInstagramActorIdChange(value === '__none__' ? '' : value)} disabled={loading || loadingPageActors || instagramActorOptions.length === 0}><SelectTrigger id="instagramActorId"><SelectValue placeholder="No linked Instagram account" /></SelectTrigger><SelectContent><SelectItem value="__none__">No Instagram account</SelectItem>{instagramActorOptions.map((actor) => <SelectItem key={actor.id} value={actor.id}>{actor.label}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{selectedPage?.instagramBusinessAccountId ? 'Linked Instagram account for selected page is preselected.' : 'Selected page has no linked Instagram business account.'}</p></div>
      <div className="space-y-2"><Label htmlFor="status">Initial Status</Label><Select value={status} onValueChange={(v) => onStatusChange(v as CreativeStatus)} disabled={loading}><SelectTrigger id="status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PAUSED">Paused (recommended for review)</SelectItem><SelectItem value="ACTIVE">Active</SelectItem></SelectContent></Select></div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading || !name.trim()}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{loading ? 'Creating…' : 'Create Ad'}</Button>
      </DialogFooter>
    </form>
  )
}