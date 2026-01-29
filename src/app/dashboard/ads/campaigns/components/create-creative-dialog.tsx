'use client'

import { useState, useEffect } from 'react'
import { useAction } from 'convex/react'
import { Plus, Loader2, Upload, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { adsCreativesApi } from '@/lib/convex-api'
import { filesApi } from '@/lib/convex-api'

type Props = {
  workspaceId: string | null
  providerId: string
  campaignId: string
  clientId?: string | null
  adSetId?: string
  availableAdSets?: Array<{ id: string; name: string }>
  onSuccess?: () => void
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

export function CreateCreativeDialog({
  workspaceId,
  providerId,
  campaignId,
  clientId,
  adSetId: propAdSetId,
  availableAdSets,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | undefined>(propAdSetId)

  const createCreative = useAction(adsCreativesApi.createCreative)
  const uploadMedia = useAction(adsCreativesApi.uploadMedia)
  const generateUploadUrl = useAction(filesApi.generateUploadUrl)

  // Form state
  const [name, setName] = useState('')
  const [objectType, setObjectType] = useState<'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'DYNAMIC'>('IMAGE')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [description, setDescription] = useState('')
  const [callToActionType, setCallToActionType] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageHash, setImageHash] = useState('')
  const [videoId, setVideoId] = useState('')
  const [pageId, setPageId] = useState('')
  const [instagramActorId, setInstagramActorId] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'PAUSED'>('PAUSED')

  // Sync selected ad set ID when prop changes
  useEffect(() => {
    setSelectedAdSetId(propAdSetId)
  }, [propAdSetId])

  const resetForm = () => {
    setName('')
    setObjectType('IMAGE')
    setTitle('')
    setBody('')
    setDescription('')
    setCallToActionType('')
    setLinkUrl('')
    setImageUrl('')
    setImageHash('')
    setVideoId('')
    setPageId('')
    setInstagramActorId('')
    setStatus('PAUSED')
    setSelectedAdSetId(propAdSetId)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (providerId !== 'facebook') {
      toast({
        title: 'Platform not supported',
        description: 'Image upload is currently only supported for Meta (Facebook/Instagram) ads.',
        variant: 'destructive',
      })
      return
    }

    setUploadingImage(true)
    try {
      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      // Convert file to bytes
      const arrayBuffer = await file.arrayBuffer()
      const fileData = new Uint8Array(arrayBuffer)

      const result = await uploadMedia({
        workspaceId,
        providerId: providerId as any,
        clientId: clientId ?? null,
        fileName: file.name,
        fileData: Array.from(fileData),
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload media')
      }

      // Extract creative spec which contains the image_hash
      if (result.creativeSpec) {
        const spec = JSON.parse(result.creativeSpec as string) as { image_hash?: string; video_id?: string }
        if (spec.image_hash) {
          setImageHash(spec.image_hash)
          toast({
            title: 'Image uploaded',
            description: 'Your image has been uploaded successfully.',
          })
        }
      }
    } catch (error) {
      logError(error, 'CreateCreativeDialog:handleImageUpload')
      toast({
        title: 'Upload failed',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Sign in required',
        variant: 'destructive',
      })
      return
    }

    if (!name.trim()) {
      toast({
        title: 'Validation error',
        description: 'Creative name is required',
        variant: 'destructive',
      })
      return
    }

    if (providerId !== 'facebook') {
      toast({
        title: 'Platform not supported',
        description: 'Creating creatives is currently only supported for Meta (Facebook/Instagram) ads.',
        variant: 'destructive',
      })
      return
    }

    if (!selectedAdSetId) {
      toast({
        title: 'Ad Set required',
        description: 'Please select an ad set to create the ad.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const result = await createCreative({
        workspaceId,
        providerId: providerId as any,
        clientId: clientId ?? null,
        campaignId,
        adSetId: selectedAdSetId,
        name: name.trim(),
        objectType,
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        description: description.trim() || undefined,
        callToActionType: callToActionType || undefined,
        linkUrl: linkUrl.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        imageHash: imageHash || undefined,
        videoId: videoId || undefined,
        pageId: pageId || undefined,
        instagramActorId: instagramActorId || undefined,
        status,
      })

      toast({
        title: 'Creative created',
        description: `Your ad creative "${name}" has been created successfully.`,
      })

      setOpen(false)
      resetForm()
      onSuccess?.()
    } catch (error) {
      logError(error, 'CreateCreativeDialog:handleSubmit')
      toast({
        title: 'Creation failed',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const isMeta = providerId === 'facebook'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!isMeta || !selectedAdSetId}>
          <Plus className="mr-2 h-4 w-4" />
          Create Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Ad Creative</DialogTitle>
          <DialogDescription>
            Create a new ad creative for your {providerId === 'facebook' ? 'Meta' : providerId} campaign.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">Creative Name *</Label>
            <Input
              id="name"
              placeholder="Summer Sale Ad - Variant A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Object Type */}
          <div className="space-y-2">
            <Label htmlFor="objectType">Ad Format</Label>
            <Select value={objectType} onValueChange={(v: any) => setObjectType(v)} disabled={loading}>
              <SelectTrigger id="objectType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMAGE">Image Ad</SelectItem>
                <SelectItem value="VIDEO">Video Ad</SelectItem>
                <SelectItem value="CAROUSEL">Carousel Ad</SelectItem>
                <SelectItem value="DYNAMIC">Dynamic Ad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ad Set Selection */}
          {availableAdSets && availableAdSets.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="adSet">Ad Set</Label>
              <Select value={selectedAdSetId} onValueChange={setSelectedAdSetId} disabled={loading}>
                <SelectTrigger id="adSet">
                  <SelectValue placeholder="Select an ad set" />
                </SelectTrigger>
                <SelectContent>
                  {availableAdSets.map((adSet) => (
                    <SelectItem key={adSet.id} value={adSet.id}>
                      {adSet.name || adSet.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The ad will be created in the selected ad set.
              </p>
            </div>
          )}

          {/* No Ad Sets Warning */}
          {isMeta && !selectedAdSetId && (!availableAdSets || availableAdSets.length === 0) && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700">No Ad Set Available</p>
                <p className="text-xs text-amber-600">
                  You need to create an ad set before creating ads. Please create an ad set first.
                </p>
              </div>
            </div>
          )}

          {/* Primary Text / Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Primary Text</Label>
            <Textarea
              id="body"
              placeholder="Enter your main ad copy here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={2200}
            />
            <p className="text-xs text-muted-foreground text-right">{body.length}/2200</p>
          </div>

          {/* Headline / Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Headline</Label>
            <Input
              id="title"
              placeholder="50% Off Everything"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              maxLength={40}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/40</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Limited time offer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/30</p>
          </div>

          {/* Call to Action */}
          <div className="space-y-2">
            <Label htmlFor="cta">Call to Action</Label>
            <Select value={callToActionType} onValueChange={setCallToActionType} disabled={loading}>
              <SelectTrigger id="cta">
                <SelectValue placeholder="Select a call to action" />
              </SelectTrigger>
              <SelectContent>
                {CTA_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destination URL */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Destination URL</Label>
            <Input
              id="linkUrl"
              type="url"
              placeholder="https://yourwebsite.com/offer"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Image Upload / URL */}
          {objectType === 'IMAGE' && (
            <div className="space-y-2">
              <Label htmlFor="image">Creative Image</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                />
                <div className="relative">
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={loading || uploadingImage}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button type="button" variant="outline" size="icon" disabled={loading || uploadingImage}>
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {imageHash && (
                <p className="text-xs text-green-600">Image uploaded successfully</p>
              )}
            </div>
          )}

          {/* Video ID */}
          {objectType === 'VIDEO' && (
            <div className="space-y-2">
              <Label htmlFor="videoId">Video ID</Label>
              <Input
                id="videoId"
                placeholder="Enter your Meta video ID"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {/* Page ID (for Facebook Page posts) */}
          <div className="space-y-2">
            <Label htmlFor="pageId">Facebook Page ID (optional)</Label>
            <Input
              id="pageId"
              placeholder="Your Facebook Page ID"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Instagram Actor ID */}
          <div className="space-y-2">
            <Label htmlFor="instagramActorId">Instagram Account ID (optional)</Label>
            <Input
              id="instagramActorId"
              placeholder="Your Instagram business account ID"
              value={instagramActorId}
              onChange={(e) => setInstagramActorId(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Initial Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)} disabled={loading}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAUSED">Paused (recommended for review)</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? 'Creating...' : 'Create Ad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
