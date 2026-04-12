'use client'

import { useCallback, useMemo, useState } from 'react'
import { LoaderCircle, Lock, Settings2, Trash2, Users } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { asErrorMessage } from '@/lib/convex-errors'
import { useToast } from '@/shared/ui/use-toast'
import type { Channel } from '../types'

type WorkspaceMemberOption = {
  id: string
  name: string
  email?: string
  role?: string
}

interface ChannelMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: Channel | null
  teamMembers: WorkspaceMemberOption[]
  onSave: (payload: { memberIds: string[]; visibility: 'public' | 'private' }) => Promise<void> | void
  onDelete?: () => Promise<void> | void
}

function ChannelMembersDialogForm({
  channel,
  teamMembers,
  onOpenChange,
  onSave,
  onDelete,
}: {
  channel: Channel
  teamMembers: WorkspaceMemberOption[]
  onOpenChange: (open: boolean) => void
  onSave: (payload: { memberIds: string[]; visibility: 'public' | 'private' }) => Promise<void> | void
  onDelete?: () => Promise<void> | void
}) {
  const { toast } = useToast()
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(() =>
    Array.isArray(channel.memberIds) ? channel.memberIds : [],
  )
  const [visibility, setVisibility] = useState<'public' | 'private'>(() =>
    channel.visibility === 'public' ? 'public' : 'private',
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const sortedMembers = useMemo(
    () => [...teamMembers].sort((a, b) => a.name.localeCompare(b.name)),
    [teamMembers],
  )

  const handleVisibilityChange = useCallback((value: string) => {
    setVisibility(value as 'public' | 'private')
  }, [])

  const handleOpenDeleteConfirm = useCallback(() => {
    setConfirmDeleteOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleMemberToggle = useCallback((memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }, [])

  const handleSave = useCallback(() => {
    setSaving(true)
    void Promise.resolve(
      onSave({
        memberIds: selectedMemberIds,
        visibility,
      }),
    )
      .then(() => {
        toast({ title: 'Channel updated', description: 'Access settings were saved.' })
        onOpenChange(false)
      })
      .catch((error) => {
        console.error('[ChannelMembersDialog] Failed to save channel access', error)
        toast({
          title: 'Could not save channel',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setSaving(false)
      })
  }, [onOpenChange, onSave, selectedMemberIds, toast, visibility])

  const memberToggleHandlers = useMemo(
    () =>
      Object.fromEntries(
        sortedMembers.map((member) => [member.id, () => handleMemberToggle(member.id)]),
      ) as Record<string, () => void>,
    [handleMemberToggle, sortedMembers],
  )

  const handleDelete = useCallback(() => {
    if (!channel.isCustom || !onDelete) {
      return
    }

    setDeleting(true)
    void Promise.resolve(onDelete())
      .then(() => {
        setConfirmDeleteOpen(false)
        onOpenChange(false)
      })
      .catch((error) => {
        console.error('[ChannelMembersDialog] Failed to delete channel', error)
        toast({
          title: 'Could not delete channel',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setDeleting(false)
      })
  }, [channel.isCustom, onDelete, onOpenChange, toast])

  return (
    <>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Manage channel access
          </DialogTitle>
          <DialogDescription>
            Update who can access this channel and whether the wider team can see it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">#{channel.name}</p>
                {channel.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{channel.description}</p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No description yet.</p>
                )}
              </div>
              <Badge variant="outline" className="gap-1.5">
                {visibility === 'private' ? <Lock className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                {visibility === 'private' ? 'Private' : 'Public to team'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Access</Label>
            <Select value={visibility} onValueChange={handleVisibilityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public to team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Members</Label>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {selectedMemberIds.length} selected
              </span>
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto rounded-2xl border border-border/70 bg-background/80 p-2">
              {sortedMembers.map((member) => {
                const checked = selectedMemberIds.includes(member.id)
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={memberToggleHandlers[member.id]}
                    className="flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      className="mt-0.5 pointer-events-none"
                      aria-label={`Toggle access for ${member.name}`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[member.role, member.email].filter(Boolean).join(' • ') || 'Workspace member'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          {channel.isCustom && onDelete ? (
            <Button
              variant="destructive"
              onClick={handleOpenDeleteConfirm}
              disabled={saving || deleting}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete channel
            </Button>
          ) : null}
          <Button variant="outline" onClick={handleCloseDialog} disabled={saving || deleting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || deleting}>
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
            Save access
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete channel?"
        description={`This will permanently remove #${channel.name} and its message history for everyone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete channel'}
        variant="destructive"
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </>
  )
}

export function ChannelMembersDialog({
  open,
  onOpenChange,
  channel,
  teamMembers,
  onSave,
  onDelete,
}: ChannelMembersDialogProps) {
  const dialogKey = `${channel?.id ?? 'no-channel'}:${open ? 'open' : 'closed'}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {channel ? (
        <ChannelMembersDialogForm
          key={dialogKey}
          channel={channel}
          teamMembers={teamMembers}
          onOpenChange={onOpenChange}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </Dialog>
  )
}
