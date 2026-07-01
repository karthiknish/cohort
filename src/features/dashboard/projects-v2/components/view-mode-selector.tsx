'use client';

import { CalendarDays, ChartGantt, ChevronsUpDown, Columns3, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ViewMode } from '../types';

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: typeof List }[] = [
  { mode: 'list', label: 'List', icon: List },
  { mode: 'grid', label: 'Grid', icon: LayoutGrid },
  { mode: 'board', label: 'Board', icon: Columns3 },
  { mode: 'gantt', label: 'Timeline', icon: ChartGantt },
  { mode: 'calendar', label: 'Calendar', icon: CalendarDays },
];

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({ viewMode, onChange }: ViewModeSelectorProps) {
  const current = VIEW_OPTIONS.find((option) => option.mode === viewMode) ?? VIEW_OPTIONS[0]!;
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-border/60 shadow-sm"
          aria-label="Select view mode"
        >
          <CurrentIcon className="size-4" aria-hidden />
          <span className="hidden sm:inline">{current.label}</span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          View mode
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
          <DropdownMenuItem
            key={mode}
            className={cn('gap-2', viewMode === mode && 'font-semibold')}
            onClick={() => onChange(mode)}
            aria-checked={viewMode === mode}
          >
            <Icon className="size-4" aria-hidden />
            <span className="flex-1">{label}</span>
            {viewMode === mode ? <span className="size-1.5 rounded-full bg-primary" aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
