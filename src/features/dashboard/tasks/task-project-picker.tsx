'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, FolderKanban, Search } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { cn } from '@/lib/utils';
import type { TaskProjectOption } from './hooks/use-task-project-options';

export type TaskProjectPickerProps = {
    value: string | null;
    projectName: string;
    options: TaskProjectOption[];
    loading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    onChange: (project: { id: string | null; name: string }) => void;
};

/**
 * Combobox-style project picker for task create/edit forms.
 * Allows searching, selecting, or clearing the linked project.
 */
export function TaskProjectPicker({ value, projectName, options, loading = false, disabled = false, placeholder = 'Search projects…', onChange, }: TaskProjectPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            inputRef.current?.focus();
        }
    }, [open]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query)
            return options;
        return options.filter((option) => option.name.toLowerCase().includes(query));
    }, [options, search]);

    const handleSelect = (project: TaskProjectOption) => {
        onChange({ id: project.id, name: project.name });
        setOpen(false);
        setSearch('');
    };

    const handleClear = () => {
        onChange({ id: null, name: '' });
        setOpen(false);
        setSearch('');
    };

    const displayLabel = value ? projectName : null;

    return (<Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" aria-expanded={open} aria-controls="project-picker-popover" className={cn('w-full justify-between font-normal', !displayLabel && 'text-muted-foreground')} disabled={disabled}>
          <span className="flex min-w-0 items-center gap-2">
            <FolderKanban className="size-4 shrink-0 text-muted-foreground" aria-hidden/>
            {displayLabel ? (<span className="truncate">{displayLabel}</span>) : (<span>{placeholder}</span>)}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden/>
        </Button>
      </PopoverTrigger>
      <PopoverContent id="project-picker-popover" className="w-[var(--radix-popover-trigger-width)] min-w-[16rem] p-0" align="start">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden/>
          <input ref={inputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" aria-label="Search projects"/>
        </div>
        <div className="max-h-60 overflow-y-auto py-1">
          {loading ? (<p className="px-3 py-4 text-center text-sm text-muted-foreground">Loading projects…</p>) : filtered.length === 0 ? (<p className="px-3 py-4 text-center text-sm text-muted-foreground">
              {search ? `No projects match "${search}".` : 'No projects available.'}
            </p>) : (filtered.map((project) => {
              const isSelected = project.id === value;
              return (<button key={project.id} type="button" onClick={() => handleSelect(project)} className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted', isSelected && 'bg-accent/10')}>
                  <FolderKanban className="size-3.5 shrink-0 text-muted-foreground" aria-hidden/>
                  <span className="min-w-0 flex-1 truncate">{project.name}</span>
                  {isSelected ? <Check className="size-4 shrink-0 text-primary" aria-hidden/> : null}
                </button>);
            }))}
        </div>
        {value ? (<div className="border-t p-1">
            <button type="button" onClick={handleClear} className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                Clear project link
              </button>
          </div>) : null}
      </PopoverContent>
    </Popover>);
}
