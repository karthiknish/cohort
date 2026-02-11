'use client'

import { useState, useMemo, useCallback } from 'react'
import { LoaderCircle, Plus, Trash, X, Building2, Users, Briefcase } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { ClientTeamMember } from '@/types/clients'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId)
  }, [clients, selectedClientId])

  const placeholder = hasClients ? 'Select workspace' : 'No workspaces available'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative w-full min-w-[220px]">
        <Select
          value={hasClients ? selectedClientId ?? '' : ''}
          onValueChange={handleValueChange}
          disabled={!hasClients}
        >
          <SelectTrigger
            id="tour-workspace-selector"
            className={cn(
              'h-11 w-full border-input bg-background/50 backdrop-blur-sm transition-all duration-200',
              'hover:bg-background hover:border-primary/30 hover:shadow-sm',
              'focus:ring-2 focus:ring-primary/20 focus:border-primary/40',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background/50',
              'data-[state=open]:bg-background data-[state=open]:border-primary/40 data-[state=open]:shadow-md',
              'rounded-xl px-4'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {selectedClient ? (
                  <Building2 className="h-3.5 w-3.5" />
                ) : (
                  <Briefcase className="h-3.5 w-3.5" />
                )}
              </div>
              <SelectValue placeholder={placeholder}>
                {selectedClient?.name || placeholder}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="w-[var(--radix-select-trigger-width)] min-w-[220px] z-[3000]"
            sideOffset={4}
          >
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-border/50 mb-1">
              <Users className="h-3 w-3" />
              <span>Your Workspaces</span>
            </div>
            {clients.map((client) => (
              <SelectItem
                key={client.id}
                value={client.id}
                className="cursor-pointer py-2.5 px-3 rounded-md mx-1 my-0.5 transition-colors hover:bg-primary/5 focus:bg-primary/5 data-[state=checked]:bg-primary/10 data-[state=checked]:font-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                  </div>
                  <span className="truncate">{client.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAdmin && (
        <>
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleSheetChange(true)}
            className="h-11 w-11 rounded-xl border-input bg-background/50 backdrop-blur-sm hover:bg-background hover:border-primary/30 hover:shadow-sm transition-all duration-200 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Manage clients</span>
          </Button>

          {isSheetOpen && (
            <div className="fixed inset-0 z-[1500] flex items-center justify-center">
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => !saving && handleSheetChange(false)}
              />
              <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border bg-background/95 backdrop-blur-md shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Manage Workspaces</h2>
                    <p className="text-sm text-muted-foreground mt-1">Create and organize client workspaces.</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSheetChange(false)}
                    disabled={saving}
                    className="rounded-full h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                <form
                  className="space-y-5"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleCreateClient()
                  }}
                >
                  <div className="space-y-2.5">
                    <label className="text-sm font-medium" htmlFor="client-name">
                      Client name
                    </label>
                    <Input
                      id="client-name"
                      value={newClientName}
                      onChange={(event) => setNewClientName(event.target.value)}
                      placeholder="e.g. Horizon Ventures"
                      required
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-sm font-medium" htmlFor="account-manager">
                      Account manager
                    </label>
                    <Input
                      id="account-manager"
                      value={newAccountManager}
                      onChange={(event) => setNewAccountManager(event.target.value)}
                      placeholder="Primary owner"
                      required
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-sm font-medium" htmlFor="team-members">
                      Team members
                    </label>
                    <Input
                      id="team-members"
                      value={newTeamMembers}
                      onChange={(event) => setNewTeamMembers(event.target.value)}
                      placeholder="Comma separated: Alex Chen: Paid Media, Priya Patel"
                      className="h-11 rounded-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use commas to separate teammates. Add optional roles with a colon.
                    </p>
                  </div>
                  {clients.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground">Existing workspaces</p>
                      <div className="space-y-2">
                        {clients.map((client) => (
                          <div
                            key={client.id}
                            className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/30 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Building2 className="h-3.5 w-3.5" />
                              </div>
                              <span className="font-medium">{client.name}</span>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full"
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
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                      <p className="text-sm text-destructive">{errorMessage}</p>
                    </div>
                  )}
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 pt-4 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSheetChange(false)}
                      disabled={saving}
                      className="rounded-lg"
                    >
                      Close
                    </Button>
                    <Button type="submit" disabled={saving} className="rounded-lg">
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
