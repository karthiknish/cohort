'use client';
import { Link } from '@/shared/ui/link';
import { CircleAlert, LoaderCircle, RefreshCw, ShieldCheck, UserCheck, UserMinus, UserPlus, Users as UsersIcon, } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { AdminUserRecord } from '@/types/admin';
import type { ChangeEvent, FormEvent } from 'react';
import { AdminActionErrorAlert } from '../components/admin-action-error-alert';
import { AdminQueryErrorAlert } from '../components/admin-query-error-alert';
import { AdminPageShell } from '../components/admin-page-shell';
import type { buildClientAllocationSummary } from '../lib/client-allocation';
import { ROLE_OPTIONS, STATUS_OPTIONS, statusActionLabel, statusToVariant, type UserStatus, } from './admin-team-types';
function formatDate(value: string | null): string {
    return formatDateLib(value, DATE_FORMATS.WITH_TIME, undefined, '—');
}
function ActionIcon({ status }: {
    status: UserStatus;
}) {
    if (status === 'active') {
        return <UserMinus className="size-4"/>;
    }
    if (status === 'disabled' || status === 'suspended') {
        return <UserCheck className="size-4"/>;
    }
    return <CircleAlert className="size-4"/>;
}
export function AdminTeamSignInRequired() {
    return (<div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
      <Card className="max-w-md border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg">Sign in required</CardTitle>
          <CardDescription>Log in to an admin account to manage your team.</CardDescription>
        </CardHeader>
      </Card>
    </div>);
}
type AdminTeamSummaryCardsProps = {
    summary: {
        total: number;
        active: number;
        admins: number;
        allocated: number;
    };
    loading: boolean;
};
export function AdminTeamSummaryCards({ summary, loading }: AdminTeamSummaryCardsProps) {
    return (<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total teammates</CardTitle>
          <UsersIcon className={cn('size-4 text-muted-foreground', loading && 'animate-spin')}/>
        </CardHeader>
        <CardContent>
          {loading ? (<div className="h-8 w-14 animate-pulse rounded-md bg-muted" aria-hidden/>) : (<div className="text-2xl font-semibold">{summary.total}</div>)}
          <p className="text-xs text-muted-foreground">In this workspace</p>
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active accounts</CardTitle>
          <UserCheck className="size-4 text-success"/>
        </CardHeader>
        <CardContent>
          {loading ? (<div className="h-8 w-14 animate-pulse rounded-md bg-muted" aria-hidden/>) : (<div className="text-2xl font-semibold">{summary.active}</div>)}
          <p className="text-xs text-muted-foreground">Currently enabled</p>
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administrators</CardTitle>
          <ShieldCheck className="size-4 text-primary"/>
        </CardHeader>
        <CardContent>
          {loading ? (<div className="h-8 w-14 animate-pulse rounded-md bg-muted" aria-hidden/>) : (<div className="text-2xl font-semibold">{summary.admins}</div>)}
          <p className="text-xs text-muted-foreground">Including yourself</p>
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="flex flex-row items-center justify-between gap-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Allocated to clients</CardTitle>
          <UsersIcon className="size-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent>
          {loading ? (<div className="h-8 w-14 animate-pulse rounded-md bg-muted" aria-hidden/>) : (<div className="text-2xl font-semibold">{summary.allocated}</div>)}
          <p className="text-xs text-muted-foreground">Internal users attached to at least one client</p>
        </CardContent>
      </Card>
    </div>);
}
type AdminTeamInviteDialogProps = {
    inviteOpen: boolean;
    inviteEmail: string;
    inviteEmailTrimmed: string;
    inviteEmailValid: boolean;
    inviteRole: string;
    inviteSending: boolean;
    onOpenChange: (open: boolean) => void;
    onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onRoleChange: (value: string) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};
export function AdminTeamInviteDialog({ inviteOpen, inviteEmail, inviteEmailTrimmed, inviteEmailValid, inviteRole, inviteSending, onOpenChange, onEmailChange, onRoleChange, onClose, onSubmit, }: AdminTeamInviteDialogProps) {
    return (<Dialog open={inviteOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="size-4"/> Invite user
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite new user</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a team member, client contact, or admin to your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-team-invite-email">Email address</Label>
              <Input id="admin-team-invite-email" name="email" type="email" autoComplete="email" placeholder="colleague@company.com" value={inviteEmail} onChange={onEmailChange} aria-invalid={inviteEmailTrimmed.length > 0 && !inviteEmailValid}/>
              {inviteEmailTrimmed.length > 0 && !inviteEmailValid ? (<p className="text-xs text-destructive">Enter a valid email address.</p>) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-team-invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={onRoleChange}>
                <SelectTrigger id="admin-team-invite-role" className="w-full">
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
            <Button type="button" variant="outline" onClick={onClose} disabled={inviteSending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!inviteEmailValid || inviteSending}>
              {inviteSending ? 'Sending…' : 'Send invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
type AdminTeamDirectorySectionProps = {
    loading: boolean;
    internalUsers: AdminUserRecord[];
    filteredUsers: AdminUserRecord[];
    hasActiveFilters: boolean;
    workspaceQueryError: string | null;
    actionError: string | null;
    clearActionError: () => void;
    searchTerm: string;
    statusFilter: string;
    roleFilter: string;
    savingId: string | null;
    allocationSummary: ReturnType<typeof buildClientAllocationSummary>;
    paginatedStatus: string;
    loadingMore: boolean;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onStatusFilterChange: (value: string) => void;
    onRoleFilterChange: (value: string) => void;
    onOpenInviteDialog: () => void;
    onClearFilters: () => void;
    onLoadMore: () => void;
    createRoleChangeHandler: (userId: string) => (value: string) => void;
    createAdminToggleHandler: (record: AdminUserRecord) => (event: ChangeEvent<HTMLInputElement>) => void;
    createStatusActionHandler: (record: AdminUserRecord) => () => void;
};
export function AdminTeamDirectorySection({ loading, internalUsers, filteredUsers, hasActiveFilters, workspaceQueryError, actionError, clearActionError, searchTerm, statusFilter, roleFilter, savingId, allocationSummary, paginatedStatus, loadingMore, onSearchChange, onStatusFilterChange, onRoleFilterChange, onOpenInviteDialog, onClearFilters, onLoadMore, createRoleChangeHandler, createAdminToggleHandler, createStatusActionHandler, }: AdminTeamDirectorySectionProps) {
    return (<Card className="border-muted/60 bg-background">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle className="text-lg">Team directory</CardTitle>
          <CardDescription>
            Search internal teammates, manage permissions, and review their current client allocation load.
            {!loading && internalUsers.length > 0 ? (<span className="mt-1 block text-xs text-muted-foreground/90">
                Showing {filteredUsers.length} of {internalUsers.length}
              </span>) : null}
          </CardDescription>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
          <Input placeholder="Search by name or email" value={searchTerm} onChange={onSearchChange} className="lg:w-64" aria-label="Search team by name or email"/>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="Filter by status"/>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (<SelectItem key={status} value={status}>
                  {status === 'all' ? 'All statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="Filter by role"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLE_OPTIONS.map((role) => (<SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdminQueryErrorAlert error={workspaceQueryError} title="Unable to load workspace data"/>
        <AdminActionErrorAlert error={actionError} onDismiss={clearActionError}/>

        {/* Mobile card layout */}
        <div className="space-y-3 lg:hidden">
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {loading ? 'Loading team…' : workspaceQueryError && internalUsers.length === 0 ? workspaceQueryError : !loading && internalUsers.length === 0 ? (
                <span className="inline-flex flex-col items-center gap-3">
                  <span>No internal teammates in this workspace yet.</span>
                  <Button type="button" size="sm" variant="outline" onClick={onOpenInviteDialog}>
                    <UserPlus className="mr-2 size-4"/>
                    Invite teammate
                  </Button>
                </span>
              ) : hasActiveFilters ? (
                <span className="inline-flex flex-col items-center gap-3">
                  <span>No teammates match current search or filters.</span>
                  <Button type="button" size="sm" variant="outline" onClick={onClearFilters}>
                    Clear filters
                  </Button>
                </span>
              ) : 'No teammates match the current filters.'}
            </div>
          ) : filteredUsers.map((record) => {
            const allocation = allocationSummary.byUserId[record.id] ?? { managedClientNames: [], supportingClientNames: [], totalClientNames: [] };
            return (
              <div key={record.id} className="rounded-lg border border-muted/40 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{record.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{record.email || 'No email on file'}</div>
                    {record.agencyId && <div className="text-xs text-muted-foreground">Agency: {record.agencyId}</div>}
                  </div>
                  <Badge variant={statusToVariant(record.status)} className="capitalize shrink-0">
                    {record.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={record.role} onValueChange={createRoleChangeHandler(record.id)} disabled={savingId === record.id}>
                    <SelectTrigger className="h-9 flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (<SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <span className="flex h-9 items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Checkbox checked={record.role === 'admin'} onChange={createAdminToggleHandler(record)} disabled={savingId === record.id} aria-label={`Toggle admin role for ${record.name}`}/>
                    Admin
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <div><span className="font-medium text-foreground/70">Joined:</span> {formatDate(record.createdAt)}</div>
                  <div><span className="font-medium text-foreground/70">Last active:</span> {formatDate(record.lastLoginAt)}</div>
                  <div className="col-span-2"><span className="font-medium text-foreground/70">Clients:</span> {allocation.totalClientNames.length > 0 ? `${allocation.totalClientNames.length} (Owner ${allocation.managedClientNames.length} · Support ${allocation.supportingClientNames.length})` : 'Unassigned'}</div>
                </div>
                <Button type="button" variant={record.status === 'active' ? 'destructive' : 'outline'} size="sm" onClick={createStatusActionHandler(record)} disabled={savingId === record.id} className="w-full inline-flex items-center justify-center gap-2">
                  {savingId === record.id ? <LoaderCircle className="size-4 animate-spin"/> : <ActionIcon status={record.status}/>}
                  {statusActionLabel(record.status)}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Desktop table layout */}
        <div className="hidden overflow-x-auto rounded-md border border-muted/40 lg:block">
          <table className="min-w-full table-fixed text-left text-sm">
            <caption className="sr-only">Team members, roles, and client allocation</caption>
            <thead>
              <tr className="border-b border-muted/40">
                <th scope="col" className="w-64 py-2 pr-3 font-medium">Team member</th>
                <th scope="col" className="w-32 py-2 pr-3 font-medium">Role</th>
                <th scope="col" className="w-24 py-2 pr-3 text-center font-medium">Admin</th>
                <th scope="col" className="w-32 py-2 pr-3 font-medium">Status</th>
                <th scope="col" className="w-40 py-2 pr-3 font-medium">Joined</th>
                <th scope="col" className="w-40 py-2 pr-3 font-medium">Client allocation</th>
                <th scope="col" className="w-40 py-2 pr-3 font-medium">Last active</th>
                <th scope="col" className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (<tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    {loading ? ('Loading team…') : workspaceQueryError && internalUsers.length === 0 ? (workspaceQueryError) : !loading && internalUsers.length === 0 ? (<span className="inline-flex flex-col items-center gap-3">
                        <span>No internal teammates in this workspace yet.</span>
                        <Button type="button" size="sm" variant="outline" onClick={onOpenInviteDialog}>
                          <UserPlus className="mr-2 size-4"/>
                          Invite teammate
                        </Button>
                      </span>) : hasActiveFilters ? (<span className="inline-flex flex-col items-center gap-3">
                        <span>No teammates match current search or filters.</span>
                        <Button type="button" size="sm" variant="outline" onClick={onClearFilters}>
                          Clear filters
                        </Button>
                      </span>) : ('No teammates match the current filters.')}
                  </td>
                </tr>) : (filteredUsers.map((record) => {
            const allocation = allocationSummary.byUserId[record.id] ?? {
                managedClientNames: [],
                supportingClientNames: [],
                totalClientNames: [],
            };
            return (<tr key={record.id} className="border-b border-muted/30">
                      <th scope="row" className="py-3 pr-3 text-left font-normal">
                        <div className="font-medium text-foreground">{record.name}</div>
                        <div className="text-xs text-muted-foreground">{record.email || 'No email on file'}</div>
                        {record.agencyId && (<div className="text-xs text-muted-foreground">Agency: {record.agencyId}</div>)}
                      </th>
                      <td className="py-3 pr-3 align-middle">
                        <Select value={record.role} onValueChange={createRoleChangeHandler(record.id)} disabled={savingId === record.id}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (<SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </SelectItem>))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 pr-3 text-center align-middle">
                        <Checkbox checked={record.role === 'admin'} onChange={createAdminToggleHandler(record)} disabled={savingId === record.id} aria-label={`Toggle admin role for ${record.name}`}/>
                      </td>
                      <td className="py-3 pr-3 align-middle">
                        <Badge variant={statusToVariant(record.status)} className="capitalize">
                          {record.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3 align-middle text-xs text-muted-foreground">
                        {formatDate(record.createdAt)}
                      </td>
                      <td className="py-3 pr-3 align-middle">
                        {allocation.totalClientNames.length > 0 ? (<div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">
                              {allocation.totalClientNames.length} client{allocation.totalClientNames.length === 1 ? '' : 's'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Owner {allocation.managedClientNames.length} · Support {allocation.supportingClientNames.length}
                            </div>
                          </div>) : (<span className="text-xs text-muted-foreground">Unassigned</span>)}
                      </td>
                      <td className="py-3 pr-3 align-middle text-xs text-muted-foreground">
                        {formatDate(record.lastLoginAt)}
                      </td>
                      <td className="py-3 align-middle text-right">
                        <Button type="button" variant={record.status === 'active' ? 'destructive' : 'outline'} size="sm" onClick={createStatusActionHandler(record)} disabled={savingId === record.id} className="inline-flex items-center gap-2">
                          {savingId === record.id ? (<LoaderCircle className="size-4 animate-spin"/>) : (<ActionIcon status={record.status}/>)}
                          {statusActionLabel(record.status)}
                        </Button>
                      </td>
                    </tr>);
        }))}
            </tbody>
          </table>
        </div>

        {paginatedStatus === 'CanLoadMore' ? (<div className="mt-6 flex justify-center">
            <Button type="button" variant="outline" onClick={onLoadMore} disabled={loadingMore} className="inline-flex items-center gap-2">
              {loadingMore ? <LoaderCircle className="size-4 animate-spin"/> : <RefreshCw className="size-4"/>}
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          </div>) : null}
      </CardContent>
    </Card>);
}
type AdminTeamPageContentProps = {
    isPreviewMode: boolean;
    loading: boolean;
    summary: {
        total: number;
        active: number;
        admins: number;
        allocated: number;
    };
    internalUsers: AdminUserRecord[];
    filteredUsers: AdminUserRecord[];
    hasActiveFilters: boolean;
    workspaceQueryError: string | null;
    actionError: string | null;
    clearActionError: () => void;
    searchTerm: string;
    statusFilter: string;
    roleFilter: string;
    savingId: string | null;
    allocationSummary: ReturnType<typeof buildClientAllocationSummary>;
    paginatedStatus: string;
    loadingMore: boolean;
    inviteOpen: boolean;
    inviteEmail: string;
    inviteEmailTrimmed: string;
    inviteEmailValid: boolean;
    inviteRole: string;
    inviteSending: boolean;
    onRefresh: () => void;
    onInviteOpenChange: (open: boolean) => void;
    onInviteEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onInviteRoleChange: (value: string) => void;
    onCloseInviteDialog: () => void;
    onInviteFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onStatusFilterChange: (value: string) => void;
    onRoleFilterChange: (value: string) => void;
    onOpenInviteDialog: () => void;
    onClearFilters: () => void;
    onLoadMore: () => void;
    createRoleChangeHandler: (userId: string) => (value: string) => void;
    createAdminToggleHandler: (record: AdminUserRecord) => (event: ChangeEvent<HTMLInputElement>) => void;
    createStatusActionHandler: (record: AdminUserRecord) => () => void;
};
export function AdminTeamPageContent(props: AdminTeamPageContentProps) {
    const { isPreviewMode, loading, summary, internalUsers, filteredUsers, hasActiveFilters, workspaceQueryError, actionError, clearActionError, searchTerm, statusFilter, roleFilter, savingId, allocationSummary, paginatedStatus, loadingMore, inviteOpen, inviteEmail, inviteEmailTrimmed, inviteEmailValid, inviteRole, inviteSending, onRefresh, onInviteOpenChange, onInviteEmailChange, onInviteRoleChange, onCloseInviteDialog, onInviteFormSubmit, onSearchChange, onStatusFilterChange, onRoleFilterChange, onOpenInviteDialog, onClearFilters, onLoadMore, createRoleChangeHandler, createAdminToggleHandler, createStatusActionHandler, } = props;
    return (<AdminPageShell title="Team management" description={<>
          Manage internal staff, their roles, and how they are allocated across client workspaces.
          {isPreviewMode ? ' Preview mode keeps staffing changes local to this session.' : ''}
        </>} isPreviewMode={isPreviewMode} actions={<>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/clients">Client workspaces</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin">Admin home</Link>
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2">
            <RefreshCw className={cn('size-4', loading && 'animate-spin')}/> Refresh
          </Button>
          <AdminTeamInviteDialog inviteOpen={inviteOpen} inviteEmail={inviteEmail} inviteEmailTrimmed={inviteEmailTrimmed} inviteEmailValid={inviteEmailValid} inviteRole={inviteRole} inviteSending={inviteSending} onOpenChange={onInviteOpenChange} onEmailChange={onInviteEmailChange} onRoleChange={onInviteRoleChange} onClose={onCloseInviteDialog} onSubmit={onInviteFormSubmit}/>
        </>}>
      <AdminTeamSummaryCards summary={summary} loading={loading}/>
      <AdminTeamDirectorySection loading={loading} internalUsers={internalUsers} filteredUsers={filteredUsers} hasActiveFilters={hasActiveFilters} workspaceQueryError={workspaceQueryError} actionError={actionError} clearActionError={clearActionError} searchTerm={searchTerm} statusFilter={statusFilter} roleFilter={roleFilter} savingId={savingId} allocationSummary={allocationSummary} paginatedStatus={paginatedStatus} loadingMore={loadingMore} onSearchChange={onSearchChange} onStatusFilterChange={onStatusFilterChange} onRoleFilterChange={onRoleFilterChange} onOpenInviteDialog={onOpenInviteDialog} onClearFilters={onClearFilters} onLoadMore={onLoadMore} createRoleChangeHandler={createRoleChangeHandler} createAdminToggleHandler={createAdminToggleHandler} createStatusActionHandler={createStatusActionHandler}/>
    </AdminPageShell>);
}
