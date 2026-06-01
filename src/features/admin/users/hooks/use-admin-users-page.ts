'use client';
import { notifyFailure } from '@/lib/notifications';
import { mergeQueryErrors, useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { useAdminActionError } from '../../hooks/use-admin-action-error';
import { useCallback, useMemo, useReducer } from 'react';
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react';
import { api } from '/_generated/api';
import { useToast } from '@/shared/ui/use-toast';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { getPreviewAdminInvitations, getPreviewAdminUsers } from '@/lib/preview-data';
import type { AdminUserRecord, AdminUserRole, AdminUserStatus } from '@/types/admin';
import { adminUsersPageReducer, createInitialAdminUsersPageState, normalizeAdminRole, normalizeAdminStatus, type AdminInvitationRecord, type InvitationLifecycleStatus, type RoleFilter, type StatusFilter, } from '../admin-users-types';
export function useAdminUsersPage() {
    const { user } = useAuth();
    const { isPreviewMode } = usePreview();
    const { toast } = useToast();
    const [state, dispatch] = useReducer(adminUsersPageReducer, undefined, createInitialAdminUsersPageState);
    const { usersOverride, previewUsers, previewInvitations, loadingMore, statusFilter, roleFilter, searchTerm, invitationSearchTerm, invitationStatusFilter, savingId, invitationActionKey, inviteOpen, revokeOpen, detailsOpen, selectedUser, inviteEmail, inviteRole, inviteSending, } = state;
    const { actionError, clearActionError, reportActionFailure } = useAdminActionError();
    const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : 'skip');
    const workspaceId = workspaceContext?.workspaceId ?? null;
    const includeAllWorkspaces = workspaceContext?.role === 'admin';
    const { results: usersPage, status, loadMore, isLoading } = usePaginatedQuery(api.adminUsers.listUsers, !isPreviewMode && workspaceId
        ? {
            workspaceId,
            includeAllWorkspaces,
        }
        : 'skip', { initialNumItems: 50 });
    const updateUserRoleStatus = useMutation(api.adminUsers.updateUserRoleStatus);
    const createInvitation = useMutation(api.adminInvitations.createInvitation);
    const resendInvitation = useMutation(api.adminInvitations.resendInvitation);
    const revokeInvitation = useMutation(api.adminInvitations.revokeInvitation);
    const invitationResponse = useQuery(api.adminInvitations.listInvitations, isPreviewMode ? 'skip' : { limit: 100 }) as {
        invitations?: Array<Record<string, unknown>>;
    } | undefined;
    const users: AdminUserRecord[] = (() => {
        if (isPreviewMode)
            return previewUsers;
        if (usersOverride)
            return usersOverride;
        return (Array.isArray(usersPage) ? usersPage : []).map((row) => ({
            id: row.legacyId,
            email: row.email ?? '',
            name: row.name ?? '',
            role: normalizeAdminRole(row.role),
            status: normalizeAdminStatus(row.status),
            agencyId: row.agencyId ?? null,
            createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
            updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
            lastLoginAt: null,
        }));
    })();
    const loading = isPreviewMode ? false : (user != null && workspaceContext === undefined) || isLoading;
    const filteredUsers = (() => {
        const search = searchTerm.trim().toLowerCase();
        return users.filter((record) => {
            if (statusFilter !== 'all' && record.status !== statusFilter) {
                return false;
            }
            if (roleFilter !== 'all' && record.role !== roleFilter) {
                return false;
            }
            if (search.length > 0) {
                const haystack = `${record.name} ${record.email}`.toLowerCase();
                return haystack.includes(search);
            }
            return true;
        });
    })();
    const summary = (() => {
        const pending = users.filter((record) => record.status === 'pending' || record.status === 'invited').length;
        const active = users.filter((record) => record.status === 'active').length;
        const total = users.length;
        const internal = users.filter((record) => record.role !== 'client').length;
        const clients = users.filter((record) => record.role === 'client').length;
        return { total, pending, active, internal, clients };
    })();
    const invitationsLoading = isPreviewMode ? false : invitationResponse === undefined;
    const workspaceQueryError = useConvexQueryError({
        data: workspaceContext,
        skipped: isPreviewMode || !user,
        loading: !isPreviewMode && Boolean(user) && workspaceContext === undefined,
        fallbackMessage: 'Unable to load workspace context.',
    });
    const invitationsQueryError = useConvexQueryError({
        data: invitationResponse,
        skipped: isPreviewMode,
        loading: invitationsLoading,
        fallbackMessage: 'Unable to load invitations.',
    });
    const listQueryError = mergeQueryErrors(workspaceQueryError, invitationsQueryError);
    const invitations: AdminInvitationRecord[] = (() => {
        if (isPreviewMode) {
            return previewInvitations;
        }
        const rows = Array.isArray(invitationResponse?.invitations) ? invitationResponse.invitations : [];
        return rows.flatMap((row) => {
            const invitation = row as {
                id?: string;
                email?: string;
                role?: AdminUserRole;
                name?: string | null;
                message?: string | null;
                status?: InvitationLifecycleStatus;
                effectiveStatus?: InvitationLifecycleStatus;
                invitedBy?: string;
                invitedByName?: string | null;
                expiresAtMs?: number;
                createdAtMs?: number;
                acceptedAtMs?: number | null;
            };
            const invitationStatus = invitation.status ?? 'pending';
            const expiresAtMs = typeof invitation.expiresAtMs === 'number' ? invitation.expiresAtMs : 0;
            const effectiveStatus = invitation.effectiveStatus ?? invitationStatus;
            const mapped = {
                id: invitation.id ?? '',
                email: invitation.email ?? '',
                role: invitation.role ?? 'team',
                name: invitation.name ?? null,
                message: invitation.message ?? null,
                status: invitationStatus,
                effectiveStatus,
                invitedBy: invitation.invitedBy ?? '',
                invitedByName: invitation.invitedByName ?? null,
                expiresAtMs,
                createdAtMs: typeof invitation.createdAtMs === 'number' ? invitation.createdAtMs : 0,
                acceptedAtMs: typeof invitation.acceptedAtMs === 'number' ? invitation.acceptedAtMs : null,
            };
            return mapped.id.length > 0 ? [mapped] : [];
        });
    })();
    const invitationSummary = invitations.reduce<Record<InvitationLifecycleStatus, number>>((acc, invitation) => {
        acc[invitation.effectiveStatus] += 1;
        return acc;
    }, {
        pending: 0,
        accepted: 0,
        expired: 0,
        revoked: 0,
    });
    const filteredInvitations = (() => {
        const search = invitationSearchTerm.trim().toLowerCase();
        return invitations.filter((invitation) => {
            if (invitation.effectiveStatus !== invitationStatusFilter) {
                return false;
            }
            if (search.length === 0) {
                return true;
            }
            const haystack = `${invitation.email} ${invitation.name ?? ''}`.toLowerCase();
            return haystack.includes(search);
        });
    })();
    const handleRoleChange = (record: AdminUserRecord, nextRole: AdminUserRole) => {
        if (record.role === nextRole) {
            return;
        }
        if (isPreviewMode) {
            dispatch({
                type: 'setPreviewUsers',
                value: (current) => current.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, role: nextRole, updatedAt: new Date().toISOString() } : userRecord)),
            });
            toast({ title: 'Preview mode', description: `${record.name} is now ${nextRole} in the sample workspace.` });
            return;
        }
        dispatch({ type: 'setSavingId', value: record.id });
        void updateUserRoleStatus({ legacyId: record.id, role: nextRole })
            .then(() => {
            dispatch({
                type: 'setUsersOverride',
                value: (prev) => {
                    const base = prev ?? users;
                    return base.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, role: nextRole } : userRecord));
                },
            });
            toast({ title: 'Role updated', description: `${record.name} is now ${nextRole}.` });
        })
            .catch((err: unknown) => {
            reportActionFailure({
                error: err,
                context: 'AdminUsers:handleRoleChange',
                title: 'Role update failed',
            });
        })
            .finally(() => {
            dispatch({ type: 'setSavingId', value: null });
        });
    };
    const handleApprovalToggle = (record: AdminUserRecord, approved: boolean) => {
        if (record.role === 'admin' && !approved) {
            notifyFailure({
                title: 'Cannot disable admin',
                message: 'Admin accounts must remain active.',
            });
            return;
        }
        const nextStatus: AdminUserStatus = approved ? 'active' : 'pending';
        if (record.status === nextStatus) {
            return;
        }
        if (isPreviewMode) {
            dispatch({
                type: 'setPreviewUsers',
                value: (current) => current.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, status: nextStatus, updatedAt: new Date().toISOString() } : userRecord)),
            });
            toast({
                title: 'Preview mode',
                description: `${record.name} status set to ${nextStatus} in the sample workspace.`,
            });
            dispatch({ type: 'setRevokeOpen', value: false });
            return;
        }
        dispatch({ type: 'setSavingId', value: record.id });
        void updateUserRoleStatus({ legacyId: record.id, status: nextStatus })
            .then(() => {
            dispatch({
                type: 'setUsersOverride',
                value: (prev) => {
                    const base = prev ?? users;
                    return base.map((userRecord) => (userRecord.id === record.id ? { ...userRecord, status: nextStatus } : userRecord));
                },
            });
            toast({ title: approved ? 'Account approved' : 'Approval revoked', description: `${record.name} status set to ${nextStatus}.` });
            dispatch({ type: 'setRevokeOpen', value: false });
        })
            .catch((err: unknown) => {
            reportActionFailure({
                error: err,
                context: 'AdminUsers:handleApprovalToggle',
                title: 'Approval update failed',
            });
        })
            .finally(() => {
            dispatch({ type: 'setSavingId', value: null });
        });
    };
    const handleInviteUser = () => {
        if (!inviteEmail)
            return;
        if (isPreviewMode) {
            const nowMs = Date.now();
            dispatch({
                type: 'setPreviewInvitations',
                value: (current) => [
                    {
                        id: `preview-invite-${nowMs}`,
                        email: inviteEmail,
                        role: inviteRole,
                        name: null,
                        message: 'Created from the preview admin invite flow.',
                        status: 'pending',
                        effectiveStatus: 'pending',
                        invitedBy: user?.id ?? 'preview-admin-1',
                        invitedByName: user?.name ?? 'Avery Stone',
                        createdAtMs: nowMs,
                        expiresAtMs: nowMs + 7 * 24 * 60 * 60 * 1000,
                        acceptedAtMs: null,
                    },
                    ...current,
                ],
            });
            toast({
                title: 'Preview mode',
                description: `Invitation queued for ${inviteEmail} in the sample workspace.`,
            });
            dispatch({ type: 'resetInviteForm' });
            return;
        }
        if (!user?.id)
            return;
        dispatch({ type: 'setInviteSending', value: true });
        void createInvitation({
            email: inviteEmail,
            role: inviteRole,
            invitedBy: user.id,
            invitedByName: user?.name ?? null,
        })
            .then(() => {
            toast({
                title: 'Invitation created',
                description: `Invitation created for ${inviteEmail} as ${inviteRole}. Email delivery depends on server integration settings.`,
            });
            dispatch({ type: 'resetInviteForm' });
        })
            .catch((err: unknown) => {
            reportActionFailure({
                error: err,
                context: 'AdminUsers:handleInviteUser',
                title: 'Invitation failed',
            });
        })
            .finally(() => {
            dispatch({ type: 'setInviteSending', value: false });
        });
    };
    const handleResendInvitation = (invitation: AdminInvitationRecord) => {
        if (isPreviewMode) {
            const nowMs = Date.now();
            dispatch({
                type: 'setPreviewInvitations',
                value: (current) => current.map((record) => (record.id === invitation.id
                    ? {
                        ...record,
                        status: 'pending',
                        effectiveStatus: 'pending',
                        createdAtMs: nowMs,
                        expiresAtMs: nowMs + 7 * 24 * 60 * 60 * 1000,
                    }
                    : record)),
            });
            toast({ title: 'Preview mode', description: `Sample invitation resent to ${invitation.email}.` });
            return;
        }
        const actionKey = `resend:${invitation.id}`;
        dispatch({ type: 'setInvitationActionKey', value: actionKey });
        void resendInvitation({ id: invitation.id })
            .then(() => {
            toast({
                title: 'Invitation resent',
                description: `A fresh invitation was created for ${invitation.email}. Email delivery depends on server integration settings.`,
            });
        })
            .catch((err: unknown) => {
            reportActionFailure({
                error: err,
                context: 'AdminUsers:handleResendInvitation',
                title: 'Resend failed',
            });
        })
            .finally(() => {
            dispatch({
                type: 'setInvitationActionKey',
                value: (current) => (current === actionKey ? null : current),
            });
        });
    };
    const handleRevokeInvitation = (invitation: AdminInvitationRecord) => {
        if (isPreviewMode) {
            dispatch({
                type: 'setPreviewInvitations',
                value: (current) => current.map((record) => (record.id === invitation.id
                    ? { ...record, status: 'revoked', effectiveStatus: 'revoked' }
                    : record)),
            });
            toast({ title: 'Preview mode', description: `${invitation.email} was revoked in the sample workspace.` });
            return;
        }
        const actionKey = `revoke:${invitation.id}`;
        dispatch({ type: 'setInvitationActionKey', value: actionKey });
        void revokeInvitation({ id: invitation.id })
            .then(() => {
            toast({
                title: 'Invitation revoked',
                description: `${invitation.email} can no longer use this invitation token.`,
            });
        })
            .catch((err: unknown) => {
            reportActionFailure({
                error: err,
                context: 'AdminUsers:handleRevokeInvitation',
                title: 'Revoke failed',
            });
        })
            .finally(() => {
            dispatch({
                type: 'setInvitationActionKey',
                value: (current) => (current === actionKey ? null : current),
            });
        });
    };
    const handleRefresh = () => {
        if (loading)
            return;
        clearActionError();
        dispatch({
            type: 'refresh',
            previewUsers: isPreviewMode ? getPreviewAdminUsers() : state.previewUsers,
            previewInvitations: isPreviewMode ? getPreviewAdminInvitations() : state.previewInvitations,
        });
    };
    const handleInviteEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setInviteEmail', value: e.target.value });
    };
    const handleInviteRoleChange = (v: string) => {
        dispatch({ type: 'setInviteRole', value: v as AdminUserRole });
    };
    const handleInviteClose = () => {
        dispatch({ type: 'setInviteOpen', value: false });
    };
    const handleInviteOpenChange = (open: boolean) => {
        dispatch({ type: 'setInviteOpen', value: open });
    };
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setSearchTerm', value: event.target.value });
    };
    const handleStatusFilterChange = (value: string) => {
        dispatch({ type: 'setStatusFilter', value: value as StatusFilter });
    };
    const handleRoleFilterChange = (value: string) => {
        dispatch({ type: 'setRoleFilter', value: value as RoleFilter });
    };
    const handleInvitationSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setInvitationSearchTerm', value: event.target.value });
    };
    const handleInvitationStatusFilterChange = (value: string) => {
        dispatch({ type: 'setInvitationStatusFilter', value: value as InvitationLifecycleStatus });
    };
    const handleRevokeClose = () => {
        dispatch({ type: 'setRevokeOpen', value: false });
    };
    const handleDetailsClose = () => {
        dispatch({ type: 'setDetailsOpen', value: false });
    };
    const handleDetailsOpenChange = (open: boolean) => {
        dispatch({ type: 'setDetailsOpen', value: open });
        if (!open) {
            dispatch({ type: 'setSelectedUser', value: null });
        }
    };
    const handleRevokeOpenChange = (open: boolean) => {
        dispatch({ type: 'setRevokeOpen', value: open });
        if (!open) {
            dispatch({ type: 'setSelectedUser', value: null });
        }
    };
    const handleViewDetails = (userRecord: AdminUserRecord) => {
        dispatch({ type: 'setSelectedUser', value: userRecord });
        dispatch({ type: 'setDetailsOpen', value: true });
    };
    const handleRevokeAccess = (userRecord: AdminUserRecord) => {
        dispatch({ type: 'setSelectedUser', value: userRecord });
        dispatch({ type: 'setRevokeOpen', value: true });
    };
    const handleRevokeConfirm = () => {
        if (selectedUser) {
            handleApprovalToggle(selectedUser, false);
        }
        dispatch({ type: 'setRevokeOpen', value: false });
        dispatch({ type: 'setSelectedUser', value: null });
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
                context: 'AdminUsers:loadMore',
                title: 'Could not load more',
            });
        })
            .finally(() => {
            dispatch({ type: 'setLoadingMore', value: false });
        });
    };
    return {
        user,
        isPreviewMode,
        loading,
        summary,
        filteredUsers,
        filteredInvitations,
        invitationSummary,
        invitationsLoading,
        listQueryError,
        actionError,
        clearActionError,
        statusFilter,
        roleFilter,
        searchTerm,
        invitationSearchTerm,
        invitationStatusFilter,
        savingId,
        invitationActionKey,
        inviteOpen,
        revokeOpen,
        detailsOpen,
        selectedUser,
        inviteEmail,
        inviteRole,
        inviteSending,
        loadingMore,
        paginatedStatus: status,
        handleRefresh,
        handleRoleChange,
        handleApprovalToggle,
        handleInviteUser,
        handleResendInvitation,
        handleRevokeInvitation,
        handleInviteEmailChange,
        handleInviteRoleChange,
        handleInviteClose,
        handleInviteOpenChange,
        handleSearchChange,
        handleStatusFilterChange,
        handleRoleFilterChange,
        handleInvitationSearchChange,
        handleInvitationStatusFilterChange,
        handleRevokeClose,
        handleDetailsClose,
        handleDetailsOpenChange,
        handleRevokeOpenChange,
        handleViewDetails,
        handleRevokeAccess,
        handleRevokeConfirm,
        handleLoadMore,
    };
}
