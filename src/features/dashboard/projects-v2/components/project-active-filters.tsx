'use client';

import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';

type ProjectActiveFiltersProps = {
  labels: string[];
  onClearAll: () => void;
};

export function ProjectActiveFilters({ labels, onClearAll }: ProjectActiveFiltersProps) {
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        Active filters
      </span>
      {labels.map((label) => (
        <Badge key={label} variant="secondary" className="font-normal">
          {label}
        </Badge>
      ))}
      <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={onClearAll}>
        <X className="size-3" aria-hidden />
        Clear all
      </Button>
    </div>
  );
}
