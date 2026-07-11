'use client';
import { useCallback, type ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts';
interface ProjectSearchProps {
    value: string;
    onChange: (value: string) => void;
}
export function ProjectSearch({ value, onChange }: ProjectSearchProps) {
    const onSearchQueryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value), [onChange]);
    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);
    return (<div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
      <Input id="project-search" placeholder="Search by name, client, or tag…" value={value} onChange={onSearchQueryChange} className="h-9 border-border/60 bg-background pl-9 pr-20 text-sm shadow-sm" aria-label="Search projects"/>
      <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 sm:flex">
        {value ? null : <KeyboardShortcutBadge combo="mod+f" className="scale-90 opacity-70"/>}
      </div>
      {value ? (<button type="button" onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Clear search">
          <X className="size-4"/>
        </button>) : null}
    </div>);
}
