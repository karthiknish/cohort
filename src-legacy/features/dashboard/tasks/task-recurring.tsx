'use client';
import { useCallback, useMemo } from 'react';
import { Repeat, Calendar, Info } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger, } from '@/shared/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { ClientFormattedDate } from '@/shared/components/client-formatted-date';
import { useClientNow } from '@/lib/hooks/use-client-relative-time';
import { cn } from '@/lib/utils';
import type { RecurrenceRule } from '@/types/tasks';
import { formatRecurrenceLabel } from './task-types';
type RecurrenceEditorProps = {
    value: RecurrenceRule;
    endDate: string | null;
    onChange: (rule: RecurrenceRule, endDate: string | null) => void;
    disabled?: boolean;
    showLabel?: boolean;
};
export function RecurrenceEditor({ value, endDate, onChange, disabled = false, showLabel = true, }: RecurrenceEditorProps) {
    const now = useClientNow();
    const minDate = (now ? now.toISOString().split('T')[0] : '');
    const handleRuleChange = (nextValue: string) => {
        onChange(nextValue as RecurrenceRule, endDate);
    };
    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(value, event.target.value || null);
    };
    const handleRemoveEndDate = () => {
        onChange(value, null);
    };
    return (<div className="space-y-3">
      {showLabel && (<div className="flex items-center gap-2">
          <Repeat className="size-4 text-muted-foreground"/>
          <Label className="text-sm">Repeat</Label>
        </div>)}

      <div className="flex items-center gap-2">
        <Select value={value} disabled={disabled} onValueChange={handleRuleChange}>
          <SelectTrigger className={cn('flex-1', value !== 'none' && 'border-accent/50')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Does not repeat</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Every 2 weeks</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        {value !== 'none' && (<Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Calendar className="size-3.5"/>
                {endDate ? 'End date set' : 'Set end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-2">
                <Label className="text-xs">Repeat until (optional)</Label>
                <Input type="date" value={endDate || ''} onChange={handleEndDateChange} min={minDate || undefined} suppressHydrationWarning/>
                {endDate && (<Button variant="ghost" size="sm" onClick={handleRemoveEndDate} className="w-full h-7 text-xs">
                    Remove end date
                  </Button>)}
              </div>
            </PopoverContent>
          </Popover>)}
      </div>

      {value !== 'none' && (<div className="flex items-start gap-2 rounded-md bg-info/10 p-2 text-xs text-info">
          <Info className="size-3.5 shrink-0 mt-0.5"/>
          <p>
            New tasks will be created automatically based on this recurrence pattern.
            {endDate ? (<>
                {' Recurring until '}
                <ClientFormattedDate value={endDate} formatStr="PPP"/>.
              </>) : null}
          </p>
        </div>)}
    </div>);
}
// Recurrence badge for display
export function RecurrenceBadge({ rule, className, }: {
    rule: RecurrenceRule;
    endDate?: string | null;
    className?: string;
}) {
    if (rule === 'none')
        return null;
    return (<Badge variant="outline" className={cn('gap-1 border-success/20 bg-success/10 text-success', className)}>
      <Repeat className="size-2.5"/>
      {formatRecurrenceLabel(rule)}
    </Badge>);
}
import { getNextOccurrence } from './task-recurring-utils';
// Display next occurrence
export function NextOccurrenceDisplay({ dueDate, rule, endDate, }: {
    dueDate: string;
    rule: RecurrenceRule;
    endDate?: string | null;
}) {
    const now = useClientNow();
    const next = now ? getNextOccurrence(dueDate, rule, endDate, now) : null;
    if (!next) {
        return (<div className="text-xs text-muted-foreground">
        {endDate ? 'Recurrence ended' : 'No future occurrences'}
      </div>);
    }
    return (<div className="text-xs text-muted-foreground">
      Next: <ClientFormattedDate value={next} formatStr="PPP" className="font-medium"/>
    </div>);
}
// Series info display
export function RecurringSeriesInfo({ rule, startDate, endDate, count, }: {
    rule: RecurrenceRule;
    startDate: string;
    endDate?: string | null;
    count?: number;
}) {
    return (<div className="space-y-2 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Repeat className="size-4"/>
        <span>Recurring Series</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Frequency:</span>
          <span className="ml-1 font-medium">{formatRecurrenceLabel(rule)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Started:</span>
          <ClientFormattedDate value={startDate} formatStr="PPP" className="ml-1 font-medium"/>
        </div>
        {endDate && (<div>
            <span className="text-muted-foreground">Ends:</span>
            <ClientFormattedDate value={endDate} formatStr="PPP" className="ml-1 font-medium"/>
          </div>)}
        {count !== undefined && (<div>
            <span className="text-muted-foreground">Occurrences:</span>
            <span className="ml-1 font-medium">{count}</span>
          </div>)}
      </div>
    </div>);
}
