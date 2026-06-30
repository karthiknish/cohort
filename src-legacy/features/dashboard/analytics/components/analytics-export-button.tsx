'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { logError } from '@/lib/convex-errors';
import { useCallback, useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { SvglExcelIcon } from '@/shared/components/svgl-brand-logo';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { useAnalyticsExport } from '../hooks/use-analytics-export';
import type { AnalyticsBreakdownRow } from '../hooks/use-analytics-data';
import type { MetricRecord } from '../hooks/types';
interface AnalyticsExportButtonProps {
    metrics: MetricRecord[];
    breakdowns?: AnalyticsBreakdownRow[];
    disabled?: boolean;
}
export function AnalyticsExportButton({ metrics, breakdowns, disabled }: AnalyticsExportButtonProps) {
    const { exportToSpreadsheet, exportToJSON, canExport } = useAnalyticsExport(metrics, breakdowns);
    const [isExporting, setIsExporting] = useState(false);
    const exportTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const handleExport = async (format: 'excel' | 'json') => {
        if (!canExport || isExporting)
            return;
        setIsExporting(true);
        // Clear an existing timeout
        if (exportTimeoutRef.current) {
            clearTimeout(exportTimeoutRef.current);
        }
        try {
            if (format === 'excel') {
                await exportToSpreadsheet();
            }
            else {
                exportToJSON();
            }
            notifySuccess({
                title: 'Export successful',
                message: `Your data has been exported as ${format === 'excel' ? 'Excel' : 'JSON'}.`,
            });
            // Reset loading state after a short delay
            exportTimeoutRef.current = setTimeout(() => {
                setIsExporting(false);
            }, 1000);
        }
        catch (error) {
            logError(error, 'analytics-export-button:handleExport');
            setIsExporting(false);
            notifyFailure({
                title: 'Export failed',
                error,
                fallbackMessage: 'There was a problem exporting your data. Please try again.',
            });
        }
    };
    const handleExportExcel = () => {
        void handleExport('excel');
    };
    const handleExportJson = () => {
        void handleExport('json');
    };
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || !canExport || isExporting} className="gap-2">
          {isExporting ? (<Loader2 className="size-4 animate-spin"/>) : (<Download className="size-4"/>)}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportExcel}>
          <SvglExcelIcon className="mr-2 size-4"/>
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJson}>
          <Download className="mr-2 size-4"/>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
}
