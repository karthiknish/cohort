'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { LoaderCircle, Lock, Settings2, Trash2, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

export function ChannelMembersDialog({
  open,
  onOpenChange,
  channel,
  teamMembers,
  onSave,
  onDelete,
}: ChannelMembersDialogProps) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    if (!open || !channel) {
      return
    }

    setSelectedMemberIds(Array.isArray(channel.memberIds) ? channel.memberIds : [])
    setVisibility(channel.visibility === 'public' ? 'public' : 'private')
  }, [channel, open])

  const sortedMembers = useMemo(
    () => [...teamMembers].sort((a, b) => a.name.localeCompare(b.name)),
    [teamMembers],
  )

  const handleMemberToggle = useCallback((memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }, [])

  const handleSave = useCallback(async () => {
    if (!channel) {
      return
    }

    setSaving(true)
    try {
      await Promise.resolve(
        onSave({
          memberIds: selectedMemberIds,
          visibility,
        }),
      )
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }, [channel, onOpenChange, onSave, selectedMemberIds, visibility])

  const handleDelete = useCallback(async () => {
    if (!channel || !channel.isCustom || !onDelete) {
      return
    }

    setDeleting(true)
    try {
      await Promise.resolve(onDelete())
      setConfirmDeleteOpen(false)
      onOpenChange(false)
    } finally {
      setDeleting(false)
    }
  }, [channel, onDelete, onOpenChange])

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => !saving && !deleting && onOpenChange(nextOpen)}>
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

          {channel ? (
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
                <Select value={visibility} onValueChange={(value) => setVisibility(value as 'public' | 'private')}>
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
                        onClick={() => handleMemberToggle(member.id)}
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
          ) : null}

          <DialogFooter>
            {channel?.isCustom && onDelete ? (
              <Button
                variant="destructive"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={saving || deleting}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4" />
                Delete channel
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving || deleting}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={!channel || saving || deleting}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Save access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={(nextOpen) => !deleting && setConfirmDeleteOpen(nextOpen)}
        title="Delete custom channel"
        description={channel ? `Delete #${channel.name}? This hides the channel from the collaboration dashboard for everyone.` : 'Delete this custom channel?'}
        confirmLabel="Delete channel"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  )
}
