'use client'

import { useState, useCallback } from 'react'
import { Plus, Hash, Users, Building2, LoaderCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { CollaborationChannelType } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'

interface ClientOption {
  id: string
  name: string
}

interface ProjectOption {
  id: string
  name: string
}

interface CreateChannelDialogProps {
  workspaceId: string | null
  userId: string | null
  clients?: ClientOption[]
  projects?: ProjectOption[]
  teamMembers?: ClientTeamMember[]
  onCreate?: (channel: {
    type: CollaborationChannelType
    name: string
    description?: string
    clientId?: string | null
    projectId?: string | null
    memberIds?: string[]
  }) => void
  trigger?: React.ReactNode
}

/**
 * Dialog for creating a new collaboration channel
 */
export function CreateChannelDialog({
  workspaceId,
  userId,
  clients = [],
  projects = [],
  teamMembers = [],
  onCreate,
  trigger,
}: CreateChannelDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [channelType, setChannelType] = useState<CollaborationChannelType>('team')
  const [channelName, setChannelName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [isPrivate, setIsPrivate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  const handleCreate = useCallback(async () => {
    if (!workspaceId || !userId) {
      toast({
        title: 'Authentication required',
        description: 'You must be signed in to create a channel.',
        variant: 'destructive',
      })
      return
    }

    // Validate inputs
    if (channelType === 'team' && !channelName.trim()) {
      toast({
        title: 'Channel name required',
        description: 'Please enter a name for your team channel.',
        variant: 'destructive',
      })
      return
    }

    if (channelType === 'client' && !selectedClientId) {
      toast({
        title: 'Client required',
        description: 'Please select a client for this channel.',
        variant: 'destructive',
      })
      return
    }

    if (channelType === 'project' && !selectedProjectId) {
      toast({
        title: 'Project required',
        description: 'Please select a project for this channel.',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)

    try {
      // Determine channel name based on type
      let finalChannelName = channelName.trim()
      if (channelType === 'client' && selectedClient) {
        finalChannelName = selectedClient.name
      } else if (channelType === 'project' && selectedProject) {
        finalChannelName = selectedProject.name
      }

      const newChannel = {
        type: channelType,
        name: finalChannelName,
        description: description.trim() || undefined,
        clientId: channelType === 'client' ? selectedClientId : null,
        projectId: channelType === 'project' ? selectedProjectId : null,
        memberIds: selectedMemberIds.length > 0 ? selectedMemberIds : undefined,
      }

      onCreate?.(newChannel)

      toast({
        title: 'Channel created',
        description: `"${finalChannelName}" has been created successfully.`,
      })

      // Reset form
      setChannelType('team')
      setChannelName('')
      setDescription('')
      setSelectedClientId('')
      setSelectedProjectId('')
      setSelectedMemberIds([])
      setIsPrivate(false)
      setOpen(false)
    } catch (error) {
      console.error('Failed to create channel:', error)
      toast({
        title: 'Failed to create channel',
        description: 'An error occurred while creating the channel.',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }, [
    workspaceId,
    userId,
    channelType,
    channelName,
    description,
    selectedClientId,
    selectedProjectId,
    selectedMemberIds,
    clients,
    projects,
    onCreate,
    toast,
  ])

  const handleMemberToggle = useCallback((memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }, [])

  const defaultTrigger = (
    <DialogTrigger asChild>
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        New Channel
      </Button>
    </DialogTrigger>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger || defaultTrigger}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Create New Channel
          </DialogTitle>
          <DialogDescription>
            Create a new space for team collaboration, client communication, or project discussions.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={channelType} onValueChange={(v) => setChannelType(v as CollaborationChannelType)} className="py-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="client" className="gap-2">
              <Building2 className="h-4 w-4" />
              Client
            </TabsTrigger>
            <TabsTrigger value="project" className="gap-2">
              <Hash className="h-4 w-4" />
              Project
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Channel Name *</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">#</span>
                <Input
                  id="team-name"
                  placeholder="e.g., general, engineering, marketing"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">Description (optional)</Label>
              <Textarea
                id="team-description"
                placeholder="What is this channel about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={200}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="team-private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
              />
              <Label htmlFor="team-private" className="text-sm font-normal cursor-pointer">
                Private channel (only invited members can access)
              </Label>
            </div>

            {teamMembers.length > 0 && (
              <div className="space-y-2">
                <Label>Add Members (optional)</Label>
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {teamMembers.map((member, index) => {
                    const memberId = member.id || `member-${index}`
                    return (
                      <div key={memberId} className="flex items-center space-x-2">
                        <Checkbox
                          id={`member-${memberId}`}
                          checked={selectedMemberIds.includes(memberId)}
                          onCheckedChange={() => handleMemberToggle(memberId)}
                        />
                        <Label
                          htmlFor={`member-${memberId}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {member.name}
                          {member.role && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {member.role}
                            </span>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="client" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="client-select">Select Client *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger id="client-select">
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                  {clients.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No clients available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedClient && (
              <>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm">
                    Creating a channel for <strong>{selectedClient.name}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All team members with access to this client will be able to see this channel.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-description">Description (optional)</Label>
                  <Textarea
                    id="client-description"
                    placeholder="Add a description for this client channel..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    maxLength={200}
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="project" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="project-select">Select Project *</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="project-select">
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                  {projects.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No projects available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedProject && (
              <>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm">
                    Creating a channel for <strong>{selectedProject.name}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    All team members assigned to this project will be able to see this channel.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-description">Description (optional)</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Add a description for this project channel..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    maxLength={200}
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || (channelType === 'client' && !selectedClientId) || (channelType === 'project' && !selectedProjectId) || (channelType === 'team' && !channelName.trim())}
          >
            {isCreating ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Channel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Quick create button for channels
 */
export function QuickCreateChannelButton(props: Omit<CreateChannelDialogProps, 'trigger'>) {
  return (
    <CreateChannelDialog
      {...props}
      trigger={
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Create channel</span>
        </Button>
      }
    />
  )
}
