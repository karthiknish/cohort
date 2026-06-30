import { getPreviewAdminUsers } from '@/lib/preview-data';
import { ADMIN_USER_ROLES, ADMIN_USER_STATUSES, type AdminUserRecord, type AdminUserRole, type AdminUserStatus } from '@/types/admin';
export type UserStatus = AdminUserStatus;
export type StatusFilter = 'all' | AdminUserStatus;
export type RoleFilter = 'all' | AdminUserRole;
export const ROLE_OPTIONS = ADMIN_USER_ROLES.filter((role) => role !== 'client');
export const STATUS_OPTIONS: StatusFilter[] = ['all', ...ADMIN_USER_STATUSES];
export const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function looksLikeEmail(value: string): boolean {
    return EMAIL_LIKE.test(value.trim());
}
export type AdminUserRow = {
    legacyId: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    status?: string | null;
    agencyId?: string | null;
    createdAtMs?: number | null;
    updatedAtMs?: number | null;
};
export function isAdminUserRole(value: unknown): value is AdminUserRole {
    return typeof value === 'string' && ADMIN_USER_ROLES.includes(value as AdminUserRole);
}
export function isAdminUserStatus(value: unknown): value is AdminUserStatus {
    return typeof value === 'string' && ADMIN_USER_STATUSES.includes(value as AdminUserStatus);
}
export type AdminTeamPageState = {
    usersOverride: AdminUserRecord[] | null;
    previewUsers: AdminUserRecord[];
    loadingMore: boolean;
    statusFilter: StatusFilter;
    roleFilter: RoleFilter;
    searchTerm: string;
    savingId: string | null;
    inviteOpen: boolean;
    inviteEmail: string;
    inviteRole: AdminUserRole;
    inviteSending: boolean;
};
export type AdminTeamPageAction = {
    type: 'setUsersOverride';
    value: AdminUserRecord[] | null | ((prev: AdminUserRecord[] | null) => AdminUserRecord[] | null);
} | {
    type: 'setPreviewUsers';
    value: AdminUserRecord[] | ((prev: AdminUserRecord[]) => AdminUserRecord[]);
} | {
    type: 'setLoadingMore';
    value: boolean;
} | {
    type: 'setStatusFilter';
    value: StatusFilter;
} | {
    type: 'setRoleFilter';
    value: RoleFilter;
} | {
    type: 'setSearchTerm';
    value: string;
} | {
    type: 'setSavingId';
    value: string | null;
} | {
    type: 'setInviteOpen';
    value: boolean;
} | {
    type: 'setInviteEmail';
    value: string;
} | {
    type: 'setInviteRole';
    value: AdminUserRole;
} | {
    type: 'setInviteSending';
    value: boolean;
} | {
    type: 'resetInviteForm';
} | {
    type: 'clearFilters';
} | {
    type: 'refresh';
    previewUsers: AdminUserRecord[];
};
export function createInitialAdminTeamPageState(): AdminTeamPageState {
    return {
        usersOverride: null,
        previewUsers: getPreviewAdminUsers(),
        loadingMore: false,
        statusFilter: 'all',
        roleFilter: 'all',
        searchTerm: '',
        savingId: null,
        inviteOpen: false,
        inviteEmail: '',
        inviteRole: 'team',
        inviteSending: false,
    };
}
export function adminTeamPageReducer(state: AdminTeamPageState, action: AdminTeamPageAction): AdminTeamPageState {
    switch (action.type) {
        case 'setUsersOverride':
            return {
                ...state,
                usersOverride: typeof action.value === 'function' ? action.value(state.usersOverride) : action.value,
            };
        case 'setPreviewUsers':
            return {
                ...state,
                previewUsers: typeof action.value === 'function' ? action.value(state.previewUsers) : action.value,
            };
        case 'setLoadingMore':
            return { ...state, loadingMore: action.value };
        case 'setStatusFilter':
            return { ...state, statusFilter: action.value };
        case 'setRoleFilter':
            return { ...state, roleFilter: action.value };
        case 'setSearchTerm':
            return { ...state, searchTerm: action.value };
        case 'setSavingId':
            return { ...state, savingId: action.value };
        case 'setInviteOpen':
            return { ...state, inviteOpen: action.value };
        case 'setInviteEmail':
            return { ...state, inviteEmail: action.value };
        case 'setInviteRole':
            return { ...state, inviteRole: action.value };
        case 'setInviteSending':
            return { ...state, inviteSending: action.value };
        case 'resetInviteForm':
            return { ...state, inviteOpen: false, inviteEmail: '', inviteRole: 'team' };
        case 'clearFilters':
            return { ...state, statusFilter: 'all', roleFilter: 'all', searchTerm: '' };
        case 'refresh':
            return {
                ...state,
                statusFilter: 'all',
                roleFilter: 'all',
                searchTerm: '',
                usersOverride: null,
                previewUsers: action.previewUsers,
            };
        default:
            return state;
    }
}
export function deriveNextStatus(status: UserStatus): UserStatus {
    if (status === 'disabled' || status === 'suspended') {
        return 'active';
    }
    if (status === 'active') {
        return 'disabled';
    }
    return 'active';
}
export function statusActionLabel(status: UserStatus): string {
    switch (status) {
        case 'active':
            return 'Disable access';
        case 'disabled':
            return 'Activate';
        case 'suspended':
            return 'Reinstate';
        case 'pending':
            return 'Approve access';
        case 'invited':
            return 'Activate';
        default:
            return 'Activate';
    }
}
export function statusToVariant(status: UserStatus) {
    switch (status) {
        case 'active':
            return 'default' as const;
        case 'disabled':
        case 'suspended':
            return 'destructive' as const;
        case 'invited':
        case 'pending':
            return 'secondary' as const;
    }
}
