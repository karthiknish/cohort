'use client';
import { notifyFailure, notifyInfo, notifySuccess } from '@/lib/notifications';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@convex/_generated/api';
import { useConvex, useQuery as useConvexQuery } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { asErrorMessage } from '@/lib/convex-errors';
import { useAdminActionError } from '@/features/admin/hooks/use-admin-action-error';
import { clientsApi } from '@/lib/convex-api';
import { getPreviewClients } from '@/lib/preview-data';
import type { ClientRecord, ClientTeamMember } from '@/types/clients';
import { dedupeClientTeamMembers } from '../../lib/client-allocation';
type ConvexArgs = Record<string, unknown>;
type ClientRow = {
    legacyId?: string;
    workspaceId?: string;
    name?: string;
    accountManager?: string;
    teamMembers?: ClientTeamMember[];
    createdAtMs?: number | null;
    updatedAtMs?: number | null;
};
function resolveClientWorkspaceId(client: ClientRecord, fallbackWorkspaceId: string | null) {
    return client.workspaceId ?? fallbackWorkspaceId;
}
export interface TeamMemberField extends ClientTeamMember {
    key: string;
}
export function createEmptyMemberField(): TeamMemberField {
    return {
        key: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
        name: '',
        role: '',
    };
}
export interface UseAdminClientsReturn {
    // Client list state
    clients: ClientRecord[];
    setClients: React.Dispatch<React.SetStateAction<ClientRecord[]>>;
    clientsLoading: boolean;
    clientsError: string | null;
    nextCursor: string | null;
    loadingMore: boolean;
    existingTeamMembers: number;
    // Admin action error
    actionError: string | null;
    clearActionError: () => void;
    // Actions
    loadClients: () => Promise<void>;
    handleLoadMore: () => Promise<void>;
    // Client form state
    clientName: string;
    setClientName: (value: string) => void;
    clientAccountManager: string;
    setClientAccountManager: (value: string) => void;
    teamMemberFields: TeamMemberField[];
    clientSaving: boolean;
    // Form actions
    resetClientForm: () => void;
    addTeamMemberField: () => void;
    updateTeamMemberField: (key: string, field: keyof ClientTeamMember, value: string) => void;
    removeTeamMemberField: (key: string) => void;
    handleCreateClient: () => Promise<void>;
    // Delete client
    clientPendingDelete: ClientRecord | null;
    isDeleteDialogOpen: boolean;
    deletingClientId: string | null;
    requestDeleteClient: (client: ClientRecord) => void;
    handleDeleteDialogChange: (open: boolean) => void;
    handleDeleteClient: () => Promise<void>;
    // Team member dialog
    clientPendingMembers: ClientRecord | null;
    isTeamDialogOpen: boolean;
    addingMember: boolean;
    removingTeamMemberKey: string | null;
    memberName: string;
    memberRole: string;
    setMemberName: (value: string) => void;
    setMemberRole: (value: string) => void;
    requestAddTeamMember: (client: ClientRecord) => void;
    handleTeamDialogChange: (open: boolean) => void;
    handleAddTeamMember: () => Promise<void>;
    handleRemoveTeamMember: (client: ClientRecord, memberName: string) => Promise<void>;
    clientPendingEditMember: {
        client: ClientRecord;
        memberName: string;
        memberRole: string;
    } | null;
    isEditRoleDialogOpen: boolean;
    editingMemberRole: string;
    updatingMemberRoleKey: string | null;
    setEditingMemberRole: (value: string) => void;
    requestEditTeamMemberRole: (client: ClientRecord, member: ClientTeamMember) => void;
    handleEditRoleDialogChange: (open: boolean) => void;
    handleUpdateTeamMemberRole: () => Promise<void>;
}
export function useAdminClients(): UseAdminClientsReturn {
    const { user } = useAuth();
    const { isPreviewMode } = usePreview();
    const convex = useConvex();
    const queryClient = useQueryClient();
    const { actionError, clearActionError, reportActionFailure } = useAdminActionError();
    const workspaceContext = useConvexQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : 'skip');
    const workspaceId = workspaceContext?.workspaceId ?? null;
    const includeAllWorkspaces = workspaceContext?.role === 'admin';
    const workspaceLoading = !isPreviewMode && user != null && workspaceContext === undefined;
    const [previewClients, setPreviewClients] = useState<ClientRecord[]>(() => getPreviewClients());
    type ClientsCursor = {
        fieldValue: string;
        legacyId: string;
    };
    const clientsInfiniteQuery = useInfiniteQuery({
        queryKey: ['adminClients', workspaceId, includeAllWorkspaces],
        enabled: !isPreviewMode && Boolean(workspaceId),
        initialPageParam: null as ClientsCursor | null,
        queryFn: async ({ pageParam }) => {
            if (!workspaceId) {
                return { items: [], nextCursor: null as ClientsCursor | null };
            }
            return (await convex.query(clientsApi.list as never, {
                workspaceId,
                limit: 100,
                cursor: pageParam,
                includeAllWorkspaces,
            } as never)) as {
                items: ClientRow[];
                nextCursor: ClientsCursor | null;
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? null,
    });
    const createClientMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.create as never, args as never),
        onSuccess: () => {
            void clientsInfiniteQuery.refetch();
            void queryClient.invalidateQueries({ queryKey: ['adminClients'] });
        },
    });
    const softDeleteClientMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.softDelete as never, args as never),
        onSuccess: () => {
            void clientsInfiniteQuery.refetch();
            void queryClient.invalidateQueries({ queryKey: ['adminClients'] });
        },
    });
    const addTeamMemberMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.addTeamMember as never, args as never),
        onSuccess: () => {
            void clientsInfiniteQuery.refetch();
            void queryClient.invalidateQueries({ queryKey: ['adminClients'] });
        },
    });
    const removeTeamMemberMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.removeTeamMember as never, args as never),
        onSuccess: () => {
            void clientsInfiniteQuery.refetch();
            void queryClient.invalidateQueries({ queryKey: ['adminClients'] });
        },
    });
    const updateTeamMemberRoleMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.updateTeamMemberRole as never, args as never),
        onSuccess: () => {
            void clientsInfiniteQuery.refetch();
            void queryClient.invalidateQueries({ queryKey: ['adminClients'] });
        },
    });
    const syncAdminTeamMembersMutation = useMutation({
        mutationFn: async (args: ConvexArgs) => await convex.mutation(clientsApi.syncAdminTeamMembers as never, args as never),
        onSuccess: () => {
            void clientsInfiniteQuery.refetch();
            void queryClient.invalidateQueries({ queryKey: ['adminClients'] });
        },
    });
    const hasSyncedAdminTeamMembersRef = useRef(false);
    // Delete dialog state
    const [clientPendingDelete, setClientPendingDelete] = useState<ClientRecord | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
    // Team member dialog state
    const [clientPendingMembers, setClientPendingMembers] = useState<ClientRecord | null>(null);
    const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
    const [addingMember, setAddingMember] = useState(false);
    const [removingTeamMemberKey, setRemovingTeamMemberKey] = useState<string | null>(null);
    const [memberName, setMemberName] = useState('');
    const [memberRole, setMemberRole] = useState('');
    const [clientPendingEditMember, setClientPendingEditMember] = useState<{
        client: ClientRecord;
        memberName: string;
        memberRole: string;
    } | null>(null);
    const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
    const [editingMemberRole, setEditingMemberRole] = useState('');
    const [updatingMemberRoleKey, setUpdatingMemberRoleKey] = useState<string | null>(null);
    // Client form state
    const [clientSaving, setClientSaving] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientAccountManager, setClientAccountManager] = useState('');
    const [teamMemberFields, setTeamMemberFields] = useState<TeamMemberField[]>([createEmptyMemberField()]);
    // Transform Convex data to ClientRecord format
    const liveClients = (() => {
        const pages = clientsInfiniteQuery.data?.pages ?? [];
        const rows = pages.flatMap((page) => (Array.isArray(page.items) ? page.items : [])) as ClientRow[];
        const list: ClientRecord[] = rows.map((row) => ({
            id: row.legacyId ?? '',
            workspaceId: typeof row.workspaceId === 'string' ? row.workspaceId : null,
            name: row.name ?? '',
            accountManager: row.accountManager ?? '',
            teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
            createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
            updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
        }));
        list.sort((a, b) => a.name.localeCompare(b.name));
        return list;
    })();
    const clients = isPreviewMode ? previewClients : liveClients;
    // Backward-compatible setter used by existing consumers.
    const setClients = (updater: React.SetStateAction<ClientRecord[]>) => {
        if (!isPreviewMode) {
            void updater;
            return;
        }
        setPreviewClients((current) => (typeof updater === 'function' ? updater(current) : updater));
    };
    const clientsLoading = isPreviewMode ? false : workspaceLoading || clientsInfiniteQuery.isLoading;
    const clientsError = isPreviewMode
        ? null
        : clientsInfiniteQuery.error
            ? asErrorMessage(clientsInfiniteQuery.error)
            : null;
    const loadingMore = !isPreviewMode && clientsInfiniteQuery.isFetchingNextPage;
    const nextCursor = !isPreviewMode && clientsInfiniteQuery.hasNextPage ? 'more' : null;
    useEffect(() => {
        hasSyncedAdminTeamMembersRef.current = false;
    }, [workspaceId, includeAllWorkspaces]);
    useEffect(() => {
        if (isPreviewMode || !workspaceId || clientsLoading || hasSyncedAdminTeamMembersRef.current) {
            return;
        }
        const workspaceIds = includeAllWorkspaces
            ? [...new Set(clients
                    .map((client) => client.workspaceId)
                    .filter((value): value is string => typeof value === 'string' && value.length > 0))]
            : [workspaceId];
        if (workspaceIds.length === 0) {
            return;
        }
        hasSyncedAdminTeamMembersRef.current = true;
        void (async () => {
            try {
                await Promise.all(workspaceIds.map((targetWorkspaceId) => syncAdminTeamMembersMutation.mutateAsync({ workspaceId: targetWorkspaceId })));
            }
            catch (err: unknown) {
                hasSyncedAdminTeamMembersRef.current = false;
                reportActionFailure({
                    error: err,
                    context: 'useAdminClients:syncAdminTeamMembers',
                    title: 'Could not sync admin teammates',
                });
            }
        })();
    }, [
        clients,
        clientsLoading,
        includeAllWorkspaces,
        isPreviewMode,
        syncAdminTeamMembersMutation,
        workspaceId,
    ]);
    const existingTeamMembers = clients.reduce((total, client) => total + client.teamMembers.length, 0);
    const loadClients = async () => {
        if (isPreviewMode) {
            setPreviewClients(getPreviewClients());
            notifyInfo({ title: 'Preview data refreshed', message: 'Showing sample client workspaces.' });
            return;
        }
        void clientsInfiniteQuery.refetch();
    };
    const handleLoadMore = async () => {
        if (isPreviewMode) {
            return;
        }
        if (!clientsInfiniteQuery.hasNextPage || clientsInfiniteQuery.isFetchingNextPage) {
            return;
        }
        try {
            await clientsInfiniteQuery.fetchNextPage();
        }
        catch (err: unknown) {
            reportActionFailure({
                error: err,
                context: 'useAdminClients:handleLoadMore',
                title: 'Could not load more',
            });
        }
    };
    // Delete dialog handlers
    const handleDeleteDialogChange = (open: boolean) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
            setClientPendingDelete(null);
        }
    };
    const requestDeleteClient = (client: ClientRecord) => {
        setClientPendingDelete(client);
        setIsDeleteDialogOpen(true);
    };
    const handleDeleteClient = async () => {
        if (!clientPendingDelete)
            return;
        if (isPreviewMode) {
            setDeletingClientId(clientPendingDelete.id);
            setPreviewClients((current) => current.filter((client) => client.id !== clientPendingDelete.id));
            notifyInfo({ title: 'Preview mode', message: `${clientPendingDelete.name} was removed locally for this session.` });
            setClientPendingDelete(null);
            setIsDeleteDialogOpen(false);
            setDeletingClientId(null);
            return;
        }
        if (!workspaceId)
            return;
        const targetWorkspaceId = resolveClientWorkspaceId(clientPendingDelete, workspaceId);
        if (!targetWorkspaceId)
            return;
        try {
            setDeletingClientId(clientPendingDelete.id);
            await softDeleteClientMutation.mutateAsync({
                workspaceId: targetWorkspaceId,
                legacyId: clientPendingDelete.id,
                deletedAtMs: Date.now(),
            });
            notifySuccess({ title: 'Client deleted', message: `${clientPendingDelete.name} has been removed.` });
            setClientPendingDelete(null);
            setIsDeleteDialogOpen(false);
        }
        catch (err: unknown) {
            reportActionFailure({
                error: err,
                context: 'useAdminClients:handleDeleteClient',
                title: 'Client delete failed',
            });
        }
        finally {
            setDeletingClientId(null);
        }
    };
    // Team member dialog handlers
    const handleTeamDialogChange = (open: boolean) => {
        setIsTeamDialogOpen(open);
        if (!open) {
            setClientPendingMembers(null);
            setMemberName('');
            setMemberRole('');
            setAddingMember(false);
        }
    };
    const requestAddTeamMember = (client: ClientRecord) => {
        setClientPendingMembers(client);
        setMemberName('');
        setMemberRole('');
        setIsTeamDialogOpen(true);
    };
    const handleAddTeamMember = async () => {
        if (!clientPendingMembers)
            return;
        const name = memberName.trim();
        if (!name) {
            notifyFailure({
                title: 'Name required',
                message: 'Enter a teammate name before adding.',
            });
            return;
        }
        const alreadyAssigned = clientPendingMembers.teamMembers.some((member) => member.name.trim().toLowerCase() === name.toLowerCase());
        if (alreadyAssigned) {
            notifyFailure({
                title: 'Already assigned',
                message: `${name} is already on ${clientPendingMembers.name}.`,
            });
            return;
        }
        const role = memberRole.trim();
        if (isPreviewMode) {
            setAddingMember(true);
            setPreviewClients((current) => current.map((client) => {
                if (client.id !== clientPendingMembers.id) {
                    return client;
                }
                return {
                    ...client,
                    teamMembers: [...client.teamMembers, { name, role: role || 'Contributor' }],
                    updatedAt: new Date().toISOString(),
                };
            }));
            notifyInfo({ title: 'Preview mode', message: `${name} joined ${clientPendingMembers.name} in the sample workspace.` });
            setMemberName('');
            setMemberRole('');
            setIsTeamDialogOpen(false);
            setClientPendingMembers(null);
            setAddingMember(false);
            return;
        }
        if (!workspaceId)
            return;
        const targetWorkspaceId = resolveClientWorkspaceId(clientPendingMembers, workspaceId);
        if (!targetWorkspaceId)
            return;
        try {
            setAddingMember(true);
            await addTeamMemberMutation.mutateAsync({
                workspaceId: targetWorkspaceId,
                legacyId: clientPendingMembers.id,
                name,
                role: role || undefined,
            });
            notifySuccess({ title: 'Teammate added', message: `${name} joined ${clientPendingMembers.name}.` });
            setMemberName('');
            setMemberRole('');
            setIsTeamDialogOpen(false);
            setClientPendingMembers(null);
        }
        catch (err: unknown) {
            reportActionFailure({
                error: err,
                context: 'useAdminClients:handleAddTeamMember',
                title: 'Add teammate failed',
            });
        }
        finally {
            setAddingMember(false);
        }
    };
    const handleRemoveTeamMember = async (client: ClientRecord, memberName: string) => {
        const normalizedName = memberName.trim();
        if (!normalizedName)
            return;
        if (normalizedName.toLowerCase() === client.accountManager.toLowerCase()) {
            notifyFailure({
                title: 'Cannot remove account manager',
                message: 'Change the account manager before removing this teammate.',
            });
            return;
        }
        if (isPreviewMode) {
            const removeKey = `${client.id}:${normalizedName.toLowerCase()}`;
            setRemovingTeamMemberKey(removeKey);
            setPreviewClients((current) => current.map((candidate) => {
                if (candidate.id !== client.id) {
                    return candidate;
                }
                return {
                    ...candidate,
                    teamMembers: candidate.teamMembers.filter((member) => member.name.trim().toLowerCase() !== normalizedName.toLowerCase()),
                    updatedAt: new Date().toISOString(),
                };
            }));
            notifyInfo({ title: 'Preview mode', message: `${normalizedName} was removed from ${client.name} locally.` });
            setRemovingTeamMemberKey(null);
            return;
        }
        if (!workspaceId)
            return;
        const targetWorkspaceId = resolveClientWorkspaceId(client, workspaceId);
        if (!targetWorkspaceId)
            return;
        const removeKey = `${client.id}:${normalizedName.toLowerCase()}`;
        try {
            setRemovingTeamMemberKey(removeKey);
            await removeTeamMemberMutation.mutateAsync({
                workspaceId: targetWorkspaceId,
                legacyId: client.id,
                name: normalizedName,
            });
            notifySuccess({
                title: 'Teammate removed',
                message: `${normalizedName} was removed from ${client.name}.`,
            });
        }
        catch (err: unknown) {
            reportActionFailure({
                error: err,
                context: 'useAdminClients:handleRemoveTeamMember',
                title: 'Remove teammate failed',
            });
        }
        finally {
            setRemovingTeamMemberKey(null);
        }
    };
    const requestEditTeamMemberRole = (client: ClientRecord, member: ClientTeamMember) => {
        setClientPendingEditMember({
            client,
            memberName: member.name,
            memberRole: member.role,
        });
        setEditingMemberRole(member.role);
        setIsEditRoleDialogOpen(true);
    };
    const handleEditRoleDialogChange = (open: boolean) => {
        setIsEditRoleDialogOpen(open);
        if (!open) {
            setClientPendingEditMember(null);
            setEditingMemberRole('');
        }
    };
    const handleUpdateTeamMemberRole = async () => {
        if (!clientPendingEditMember)
            return;
        const { client, memberName: currentMemberName } = clientPendingEditMember;
        const normalizedName = currentMemberName.trim();
        if (!normalizedName)
            return;
        const role = editingMemberRole.trim() || 'Contributor';
        if (isPreviewMode) {
            const updateKey = `${client.id}:${normalizedName.toLowerCase()}`;
            setUpdatingMemberRoleKey(updateKey);
            setPreviewClients((current) => current.map((candidate) => {
                if (candidate.id !== client.id) {
                    return candidate;
                }
                return {
                    ...candidate,
                    teamMembers: candidate.teamMembers.map((member) => member.name.trim().toLowerCase() === normalizedName.toLowerCase()
                        ? { ...member, role }
                        : member),
                    updatedAt: new Date().toISOString(),
                };
            }));
            notifyInfo({
                title: 'Preview mode',
                message: `${normalizedName}'s role on ${client.name} was updated locally.`,
            });
            setIsEditRoleDialogOpen(false);
            setClientPendingEditMember(null);
            setEditingMemberRole('');
            setUpdatingMemberRoleKey(null);
            return;
        }
        if (!workspaceId)
            return;
        const targetWorkspaceId = resolveClientWorkspaceId(client, workspaceId);
        if (!targetWorkspaceId)
            return;
        const updateKey = `${client.id}:${normalizedName.toLowerCase()}`;
        try {
            setUpdatingMemberRoleKey(updateKey);
            await updateTeamMemberRoleMutation.mutateAsync({
                workspaceId: targetWorkspaceId,
                legacyId: client.id,
                name: normalizedName,
                role,
            });
            notifySuccess({
                title: 'Role updated',
                message: `${normalizedName} is now ${role} on ${client.name}.`,
            });
            setIsEditRoleDialogOpen(false);
            setClientPendingEditMember(null);
            setEditingMemberRole('');
        }
        catch (err: unknown) {
            reportActionFailure({
                error: err,
                context: 'useAdminClients:handleUpdateTeamMemberRole',
                title: 'Update role failed',
            });
        }
        finally {
            setUpdatingMemberRoleKey(null);
        }
    };
    // Client form handlers
    const resetClientForm = () => {
        setClientName('');
        setClientAccountManager('');
        setTeamMemberFields([createEmptyMemberField()]);
    };
    const addTeamMemberField = () => {
        setTeamMemberFields((prev) => [...prev, createEmptyMemberField()]);
    };
    const updateTeamMemberField = (key: string, field: keyof ClientTeamMember, value: string) => {
        setTeamMemberFields((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
    };
    const removeTeamMemberField = (key: string) => {
        setTeamMemberFields((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)));
    };
    const handleCreateClient = async () => {
        const name = clientName.trim();
        const accountManager = clientAccountManager.trim();
        if (!name || !accountManager) {
            notifyFailure({
                title: 'Missing details',
                message: 'Client name and account manager are required.',
            });
            return;
        }
        const teamMembers = dedupeClientTeamMembers(accountManager, teamMemberFields.flatMap((member) => {
            const normalized = {
                name: member.name.trim(),
                role: member.role.trim(),
            };
            return normalized.name.length > 0
                ? [{ ...normalized, role: normalized.role || 'Contributor' }]
                : [];
        }));
        setClientSaving(true);
        if (isPreviewMode) {
            setPreviewClients((current) => {
                const normalizedPreviewTeamMembers = teamMembers.map((member) => ({
                    ...member,
                    role: member.role || 'Contributor',
                }));
                const nextClient: ClientRecord = {
                    id: `preview-client-${Date.now()}`,
                    name,
                    accountManager,
                    teamMembers: normalizedPreviewTeamMembers,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                return [...current, nextClient].sort((left, right) => left.name.localeCompare(right.name));
            });
            notifyInfo({ title: 'Preview mode', message: `${name} was created in the sample workspace.` });
            resetClientForm();
            setClientSaving(false);
            return;
        }
        if (!workspaceId)
            return;
        try {
            await createClientMutation.mutateAsync({
                workspaceId,
                name,
                accountManager,
                teamMembers,
                createdBy: user?.id ?? null,
            });
            notifySuccess({ title: 'Client created', message: `${name} is ready to use.` });
            resetClientForm();
        }
        catch (err: unknown) {
            reportActionFailure({
                error: err,
                context: 'useAdminClients:handleCreateClient',
                title: 'Client create failed',
            });
        }
        finally {
            setClientSaving(false);
        }
    };
    return {
        // Client list
        clients,
        setClients,
        clientsLoading,
        clientsError,
        nextCursor,
        loadingMore,
        existingTeamMembers,
        actionError,
        clearActionError,
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
        clientPendingEditMember,
        isEditRoleDialogOpen,
        editingMemberRole,
        updatingMemberRoleKey,
        setEditingMemberRole,
        requestEditTeamMemberRole,
        handleEditRoleDialogChange,
        handleUpdateTeamMemberRole,
    };
}
