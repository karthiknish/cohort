'use client'

import { useState, useMemo, useCallback } from 'react'
import { LoaderCircle, Plus, Trash, ChevronDown, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      const parts = entry.split(':')
      const name = parts[0]!
      const role = parts[1]
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

  const handleValueChange = useCallback((value: string) => {
    selectClient(value || null)
  }, [selectClient])

  const placeholder = hasClients ? 'Select client' : 'No clients available'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative w-full min-w-[200px]">
        <select
          id="tour-workspace-selector"
          value={hasClients ? selectedClientId ?? '' : ''}
          onChange={(e) => handleValueChange(e.target.value)}
          disabled={!hasClients}
          className={cn(
            'flex h-10 w-full appearance-none items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
      </div>

      {isAdmin && (
        <>
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleSheetChange(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Manage clients</span>
          </Button>

          {isSheetOpen && (
            <div className="fixed inset-0 z-[1500] flex items-center justify-center">
              <div 
                className="absolute inset-0 bg-black/50"
                onClick={() => !saving && handleSheetChange(false)}
              />
              <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border bg-background shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Manage clients</h2>
                    <p className="text-sm text-muted-foreground">Create new client workspaces and assign teams.</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSheetChange(false)}
                    disabled={saving}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleCreateClient()
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="client-name">
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
                    <label className="text-sm font-medium" htmlFor="account-manager">
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
                    <label className="text-sm font-medium" htmlFor="team-members">
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
                      <p className="text-sm font-semibold">Existing clients</p>
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
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSheetChange(false)}
                      disabled={saving}
                    >
                      Close
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                      Save client
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
