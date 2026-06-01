"use client";
import { useCallback, useState } from 'react';
import { Filter, ListFilter } from 'lucide-react';
import type { ClientRecord } from '@/types/clients';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { cn } from '@/lib/utils';
const PERIOD_OPTIONS = [7, 30, 90];
const MAX_CLIENT_COMPARISONS = 5;
type DashboardFilterBarProps = {
    clients: ClientRecord[];
    selectedClientIds: string[];
    onClientChange: (clientIds: string[]) => void;
    periodDays: number;
    onPeriodChange: (days: number) => void;
    canCompare: boolean;
    className?: string;
};
export function DashboardFilterBar({ clients, selectedClientIds, onClientChange, periodDays, onPeriodChange, canCompare, className, }: DashboardFilterBarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handleClientChange = (clientId: string) => {
        if (!canCompare)
            return;
        const exists = selectedClientIds.includes(clientId);
        if (exists) {
            onClientChange(selectedClientIds.filter((id) => id !== clientId));
            return;
        }
        if (selectedClientIds.length >= MAX_CLIENT_COMPARISONS)
            return;
        onClientChange([...selectedClientIds, clientId]);
    };
    const handleClearSelection = () => {
        if (!canCompare)
            return;
        onClientChange([]);
    };
    const handleCloseMenu = () => {
        setIsMenuOpen(false);
    };
    const handlePeriodChange = (value: string) => {
        onPeriodChange(Number(value));
    };
    const selectedLabel = selectedClientIds.length === 0
        ? 'Select workspaces'
        : `${selectedClientIds.length} workspace${selectedClientIds.length > 1 ? 's' : ''}`;
    return (<div className={cn('flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3', className)}>
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground"/>
        <span className="text-sm font-semibold text-foreground">Comparison filters</span>
      </div>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ListFilter className="size-4"/>
            {selectedLabel}
            {selectedClientIds.length > 0 && (<Badge variant="secondary" className="ml-1 text-xs">
                {selectedClientIds.length}/{Math.min(MAX_CLIENT_COMPARISONS, clients.length)}
              </Badge>)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
            Workspaces
            <span className="text-[11px] font-normal text-muted-foreground/80">max {MAX_CLIENT_COMPARISONS}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {clients.length === 0 && (<div className="px-2 py-4 text-sm text-muted-foreground">No clients available.</div>)}
          {clients.map((client) => {
            const checked = selectedClientIds.includes(client.id);
            return (<DashboardFilterClientItem key={client.id} client={client} checked={checked} canCompare={canCompare} onToggle={handleClientChange}/>);
        })}
          <DropdownMenuSeparator />
          <div className="flex items-center justify-between px-2 py-1">
            <Button type="button" variant="ghost" size="sm" disabled={!canCompare || selectedClientIds.length === 0} onClick={handleClearSelection}>
              Clear
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleCloseMenu}>
              Close filters
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        <span>Period</span>
        <Select value={String(periodDays)} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Period"/>
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (<SelectItem key={option} value={String(option)}>
                Last {option} days
              </SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {!canCompare && (<p className="basis-full text-xs text-warning">
          Need admin access to compare multiple workspaces. You can still adjust the period.
        </p>)}
    </div>);
}
function DashboardFilterClientItem({ client, checked, canCompare, onToggle, }: {
    client: ClientRecord;
    checked: boolean;
    canCompare: boolean;
    onToggle: (clientId: string) => void;
}) {
    const handleSelect = (event: Event) => {
        event.preventDefault();
    };
    const onToggleClientFilter = () => {
        onToggle(client.id);
    };
    return (<DropdownMenuItem className={cn('gap-2', !canCompare && 'pointer-events-none opacity-60')} onSelect={handleSelect} onClick={onToggleClientFilter}>
      <Checkbox checked={checked} aria-label={`Toggle ${client.name}`} className="size-4"/>
      <span className="text-sm">{client.name}</span>
    </DropdownMenuItem>);
}
