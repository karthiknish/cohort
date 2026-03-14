'use client'

import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@convex/_generated/api'
import { useConvex, useQuery as useConvexQuery } from 'convex/react'

import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { clientsApi } from '@/lib/convex-api'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'
import { dedupeClientTeamMembers } from '../../lib/client-allocation'

type ConvexArgs = Record<string, unknown>

type ClientRow = {
    legacyId?: string
    name?: string
    accountManager?: string
    teamMembers?: ClientTeamMember[]
    createdAtMs?: number | null
    updatedAtMs?: number | null
}

export interface TeamMemberField extends ClientTeamMember {
    key: string
}

export function createEmptyMemberField(): TeamMemberField {
    return {
        key: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
        name: '',
        role: '',
    }
}

export interface UseAdminClientsReturn {
    // Client list state
    clients: ClientRecord[]
    setClients: React.Dispatch<React.SetStateAction<ClientRecord[]>>
    clientsLoading: boolean
    clientsError: string | null
    nextCursor: string | null
    loadingMore: boolean
    existingTeamMembers: number

    // Actions
    loadClients: () => Promise<void>
    handleLoadMore: () => Promise<void>

    // Client form state
    clientName: string
    setClientName: (value: string) => void
    clientAccountManager: string
    setClientAccountManager: (value: string) => void
    teamMemberFields: TeamMemberField[]
    clientSaving: boolean

    // Form actions
    resetClientForm: () => void
    addTeamMemberField: () => void
    updateTeamMemberField: (key: string, field: keyof ClientTeamMember, value: string) => void
    removeTeamMemberField: (key: string) => void
    handleCreateClient: () => Promise<void>

    // Delete client
    clientPendingDelete: ClientRecord | null
    isDeleteDialogOpen: boolean
    deletingClientId: string | null
    requestDeleteClient: (client: ClientRecord) => void
    handleDeleteDialogChange: (open: boolean) => void
    handleDeleteClient: () => Promise<void>

    // Team member dialog
    clientPendingMembers: ClientRecord | null
    isTeamDialogOpen: boolean
    addingMember: boolean
    removingTeamMemberKey: string | null
    memberName: string
    memberRole: string
    setMemberName: (value: string) => void
    setMemberRole: (value: string) => void
    requestAddTeamMember: (client: ClientRecord) => void
    handleTeamDialogChange: (open: boolean) => void
    handleAddTeamMember: () => Promise<void>
    handleRemoveTeamMember: (client: ClientRecord, memberName: string) => Promise<void>

}

export function useAdminClients(): UseAdminClientsReturn {
    const { user } = useAuth()
    const { toast } = useToast()
    const convex = useConvex()

    const workspaceContext = useConvexQuery(api.users.getMyWorkspaceContext, user ? {} : 'skip')
    const workspaceId = workspaceContext?.workspaceId ?? null
    const includeAllWorkspaces = workspaceContext?.role === 'admin'
    const workspaceLoading = user != null && workspaceContext === undefined

    const clientsQuery = useQuery({
        queryKey: ['adminClients', workspaceId],
        queryFn: async () => {
            if (!workspaceId) return { items: [], nextCursor: null }
            return await convex.query(clientsApi.list as never, {
                workspaceId,
                limit: 100,
                cursor: null,
                includeAllWorkspaces,
            } as never)
        },
        enabled: Boolean(workspaceId),
    })

    const createClientMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.create as never, args as never),
        onSuccess: () => {
            clientsQuery.refetch()
        },
    })

    const softDeleteClientMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.softDelete as never, args as never),
        onSuccess: () => {
            clientsQuery.refetch()
        },
    })

    const addTeamMemberMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.addTeamMember as never, args as never),
        onSuccess: () => {
            clientsQuery.refetch()
        },
    })

    const removeTeamMemberMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.removeTeamMember as never, args as never),
        onSuccess: () => {
            clientsQuery.refetch()
        },
    })

    // Delete dialog state
    const [clientPendingDelete, setClientPendingDelete] = useState<ClientRecord | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingClientId, setDeletingClientId] = useState<string | null>(null)

    // Team member dialog state
    const [clientPendingMembers, setClientPendingMembers] = useState<ClientRecord | null>(null)
    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
    const [addingMember, setAddingMember] = useState(false)
    const [removingTeamMemberKey, setRemovingTeamMemberKey] = useState<string | null>(null)
    const [memberName, setMemberName] = useState('')
    const [memberRole, setMemberRole] = useState('')

    // Client form state
    const [clientSaving, setClientSaving] = useState(false)
    const [clientName, setClientName] = useState('')
    const [clientAccountManager, setClientAccountManager] = useState('')
    const [teamMemberFields, setTeamMemberFields] = useState<TeamMemberField[]>([createEmptyMemberField()])

    // Transform Convex data to ClientRecord format
    const clients = useMemo<ClientRecord[]>(() => {
        const data = clientsQuery.data
        if (!data || typeof data !== 'object') return []

        const rows = (Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []) as ClientRow[]

        const list: ClientRecord[] = rows.map((row) => ({
            id: row.legacyId ?? '',
            name: row.name ?? '',
            accountManager: row.accountManager ?? '',
            teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
            createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
            updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
        }))

        list.sort((a, b) => a.name.localeCompare(b.name))
        return list
    }, [clientsQuery.data])

    // Dummy setClients for backward compatibility (TanStack handles state)
    const setClients = useCallback((updater: React.SetStateAction<ClientRecord[]>) => {
        void updater
        // No-op: TanStack Query automatically updates
    }, [])

    const clientsLoading = workspaceLoading || clientsQuery.isLoading
    const clientsError = clientsQuery.error ? asErrorMessage(clientsQuery.error) : null
    const loadingMore = false
    const nextCursor = null

    const existingTeamMembers = useMemo(
        () => clients.reduce((total, client) => total + client.teamMembers.length, 0),
        [clients]
    )

    const loadClients = useCallback(async () => {
        await clientsQuery.refetch()
    }, [clientsQuery])

    const handleLoadMore = useCallback(async () => {
        // No infinite scroll with single query
        await clientsQuery.refetch()
    }, [clientsQuery])

    // Delete dialog handlers
    const handleDeleteDialogChange = useCallback((open: boolean) => {
        setIsDeleteDialogOpen(open)
        if (!open) {
            setClientPendingDelete(null)
        }
    }, [])

    const requestDeleteClient = useCallback((client: ClientRecord) => {
        setClientPendingDelete(client)
        setIsDeleteDialogOpen(true)
    }, [])

    const handleDeleteClient = useCallback(async () => {
        if (!clientPendingDelete || !workspaceId) return

        try {
            setDeletingClientId(clientPendingDelete.id)
            await softDeleteClientMutation.mutateAsync({
                workspaceId,
                legacyId: clientPendingDelete.id,
                deletedAtMs: Date.now(),
            })

            toast({ title: 'Client deleted', description: `${clientPendingDelete.name} has been removed.` })
            setClientPendingDelete(null)
            setIsDeleteDialogOpen(false)
        } catch (err: unknown) {
            logError(err, 'useAdminClients:handleDeleteClient')
            const message = asErrorMessage(err)
            toast({ title: 'Client delete failed', description: message, variant: 'destructive' })
        } finally {
            setDeletingClientId(null)
        }
    }, [clientPendingDelete, workspaceId, softDeleteClientMutation, toast])

    // Team member dialog handlers
    const handleTeamDialogChange = useCallback((open: boolean) => {
        setIsTeamDialogOpen(open)
        if (!open) {
            setClientPendingMembers(null)
            setMemberName('')
            setMemberRole('')
            setAddingMember(false)
        }
    }, [])

    const requestAddTeamMember = useCallback((client: ClientRecord) => {
        setClientPendingMembers(client)
        setMemberName('')
        setMemberRole('')
        setIsTeamDialogOpen(true)
    }, [])

    const handleAddTeamMember = useCallback(async () => {
        if (!clientPendingMembers || !workspaceId) return

        const name = memberName.trim()
        if (!name) {
            toast({ title: 'Name required', description: 'Enter a teammate name before adding.', variant: 'destructive' })
            return
        }

        const alreadyAssigned = clientPendingMembers.teamMembers.some(
            (member) => member.name.trim().toLowerCase() === name.toLowerCase()
        )
        if (alreadyAssigned) {
            toast({
                title: 'Already assigned',
                description: `${name} is already on ${clientPendingMembers.name}.`,
                variant: 'destructive',
            })
            return
        }

        const role = memberRole.trim()

        try {
            setAddingMember(true)
            await addTeamMemberMutation.mutateAsync({
                workspaceId,
                legacyId: clientPendingMembers.id,
                name,
                role: role || undefined,
            })

            toast({ title: 'Teammate added', description: `${name} joined ${clientPendingMembers.name}.` })
            setMemberName('')
            setMemberRole('')
            setIsTeamDialogOpen(false)
            setClientPendingMembers(null)
        } catch (err: unknown) {
            logError(err, 'useAdminClients:handleAddTeamMember')
            const message = asErrorMessage(err)
            toast({ title: 'Add teammate failed', description: message, variant: 'destructive' })
        } finally {
            setAddingMember(false)
        }
    }, [clientPendingMembers, workspaceId, memberName, memberRole, addTeamMemberMutation, toast])

    const handleRemoveTeamMember = useCallback(async (client: ClientRecord, memberName: string) => {
        if (!workspaceId) return

        const normalizedName = memberName.trim()
        if (!normalizedName) return

        if (normalizedName.toLowerCase() === client.accountManager.toLowerCase()) {
            toast({
                title: 'Cannot remove account manager',
                description: 'Change the account manager before removing this teammate.',
                variant: 'destructive',
            })
            return
        }

        const removeKey = `${client.id}:${normalizedName.toLowerCase()}`

        try {
            setRemovingTeamMemberKey(removeKey)
            await removeTeamMemberMutation.mutateAsync({
                workspaceId,
                legacyId: client.id,
                name: normalizedName,
            })

            toast({
                title: 'Teammate removed',
                description: `${normalizedName} was removed from ${client.name}.`,
            })
        } catch (err: unknown) {
            logError(err, 'useAdminClients:handleRemoveTeamMember')
            const message = asErrorMessage(err)
            toast({ title: 'Remove teammate failed', description: message, variant: 'destructive' })
        } finally {
            setRemovingTeamMemberKey(null)
        }
    }, [workspaceId, removeTeamMemberMutation, toast])

    // Client form handlers
    const resetClientForm = useCallback(() => {
        setClientName('')
        setClientAccountManager('')
        setTeamMemberFields([createEmptyMemberField()])
    }, [])

    const addTeamMemberField = useCallback(() => {
        setTeamMemberFields((prev) => [...prev, createEmptyMemberField()])
    }, [])

    const updateTeamMemberField = useCallback((key: string, field: keyof ClientTeamMember, value: string) => {
        setTeamMemberFields((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)))
    }, [])

    const removeTeamMemberField = useCallback((key: string) => {
        setTeamMemberFields((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)))
    }, [])

    const handleCreateClient = useCallback(async () => {
        if (!workspaceId) return

        const name = clientName.trim()
        const accountManager = clientAccountManager.trim()

        if (!name || !accountManager) {
            toast({ title: 'Missing details', description: 'Client name and account manager are required.', variant: 'destructive' })
            return
        }

        const teamMembers = dedupeClientTeamMembers(
            accountManager,
            teamMemberFields
            .map((member) => ({
                name: member.name.trim(),
                role: member.role.trim(),
            }))
            .filter((member) => member.name.length > 0)
            .map((member) => ({ ...member, role: member.role || 'Contributor' }))
        )

        setClientSaving(true)

        try {
            await createClientMutation.mutateAsync({
                workspaceId,
                name,
                accountManager,
                teamMembers,
                createdBy: user?.id ?? null,
            })

            toast({ title: 'Client created', description: `${name} is ready to use.` })
            resetClientForm()
        } catch (err: unknown) {
            logError(err, 'useAdminClients:handleCreateClient')
            const message = asErrorMessage(err)
            toast({ title: 'Client create failed', description: message, variant: 'destructive' })
        } finally {
            setClientSaving(false)
        }
    }, [workspaceId, clientAccountManager, clientName, resetClientForm, teamMemberFields, createClientMutation, user?.id, toast])

    return {
        // Client list
        clients,
        setClients,
        clientsLoading,
        clientsError,
        nextCursor,
        loadingMore,
        existingTeamMembers,
        loadClients,
        handleLoadMore,

        // Client form
        clientName,
        setClientName,
        clientAccountManager,
        setClientAccountManager,
        teamMemberFields,
        clientSaving,
        resetClientForm,
        addTeamMemberField,
        updateTeamMemberField,
        removeTeamMemberField,
        handleCreateClient,

        // Delete
        clientPendingDelete,
        isDeleteDialogOpen,
        deletingClientId,
        requestDeleteClient,
        handleDeleteDialogChange,
        handleDeleteClient,

        // Team member
        clientPendingMembers,
        isTeamDialogOpen,
        addingMember,
        removingTeamMemberKey,
        memberName,
        memberRole,
        setMemberName,
        setMemberRole,
        requestAddTeamMember,
        handleTeamDialogChange,
        handleAddTeamMember,
        handleRemoveTeamMember,
    }
}
