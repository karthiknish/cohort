'use client';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { useAdminActionError } from '../../hooks/use-admin-action-error';
import { useCallback, useMemo, useReducer } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
import { api } from '/_generated/api';
import { useToast } from '@/shared/ui/use-toast';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { getPreviewAdminClients, getPreviewAdminUsers } from '@/lib/preview-data';
import type { AdminUserRecord, AdminUserRole } from '@/types/admin';
import { buildClientAllocationSummary } from '../../lib/client-allocation';
import { adminTeamPageReducer, createInitialAdminTeamPageState, deriveNextStatus, isAdminUserRole, isAdminUserStatus, looksLikeEmail, type AdminUserRow, type RoleFilter, type StatusFilter, } from '../admin-team-types';
export function useAdminTeamPage() {
    const { user } = useAuth();
    const { isPreviewMode } = usePreview();
    const [state, dispatch] = useReducer(adminTeamPageReducer, undefined, createInitialAdminTeamPageState);
    const { usersOverride, previewUsers, loadingMore, statusFilter, roleFilter, searchTerm, savingId, inviteOpen, inviteEmail, inviteRole, inviteSending, } = state;
    const { actionError, clearActionError, reportActionFailure } = useAdminActionError();
    const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : 'skip');
    const workspaceId = workspaceContext?.workspaceId ?? null;
    const includeAllWorkspaces = workspaceContext?.role === 'admin';
    const { toast } = useToast();
    const { results: usersPage, status, loadMore, isLoading } = usePaginatedQuery(api.adminUsers.listUsers, !isPreviewMode && workspaceId
        ? {
            workspaceId,
            includeAllWorkspaces,
        }
        : 'skip', { initialNumItems: 50 });
    const updateUserRoleStatus = useMutation(api.adminUsers.updateUserRoleStatus);
    const createInvitation = useMutation(api.adminInvitations.createInvitation);
    const clientsData = useQuery(api.clients.list, !isPreviewMode && workspaceId
        ? {
            workspaceId,
            limit: 200,
            cursor: null,
            includeAllWorkspaces,
        }
        : 'skip');
    const handleInviteEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setInviteEmail', value: event.target.value });
    };
    const handleInviteRoleChange = (value: string) => {
        dispatch({ type: 'setInviteRole', value: value as AdminUserRole });
    };
    const handleCloseInviteDialog = () => {
        dispatch({ type: 'setInviteOpen', value: false });
    };
    const handleInviteOpenChange = (open: boolean) => {
        dispatch({ type: 'setInviteOpen', value: open });
        if (!open) {
            dispatch({ type: 'setInviteEmail', value: '' });
            dispatch({ type: 'setInviteRole', value: 'team' });
        }
    };
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setSearchTerm', value: event.target.value });
    };
    const handleStatusFilterChange = (value: string) => {
        dispatch({ type: 'setStatusFilter', value: value as StatusFilter });
    };
    const handleRoleFilterChange = (value: string) => {
        dispatch({ type: 'setRoleFilter', value: value as RoleFilter });
    };
    const handleLoadMore = () => {
        if (isPreviewMode)
            return;
        if (loadingMore)
            return;
        dispatch({ type: 'setLoadingMore', value: true });
        void Promise.resolve()
            .then(() => loadMore(50))
            .catch((err: unknown) => {
            reportActionFailure({
                error: err,
                context: 'AdminTeamPage:loadMore',
                title: 'Could not load more',
            });
        })
            .finally(() => {
            dispatch({ type: 'setLoadingMore', value: false });
        });
    };
    const users: AdminUserRecord[] = (() => {
        if (isPreviewMode)
            return previewUsers;
        if (usersOverride)
            return usersOverride;
        return (Array.isArray(usersPage) ? usersPage : []).map((row) => {
            const typedRow = row as AdminUserRow;
            return {
                id: typedRow.legacyId,
                email: typedRow.email ?? '',
                name: typedRow.name ?? '',
                role: isAdminUserRole(typedRow.role) ? typedRow.role : 'team',
                status: isAdminUserStatus(typedRow.status) ? typedRow.status : 'pending',
                agencyId: typedRow.agencyId ?? null,
                createdAt: typedRow.createdAtMs ? new Date(typedRow.createdAtMs).toISOString() : null,
                updatedAt: typedRow.updatedAtMs ? new Date(typedRow.updatedAtMs).toISOString() : null,
                lastLoginAt: null,
            };
        });
    })();
    const loading = isPreviewMode ? false : (user != null && workspaceContext === undefined) || isLoading;
    const workspaceQueryError = useConvexQueryError({
        data: workspaceContext,
        skipped: isPreviewMode || !user,
        loading: !isPreviewMode && Boolean(user) && workspaceContext === undefined,
        fallbackMessage: 'Unable to load workspace context.',
    });
    const clientItems = isPreviewMode
        ? getPreviewAdminClients().map((client) => ({
            legacyId: client.id,
            name: client.name,
            accountManager: client.accountManager,
            teamMembers: client.teamMembers,
        }))
        : clientsData?.items;
    const internalUsers = users.filter((candidate) => candidate.role !== 'client');
    const allocationSummary = (() => {
        const clientRows = Array.isArray(clientItems) ? clientItems : [];
        return buildClientAllocationSummary(internalUsers.map((record) => ({
            id: record.id,
            name: record.name,
            email: record.email,
            role: record.role,
            status: record.status,
        })), clientRows.map((client) => ({
            id: client.legacyId,
            name: client.name,
            accountManager: client.accountManager,
            teamMembers: client.teamMembers ?? [],
        })));
    })();
    const hasActiveFilters = searchTerm.trim() !== '' || statusFilter !== 'all' || roleFilter !== 'all';
    const filteredUsers = (() => {
        const search = searchTerm.trim().toLowerCase();
        return internalUsers.filter((candidate) => {
            if (statusFilter !== 'all' && candidate.status !== statusFilter) {
                return false;
            }
            if (roleFilter !== 'all' && candidate.role !== roleFilter) {
                return false;
            }
            if (search.length > 0) {
                const haystack = `${candidate.name} ${candidate.email}`.toLowerCase();
                return haystack.includes(search);
            }
            return true;
        });
    })();
    const summary = (() => {
        const active = internalUsers.filter((record) => record.status === 'active').length;
        const admins = internalUsers.filter((record) => record.role === 'admin').length;
        const allocated = internalUsers.filter((record) => (allocationSummary.byUserId[record.id]?.totalClientNames.length ?? 0) > 0).length;
        return {
            total: internalUsers.length,
            active,
            admins,
            allocated,
        };
    })();
    const handleRoleChange = (userId: string, role: AdminUserRecord['role']) => {
        if (isPreviewMode) {
            dispatch({
                type: 'setPreviewUsers',
                value: (current) => current.map((record) => (record.id === userId ? { ...record, role, updatedAt: new Date().toISOString() } : record)),
            });
            toast({ title: 'Preview mode', description: `Member role updated to ${role} in the sample workspace.` });
            return;
        }
        dispatch({ type: 'setSavingId', value: userId });
        clearActionError();
        void updateUserRoleStatus({ legacyId: userId, role })
            .then(() => {
            dispatch({
                type: 'setUsersOverride',
                value: (prev) => {
                    const base = prev ?? users;
                    return base.map((record) => (record.id === userId ? { ...record, role } : record));
                },
            });
            toast({ title: 'Role updated', description: `Member is now a ${role}.` });
        })
            .catch((err: unknown) => {
            reportActionFailure({
                error: err,
                context: 'AdminTeamPage:handleRoleChange',
                title: 'Role update failed',
            });
        })
            .finally(() => {
            dispatch({ type: 'setSavingId', value: null });
        });
    };
    const handleAdminToggle = (record: AdminUserRecord, makeAdmin: boolean) => {
        if (makeAdmin && record.role === 'admin') {
            return;
        }
        if (!makeAdmin && record.role !== 'admin') {
            return;
        }
        const fallbackRole: AdminUserRecord['role'] = makeAdmin ? 'admin' : 'team';
        void handleRoleChange(record.id, fallbackRole);
    };
    const handleStatusAction = (userRecord: AdminUserRecord) => {
        const nextStatus = deriveNextStatus(userRecord.status);
        if (isPreviewMode) {
            dispatch({
                type: 'setPreviewUsers',
                value: (current) => current.map((record) => (record.id === userRecord.id ? { ...record, status: nextStatus, updatedAt: new Date().toISOString() } : record)),
            });
            toast({
                title: 'Preview mode',
                description: `Member is now ${nextStatus.replace(/_/g, ' ')} in the sample workspace.`,
            });
            return;
        }
        dispatch({ type: 'setSavingId', value: userRecord.id });
        clearActionError();
        void updateUserRoleStatus({ legacyId: userRecord.id, status: nextStatus })
            .then(() => {
            dispatch({
                type: 'setUsersOverride',
                value: (prev) => {
                    const base = prev ?? users;
                    return base.map((record) => (record.id === userRecord.id ? { ...record, status: nextStatus } : record));
                },
            });
            toast({
                title: 'Status updated',
                description: `Member is now ${nextStatus.replace(/_/g, ' ')}.`,
            });
        })
            .catch((err: unknown) => {
            reportActionFailure({
                error: err,
                context: 'AdminTeamPage:handleStatusAction',
                title: 'Status update failed',
            });
        })
            .finally(() => {
            dispatch({ type: 'setSavingId', value: null });
        });
    };
    const inviteEmailTrimmed = inviteEmail.trim();
    const inviteEmailValid = looksLikeEmail(inviteEmailTrimmed);
    const handleInviteUser = () => {
        const email = inviteEmail.trim();
        if (!email || !looksLikeEmail(email))
            return;
        if (isPreviewMode) {
            dispatch({
                type: 'setPreviewUsers',
                value: (current) => [
                    {
                        id: `preview-user-${Date.now()}`,
                        email,
                        name: email.split('@')[0] ?? 'Preview User',
                        role: inviteRole,
                        status: 'invited',
                        agencyId: 'preview-agency',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        lastLoginAt: null,
                    },
                    ...current,
                ],
            });
            toast({
                title: 'Preview mode',
                description: `Invitation created for ${email} in the sample workspace.`,
            });
            dispatch({ type: 'resetInviteForm' });
            return;
        }
        if (!user?.id)
            return;
        dispatch({ type: 'setInviteSending', value: true });
        void createInvitation({
            email,
            role: inviteRole,
            invitedBy: user.id,
            invitedByName: user?.name ?? null,
        })
            .then(() => {
            toast({
                title: 'Invitation sent!',
                description: `Invitation created for ${email} as ${inviteRole}. Email delivery depends on server integration settings.`,
            });
            dispatch({ type: 'resetInviteForm' });
        })
            .catch((err: unknown) => {
            reportActionFailure({
                error: err,
                context: 'AdminTeamPage:handleInviteUser',
                title: 'Invitation failed',
            });
        })
            .finally(() => {
            dispatch({ type: 'setInviteSending', value: false });
        });
    };
    const handleInviteFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleInviteUser();
    };
    const handleOpenInviteDialog = () => {
        dispatch({ type: 'setInviteOpen', value: true });
    };
    const handleClearFilters = () => {
        dispatch({ type: 'clearFilters' });
    };
    const handleRefresh = () => {
        if (loading)
            return;
        clearActionError();
        dispatch({
            type: 'refresh',
            previewUsers: isPreviewMode ? getPreviewAdminUsers() : state.previewUsers,
        });
    };
    const createRoleChangeHandler = (userId: string) => (value: string) => {
        handleRoleChange(userId, value as AdminUserRecord['role']);
    };
    const createAdminToggleHandler = (record: AdminUserRecord) => (event: ChangeEvent<HTMLInputElement>) => {
        handleAdminToggle(record, event.target.checked);
    };
    const createStatusActionHandler = (record: AdminUserRecord) => () => {
        handleStatusAction(record);
    };
    return {
        user,
        isPreviewMode,
        loading,
        summary,
        filteredUsers,
        internalUsers,
        allocationSummary,
        hasActiveFilters,
        workspaceQueryError,
        actionError,
        clearActionError,
        statusFilter,
        roleFilter,
        searchTerm,
        savingId,
        inviteOpen,
        inviteEmail,
        inviteEmailTrimmed,
        inviteEmailValid,
        inviteRole,
        inviteSending,
        loadingMore,
        paginatedStatus: status,
        handleRefresh,
        handleInviteEmailChange,
        handleInviteRoleChange,
        handleCloseInviteDialog,
        handleInviteOpenChange,
        handleSearchChange,
        handleStatusFilterChange,
        handleRoleFilterChange,
        handleLoadMore,
        handleInviteFormSubmit,
        handleOpenInviteDialog,
        handleClearFilters,
        createRoleChangeHandler,
        createAdminToggleHandler,
        createStatusActionHandler,
    };
}
