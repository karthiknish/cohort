'use client'

import { useAction } from 'convex/react'
import { useCallback, useEffect, useReducer, useState } from 'react'
import { CheckCircle, Edit2, Loader2, UserCheck } from 'lucide-react'

import { adsAudiencesApi } from '@/lib/convex-api'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { parseEmailLines } from '@/lib/meta-audience-user-hash'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { toast } from '@/shared/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

import type { AggregatedTargetingData } from './audience-control-types'
import { TargetingCollapsiblePanel } from './targeting-collapsible-panel'

type AudienceRow = { id: string; name: string }

type Props = {
  aggregatedData: AggregatedTargetingData
  expandedSections: Set<string>
  toggleSection: (section: string) => void
  editingSection: string | null
  onToggleEditing: (section: string) => void
  canEdit?: boolean
  workspaceId?: string | null
  clientId?: string | null
  onAddAudience?: (audience: AudienceRow) => void
  onRemoveAudience?: (audienceId: string) => void
  onSaveTargeting?: () => void | Promise<void>
  savingTargeting?: boolean
}

type CatalogState = {
  catalog: AudienceRow[]
  loading: boolean
}

function AudienceRemoveButton({
  audienceId,
  audienceName,
  onRemove,
}: {
  audienceId: string
  audienceName: string
  onRemove: (audienceId: string) => void
}) {
  const handleRemove = useCallback(() => {
    onRemove(audienceId)
  }, [audienceId, onRemove])

  return (
    <button
      type="button"
      className="ml-0.5 rounded-sm hover:text-destructive"
      aria-label={`Remove ${audienceName}`}
      onClick={handleRemove}
    >
      ×
    </button>
  )
}

export function CustomAudiencesTargetingSection({
  aggregatedData,
  expandedSections,
  toggleSection,
  editingSection,
  onToggleEditing,
  canEdit,
  workspaceId,
  clientId,
  onAddAudience,
  onRemoveAudience,
  onSaveTargeting,
  savingTargeting,
}: Props) {
  const [catalog, dispatchCatalog] = useReducer(
    (state: CatalogState, action: { type: 'set'; value: CatalogState }) => action.value,
    { catalog: [], loading: false },
  )

  const listAudiences = useAction(adsAudiencesApi.listAudiences)
  const uploadAudienceUsers = useAction(adsAudiencesApi.uploadAudienceUsers)
  const [uploadAudienceId, setUploadAudienceId] = useState('')
  const [uploadEmailsRaw, setUploadEmailsRaw] = useState('')
  const [uploadingUsers, setUploadingUsers] = useState(false)
  const isEditing = editingSection === 'audiences'
  const included = aggregatedData.audiences.included

  const handleToggle = useCallback(() => toggleSection('audiences'), [toggleSection])

  const handleEdit = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onToggleEditing('audiences')
    },
    [onToggleEditing],
  )

  useEffect(() => {
    if (!canEdit || !workspaceId || !isEditing) return

    let cancelled = false
    dispatchCatalog({ type: 'set', value: { catalog: [], loading: true } })

    void listAudiences({
      workspaceId,
      providerId: 'facebook',
      clientId: clientId ?? null,
    })
      .then((rows) => {
        if (cancelled) return
        dispatchCatalog({
          type: 'set',
          value: {
            catalog: Array.isArray(rows)
              ? rows.map((row) => ({
                  id: String((row as AudienceRow).id),
                  name: String((row as AudienceRow).name),
                }))
              : [],
            loading: false,
          },
        })
      })
      .catch((error) => {
        if (cancelled) return
        reportConvexFailure({
          error,
          context: 'CustomAudiencesTargetingSection:listAudiences',
          title: 'Could not load custom audiences',
          fallbackMessage: 'Could not load custom audiences',
        })
        dispatchCatalog({ type: 'set', value: { catalog: [], loading: false } })
      })

    return () => {
      cancelled = true
    }
  }, [canEdit, clientId, isEditing, listAudiences, workspaceId])

  const availableToAdd = catalog.catalog.filter(
    (row) => !included.some((item) => item.id === row.id),
  )

  const handleUploadEmailsChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUploadEmailsRaw(event.target.value)
  }, [])

  const handleUploadUsers = useCallback(() => {
    if (!workspaceId || !uploadAudienceId) return
    const emails = parseEmailLines(uploadEmailsRaw)
    if (emails.length === 0) {
      toast({
        title: 'No valid emails',
        description: 'Enter one email address per line.',
        variant: 'destructive',
      })
      return
    }

    setUploadingUsers(true)
    void uploadAudienceUsers({
      workspaceId,
      providerId: 'facebook',
      clientId: clientId ?? null,
      audienceId: uploadAudienceId,
      emails,
    })
      .then((result) => {
        toast({
          title: 'Audience updated',
          description: `Meta received ${result.numReceived ?? emails.length} hashed email${emails.length === 1 ? '' : 's'}.`,
        })
        setUploadEmailsRaw('')
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'CustomAudiencesTargetingSection:uploadUsers',
          title: 'Upload failed',
          fallbackMessage: 'Could not upload emails to Meta.',
        })
      })
      .finally(() => {
        setUploadingUsers(false)
      })
  }, [clientId, uploadAudienceId, uploadAudienceUsers, uploadEmailsRaw, workspaceId])

  const handleAddAudienceSelect = useCallback(
    (id: string) => {
      const row = catalog.catalog.find((item) => item.id === id)
      if (row) onAddAudience?.(row)
    },
    [catalog.catalog, onAddAudience],
  )

  const handleSaveTargetingClick = useCallback(() => {
    void onSaveTargeting?.()
  }, [onSaveTargeting])

  const editButton =
    canEdit && onAddAudience ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleEdit}
              aria-label="Edit custom audiences"
            >
              <Edit2 className="size-3.5" aria-hidden />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isEditing ? 'Exit audience editing' : 'Edit custom audiences'}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : null

  return (
    <TargetingCollapsiblePanel
      sectionId="audiences"
      icon={UserCheck}
      title="Custom audiences"
      count={included.length}
      expanded={expandedSections.has('audiences')}
      onToggle={handleToggle}
      headerActions={editButton}
    >
      <div className="space-y-3">
        {isEditing && canEdit && workspaceId ? (
          catalog.loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading audiences…
            </div>
          ) : availableToAdd.length > 0 ? (
            <Select onValueChange={handleAddAudienceSelect} disabled={savingTargeting}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Add custom audience…" />
              </SelectTrigger>
              <SelectContent>
                {availableToAdd.map((row) => (
                  <SelectItem key={row.id} value={row.id}>
                    {row.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-xs text-muted-foreground">
              {catalog.catalog.length === 0
                ? 'No custom audiences in this ad account. Create one with Create audience.'
                : 'All available audiences are already included.'}
            </p>
          )
        ) : null}

        {included.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {included.map((audience) => (
              <Badge key={audience.id} variant="secondary" className="gap-1 text-xs">
                {audience.name}
                {isEditing && onRemoveAudience ? (
                  <AudienceRemoveButton
                    audienceId={audience.id}
                    audienceName={audience.name}
                    onRemove={onRemoveAudience}
                  />
                ) : null}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {isEditing ? 'Add custom audiences above, then save to Meta.' : 'No custom audiences on this ad set.'}
          </p>
        )}

        {isEditing && canEdit && workspaceId && catalog.catalog.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-dashed border-border/60 p-3">
            <p className="text-xs font-medium text-muted-foreground">Upload customer emails (hashed server-side)</p>
            <div className="space-y-1.5">
              <Label htmlFor="meta-upload-audience" className="text-xs">
                Audience
              </Label>
              <Select value={uploadAudienceId} onValueChange={setUploadAudienceId} disabled={uploadingUsers}>
                <SelectTrigger id="meta-upload-audience" className="h-9">
                  <SelectValue placeholder="Select audience to fill…" />
                </SelectTrigger>
                <SelectContent>
                  {catalog.catalog.map((row) => (
                    <SelectItem key={row.id} value={row.id}>
                      {row.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={uploadEmailsRaw}
              onChange={handleUploadEmailsChange}
              placeholder={'user@example.com\nanother@example.com'}
              rows={4}
              className="text-sm"
              disabled={uploadingUsers}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={uploadingUsers || !uploadAudienceId || !uploadEmailsRaw.trim()}
              onClick={handleUploadUsers}
            >
              {uploadingUsers ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Uploading…
                </>
              ) : (
                'Upload emails to Meta'
              )}
            </Button>
          </div>
        ) : null}

        {isEditing && onSaveTargeting ? (
          <div className="flex justify-end border-t border-border/60 pt-3">
            <Button size="sm" onClick={handleSaveTargetingClick} disabled={savingTargeting}>
              {savingTargeting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : (
                'Save audiences to Meta'
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </TargetingCollapsiblePanel>
  )
}
