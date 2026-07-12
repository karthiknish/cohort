'use client';
import { useCallback } from 'react';
import { Building2, LoaderCircle, Plus, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/shared/ui/dialog';
import { MentionInput, type MentionableUser } from '@/shared/ui/mention-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { TruncatedTextPreview } from '@/shared/ui/hover-preview';
import type { ClientRecord } from '@/types/clients';
export function WorkspaceRow({ client, disabled, onRemove, }: {
    client: {
        id: string;
        name: string;
    };
    disabled: boolean;
    onRemove: (clientId: string) => void;
}) {
    const handleRemove = () => onRemove(client.id);
    return (<div className="flex items-center justify-between rounded-lg border border-muted/60 bg-muted/30 px-4 py-3 text-sm transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-primary">
          <Building2 className="size-3.5"/>
        </div>
        <span className="font-medium">{client.name}</span>
      </div>
      <Button type="button" size="icon" variant="ghost" className="size-8 rounded-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive" onClick={handleRemove} disabled={disabled} aria-label={`Remove ${client.name} workspace`}>
        <Trash className="size-4" aria-hidden/>
      </Button>
    </div>);
}
type WorkspaceSelectProps = {
    className?: string;
    clients: ClientRecord[];
    hasClients: boolean;
    selectValue: string;
    selectedLabel: string;
    placeholder: string;
    onValueChange: (value: string) => void;
};
export function WorkspaceSelect({ className, clients, hasClients, selectValue, selectedLabel, placeholder, onValueChange, }: WorkspaceSelectProps) {
    return (<div className={cn('relative min-w-0 flex-1 sm:max-w-[12.5rem] lg:max-w-[14rem]', className)}>
      <Select value={selectValue} onValueChange={onValueChange} disabled={!hasClients}>
        <SelectTrigger id="tour-workspace-selector" className={cn('h-11 w-full border-input bg-background/50 backdrop-blur-sm motion-chromatic', 'hover:bg-background hover:border-accent/30 hover:shadow-sm', 'focus:ring-2 focus:ring-primary/20 focus:border-accent/40', 'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background/50', 'data-[state=open]:bg-background data-[state=open]:border-accent/40 data-[state=open]:shadow-md', 'rounded-xl px-4')}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-primary">
              <Building2 className="size-3.5"/>
            </div>
            <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent position="popper" className="z-[3000] min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)]" sideOffset={4}>
          {clients.map((client) => (<SelectItem key={client.id} value={client.id} hideIndicator className="cursor-pointer rounded-md mx-1 my-0.5 px-3 py-2.5 text-popover-foreground transition-colors hover:bg-muted focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[state=checked]:bg-accent/10 data-[state=checked]:font-medium data-[state=checked]:text-foreground">
              <div className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-foreground/70">
                  <Building2 className="size-3"/>
                </div>
                <TruncatedTextPreview text={client.name}/>
              </div>
            </SelectItem>))}
        </SelectContent>
      </Select>
    </div>);
}
type ManageWorkspacesDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    newClientName: string;
    accountManagerInput: string;
    teamInput: string;
    saving: boolean;
    removingId: string | null;
    errorMessage: string | null;
    clients: ClientRecord[];
    mentionableUsers: MentionableUser[];
    onClientNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAccountManagerChange: (value: string, mentions: MentionableUser[]) => void;
    onTeamChange: (value: string, mentions: MentionableUser[]) => void;
    onRemoveClient: (clientId: string) => void;
    onClose: () => void;
    onSave: () => void;
};
export function ManageWorkspacesDialog({ isOpen, onOpenChange, newClientName, accountManagerInput, teamInput, saving, removingId, errorMessage, clients, mentionableUsers, onClientNameChange, onAccountManagerChange, onTeamChange, onRemoveClient, onClose, onSave, }: ManageWorkspacesDialogProps) {
    return (<Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Workspaces</DialogTitle>
          <DialogDescription>Create and organize client workspaces.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2.5">
            <label className="text-sm font-medium" htmlFor="client-name">
              Client name
            </label>
            <Input id="client-name" value={newClientName} onChange={onClientNameChange} placeholder="e.g. Horizon Ventures" required className="h-11 rounded-lg"/>
          </div>
          <MentionInput label="Account manager" value={accountManagerInput} onChange={onAccountManagerChange} users={mentionableUsers} placeholder="Type a name or use @ to pick a user…" disabled={saving} singleSelect/>
          <MentionInput label="Team members" value={teamInput} onChange={onTeamChange} users={mentionableUsers} placeholder="Type names separated by commas, or use @ to add users…" disabled={saving} allowMultiple maxMentions={10}/>
          {clients.length > 0 && (<div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Existing workspaces</p>
              <div className="space-y-2">
                {clients.map((client) => (<WorkspaceRow key={client.id} client={client} disabled={clients.length === 1 || removingId === client.id || saving} onRemove={onRemoveClient}/>))}
              </div>
            </div>)}
          {errorMessage && (<div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{errorMessage}</p>
            </div>)}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="rounded-lg">
              Close
            </Button>
            <Button type="button" disabled={saving} className="rounded-lg" onClick={onSave}>
              {saving && <LoaderCircle className="mr-2 size-4 animate-spin"/>}
              Save client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);
}
export function ManageWorkspacesButton({ onClick }: {
    onClick: () => void;
}) {
    return (<Button size="icon" variant="outline" onClick={onClick} className="size-11 rounded-xl border-input bg-background/50 backdrop-blur-sm hover:bg-background hover:border-accent/30 hover:shadow-sm hover:text-foreground motion-chromatic shrink-0">
      <Plus className="size-4"/>
      <span className="sr-only">Manage clients</span>
    </Button>);
}
