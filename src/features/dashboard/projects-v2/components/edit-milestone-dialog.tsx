'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, LoaderCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/lib/utils';
import type { MilestoneRecord, MilestoneStatus } from '@/types/milestones';
import { MILESTONE_STATUSES } from '@/types/milestones';
import { parseDate } from '../utils/project-formatters';

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
};

export type EditMilestoneDialogProps = {
  milestone: MilestoneRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    milestone: MilestoneRecord,
    patch: {
      title?: string;
      status?: string;
      description?: string | null;
      startDateMs?: number | null;
      endDateMs?: number | null;
    },
  ) => Promise<void>;
};

export function EditMilestoneDialog({
  milestone,
  open,
  onOpenChange,
  onSave,
}: EditMilestoneDialogProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<MilestoneStatus>('planned');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (milestone && open) {
      setTitle(milestone.title);
      setStatus(milestone.status);
      setDescription(milestone.description ?? '');
      setStartDate(parseDate(milestone.startDate) ?? undefined);
      setEndDate(parseDate(milestone.endDate) ?? undefined);
    }
  }, [milestone, open]);

  const canSave = useMemo(() => {
    if (!milestone) return false;
    if (!title.trim()) return false;
    if (!startDate) return false;
    return true;
  }, [milestone, title, startDate]);

  const handleSave = async () => {
    if (!milestone || !canSave) return;
    setSaving(true);
    try {
      await onSave(milestone, {
        title: title.trim(),
        status,
        description: description.trim() || null,
        startDateMs: startDate ? startDate.getTime() : null,
        endDateMs: endDate ? endDate.getTime() : null,
      });
      onOpenChange(false);
    } catch {
      // Errors are reported by the parent mutation; just keep dialog open
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit milestone</DialogTitle>
          <DialogDescription>Update the milestone details and schedule.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="milestone-title">Title</Label>
            <Input
              id="milestone-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Milestone title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as MilestoneStatus)}>
              <SelectTrigger id="milestone-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MILESTONE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-description">Description</Label>
            <Textarea
              id="milestone-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave || saving}>
            {saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
