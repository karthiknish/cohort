'use client'

import { useCallback, useMemo, useState } from 'react'
import { Hash, LoaderCircle, Lock, Plus, Users } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { useToast } from '@/shared/ui/use-toast'

import type { ChangeEvent } from 'react'

type WorkspaceMemberOption = {
  id: string
  name: string
  email?: string
  role?: string
}

type CreateChannelPayload = {
  name: string
  description?: string
  visibility: 'public' | 'private'
  memberIds: string[]
}

const EMPTY_TEAM_MEMBERS: WorkspaceMemberOption[] = []

interface CreateChannelDialogProps {
  workspaceId: string | null
  userId: string | null
  teamMembers?: WorkspaceMemberOption[]
  onCreate?: (channel: CreateChannelPayload) => Promise<void> | void
  trigger?: React.ReactNode
}

function sortMembers(members: WorkspaceMemberOption[]) {
  return [...members].sort((a, b) => a.name.localeCompare(b.name))
}

function ChannelMemberOptionRow({
  checked,
  member,
  onToggle,
}: {
  checked: boolean
  member: WorkspaceMemberOption
  onToggle: (memberId: string) => void
}) {
  const checkboxId = `create-channel-member-${member.id}`
  const handleToggle = useCallback(() => onToggle(member.id), [member.id, onToggle])

  return (
    <div className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent bg-background/80 px-3 py-3 transition-colors hover:border-border hover:bg-background">
      <Checkbox id={checkboxId} checked={checked} onCheckedChange={handleToggle} className="mt-0.5" />
      <Label htmlFor={checkboxId} className="min-w-0 cursor-pointer">
        <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[member.role, member.email].filter(Boolean).join(' • ') || 'Workspace member'}
        </p>
      </Label>
    </div>
  )
}

export function CreateChannelDialog({
  workspaceId,
  userId,
  teamMembers = EMPTY_TEAM_MEMBERS,
  onCreate,
  trigger,
}: CreateChannelDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const sortedMembers = useMemo(() => sortMembers(teamMembers), [teamMembers])

  const resetForm = useCallback(() => {
    setChannelName('')
    setDescription('')
    setVisibility('private')
    setSelectedMemberIds([])
  }, [])

  const handleMemberToggle = useCallback((memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen && !isCreating) {
        resetForm()
      }
    },
    [isCreating, resetForm]
  )

  const handleChannelNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setChannelName(event.target.value)
  }, [])

  const handleDescriptionChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value)
  }, [])

  const handleVisibilityChange = useCallback((value: string) => {
    setVisibility(value as 'public' | 'private')
  }, [])

  const handleCancel = useCallback(() => {
    setOpen(false)
  }, [])

  const handleCreate = useCallback(async () => {
    if (!workspaceId || !userId) {
      toast({
        title: 'Authentication required',
        description: 'You must be signed in to create channels.',
        variant: 'destructive',
      })
      return
    }

    const normalizedName = channelName.replace(/\s+/g, ' ').trim()
    if (normalizedName.length < 2) {
      toast({
        title: 'Channel name required',
        description: 'Use at least 2 characters for the channel name.',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)

    await Promise.resolve(
      onCreate?.({
        name: normalizedName,
        description: description.trim() || undefined,
        visibility,
        memberIds: selectedMemberIds,
      }),
    )
      .then(() => {
        toast({
          title: 'Channel created',
          description: `#${normalizedName} is ready for collaboration.`,
        })
        resetForm()
        setOpen(false)
        setIsCreating(false)
      })
      .catch((error) => {
        console.error('Failed to create collaboration channel', error)
        toast({
          title: 'Channel creation failed',
          description: 'The channel could not be created. Try again.',
          variant: 'destructive',
        })
        setIsCreating(false)
      })
  }, [channelName, description, onCreate, resetForm, selectedMemberIds, toast, userId, visibility, workspaceId])

  const defaultTrigger = (
    <DialogTrigger asChild>
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Create channel
      </Button>
    </DialogTrigger>
  )

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      {trigger || defaultTrigger}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Create collaboration channel
          </DialogTitle>
          <DialogDescription>
            Create an admin-managed room for internal coordination. Client and project channels remain automatic.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel name</Label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="channel-name"
                  value={channelName}
                  onChange={handleChannelNameChange}
                  className="pl-9"
                  placeholder="leadership, launch-war-room, finance"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-description">Description</Label>
              <Textarea
                id="channel-description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="What should this channel be used for?"
                rows={4}
                maxLength={220}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-visibility">Access</Label>
              <Select value={visibility} onValueChange={handleVisibilityChange}>
                <SelectTrigger id="channel-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Private
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Public to team
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Private channels are limited to admins and selected members. Public channels are visible to the workspace team.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Add people</p>
                <p className="text-xs text-muted-foreground">Select who should be explicitly included.</p>
              </div>
              <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {selectedMemberIds.length} selected
              </span>
            </div>

            {sortedMembers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                No workspace members available.
              </div>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {sortedMembers.map((member) => {
                  const checked = selectedMemberIds.includes(member.id)
                  return (
                    <ChannelMemberOptionRow
                      key={member.id}
                      checked={checked}
                      member={member}
                      onToggle={handleMemberToggle}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function QuickCreateChannelButton(props: Omit<CreateChannelDialogProps, 'trigger'>) {
  const trigger = useMemo(
    () => (
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create channel
        </Button>
      </DialogTrigger>
    ),
    []
  )

  return (
    <CreateChannelDialog
      {...props}
      trigger={trigger}
    />
  )
}
