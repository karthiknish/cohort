'use client';
import { useCallback, useMemo, useState } from 'react';
import { format, subDays, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger, } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
type DayPickerRange = {
    from: Date;
    to: Date;
};
export interface AnalyticsDateRange {
    start: Date;
    end: Date;
}
type PeriodValue = '7d' | '14d' | '30d' | '90d' | 'max' | 'custom';
const PERIOD_OPTIONS: Array<{
    value: PeriodValue;
    label: string;
    days: number;
}> = [
    { value: '7d', label: 'Last 7 days', days: 7 },
    { value: '14d', label: 'Last 14 days', days: 14 },
    { value: '30d', label: 'Last 30 days', days: 30 },
    { value: '90d', label: 'Last 90 days', days: 90 },
    { value: 'max', label: 'Max (365 days)', days: 365 },
    { value: 'custom', label: 'Custom range', days: 0 },
];
function getPresetRange(days: number): AnalyticsDateRange {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(end, days - 1));
    return { start, end };
}
function formatDateRange(range: AnalyticsDateRange): string {
    const startStr = format(range.start, 'MMM d');
    const endStr = format(range.end, 'MMM d, yyyy');
    return `${startStr} – ${endStr}`;
}
interface AnalyticsDateRangePickerProps {
    value: AnalyticsDateRange;
    onChange: (range: AnalyticsDateRange, days?: number) => void;
    className?: string;
}
export function AnalyticsDateRangePicker({ value, onChange, className, }: AnalyticsDateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const maxDisabledDate = new Date();
    const minDisabledDate = new Date(maxDisabledDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    const currentDays = differenceInDays(value.end, value.start) + 1;
    const currentPreset: PeriodValue = (() => {
        if (currentDays === 7)
            return '7d';
        if (currentDays === 14)
            return '14d';
        if (currentDays === 30)
            return '30d';
        if (currentDays === 90)
            return '90d';
        if (currentDays === 365)
            return 'max';
        return 'custom';
    })();
    const currentPresetLabel = PERIOD_OPTIONS.find((opt) => opt.value === currentPreset)?.label ?? 'Custom range';
    const dateRange = useMemo(() => ({
        from: value.start,
        to: value.end,
    }), [value.start, value.end]);
    const handleSelect = useCallback((range: Partial<DayPickerRange> | undefined) => {
        if (range?.from && range?.to) {
            const newRange: AnalyticsDateRange = {
                start: startOfDay(range.from),
                end: endOfDay(range.to),
            };
            const days = differenceInDays(newRange.end, newRange.start) + 1;
            onChange(newRange, days);
        }
    }, [onChange]);
    const handleQuickPresetClick = useCallback((days: number) => {
        onChange(getPresetRange(days), days);
        setOpen(false);
    }, [onChange]);
    const handleDisabledDate = useCallback((date: Date) => date > maxDisabledDate || date < minDisabledDate, [maxDisabledDate, minDisabledDate]);
    return (<div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('h-9 justify-start text-left font-normal', !value && 'text-muted-foreground')}>
            <CalendarIcon className="mr-2 size-4"/>
            <span className="flex items-center gap-1.5">
              {currentPresetLabel}
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{formatDateRange(value)}</span>
            </span>
            <ChevronDown className="ml-1 size-3.5 opacity-50"/>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-col gap-1 border-b p-3 sm:border-b-0 sm:border-r">
              <span className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Quick select
              </span>
              {PERIOD_OPTIONS.flatMap((preset) => preset.value !== 'custom'
                ? [<button key={preset.days} type="button" onClick={() => handleQuickPresetClick(preset.days)} className={cn('rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted', currentPreset === preset.value
                        ? 'bg-primary/[0.08] font-medium text-primary'
                        : 'text-foreground')}>
                    {preset.label}
                  </button>]
                : [])}
            </div>
            <div className="p-1">
              <Calendar initialFocus mode="range" defaultMonth={dateRange.from} selected={dateRange} onSelect={handleSelect} numberOfMonths={2} disabled={handleDisabledDate}/>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>);
}
