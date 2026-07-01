'use client';
import { Download, List, LayoutGrid, LoaderCircle, Columns3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { TASKS_THEME } from './tasks-theme';
export type TaskViewControlsProps = {
    viewMode: 'list' | 'grid' | 'board';
    onViewModeChange: (mode: 'list' | 'grid' | 'board') => void;
    onExport: () => void;
    canExport: boolean;
    isExporting?: boolean;
    exportDisabledReason?: string;
};
const VIEW_OPTIONS = [
    { mode: 'list' as const, label: 'List', icon: List },
    { mode: 'grid' as const, label: 'Grid', icon: LayoutGrid },
    { mode: 'board' as const, label: 'Board', icon: Columns3 },
];
export function TaskViewControls({ viewMode, onViewModeChange, onExport, canExport, isExporting = false, exportDisabledReason, }: TaskViewControlsProps) {
    const exportDisabled = !canExport || isExporting;
    const exportButton = (<Button type="button" variant="outline" size="sm" className="h-9 gap-1.5 border-border/60 bg-background/80 text-xs shadow-sm" onClick={onExport} disabled={exportDisabled} aria-label="Export tasks to Excel">
      {isExporting ? (<LoaderCircle className="size-3.5 animate-spin" aria-hidden/>) : (<Download className="size-3.5" aria-hidden/>)}
      <span className="hidden sm:inline">{isExporting ? 'Exporting…' : 'Export'}</span>
    </Button>);
    return (<div className="flex flex-wrap items-center gap-2">
      <fieldset className={cn(TASKS_THEME.segmented, 'm-0 min-w-0 border-0 p-0')} aria-label="View mode">
        {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (<ViewToggleButton key={mode} mode={mode} active={viewMode === mode} label={label} icon={Icon} onViewModeChange={onViewModeChange}/>))}
      </fieldset>
      {exportDisabled && exportDisabledReason ? (<Tooltip>
          <TooltipTrigger asChild>
            {exportButton}
          </TooltipTrigger>
          <TooltipContent>{exportDisabledReason}</TooltipContent>
        </Tooltip>) : exportButton}
    </div>);
}
function ViewToggleButton({ mode, active, label, onViewModeChange, icon: Icon, }: {
    mode: 'list' | 'grid' | 'board';
    active: boolean;
    label: string;
    onViewModeChange: (mode: 'list' | 'grid' | 'board') => void;
    icon: typeof List;
}) {
    const onSelectTaskViewMode = () => {
        onViewModeChange(mode);
    };
    return (<button type="button" className={TASKS_THEME.segmentedButton(active)} onClick={onSelectTaskViewMode} aria-label={`${label} view`} aria-pressed={active}>
      <Icon className="size-3.5" aria-hidden/>
      <span className="hidden sm:inline">{label}</span>
    </button>);
}
