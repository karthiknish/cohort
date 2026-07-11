'use client';

import { useEffect, useRef, useState } from 'react';
import { Bookmark, BookmarkPlus, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { SavedView } from '../types';
import type { SavedViewSnapshot } from '../hooks/use-saved-views';

interface SavedViewsSelectorProps {
  savedViews: SavedView[];
  onSaveView: (name: string) => SavedView;
  onApplyView: (view: SavedViewSnapshot & { name: string }) => void;
  onDeleteView: (id: string) => void;
}

export function SavedViewsSelector({
  savedViews,
  onSaveView,
  onApplyView,
  onDeleteView,
}: SavedViewsSelectorProps) {
  const [isNaming, setIsNaming] = useState(false);
  const [viewName, setViewName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNaming) inputRef.current?.focus();
  }, [isNaming]);

  const handleStartNaming = () => {
    setViewName('');
    setNameError(null);
    setIsNaming(true);
  };

  const handleConfirmSave = () => {
    const trimmed = viewName.trim();
    if (!trimmed) {
      setNameError('Enter a name');
      return;
    }
    if (savedViews.some((v) => v.name.toLowerCase() === trimmed.toLowerCase())) {
      setNameError('A view with this name already exists');
      return;
    }
    onSaveView(trimmed);
    setViewName('');
    setNameError(null);
    setIsNaming(false);
  };

  const handleCancelSave = () => {
    setViewName('');
    setNameError(null);
    setIsNaming(false);
  };

  const handleNameChange = (value: string) => {
    setViewName(value);
    if (nameError) setNameError(null);
  };

  return (
    <div className="flex items-center gap-1.5">
      {isNaming ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Input
              ref={inputRef}
              value={viewName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="View name…"
              className={cn(
                'h-9 w-36 border-border/60 bg-background text-xs shadow-sm',
                nameError && 'border-destructive',
              )}
              aria-invalid={Boolean(nameError)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmSave();
                if (e.key === 'Escape') handleCancelSave();
              }}
            />
            <Button
              type="button"
              variant="default"
              size="icon"
              className="size-9 shrink-0"
              onClick={handleConfirmSave}
              disabled={!viewName.trim()}
              aria-label="Save view"
            >
              <Check className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              onClick={handleCancelSave}
              aria-label="Cancel save"
            >
              <X className="size-4" />
            </Button>
          </div>
          {nameError ? (
            <p className="text-[10px] text-destructive">{nameError}</p>
          ) : null}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 border-border/60 shadow-sm"
          onClick={handleStartNaming}
          aria-label="Save view"
        >
          <BookmarkPlus className="size-4" />
          <span className="hidden md:inline">Save view</span>
        </Button>
      )}

      {savedViews.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 border-border/60 shadow-sm"
              aria-label="Views"
            >
              <Bookmark className="size-4" />
              <span className="hidden md:inline">Views</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saved views
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {savedViews.map((view) => (
              <SavedViewItem
                key={view.id}
                view={view}
                onApply={() => onApplyView(view)}
                onDelete={() => onDeleteView(view.id)}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

function SavedViewItem({
  view,
  onApply,
  onDelete,
}: {
  view: SavedView;
  onApply: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-1">
      <DropdownMenuItem className="flex-1 gap-2" onClick={onApply}>
        <Bookmark className="size-3.5 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm">{view.name}</span>
      </DropdownMenuItem>
      <button
        type="button"
        className={cn(
          'mr-1 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/60',
          'opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Delete saved view "${view.name}"`}
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
