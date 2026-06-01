'use client';
import { exportCohortsSpreadsheet } from '@/lib/export/cohorts-spreadsheet';
import { buildSpreadsheetChartsFromTableData } from '@/lib/export/cohorts-spreadsheet-charts';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { SvglExcelIcon, SvglPdfIcon } from '@/shared/components/svgl-brand-logo';
import { useCallback, useState } from 'react';
import { Download, FileImage, FileJson, LoaderCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/shared/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { cn } from '@/lib/utils';
import { useToast } from '@/shared/ui/use-toast';
import type { ChartDataPoint } from './interactive-chart';
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json' | 'png';
interface ExportOption {
    value: ExportFormat;
    label: string;
    icon: React.ComponentType<{
        className?: string;
    }>;
    description: string;
}
function DashboardExportMenuOption({ option, isExporting, onSelect, }: {
    option: ExportOption;
    isExporting: boolean;
    onSelect: (format: ExportFormat) => void;
}) {
    const onSelectExportFormat = () => {
        onSelect(option.value);
    };
    return (<DropdownMenuItem onClick={onSelectExportFormat} disabled={isExporting}>
      <option.icon className="mr-2 size-4"/>
      <div>
        <div className="font-medium">{option.label}</div>
        <div className="text-xs text-muted-foreground">{option.description}</div>
      </div>
    </DropdownMenuItem>);
}
function DashboardExportGridOption({ option, isExporting, onSelect, }: {
    option: ExportOption;
    isExporting: boolean;
    onSelect: (format: ExportFormat) => void;
}) {
    const onSelectExportFormat = () => {
        onSelect(option.value);
    };
    const Icon = option.icon;
    return (<button type="button" onClick={onSelectExportFormat} disabled={isExporting} className={cn('flex items-center gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent', isExporting && 'pointer-events-none opacity-50')}>
      <Icon className="size-5 text-muted-foreground"/>
      <div>
        <p className="font-medium">{option.label}</p>
        <p className="text-xs text-muted-foreground">{option.description}</p>
      </div>
      {isExporting && <LoaderCircle className="ml-auto size-4 animate-spin"/>}
    </button>);
}
const EXPORT_OPTIONS: ExportOption[] = [
    {
        value: 'excel',
        label: 'Excel',
        icon: SvglExcelIcon,
        description: 'Branded Cohorts spreadsheet',
    },
    {
        value: 'pdf',
        label: 'PDF',
        icon: SvglPdfIcon,
        description: 'PDF document',
    },
    {
        value: 'json',
        label: 'JSON',
        icon: FileJson,
        description: 'Raw data in JSON format',
    },
    {
        value: 'png',
        label: 'Image',
        icon: FileImage,
        description: 'PNG image snapshot',
    },
];
interface DashboardExportProps {
    data: ChartDataPoint[] | Record<string, unknown>[];
    filename?: string;
    title?: string;
    formats?: ExportOption[];
    includeFormats?: ExportOption[];
    onExport?: (format: ExportFormat, options: ExportOptions) => Promise<void>;
    trigger?: React.ReactNode;
    buttonVariant?: 'default' | 'outline' | 'ghost';
    buttonSize?: 'default' | 'sm' | 'icon';
    className?: string;
}
export interface ExportOptions {
    includeHeaders?: boolean;
    includeMetadata?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
    selectedFields?: string[];
}
/**
 * Export button with multiple format support
 */
export function DashboardExport({ formats = EXPORT_OPTIONS, onExport, trigger, buttonVariant = 'outline', buttonSize = 'sm', className, }: DashboardExportProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [includeHeaders, setIncludeHeaders] = useState(true);
    const [includeMetadata, setIncludeMetadata] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const handleExport = async (format: ExportFormat) => {
        setIsExporting(true);
        await Promise.resolve(onExport?.(format, {
            includeHeaders,
            includeMetadata,
        }))
            .then(() => {
            toast({
                title: 'Export successful',
                description: `Your data has been exported as ${format.toUpperCase()}.`,
            });
            setOpen(false);
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'DashboardExport:handleExport',
                title: 'Export failed',
                fallbackMessage: 'Export failed',
            });
        })
            .finally(() => {
            setIsExporting(false);
        });
    };
    const defaultTrigger = (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Download className="size-4"/>
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {formats.map((option) => (<DashboardExportMenuOption key={option.value} option={option} isExporting={isExporting} onSelect={handleExport}/>))}
      </DropdownMenuContent>
    </DropdownMenu>);
    return (<>
      {trigger || defaultTrigger}
      {/* Full export dialog with options */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="size-5"/>
              Export Dashboard Data
            </DialogTitle>
            <DialogDescription>
              Choose format and options for exporting your data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Format selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-2 gap-2">
                {formats.map((option) => {
            return (<DashboardExportGridOption key={option.value} option={option} isExporting={isExporting} onSelect={handleExport}/>);
        })}
              </div>
            </div>

            {/* Export options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="headers">Include column headers</Label>
                <Checkbox id="headers" checked={includeHeaders} onCheckedChange={setIncludeHeaders}/>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="metadata">Include metadata (dates, IDs)</Label>
                <Checkbox id="metadata" checked={includeMetadata} onCheckedChange={setIncludeMetadata}/>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>);
}
/**
 * Quick export button for single format
 */
export function QuickExportButton({ format, data, filename, icon: Icon, disabled, onComplete, }: {
    format: ExportFormat;
    data: ChartDataPoint[] | Record<string, unknown>[];
    filename?: string;
    icon?: React.ComponentType<{
        className?: string;
    }>;
    disabled?: boolean;
    onComplete?: () => void;
}) {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);
    const handleExport = async () => {
        setIsExporting(true);
        try {
            if (format === 'excel' || format === 'csv') {
                const rows = data as Record<string, unknown>[];
                await exportCohortsSpreadsheet({
                    data: rows,
                    filename: `${filename || 'export'}.xlsx`,
                    title: filename || 'Dashboard export',
                    charts: buildSpreadsheetChartsFromTableData(rows, filename || 'Dashboard export'),
                });
                toast({
                    title: 'Export complete',
                    description: 'Your data has been exported as XLSX.',
                });
                onComplete?.();
                return;
            }
            if (format === 'json') {
                const content = JSON.stringify(data, null, 2);
                const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${filename || 'export'}.json`;
                link.click();
                URL.revokeObjectURL(url);
                toast({
                    title: 'Export complete',
                    description: 'Your data has been exported as JSON.',
                });
                onComplete?.();
                return;
            }
            throw new Error(`Unsupported format: ${format}`);
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'QuickExportButton:handleExport',
                title: 'Export failed',
                fallbackMessage: 'Export failed',
            });
        }
        finally {
            setIsExporting(false);
        }
    };
    return (<Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={disabled || isExporting} className="gap-1.5">
      {isExporting ? (<LoaderCircle className="size-4 animate-spin"/>) : Icon ? (<Icon className="size-4"/>) : null}
      {isExporting ? 'Exporting...' : format.toUpperCase()}
    </Button>);
}
/**
 * Scheduled export configuration dialog
 */
export function ScheduledExportDialog({ trigger, onSchedule, }: {
    trigger?: React.ReactNode;
    onSchedule?: (config: {
        format: ExportFormat;
        frequency: 'daily' | 'weekly' | 'monthly';
        recipients: string[];
    }) => void;
}) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<ExportFormat>('excel');
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [isScheduling, setIsScheduling] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const handleFormatChange = (value: ExportFormat) => {
        setFormat(value);
    };
    const handleFrequencyChange = (value: 'daily' | 'weekly' | 'monthly') => {
        setFrequency(value);
    };
    const handleSchedule = () => {
        const recipients: string[] = [];
        setIsScheduling(true);
        void Promise.resolve()
            .then(() => {
            onSchedule?.({ format, frequency, recipients });
            toast({
                title: 'Scheduled export created',
                description: `You'll receive ${format.toUpperCase()} exports ${frequency}.`,
            });
            setOpen(false);
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'ScheduledExportDialog:handleSchedule',
                title: 'Failed to schedule',
                fallbackMessage: 'Failed to schedule',
            });
        })
            .finally(() => {
            setIsScheduling(false);
        });
    };
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (<Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4"/>
            Schedule Export
          </Button>)}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Automatic Exports</DialogTitle>
          <DialogDescription>
            Set up recurring data exports sent to your email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format */}
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={handleFormatChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipients would be populated with team members */}
          <div className="text-sm text-muted-foreground">
            Reports will be sent to your email address.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={isScheduling}>
            {isScheduling ? 'Scheduling...' : 'Schedule Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);
}
