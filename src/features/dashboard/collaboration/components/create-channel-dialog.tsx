'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useMemo, useReducer } from 'react';
import { Hash, LoaderCircle, Lock, Plus, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { asErrorMessage, logError } from '@/lib/convex-errors';
const CREATE_CHANNEL_DEFAULT_TRIGGER = (<DialogTrigger asChild>
    <Button className="gap-2">
      <Plus className="size-4"/>
      Create channel
    </Button>
  </DialogTrigger>);
import type { ChangeEvent } from 'react';
type WorkspaceMemberOption = {
    id: string;
    name: string;
    email?: string;
    role?: string;
};
type CreateChannelPayload = {
    name: string;
    description?: string;
    visibility: 'public' | 'private';
    memberIds: string[];
};
const EMPTY_TEAM_MEMBERS: WorkspaceMemberOption[] = [];
interface CreateChannelDialogProps {
    workspaceId: string | null;
    userId: string | null;
    teamMembers?: WorkspaceMemberOption[];
    onCreate: (channel: CreateChannelPayload) => Promise<void> | void;
    trigger?: React.ReactNode;
}
type CreateChannelDialogState = {
    open: boolean;
    channelName: string;
    description: string;
    visibility: 'public' | 'private';
    selectedMemberIds: string[];
    isCreating: boolean;
};
type CreateChannelDialogAction = {
    type: 'setOpen';
    open: boolean;
} | {
    type: 'setChannelName';
    channelName: string;
} | {
    type: 'setDescription';
    description: string;
} | {
    type: 'setVisibility';
    visibility: 'public' | 'private';
} | {
    type: 'toggleMember';
    memberId: string;
} | {
    type: 'setIsCreating';
    isCreating: boolean;
} | {
    type: 'resetForm';
};
const INITIAL_CREATE_CHANNEL_DIALOG_STATE: CreateChannelDialogState = {
    open: false,
    channelName: '',
    description: '',
    visibility: 'private',
    selectedMemberIds: [],
    isCreating: false,
};
function createChannelDialogReducer(state: CreateChannelDialogState, action: CreateChannelDialogAction): CreateChannelDialogState {
    switch (action.type) {
        case 'setOpen':
            return { ...state, open: action.open };
        case 'setChannelName':
            return { ...state, channelName: action.channelName };
        case 'setDescription':
            return { ...state, description: action.description };
        case 'setVisibility':
            return { ...state, visibility: action.visibility };
        case 'toggleMember':
            return {
                ...state,
                selectedMemberIds: state.selectedMemberIds.includes(action.memberId)
                    ? state.selectedMemberIds.filter((id) => id !== action.memberId)
                    : [...state.selectedMemberIds, action.memberId],
            };
        case 'setIsCreating':
            return { ...state, isCreating: action.isCreating };
        case 'resetForm':
            return {
                ...state,
                channelName: '',
                description: '',
                visibility: 'private',
                selectedMemberIds: [],
            };
        default:
            return state;
    }
}
function sortMembers(members: WorkspaceMemberOption[]) {
    return members.toSorted((a, b) => a.name.localeCompare(b.name));
}
function ChannelMemberOptionRow({ checked, disabled = false, member, onToggle, }: {
    checked: boolean;
    disabled?: boolean;
    member: WorkspaceMemberOption;
    onToggle: (memberId: string) => void;
}) {
    const checkboxId = `create-channel-member-${member.id}`;
    const handleToggle = () => onToggle(member.id);
    return (<div className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent bg-background/80 p-3 transition-colors hover:border-border hover:bg-background">
      <Checkbox id={checkboxId} checked={checked} onCheckedChange={handleToggle} disabled={disabled} className="mt-0.5"/>
      <Label htmlFor={checkboxId} className="min-w-0 cursor-pointer">
        <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {[member.role, member.email].filter(Boolean).join(' • ') || 'Workspace member'}
        </p>
      </Label>
    </div>);
}
export function CreateChannelDialog({ workspaceId, userId, teamMembers = EMPTY_TEAM_MEMBERS, onCreate, trigger, }: CreateChannelDialogProps) {
    const [{ open, channelName, description, visibility, selectedMemberIds, isCreating }, dispatch] = useReducer(createChannelDialogReducer, INITIAL_CREATE_CHANNEL_DIALOG_STATE);
    const sortedMembers = sortMembers(teamMembers);
    const resetForm = () => {
        dispatch({ type: 'resetForm' });
    };
    const handleMemberToggle = (memberId: string) => {
        dispatch({ type: 'toggleMember', memberId });
    };
    const selectedMemberIdsSet = new Set(selectedMemberIds);
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && isCreating) {
            return;
        }
        dispatch({ type: 'setOpen', open: nextOpen });
        if (!nextOpen) {
            resetForm();
        }
    };
    const handleChannelNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setChannelName', channelName: event.target.value });
    };
    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: 'setDescription', description: event.target.value });
    };
    const handleVisibilityChange = (value: string) => {
        dispatch({ type: 'setVisibility', visibility: value as 'public' | 'private' });
    };
    const handleCancel = () => {
        if (isCreating) {
            return;
        }
        dispatch({ type: 'setOpen', open: false });
    };
    const handleCreate = async () => {
        if (isCreating) {
            return;
        }
        if (!workspaceId || !userId) {
            notifyFailure({
                title: 'Authentication required',
                message: 'You must be signed in to create channels.',
            });
            return;
        }
        const normalizedName = channelName.replace(/\s+/g, ' ').trim();
        if (normalizedName.length < 2) {
            notifyFailure({
                title: 'Channel name required',
                message: 'Use at least 2 characters for the channel name.',
            });
            return;
        }
        dispatch({ type: 'setIsCreating', isCreating: true });
        try {
            await onCreate({
                name: normalizedName,
                description: description.trim() || undefined,
                visibility,
                memberIds: selectedMemberIds,
            });
            notifySuccess({
                title: 'Channel created',
                message: `#${normalizedName} is ready for collaboration.`,
            });
            resetForm();
            dispatch({ type: 'setOpen', open: false });
        }
        catch (error) {
            reportConvexFailure({
                error: error,
                context: 'CreateChannelDialog:handleCreate',
                title: 'Channel creation failed',
                fallbackMessage: 'Channel creation failed',
            });
        }
        dispatch({ type: 'setIsCreating', isCreating: false });
    };
    return (<Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ?? CREATE_CHANNEL_DEFAULT_TRIGGER}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="size-5"/>
            Create collaboration channel
          </DialogTitle>
          <DialogDescription>
            Create an admin-managed room for internal coordination. Client and project channels remain automatic.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel name</Label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <Input id="channel-name" value={channelName} onChange={handleChannelNameChange} disabled={isCreating} className="pl-9" placeholder="leadership, launch-war-room, finance" maxLength={50}/>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-description">Description</Label>
              <Textarea id="channel-description" value={description} onChange={handleDescriptionChange} disabled={isCreating} placeholder="What should this channel be used for?" rows={4} maxLength={220}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-visibility">Access</Label>
              <Select value={visibility} onValueChange={handleVisibilityChange} disabled={isCreating}>
                <SelectTrigger id="channel-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="size-4"/>
                      Private
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Users className="size-4"/>
                      Public to team
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Private channels are limited to admins and selected members. Public channels are visible to the workspace team.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Add people</p>
                <p className="text-xs text-muted-foreground">Select who should be explicitly included.</p>
              </div>
              <span className="rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {selectedMemberIds.length} selected
              </span>
            </div>

            {sortedMembers.length === 0 ? (<div className="rounded-xl border border-dashed border-border/70 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                No workspace members available.
              </div>) : (<div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {sortedMembers.map((member) => {
                const checked = selectedMemberIdsSet.has(member.id);
                return (<ChannelMemberOptionRow key={member.id} checked={checked} disabled={isCreating} member={member} onToggle={handleMemberToggle}/>);
            })}
              </div>)}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? <LoaderCircle className="size-4 animate-spin"/> : <Plus className="size-4"/>}
            Create channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
const QUICK_CREATE_TRIGGER = (<DialogTrigger asChild>
    <Button size="sm" className="gap-2">
      <Plus className="size-4"/>
      Create channel
    </Button>
  </DialogTrigger>);
export function QuickCreateChannelButton(props: Omit<CreateChannelDialogProps, 'trigger'>) {
    return (<CreateChannelDialog {...props} trigger={QUICK_CREATE_TRIGGER}/>);
}
