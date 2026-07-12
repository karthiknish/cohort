'use client';
import { useCallback, useMemo } from 'react';
import { Link } from '@/shared/ui/link';
import { CircleAlert, MoreHorizontal, RefreshCw, ShieldCheck, Trash2, UserPlus, Users as UsersIcon, } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/shared/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { formatRelativeTime } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { ADMIN_USER_ROLES, type AdminUserRecord, type AdminUserRole } from '@/types/admin';
import { AdminActionErrorAlert } from '../components/admin-action-error-alert';
import { AdminQueryErrorAlert } from '../components/admin-query-error-alert';
import { AdminPageShell } from '../components/admin-page-shell';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { INVITATION_STATUSES, ROLE_ASSIGNABLE, STATUS_OPTIONS, invitationStatusLabel, roleLabel, statusLabel, type AdminInvitationRecord, type InvitationLifecycleStatus, } from './admin-users-types';
export function AdminUsersSignInRequired() {
    return (<div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <Card className="max-w-md border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg">Sign in required</CardTitle>
          <CardDescription>Log in to an admin account to approve new users.</CardDescription>
        </CardHeader>
      </Card>
    </div>);
}
function UserRow({ record, savingId, onRoleChange, onApprovalToggle, onViewDetails, onRevokeAccess, }: {
    record: AdminUserRecord;
    savingId: string | null;
    onRoleChange: (record: AdminUserRecord, role: AdminUserRole) => void;
    onApprovalToggle: (record: AdminUserRecord, approved: boolean) => void;
    onViewDetails: (user: AdminUserRecord) => void;
    onRevokeAccess: (user: AdminUserRecord) => void;
}) {
    const handleRoleChange = (value: string) => onRoleChange(record, value as AdminUserRole);
    const handleApprovalToggle = (checked: boolean | 'indeterminate') => onApprovalToggle(record, checked === true);
    const handleViewDetails = () => onViewDetails(record);
    const handleRevokeAccess = () => onRevokeAccess(record);
    return (<tr className="border-b border-muted/20">
      <th scope="row" className="py-3 px-3 text-left font-normal">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-medium">{record.name}</span>
            <span className="text-xs text-muted-foreground">{record.email}</span>
          </div>
        </div>
      </th>
      <td className="py-3 px-3">
        <Select value={record.role} onValueChange={handleRoleChange} disabled={savingId === record.id}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_ASSIGNABLE.map((role) => (<SelectItem key={role} value={role}>
                {roleLabel(role)}
              </SelectItem>))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-3 px-3 text-center">
        <Checkbox checked={record.status === 'active'} onCheckedChange={handleApprovalToggle} disabled={savingId === record.id}/>
      </td>
      <td className="py-3 px-3">
        <Badge variant={record.status === 'active' ? 'default' : 'secondary'}>
          {record.status}
        </Badge>
      </td>
      <td className="py-3 px-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" aria-label={`Actions for ${record.name}`}>
              <MoreHorizontal className="size-4" aria-hidden/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewDetails}>
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRevokeAccess} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 size-4"/>
              Revoke access
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>);
}
function UserCard({ record, savingId, onRoleChange, onApprovalToggle, onViewDetails, onRevokeAccess, }: {
    record: AdminUserRecord;
    savingId: string | null;
    onRoleChange: (record: AdminUserRecord, role: AdminUserRole) => void;
    onApprovalToggle: (record: AdminUserRecord, approved: boolean) => void;
    onViewDetails: (user: AdminUserRecord) => void;
    onRevokeAccess: (user: AdminUserRecord) => void;
}) {
    const handleRoleChange = (value: string) => onRoleChange(record, value as AdminUserRole);
    const handleApprovalToggle = (checked: boolean | 'indeterminate') => onApprovalToggle(record, checked === true);
    const handleViewDetails = () => onViewDetails(record);
    const handleRevokeAccess = () => onRevokeAccess(record);
    return (
        <div className="rounded-lg border border-muted/40 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{record.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{record.email}</div>
                </div>
                <Badge variant={record.status === 'active' ? 'default' : 'secondary'} className="shrink-0 capitalize">
                    {record.status}
                </Badge>
            </div>
            <div className="flex items-center gap-2">
                <Select value={record.role} onValueChange={handleRoleChange} disabled={savingId === record.id}>
                    <SelectTrigger className="h-9 flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {ROLE_ASSIGNABLE.map((role) => (<SelectItem key={role} value={role}>{roleLabel(role)}</SelectItem>))}
                    </SelectContent>
                </Select>
                <span className="flex h-9 items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Checkbox checked={record.status === 'active'} onCheckedChange={handleApprovalToggle} disabled={savingId === record.id} aria-label={`Toggle approval for ${record.name}`}/>
                    Active
                </span>
            </div>

            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleViewDetails} className="flex-1">
                    View details
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleRevokeAccess} className="text-destructive hover:text-destructive">
                    <Trash2 className="size-4"/>
                </Button>
            </div>
        </div>
    );
}
function InvitationRow({ invitation, invitationActionKey, onResend, onRevoke, }: {
    invitation: AdminInvitationRecord;
    invitationActionKey: string | null;
    onResend: (invitation: AdminInvitationRecord) => void;
    onRevoke: (invitation: AdminInvitationRecord) => void;
}) {
    const isLoading = invitationActionKey === invitation.id;
    const handleResend = () => onResend(invitation);
    const handleRevoke = () => onRevoke(invitation);
    return (<tr className="border-b border-muted/20">
      <th scope="row" className="py-3 px-3 text-left font-normal">
        <div className="flex flex-col">
          <span className="font-medium">{invitation.name || invitation.email}</span>
          {invitation.name && <span className="text-xs text-muted-foreground">{invitation.email}</span>}
        </div>
      </th>
      <td className="py-3 px-3">
        <Badge variant="outline">{invitation.role}</Badge>
      </td>
      <td className="py-3 px-3">
        <Badge variant={invitation.effectiveStatus === 'accepted'
            ? 'default'
            : invitation.effectiveStatus === 'expired'
                ? 'destructive'
                : invitation.effectiveStatus === 'revoked'
                    ? 'secondary'
                    : 'outline'}>
          {invitation.effectiveStatus}
        </Badge>
      </td>
      <td className="py-3 px-3 text-sm text-muted-foreground">
        {formatRelativeTime(invitation.createdAtMs)}
      </td>
      <td className="py-3 px-3 text-sm text-muted-foreground">
        {formatRelativeTime(invitation.expiresAtMs)}
      </td>
      <td className="py-3 px-3 text-sm text-muted-foreground">
        {invitation.invitedByName || invitation.invitedBy}
      </td>
      <td className="py-3 text-right">
        <div className="flex justify-end gap-2">
          {invitation.effectiveStatus === 'pending' && (<Button variant="outline" size="sm" onClick={handleResend} disabled={isLoading}>
              Resend
            </Button>)}
          {(invitation.effectiveStatus === 'pending' || invitation.effectiveStatus === 'expired') && (<Button variant="outline" size="sm" onClick={handleRevoke} disabled={isLoading} className="text-destructive hover:text-destructive">
              Revoke
            </Button>)}
        </div>
      </td>
    </tr>);
}
function InvitationCard({ invitation, invitationActionKey, onResend, onRevoke, }: {
    invitation: AdminInvitationRecord;
    invitationActionKey: string | null;
    onResend: (invitation: AdminInvitationRecord) => void;
    onRevoke: (invitation: AdminInvitationRecord) => void;
}) {
    const isLoading = invitationActionKey === invitation.id;
    const handleResend = () => onResend(invitation);
    const handleRevoke = () => onRevoke(invitation);
    return (
        <div className="rounded-lg border border-muted/40 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{invitation.name || invitation.email}</div>
                    {invitation.name && <div className="text-xs text-muted-foreground truncate">{invitation.email}</div>}
                </div>
                <Badge variant={invitation.effectiveStatus === 'accepted' ? 'default' : invitation.effectiveStatus === 'expired' ? 'destructive' : invitation.effectiveStatus === 'revoked' ? 'secondary' : 'outline'} className="shrink-0 capitalize">
                    {invitation.effectiveStatus}
                </Badge>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{invitation.role}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <div><span className="font-medium text-foreground/70">Sent:</span> {formatRelativeTime(invitation.createdAtMs)}</div>
                <div><span className="font-medium text-foreground/70">Expires:</span> {formatRelativeTime(invitation.expiresAtMs)}</div>
                <div className="col-span-2"><span className="font-medium text-foreground/70">Invited by:</span> {invitation.invitedByName || invitation.invitedBy}</div>
            </div>
            {(invitation.effectiveStatus === 'pending' || invitation.effectiveStatus === 'expired') && (
                <div className="flex gap-2">
                    {invitation.effectiveStatus === 'pending' && (
                        <Button variant="outline" size="sm" onClick={handleResend} disabled={isLoading} className="flex-1">Resend</Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleRevoke} disabled={isLoading} className="text-destructive hover:text-destructive flex-1">Revoke</Button>
                </div>
            )}
        </div>
    );
}
type AdminUsersSummaryCardsProps = {
    summary: {
        total: number;
        pending: number;
        internal: number;
        clients: number;
    };
    loading: boolean;
};
export function AdminUsersSummaryCards({ summary, loading }: AdminUsersSummaryCardsProps) {
    return (<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total users</CardTitle>
          <UsersIcon className={cn('size-4 text-muted-foreground', loading && 'animate-spin')}/>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-14"/> : <div className="text-2xl font-semibold">{summary.total}</div>}
          <p className="text-xs text-muted-foreground">All accounts in your organisation</p>
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending approval</CardTitle>
          <CircleAlert className="size-4 text-warning"/>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-14"/> : <div className="text-2xl font-semibold">{summary.pending}</div>}
          <p className="text-xs text-muted-foreground">Awaiting activation</p>
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Internal team</CardTitle>
          <ShieldCheck className="size-4 text-primary"/>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-14"/> : <div className="text-2xl font-semibold">{summary.internal}</div>}
          <p className="text-xs text-muted-foreground">Admins and internal team accounts</p>
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Client access</CardTitle>
          <UsersIcon className="size-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-14"/> : <div className="text-2xl font-semibold">{summary.clients}</div>}
          <p className="text-xs text-muted-foreground">Accounts currently marked as client users</p>
        </CardContent>
      </Card>
    </div>);
}
type AdminUsersDirectorySectionProps = {
    loading: boolean;
    listQueryError: string | null;
    actionError: string | null;
    clearActionError: () => void;
    searchTerm: string;
    statusFilter: string;
    roleFilter: string;
    filteredUsers: AdminUserRecord[];
    savingId: string | null;
    paginatedStatus: string;
    loadingMore: boolean;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onStatusFilterChange: (value: string) => void;
    onRoleFilterChange: (value: string) => void;
    onRoleChange: (record: AdminUserRecord, role: AdminUserRole) => void;
    onApprovalToggle: (record: AdminUserRecord, approved: boolean) => void;
    onViewDetails: (user: AdminUserRecord) => void;
    onRevokeAccess: (user: AdminUserRecord) => void;
    onLoadMore: () => void;
};
export function AdminUsersDirectorySection({ loading, listQueryError, actionError, clearActionError, searchTerm, statusFilter, roleFilter, filteredUsers, savingId, paginatedStatus, loadingMore, onSearchChange, onStatusFilterChange, onRoleFilterChange, onRoleChange, onApprovalToggle, onViewDetails, onRevokeAccess, onLoadMore, }: AdminUsersDirectorySectionProps) {
    const usersTableSkeleton = (<div className="space-y-3">
      {['user-skeleton-a', 'user-skeleton-b', 'user-skeleton-c', 'user-skeleton-d', 'user-skeleton-e'].map((key) => (<div key={key} className="flex items-center gap-4 rounded-md border border-muted/40 px-3 py-3">
          <Skeleton className="size-9 rounded-full"/>
          <Skeleton className="h-4 w-40"/>
          <Skeleton className="h-8 w-28 rounded-md"/>
          <Skeleton className="ml-auto h-8 w-20 rounded-md"/>
        </div>))}
    </div>);
    return (<Card className="border-muted/60 bg-background">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle className="text-lg">Account directory</CardTitle>
          <CardDescription>Filter by status or role, approve users, and assign access. Internal staffing and client ownership are managed on the Team and Client pages.</CardDescription>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
          <Input placeholder="Search by name or email" value={searchTerm} onChange={onSearchChange} className="lg:w-64"/>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="Filter by status"/>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (<SelectItem key={status} value={status}>
                  {statusLabel(status)}
                </SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="Filter by role"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ADMIN_USER_ROLES.map((role) => (<SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <PageSkeletonBoundary loading={loading && filteredUsers.length === 0} loadingContent={usersTableSkeleton}>
        <CardContent className="space-y-4">
          <AdminQueryErrorAlert error={listQueryError} title="Unable to load workspace data"/>
          <AdminActionErrorAlert error={actionError} onDismiss={clearActionError}/>

          {/* Mobile card layout */}
          <div className="space-y-3 lg:hidden">
            {filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {loading ? 'Loading users…' : listQueryError ? listQueryError : 'No users match the current filters.'}
              </div>
            ) : filteredUsers.map((record) => (
              <UserCard key={record.id} record={record} savingId={savingId} onRoleChange={onRoleChange} onApprovalToggle={onApprovalToggle} onViewDetails={onViewDetails} onRevokeAccess={onRevokeAccess}/>
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden overflow-x-auto rounded-md border border-muted/40 lg:block">
            <table className="min-w-full table-fixed text-left text-sm">
              <caption className="sr-only">Workspace users, roles, and approval status</caption>
              <thead>
                <tr className="border-b border-muted/40">
                  <th scope="col" className="w-72 py-2 px-3 font-medium">User</th>
                  <th scope="col" className="w-32 py-2 px-3 font-medium">Role</th>
                  <th scope="col" className="w-32 py-2 px-3 text-center font-medium">Approved</th>
                  <th scope="col" className="w-32 py-2 px-3 font-medium">Status</th>
                  <th scope="col" className="py-2 px-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (<tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      {loading
                  ? 'Loading users…'
                  : listQueryError
                      ? listQueryError
                      : 'No users match the current filters.'}
                    </td>
                  </tr>) : (filteredUsers.map((record) => (<UserRow key={record.id} record={record} savingId={savingId} onRoleChange={onRoleChange} onApprovalToggle={onApprovalToggle} onViewDetails={onViewDetails} onRevokeAccess={onRevokeAccess}/>)))}
              </tbody>
            </table>
          </div>

          {paginatedStatus === 'CanLoadMore' ? (<div className="mt-6 flex justify-center">
              <Button type="button" variant="outline" onClick={onLoadMore} disabled={loadingMore} className="inline-flex items-center gap-2">
                {loadingMore ? <RefreshCw className="size-4 animate-spin"/> : <RefreshCw className="size-4"/>}
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            </div>) : null}
        </CardContent>
      </PageSkeletonBoundary>
    </Card>);
}
type AdminUsersInvitationsSectionProps = {
    invitationSearchTerm: string;
    invitationStatusFilter: InvitationLifecycleStatus;
    invitationSummary: Record<InvitationLifecycleStatus, number>;
    invitationsLoading: boolean;
    filteredInvitations: AdminInvitationRecord[];
    invitationActionKey: string | null;
    onInvitationSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInvitationStatusFilterChange: (value: string) => void;
    onResend: (invitation: AdminInvitationRecord) => void;
    onRevoke: (invitation: AdminInvitationRecord) => void;
};
export function AdminUsersInvitationsSection({ invitationSearchTerm, invitationStatusFilter, invitationSummary, invitationsLoading, filteredInvitations, invitationActionKey, onInvitationSearchChange, onInvitationStatusFilterChange, onResend, onRevoke, }: AdminUsersInvitationsSectionProps) {
    const invitationsSkeleton = (<div className="space-y-3">
      {['invite-skeleton-a', 'invite-skeleton-b', 'invite-skeleton-c', 'invite-skeleton-d', 'invite-skeleton-e'].map((key) => (<div key={key} className="flex items-center gap-4 rounded-md border border-muted/40 px-3 py-3">
          <Skeleton className="size-9 rounded-full"/>
          <Skeleton className="h-4 w-40"/>
          <Skeleton className="h-8 w-28 rounded-md"/>
          <Skeleton className="ml-auto h-8 w-20 rounded-md"/>
        </div>))}
    </div>);
    return (<Card className="border-muted/60 bg-background">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle className="text-lg">Invitation lifecycle</CardTitle>
          <CardDescription>
            Track pending, accepted, expired, and revoked invitations. Resend expired invites or revoke outstanding ones.
          </CardDescription>
        </div>
        <Input value={invitationSearchTerm} onChange={onInvitationSearchChange} placeholder="Search invitations by name or email" className="lg:w-72"/>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={invitationStatusFilter} onValueChange={onInvitationStatusFilterChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            {INVITATION_STATUSES.map((status) => (<TabsTrigger key={status} value={status} className="capitalize">
                {invitationStatusLabel(status)} ({invitationSummary[status]})
              </TabsTrigger>))}
          </TabsList>
        </Tabs>

        {/* Mobile card layout */}
        <div className="space-y-3 lg:hidden">
          {invitationsLoading && filteredInvitations.length === 0 ? (invitationsSkeleton) : filteredInvitations.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No invitations match this lifecycle status and search.
            </div>
          ) : filteredInvitations.map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation} invitationActionKey={invitationActionKey} onResend={onResend} onRevoke={onRevoke}/>
          ))}
        </div>

        {/* Desktop table layout */}
        <div className="hidden overflow-x-auto rounded-md border border-muted/40 lg:block">
          <table className="min-w-full table-fixed text-left text-sm">
            <caption className="sr-only">Invitation lifecycle by status</caption>
            <thead>
              <tr className="border-b border-muted/40">
                <th scope="col" className="w-64 py-2 px-3 font-medium">Invitee</th>
                <th scope="col" className="w-28 py-2 px-3 font-medium">Role</th>
                <th scope="col" className="w-28 py-2 px-3 font-medium">Status</th>
                <th scope="col" className="w-36 py-2 px-3 font-medium">Sent</th>
                <th scope="col" className="w-36 py-2 px-3 font-medium">Expires</th>
                <th scope="col" className="w-44 py-2 px-3 font-medium">Invited by</th>
                <th scope="col" className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invitationsLoading && filteredInvitations.length === 0 ? (<tr>
                  <td colSpan={7} className="py-3">
                    {invitationsSkeleton}
                  </td>
                </tr>) : filteredInvitations.length === 0 ? (<tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No invitations match this lifecycle status and search.
                  </td>
                </tr>) : (filteredInvitations.map((invitation) => (<InvitationRow key={invitation.id} invitation={invitation} invitationActionKey={invitationActionKey} onResend={onResend} onRevoke={onRevoke}/>)))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>);
}
type AdminUsersPageActionsProps = {
    loading: boolean;
    inviteOpen: boolean;
    inviteEmail: string;
    inviteRole: string;
    inviteSending: boolean;
    onRefresh: () => void;
    onInviteOpenChange: (open: boolean) => void;
    onInviteEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInviteRoleChange: (value: string) => void;
    onInviteClose: () => void;
    onInviteUser: () => void;
};
export function AdminUsersPageActions({ loading, inviteOpen, inviteEmail, inviteRole, inviteSending, onRefresh, onInviteOpenChange, onInviteEmailChange, onInviteRoleChange, onInviteClose, onInviteUser, }: AdminUsersPageActionsProps) {
    return (<>
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/team">Team management</Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/clients">Client workspaces</Link>
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2">
        <RefreshCw className={cn('size-4', loading && 'animate-spin')}/> Refresh
      </Button>
      <Dialog open={inviteOpen} onOpenChange={onInviteOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <UserPlus className="size-4"/> Invite user
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite new user</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a new member to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" placeholder="colleague@company.com" value={inviteEmail} onChange={onInviteEmailChange}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={onInviteRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Team Member</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onInviteClose} disabled={inviteSending}>Cancel</Button>
            <Button onClick={onInviteUser} disabled={!inviteEmail || inviteSending}>
              {inviteSending ? 'Sending…' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>);
}
type AdminUsersRevokeDialogProps = {
    revokeOpen: boolean;
    selectedUser: AdminUserRecord | null;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
    onConfirm: () => void;
};
export function AdminUsersRevokeDialog({ revokeOpen, selectedUser, onOpenChange, onClose, onConfirm, }: AdminUsersRevokeDialogProps) {
    return (<Dialog open={revokeOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke access?</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke access for <strong>{selectedUser?.name}</strong>? They will no longer be able to sign in.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Revoke Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
type AdminUsersDetailDialogProps = {
    detailsOpen: boolean;
    selectedUser: AdminUserRecord | null;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
};
export function AdminUsersDetailDialog({ detailsOpen, selectedUser, onOpenChange, onClose, }: AdminUsersDetailDialogProps) {
    return (<Dialog open={detailsOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedUser?.name ?? 'User details'}</DialogTitle>
          <DialogDescription>{selectedUser?.email ?? 'Account information'}</DialogDescription>
        </DialogHeader>
        {selectedUser ? (<dl className="grid gap-3 py-2 text-sm">
            <div className="grid grid-cols-[7rem_1fr] gap-2">
              <dt className="text-muted-foreground">Role</dt>
              <dd>{roleLabel(selectedUser.role)}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-2">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="capitalize">{selectedUser.status.replace('_', ' ')}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-2">
              <dt className="text-muted-foreground">Workspace</dt>
              <dd>{selectedUser.agencyId ?? '—'}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-2">
              <dt className="text-muted-foreground">Created</dt>
              <dd>{selectedUser.createdAt ? formatRelativeTime(selectedUser.createdAt) : '—'}</dd>
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-2">
              <dt className="text-muted-foreground">Last login</dt>
              <dd>{selectedUser.lastLoginAt ? formatRelativeTime(selectedUser.lastLoginAt) : 'Never'}</dd>
            </div>
          </dl>) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
type AdminUsersPageContentProps = {
    isPreviewMode: boolean;
    loading: boolean;
    summary: {
        total: number;
        pending: number;
        internal: number;
        clients: number;
    };
    listQueryError: string | null;
    actionError: string | null;
    clearActionError: () => void;
    searchTerm: string;
    statusFilter: string;
    roleFilter: string;
    filteredUsers: AdminUserRecord[];
    savingId: string | null;
    paginatedStatus: string;
    loadingMore: boolean;
    invitationSearchTerm: string;
    invitationStatusFilter: InvitationLifecycleStatus;
    invitationSummary: Record<InvitationLifecycleStatus, number>;
    invitationsLoading: boolean;
    filteredInvitations: AdminInvitationRecord[];
    invitationActionKey: string | null;
    inviteOpen: boolean;
    inviteEmail: string;
    inviteRole: string;
    inviteSending: boolean;
    revokeOpen: boolean;
    detailsOpen: boolean;
    selectedUser: AdminUserRecord | null;
    onRefresh: () => void;
    onInviteOpenChange: (open: boolean) => void;
    onInviteEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInviteRoleChange: (value: string) => void;
    onInviteClose: () => void;
    onInviteUser: () => void;
    onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onStatusFilterChange: (value: string) => void;
    onRoleFilterChange: (value: string) => void;
    onRoleChange: (record: AdminUserRecord, role: AdminUserRole) => void;
    onApprovalToggle: (record: AdminUserRecord, approved: boolean) => void;
    onViewDetails: (user: AdminUserRecord) => void;
    onRevokeAccess: (user: AdminUserRecord) => void;
    onLoadMore: () => void;
    onInvitationSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInvitationStatusFilterChange: (value: string) => void;
    onResendInvitation: (invitation: AdminInvitationRecord) => void;
    onRevokeInvitation: (invitation: AdminInvitationRecord) => void;
    onDetailsOpenChange: (open: boolean) => void;
    onDetailsClose: () => void;
    onRevokeOpenChange: (open: boolean) => void;
    onRevokeClose: () => void;
    onRevokeConfirm: () => void;
};
export function AdminUsersPageContent(props: AdminUsersPageContentProps) {
    const { isPreviewMode, loading, summary, listQueryError, actionError, clearActionError, searchTerm, statusFilter, roleFilter, filteredUsers, savingId, paginatedStatus, loadingMore, invitationSearchTerm, invitationStatusFilter, invitationSummary, invitationsLoading, filteredInvitations, invitationActionKey, inviteOpen, inviteEmail, inviteRole, inviteSending, revokeOpen, detailsOpen, selectedUser, onRefresh, onInviteOpenChange, onInviteEmailChange, onInviteRoleChange, onInviteClose, onInviteUser, onSearchChange, onStatusFilterChange, onRoleFilterChange, onRoleChange, onApprovalToggle, onViewDetails, onRevokeAccess, onLoadMore, onInvitationSearchChange, onInvitationStatusFilterChange, onResendInvitation, onRevokeInvitation, onDetailsOpenChange, onDetailsClose, onRevokeOpenChange, onRevokeClose, onRevokeConfirm, } = props;
    const pageActions = (<AdminUsersPageActions loading={loading} inviteOpen={inviteOpen} inviteEmail={inviteEmail} inviteRole={inviteRole} inviteSending={inviteSending} onRefresh={onRefresh} onInviteOpenChange={onInviteOpenChange} onInviteEmailChange={onInviteEmailChange} onInviteRoleChange={onInviteRoleChange} onInviteClose={onInviteClose} onInviteUser={onInviteUser}/>);
    return (<>
      <AdminPageShell title="Users and approvals" description={<>
            Approve new accounts and assign access. Use Team management for internal staffing and Client workspaces for client allocation.
            {isPreviewMode ? ' Preview mode keeps user changes local to this session.' : ''}
          </>} isPreviewMode={isPreviewMode} actions={pageActions}>
        <AdminUsersSummaryCards summary={summary} loading={loading}/>
        <AdminUsersDirectorySection loading={loading} listQueryError={listQueryError} actionError={actionError} clearActionError={clearActionError} searchTerm={searchTerm} statusFilter={statusFilter} roleFilter={roleFilter} filteredUsers={filteredUsers} savingId={savingId} paginatedStatus={paginatedStatus} loadingMore={loadingMore} onSearchChange={onSearchChange} onStatusFilterChange={onStatusFilterChange} onRoleFilterChange={onRoleFilterChange} onRoleChange={onRoleChange} onApprovalToggle={onApprovalToggle} onViewDetails={onViewDetails} onRevokeAccess={onRevokeAccess} onLoadMore={onLoadMore}/>
        <AdminUsersInvitationsSection invitationSearchTerm={invitationSearchTerm} invitationStatusFilter={invitationStatusFilter} invitationSummary={invitationSummary} invitationsLoading={invitationsLoading} filteredInvitations={filteredInvitations} invitationActionKey={invitationActionKey} onInvitationSearchChange={onInvitationSearchChange} onInvitationStatusFilterChange={onInvitationStatusFilterChange} onResend={onResendInvitation} onRevoke={onRevokeInvitation}/>
      </AdminPageShell>

      <AdminUsersDetailDialog detailsOpen={detailsOpen} selectedUser={selectedUser} onOpenChange={onDetailsOpenChange} onClose={onDetailsClose}/>

      <AdminUsersRevokeDialog revokeOpen={revokeOpen} selectedUser={selectedUser} onOpenChange={onRevokeOpenChange} onClose={onRevokeClose} onConfirm={onRevokeConfirm}/>
    </>);
}
