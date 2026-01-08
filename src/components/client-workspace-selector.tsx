'use client'

import { useState } from 'react'
import { LoaderCircle, Plus, Trash } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { ClientTeamMember } from '@/types/clients'

type ClientWorkspaceSelectorProps = {
  className?: string
}

function parseTeamMembers(input: string): ClientTeamMember[] {
  return input
    .split(',')
    .map((member) => member.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, role] = entry.split(':')
      return {
        name: name.trim(),
        role: role ? role.trim() : 'Contributor',
      }
    })
}

export function ClientWorkspaceSelector({ className }: ClientWorkspaceSelectorProps) {
  const { user } = useAuth()
  const { clients, selectedClientId, selectClient, createClient, removeClient } = useClientContext()

  const isAdmin = user?.role === 'admin'
  const hasClients = clients.length > 0

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newAccountManager, setNewAccountManager] = useState('')
  const [newTeamMembers, setNewTeamMembers] = useState('')
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const resetForm = () => {
    setNewClientName('')
    setNewAccountManager('')
    setNewTeamMembers('')
    setSaving(false)
    setRemovingId(null)
    setErrorMessage(null)
  }

  const handleSheetChange = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleCreateClient = async () => {
    const name = newClientName.trim()
    const accountManager = newAccountManager.trim()

    if (!name || !accountManager) {
      setErrorMessage('Client name and account manager are required')
      return
    }

    const teamMembers = parseTeamMembers(newTeamMembers)

    setSaving(true)
    setErrorMessage(null)

    try {
      await createClient({
        name,
        accountManager,
        teamMembers,
      })
      handleSheetChange(false)
    } catch (createError: unknown) {
      const message =
        createError instanceof Error && createError.message
          ? createError.message
          : 'Unable to create client'
      setErrorMessage(message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveClient = async (clientId: string) => {
    setRemovingId(clientId)
    setErrorMessage(null)

    try {
      await removeClient(clientId)
    } catch (removeError: unknown) {
      const message =
        removeError instanceof Error && removeError.message
          ? removeError.message
          : 'Unable to remove client'
      setErrorMessage(message)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        value={hasClients ? selectedClientId ?? '' : ''}
        onValueChange={(value) => selectClient(value || null)}
        disabled={!hasClients}
      >
        <SelectTrigger id="tour-workspace-selector" className="w-full min-w-[200px]">
          <SelectValue placeholder={hasClients ? 'Select client' : 'No clients available'} />
        </SelectTrigger>
        {hasClients && (
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        )}
      </Select>

      {isAdmin && (
        <Sheet open={isSheetOpen} onOpenChange={handleSheetChange}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Manage clients</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-md">
            <form
              className="flex h-full flex-col"
              onSubmit={(event) => {
                event.preventDefault()
                void handleCreateClient()
              }}
            >
              <SheetHeader>
                <SheetTitle>Manage clients</SheetTitle>
                <SheetDescription>Create new client workspaces and assign teams.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 overflow-y-auto py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="client-name">
                    Client name
                  </label>
                  <Input
                    id="client-name"
                    value={newClientName}
                    onChange={(event) => setNewClientName(event.target.value)}
                    placeholder="e.g. Horizon Ventures"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="account-manager">
                    Account manager
                  </label>
                  <Input
                    id="account-manager"
                    value={newAccountManager}
                    onChange={(event) => setNewAccountManager(event.target.value)}
                    placeholder="Primary owner"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="team-members">
                    Team members
                  </label>
                  <Input
                    id="team-members"
                    value={newTeamMembers}
                    onChange={(event) => setNewTeamMembers(event.target.value)}
                    placeholder="Comma separated: Alex Chen: Paid Media, Priya Patel"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use commas to separate teammates. Add optional roles with a colon.
                  </p>
                </div>
                {clients.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Existing clients</p>
                    <div className="space-y-2">
                      {clients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between rounded-md border border-muted/60 bg-muted/20 px-3 py-2 text-sm"
                        >
                          <span>{client.name}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => void handleRemoveClient(client.id)}
                            disabled={clients.length === 1 || removingId === client.id || saving}
                          >
                            {removingId === client.id ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errorMessage && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}
              </div>
              <SheetFooter className="sm:flex-row-reverse">
                <Button type="submit" disabled={saving}>
                  {saving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                  Save client
                </Button>
                <SheetClose asChild>
                  <Button type="button" variant="outline" disabled={saving}>
                    Close
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
