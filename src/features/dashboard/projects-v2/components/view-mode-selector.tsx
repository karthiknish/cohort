'use client';

import { ChartGantt, Columns3, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { PROJECTS_THEME } from './projects-theme';
import type { ViewMode } from '../types';

const VIEW_OPTIONS: { mode: ViewMode; label: string; icon: typeof List }[] = [
  { mode: 'list', label: 'List', icon: List },
  { mode: 'grid', label: 'Grid', icon: LayoutGrid },
  { mode: 'board', label: 'Board', icon: Columns3 },
  { mode: 'gantt', label: 'Timeline', icon: ChartGantt },
];

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({ viewMode, onChange }: ViewModeSelectorProps) {
  return (
    <fieldset
      className={cn(PROJECTS_THEME.segmented, 'm-0 min-w-0 border-0 p-0')}
      aria-label="Project view mode"
    >
      {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
        <Tooltip key={mode}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={PROJECTS_THEME.segmentedItem(viewMode === mode)}
              onClick={() => onChange(mode)}
              aria-label={label}
              aria-pressed={viewMode === mode}
            >
              <Icon className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>{label} view</TooltipContent>
        </Tooltip>
      ))}
    </fieldset>
  );
}
