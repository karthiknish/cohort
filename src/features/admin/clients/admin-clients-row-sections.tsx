'use client';
import { useCallback } from 'react';
import { LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { UserSearchPicker } from '../components/user-search-picker';
import type { AllocationUser } from '../lib/client-allocation';
import type { ClientRecord, TeamMemberField } from './admin-clients-types';
type AdminClientsTeamMemberFieldRowProps = {
    member: TeamMemberField;
    index: number;
    assignableUsers: AllocationUser[];
    clientSaving: boolean;
    teamMembersLength: number;
    onUpdateName: (key: string, value: string) => void;
    onUpdateRole: (key: string, value: string) => void;
    onRemove: (key: string) => void;
    excludeNames: string[];
};
export function AdminClientsTeamMemberFieldRow({ member, index, assignableUsers, clientSaving, teamMembersLength, onUpdateName, onUpdateRole, onRemove, excludeNames, }: AdminClientsTeamMemberFieldRowProps) {
    const handleNameChange = (value: string) => onUpdateName(member.key, value);
    const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => onUpdateName(member.key, event.target.value);
    const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => onUpdateRole(member.key, event.target.value);
    const handleRemove = () => onRemove(member.key);
    return (<div className="flex flex-col gap-2 rounded-md border p-4 sm:flex-row sm:items-center">
      <div className="flex-1 space-y-2">
        <Label htmlFor={`team-member-name-${member.key}`} className="text-xs uppercase tracking-wide text-muted-foreground">
          Name
        </Label>
        {assignableUsers.length > 0 ? (<UserSearchPicker id={`team-member-name-${member.key}`} value={member.name} onChange={handleNameChange} options={assignableUsers} placeholder={index === 0 ? 'Select teammate' : 'Choose teammate'} searchPlaceholder="Search teammates" emptyText="No matching teammate found." disabled={clientSaving} excludeNames={excludeNames}/>) : (<Input id={`team-member-name-${member.key}`} placeholder={index === 0 ? 'Alex Chen' : 'Teammate name'} value={member.name} onChange={handleNameInputChange} disabled={clientSaving}/>)}
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor={`team-member-role-${member.key}`} className="text-xs uppercase tracking-wide text-muted-foreground">
          Role
        </Label>
        <Input id={`team-member-role-${member.key}`} placeholder={index === 0 ? 'Paid Media Lead' : 'Role (optional)'} value={member.role} onChange={handleRoleChange} disabled={clientSaving}/>
      </div>
      <div className="flex items-center justify-end pt-2 sm:pt-6">
        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={handleRemove} disabled={teamMembersLength <= 1 || clientSaving}>
          <Trash2 className="size-4"/>
          <span className="sr-only">Remove team member</span>
        </Button>
      </div>
    </div>);
}
type AdminClientsClientRowProps = {
    client: ClientRecord;
    unmatchedCount: number;
    addingMember: boolean;
    clientPendingMembersId: string | undefined;
    deletingClientId: string | null | undefined;
    removingTeamMemberKey: string | null | undefined;
    onAddTeamMember: (client: ClientRecord) => void;
    onDeleteClient: (client: ClientRecord) => void;
    onRemoveTeamMember: (client: ClientRecord, memberName: string) => void;
    onEditTeamMemberRole: (client: ClientRecord, member: {
        name: string;
        role: string;
    }) => void;
    updatingMemberRoleKey: string | null | undefined;
};
export function AdminClientsClientRow({ client, unmatchedCount, addingMember, clientPendingMembersId, deletingClientId, removingTeamMemberKey, onAddTeamMember, onDeleteClient, onRemoveTeamMember, onEditTeamMemberRole, updatingMemberRoleKey, }: AdminClientsClientRowProps) {
    const handleAddTeamMember = () => onAddTeamMember(client);
    const handleDeleteClient = () => onDeleteClient(client);
    return (<div className="rounded-md border p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">{client.name}</p>
          <p className="text-xs text-muted-foreground">Managed by {client.accountManager}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Team {client.teamMembers.length}</Badge>
          <Badge variant={unmatchedCount ? 'secondary' : 'outline'}>
            {unmatchedCount ? `${unmatchedCount} unmatched` : 'Mapped'}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleAddTeamMember} disabled={addingMember && clientPendingMembersId === client.id}>
            <Plus className="mr-2 size-4"/> Add teammate
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteClient} disabled={Boolean(deletingClientId) && deletingClientId !== client.id}>
            {deletingClientId === client.id ? (<>
                <LoaderCircle className="mr-2 size-4 animate-spin"/> Deleting…
              </>) : (<>
                <Trash2 className="mr-2 size-4"/> Delete
              </>)}
          </Button>
        </div>
      </div>
      {unmatchedCount ? (<p className="mt-3 text-xs text-warning">
          This client still has legacy allocation names that do not match current workspace users.
        </p>) : null}
      {client.teamMembers.length > 0 && (<div className="mt-3 flex flex-wrap gap-2">
          {client.teamMembers.map((member) => (<AdminClientsTeamMemberBadge key={`${client.id}-${member.name}-${member.role}`} client={client} member={member} removingTeamMemberKey={removingTeamMemberKey} updatingMemberRoleKey={updatingMemberRoleKey} onRemove={onRemoveTeamMember} onEditRole={onEditTeamMemberRole}/>))}
        </div>)}
    </div>);
}
type AdminClientsTeamMemberBadgeProps = {
    client: ClientRecord;
    member: {
        name: string;
        role: string;
    };
    removingTeamMemberKey: string | null | undefined;
    updatingMemberRoleKey: string | null | undefined;
    onRemove: (client: ClientRecord, memberName: string) => void;
    onEditRole: (client: ClientRecord, member: {
        name: string;
        role: string;
    }) => void;
};
function AdminClientsTeamMemberBadge({ client, member, removingTeamMemberKey, updatingMemberRoleKey, onRemove, onEditRole, }: AdminClientsTeamMemberBadgeProps) {
    const handleRemove = () => onRemove(client, member.name);
    const handleEditRole = () => onEditRole(client, member);
    const memberKey = `${client.id}:${member.name.toLowerCase()}`;
    const isRemoving = removingTeamMemberKey === memberKey;
    const isUpdatingRole = updatingMemberRoleKey === memberKey;
    const isAccountManager = member.name.toLowerCase() === client.accountManager.toLowerCase();
    return (<div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{member.name}</span>
      {member.role && <span className="ml-2 text-muted-foreground">{member.role}</span>}
      <button type="button" className="ml-2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50" onClick={handleEditRole} disabled={isRemoving || isUpdatingRole} aria-label={`Edit ${member.name}'s role on ${client.name}`} title={`Edit ${member.name}'s role`}>
        {isUpdatingRole ? <LoaderCircle className="size-3 animate-spin"/> : <Pencil className="size-3"/>}
      </button>
      <button type="button" className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50" onClick={handleRemove} disabled={isRemoving || isUpdatingRole || isAccountManager} aria-label={`Remove ${member.name} from ${client.name}`} title={isAccountManager ? 'Account manager cannot be removed from the team' : `Remove ${member.name}`}>
        {isRemoving ? <LoaderCircle className="size-3 animate-spin"/> : <X className="size-3"/>}
      </button>
    </div>);
}
