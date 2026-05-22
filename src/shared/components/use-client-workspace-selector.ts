'use client'

import { useReducer, useMemo, useCallback, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import type { MentionableUser } from '@/shared/ui/mention-input'

import {
  clientWorkspaceFormReducer,
  createInitialWorkspaceFormState,
  parseSinglePerson,
  parseTeamMembers,
  type ClientWorkspaceSelectorProps,
} from './client-workspace-selector-types'

export function useClientWorkspaceSelector(_props: ClientWorkspaceSelectorProps) {
  const { user } = useAuth()
  const { clients, selectedClientId, selectClient, createClient, removeClient } = useClientContext()

  const isAdmin = user?.role === 'admin'
  const hasClients = clients.length > 0

  const [formState, dispatch] = useReducer(clientWorkspaceFormReducer, undefined, createInitialWorkspaceFormState)
  const {
    isSheetOpen,
    newClientName,
    accountManagerInput,
    teamInput,
    saving,
    removingId,
    errorMessage,
  } = formState
  const accountManagerMentionsRef = useRef<MentionableUser[]>([])
  const teamMentionsRef = useRef<MentionableUser[]>([])

  const allUsers = useQuery(
    api.users.listAllUsers,
    isAdmin ? { limit: 500 } : 'skip',
  ) as Array<{ id: string; name: string; email?: string; role?: string }> | undefined

  const mentionableUsers: MentionableUser[] = useMemo(() => {
    if (!allUsers) return []
    return allUsers.map((userEntry) => ({
      id: userEntry.id,
      name: userEntry.name,
      email: userEntry.email,
      role: userEntry.role,
    }))
  }, [allUsers])

  const handleSheetChange = useCallback((open: boolean) => {
    dispatch({ type: 'setSheetOpen', value: open })
    if (!open) {
      accountManagerMentionsRef.current = []
      teamMentionsRef.current = []
    }
  }, [])

  const handleCreateClient = useCallback(async () => {
    const name = newClientName.trim()
    const accountManager = accountManagerMentionsRef.current[0]?.name ?? parseSinglePerson(accountManagerInput)

    if (!name || !accountManager) {
      dispatch({ type: 'setErrorMessage', value: 'Client name and account manager are required' })
      return
    }

    const mentionTeamMembers = teamMentionsRef.current.map((userEntry) => ({
      name: userEntry.name,
      role: userEntry.role ?? 'Contributor',
    }))
    const typedTeamMembers = parseTeamMembers(teamInput)
    const teamMembers = Array.from(
      new Map(
        [...mentionTeamMembers, ...typedTeamMembers].map((member) => [
          member.name.trim().toLowerCase(),
          {
            name: member.name.trim(),
            role: member.role?.trim() || 'Contributor',
          },
        ]),
      ).values(),
    )

    dispatch({ type: 'setSaving', value: true })
    dispatch({ type: 'setErrorMessage', value: null })

    await createClient({
      name,
      accountManager,
      teamMembers,
    })
      .then(() => {
        handleSheetChange(false)
      })
      .catch((createError: unknown) => {
        const message =
          createError instanceof Error && createError.message
            ? createError.message
            : 'Unable to create client'
        dispatch({ type: 'setErrorMessage', value: message })
      })
      .finally(() => {
        dispatch({ type: 'setSaving', value: false })
      })
  }, [accountManagerInput, createClient, handleSheetChange, newClientName, teamInput])

  const handleRemoveClient = useCallback(async (clientId: string) => {
    dispatch({ type: 'setRemovingId', value: clientId })
    dispatch({ type: 'setErrorMessage', value: null })

    try {
      await removeClient(clientId)
    } catch (removeError: unknown) {
      const message =
        removeError instanceof Error && removeError.message
          ? removeError.message
          : 'Unable to remove client'
      dispatch({ type: 'setErrorMessage', value: message })
    } finally {
      dispatch({ type: 'setRemovingId', value: null })
    }
  }, [removeClient])

  const handleClientNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setNewClientName', value: event.target.value })
  }, [])

  const handleAccountManagerChange = useCallback(
    (value: string, mentions: MentionableUser[]) => {
      dispatch({ type: 'setAccountManagerInput', value })
      accountManagerMentionsRef.current = mentions.slice(0, 1)
    },
    [],
  )

  const handleTeamChange = useCallback((value: string, mentions: MentionableUser[]) => {
    dispatch({ type: 'setTeamInput', value })
    teamMentionsRef.current = mentions
  }, [])

  const handleOpenSheet = useCallback(() => {
    handleSheetChange(true)
  }, [handleSheetChange])

  const handleCloseSheet = useCallback(() => {
    handleSheetChange(false)
  }, [handleSheetChange])

  const handleSaveClientClick = useCallback(() => {
    void handleCreateClient()
  }, [handleCreateClient])

  const handleValueChange = useCallback((value: string) => {
    selectClient(value)
  }, [selectClient])

  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) ?? clients[0]
  }, [clients, selectedClientId])

  const placeholder = hasClients ? 'Select workspace' : 'No workspaces available'
  const selectValue = hasClients ? selectedClient?.id ?? '' : ''
  const selectedLabel = selectedClient?.name ?? placeholder

  return {
    isAdmin,
    hasClients,
    clients,
    isSheetOpen,
    newClientName,
    accountManagerInput,
    teamInput,
    saving,
    removingId,
    errorMessage,
    mentionableUsers,
    placeholder,
    selectValue,
    selectedLabel,
    handleSheetChange,
    handleClientNameChange,
    handleAccountManagerChange,
    handleTeamChange,
    handleRemoveClient,
    handleOpenSheet,
    handleCloseSheet,
    handleSaveClientClick,
    handleValueChange,
  }
}
