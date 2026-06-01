'use client';
import { useCallback, useMemo, useState } from 'react';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { api } from '/_generated/api';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { getPreviewAdminUsers } from '@/lib/preview-data';
import { buildClientAllocationSummary, countUnmatchedClientAllocations, filterAllocationClients, getAssignableWorkspaceUsers, normalizeAllocationUsers, type AllocationUserRow, } from '../../lib/client-allocation';
import { useAdminClients } from './use-admin-clients';
import type { ClientRecord } from '../admin-clients-types';
export function useAdminClientsPage() {
    const { user } = useAuth();
    const { isPreviewMode } = usePreview();
    const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : 'skip');
    const workspaceId = workspaceContext?.workspaceId ?? null;
    const includeAllWorkspaces = workspaceContext?.role === 'admin';
    const workspaceQueryError = useConvexQueryError({
        data: workspaceContext,
        skipped: isPreviewMode || !user,
        loading: !isPreviewMode && Boolean(user) && workspaceContext === undefined,
        fallbackMessage: 'Unable to load workspace context.',
    });
    const adminClients = useAdminClients();
    const { results: adminUserRows } = usePaginatedQuery(api.adminUsers.listUsers, !isPreviewMode && workspaceId
        ? {
            workspaceId,
            includeAllWorkspaces,
        }
        : 'skip', { initialNumItems: 200 });
    const [clientSearch, setClientSearch] = useState('');
    const assignableUsers = (() => {
        if (isPreviewMode) {
            return getAssignableWorkspaceUsers(getPreviewAdminUsers().map((row) => ({
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role,
                status: row.status,
            })));
        }
        const normalizedUsers = normalizeAllocationUsers((adminUserRows ?? []) as AllocationUserRow[]);
        return getAssignableWorkspaceUsers(normalizedUsers);
    })();
    const allocationSummary = buildClientAllocationSummary(assignableUsers, adminClients.clients);
    const filteredClients = filterAllocationClients(adminClients.clients, clientSearch);
    const unmatchedByClientId = countUnmatchedClientAllocations(allocationSummary.unmatched);
    const handleRefresh = () => void adminClients.loadClients();
    const handleFormSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        void adminClients.handleCreateClient();
    };
    const handleClientNameChange = (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setClientName(event.target.value);
    const handleAccountManagerChange = (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setClientAccountManager(event.target.value);
    const handleClientSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => setClientSearch(event.target.value);
    const handleUpdateTeamMemberName = (key: string, value: string) => adminClients.updateTeamMemberField(key, 'name', value);
    const handleUpdateTeamMemberRole = (key: string, value: string) => adminClients.updateTeamMemberField(key, 'role', value);
    const handleCancelDelete = () => adminClients.handleDeleteDialogChange(false);
    const handleConfirmDelete = () => void adminClients.handleDeleteClient();
    const handleMemberNameChange = (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setMemberName(event.target.value);
    const handleMemberRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setMemberRole(event.target.value);
    const handleCancelTeamDialog = () => adminClients.handleTeamDialogChange(false);
    const handleConfirmAddTeamMember = () => void adminClients.handleAddTeamMember();
    const handleRemoveTeamMemberStable = (client: ClientRecord, memberName: string) => void adminClients.handleRemoveTeamMember(client, memberName);
    const handleEditTeamMemberRoleStable = (client: ClientRecord, member: {
        name: string;
        role: string;
    }) => adminClients.requestEditTeamMemberRole(client, member);
    const handleEditingMemberRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => adminClients.setEditingMemberRole(event.target.value);
    const handleCancelEditRoleDialog = () => adminClients.handleEditRoleDialogChange(false);
    const handleConfirmEditTeamMemberRole = () => void adminClients.handleUpdateTeamMemberRole();
    return {
        user,
        isPreviewMode,
        workspaceQueryError,
        assignableUsers,
        allocationSummary,
        filteredClients,
        unmatchedByClientId,
        clientSearch,
        ...adminClients,
        handleRefresh,
        handleFormSubmit,
        handleClientNameChange,
        handleAccountManagerChange,
        handleClientSearchChange,
        handleUpdateTeamMemberName,
        handleUpdateTeamMemberRole,
        handleCancelDelete,
        handleConfirmDelete,
        handleMemberNameChange,
        handleMemberRoleChange,
        handleCancelTeamDialog,
        handleConfirmAddTeamMember,
        handleRemoveTeamMemberStable,
        handleEditTeamMemberRoleStable,
        handleEditingMemberRoleChange,
        handleCancelEditRoleDialog,
        handleConfirmEditTeamMemberRole,
    };
}
