'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useConvex, useMutation } from 'convex/react'
import { useAuth } from '@/contexts/auth-context'
import { apiFetch } from '@/lib/api-client'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { useToast } from '@/components/ui/use-toast'
import { clientsApi } from '@/lib/convex-api'
import type { ClientRecord, ClientTeamMember } from '@/types/clients'

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
    memberName: string
    memberRole: string
    setMemberName: (value: string) => void
    setMemberRole: (value: string) => void
    requestAddTeamMember: (client: ClientRecord) => void
    handleTeamDialogChange: (open: boolean) => void
    handleAddTeamMember: () => Promise<void>

    // Invoice state
    clientPendingInvoice: ClientRecord | null
    isInvoiceDialogOpen: boolean
    invoiceAmount: string
    invoiceDescription: string
    invoiceDueDate: Date | undefined
    invoiceEmail: string
    creatingInvoice: boolean
    invoiceError: string | null
    selectedInvoiceClientId: string | undefined

    // Invoice actions
    setInvoiceAmount: (value: string) => void
    setInvoiceDescription: (value: string) => void
    setInvoiceDueDate: (date: Date | undefined) => void
    setInvoiceEmail: (value: string) => void
    setSelectedInvoiceClientId: (id: string | undefined) => void
    requestInvoiceForClient: (client: ClientRecord) => void
    handleInvoiceDialogChange: (open: boolean) => void
    handleCreateInvoice: () => Promise<void>
}

export function useAdminClients(): UseAdminClientsReturn {
    const { user } = useAuth()
    const { toast } = useToast()

    const workspaceId = user?.agencyId ?? null
    const convex = useConvex()

    const clientsInfiniteQuery = useInfiniteQuery({
        queryKey: ['adminClients', workspaceId],
        enabled: Boolean(workspaceId),
        initialPageParam: null as { nameLower: string; legacyId: string } | null,
        queryFn: async ({ pageParam }) => {
            if (!workspaceId) {
                return [] as Array<any>
            }

            const page = await convex.query(clientsApi.list, {
                workspaceId,
                limit: 100,
                afterNameLower: pageParam?.nameLower,
                afterLegacyId: pageParam?.legacyId,
            })

            return page
        },
        getNextPageParam: (lastPage) => {
            if (!Array.isArray(lastPage) || lastPage.length === 0) {
                return null
            }

            const last = lastPage[lastPage.length - 1]
            const name = typeof last?.name === 'string' ? last.name : ''
            const legacyId = typeof last?.legacyId === 'string' ? last.legacyId : ''
            if (!legacyId) {
                return null
            }

            return { nameLower: name.toLowerCase(), legacyId }
        },
    })

    const convexCreateClient = useMutation(clientsApi.create)
    const convexSoftDeleteClient = useMutation(clientsApi.softDelete)
    const convexAddTeamMember = useMutation(clientsApi.addTeamMember)

    // Client list state (derived from Convex query)
    const [clientsError, setClientsError] = useState<string | null>(null)

    // Delete dialog state
    const [clientPendingDelete, setClientPendingDelete] = useState<ClientRecord | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingClientId, setDeletingClientId] = useState<string | null>(null)

    // Team member dialog state
    const [clientPendingMembers, setClientPendingMembers] = useState<ClientRecord | null>(null)
    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
    const [addingMember, setAddingMember] = useState(false)
    const [memberName, setMemberName] = useState('')
    const [memberRole, setMemberRole] = useState('')

    // Client form state
    const [clientSaving, setClientSaving] = useState(false)
    const [clientName, setClientName] = useState('')
    const [clientAccountManager, setClientAccountManager] = useState('')
    const [teamMemberFields, setTeamMemberFields] = useState<TeamMemberField[]>([createEmptyMemberField()])

    // Invoice dialog state
    const [clientPendingInvoice, setClientPendingInvoice] = useState<ClientRecord | null>(null)
    const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
    const [invoiceAmount, setInvoiceAmount] = useState('')
    const [invoiceDescription, setInvoiceDescription] = useState('')
    const [invoiceDueDate, setInvoiceDueDate] = useState<Date | undefined>(undefined)
    const [invoiceEmail, setInvoiceEmail] = useState('')
    const [creatingInvoice, setCreatingInvoice] = useState(false)
    const [invoiceError, setInvoiceError] = useState<string | null>(null)
    const [selectedInvoiceClientId, setSelectedInvoiceClientId] = useState<string | undefined>(undefined)

    // Transform Convex data to ClientRecord format
    const clients = useMemo<ClientRecord[]>(() => {
        const rows = clientsInfiniteQuery.data?.pages.flatMap((page) => (Array.isArray(page) ? page : [])) ?? []

        const list: ClientRecord[] = rows.map((row: any) => ({
            id: row.legacyId,
            name: row.name,
            accountManager: row.accountManager,
            teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
            billingEmail: row.billingEmail ?? null,
            stripeCustomerId: row.stripeCustomerId ?? null,
            lastInvoiceStatus: row.lastInvoiceStatus ?? null,
            lastInvoiceAmount: row.lastInvoiceAmount ?? null,
            lastInvoiceCurrency: row.lastInvoiceCurrency ?? null,
            lastInvoiceIssuedAt: row.lastInvoiceIssuedAtMs ? new Date(row.lastInvoiceIssuedAtMs).toISOString() : null,
            lastInvoiceNumber: row.lastInvoiceNumber ?? null,
            lastInvoiceUrl: row.lastInvoiceUrl ?? null,
            lastInvoicePaidAt: row.lastInvoicePaidAtMs ? new Date(row.lastInvoicePaidAtMs).toISOString() : null,
            createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
            updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
        }))

        list.sort((a, b) => a.name.localeCompare(b.name))
        return list
    }, [clientsInfiniteQuery.data?.pages])

    // Dummy setClients for backward compatibility (Convex handles state)
    const setClients = useCallback((_updater: React.SetStateAction<ClientRecord[]>) => {
        // No-op: Convex query automatically updates
    }, [])

    const clientsLoading = clientsInfiniteQuery.isLoading
    const loadingMore = clientsInfiniteQuery.isFetchingNextPage
    const nextCursor = clientsInfiniteQuery.hasNextPage ? 'more' : null

    const existingTeamMembers = useMemo(
        () => clients.reduce((total, client) => total + client.teamMembers.length, 0),
        [clients]
    )

    const loadClients = useCallback(async () => {
        await clientsInfiniteQuery.refetch()
    }, [clientsInfiniteQuery])

    const handleLoadMore = useCallback(async () => {
        if (!clientsInfiniteQuery.hasNextPage || clientsInfiniteQuery.isFetchingNextPage) {
            return
        }

        await clientsInfiniteQuery.fetchNextPage()
    }, [clientsInfiniteQuery])

    // Sync invoice client selection
    useEffect(() => {
        if (clients.length === 0) {
            setSelectedInvoiceClientId(undefined)
            return
        }
        setSelectedInvoiceClientId((current) => {
            if (current && clients.some((client) => client.id === current)) {
                return current
            }
            return clients[0]?.id
        })
    }, [clients])

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
            await convexSoftDeleteClient({
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
    }, [clientPendingDelete, workspaceId, convexSoftDeleteClient, toast])

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

        const role = memberRole.trim()

        try {
            setAddingMember(true)
            await convexAddTeamMember({
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
    }, [clientPendingMembers, workspaceId, memberName, memberRole, convexAddTeamMember, toast])

    // Invoice dialog handlers
    const handleInvoiceDialogChange = useCallback(
        (open: boolean) => {
            if (!open && creatingInvoice) return
            setIsInvoiceDialogOpen(open)
            if (!open) {
                setClientPendingInvoice(null)
                setInvoiceAmount('')
                setInvoiceDescription('')
                setInvoiceDueDate(undefined)
                setInvoiceEmail('')
                setInvoiceError(null)
            }
        },
        [creatingInvoice]
    )

    const requestInvoiceForClient = useCallback((client: ClientRecord) => {
        setClientPendingInvoice(client)
        setInvoiceAmount('')
        setInvoiceDescription('')
        setInvoiceDueDate(undefined)
        setInvoiceEmail(client.billingEmail ?? '')
        setInvoiceError(null)
        setIsInvoiceDialogOpen(true)
    }, [])

    const handleCreateInvoice = useCallback(async () => {
        if (!clientPendingInvoice) return

        const amountValue = Number(invoiceAmount)
        if (!Number.isFinite(amountValue) || amountValue <= 0) {
            setInvoiceError('Enter a positive amount to invoice.')
            return
        }

        const normalizedEmail = invoiceEmail.trim().toLowerCase()
        if (!normalizedEmail) {
            setInvoiceError('Add a billing email before sending the invoice.')
            return
        }

        let dueDateIso: string | undefined
        if (invoiceDueDate) {
            dueDateIso = invoiceDueDate.toISOString()
        }

        setCreatingInvoice(true)
        setInvoiceError(null)

        try {
            // Invoice creation still uses API route (Stripe integration requires server-side)
            const { invoice } = await apiFetch<{
                invoice: {
                    id: string
                    number: string | null
                    status: string | null
                    amount: number
                    currency: string | null
                    amountDue: number | null
                    issuedAt: string | null
                    hostedInvoiceUrl: string | null
                }
                client: {
                    id: string
                    billingEmail?: string | null
                    stripeCustomerId?: string | null
                    lastInvoiceStatus?: string | null
                    lastInvoiceAmount?: number | null
                    lastInvoiceCurrency?: string | null
                    lastInvoiceIssuedAt?: string | null
                    lastInvoiceNumber?: string | null
                    lastInvoiceUrl?: string | null
                }
            }>(`/api/clients/${encodeURIComponent(clientPendingInvoice.id)}/invoice`, {
                method: 'POST',
                body: JSON.stringify({
                    amount: amountValue,
                    description: invoiceDescription.trim().length > 0 ? invoiceDescription.trim() : undefined,
                    dueDate: dueDateIso,
                    email: normalizedEmail,
                }),
            })

            const invoiceLabel = invoice.number ?? invoice.id
            toast({
                title: 'Invoice sent',
                description: `Invoice ${invoiceLabel} emailed to ${normalizedEmail}.`,
            })

            if (invoice.hostedInvoiceUrl) {
                try {
                    window.open(invoice.hostedInvoiceUrl, '_blank', 'noopener')
                } catch (openError) {
                    console.warn('[AdminClients] Failed to open invoice preview', openError)
                }
            }

            handleInvoiceDialogChange(false)
        } catch (err: unknown) {
            logError(err, 'useAdminClients:handleCreateInvoice')
            const message = asErrorMessage(err)
            setInvoiceError(message)
            toast({ title: 'Invoice error', description: message, variant: 'destructive' })
        } finally {
            setCreatingInvoice(false)
        }
    }, [clientPendingInvoice, handleInvoiceDialogChange, invoiceAmount, invoiceDescription, invoiceDueDate, invoiceEmail, toast])

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

        const teamMembers = teamMemberFields
            .map((member) => ({
                name: member.name.trim(),
                role: member.role.trim(),
            }))
            .filter((member) => member.name.length > 0)
            .map((member) => ({ ...member, role: member.role || 'Contributor' }))

        // Add account manager if not in team
        if (!teamMembers.some((member) => member.name.toLowerCase() === accountManager.toLowerCase())) {
            teamMembers.unshift({ name: accountManager, role: 'Account Manager' })
        }

        setClientSaving(true)

        try {
            const result = await convexCreateClient({
                workspaceId,
                name,
                accountManager,
                teamMembers,
                billingEmail: null,
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
    }, [workspaceId, clientAccountManager, clientName, resetClientForm, teamMemberFields, convexCreateClient, user?.id, toast])

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
        memberName,
        memberRole,
        setMemberName,
        setMemberRole,
        requestAddTeamMember,
        handleTeamDialogChange,
        handleAddTeamMember,

        // Invoice
        clientPendingInvoice,
        isInvoiceDialogOpen,
        invoiceAmount,
        invoiceDescription,
        invoiceDueDate,
        invoiceEmail,
        creatingInvoice,
        invoiceError,
        selectedInvoiceClientId,
        setInvoiceAmount,
        setInvoiceDescription,
        setInvoiceDueDate,
        setInvoiceEmail,
        setSelectedInvoiceClientId,
        requestInvoiceForClient,
        handleInvoiceDialogChange,
        handleCreateInvoice,
    }
}
