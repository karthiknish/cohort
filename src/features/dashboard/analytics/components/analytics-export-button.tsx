'use client'

import { notifyFailure } from '@/lib/notifications'
import { useCallback, useState, useRef } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { SvglExcelIcon } from '@/shared/components/svgl-brand-logo'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { useToast } from '@/shared/ui/use-toast'
import { useAnalyticsExport } from '../hooks/use-analytics-export'
import type { MetricRecord } from '../hooks/types'

interface AnalyticsExportButtonProps {
  metrics: MetricRecord[]
  disabled?: boolean
}

export function AnalyticsExportButton({ metrics, disabled }: AnalyticsExportButtonProps) {
  const { exportToSpreadsheet, exportToJSON, canExport } = useAnalyticsExport(metrics)
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const exportTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleExport = useCallback(async (format: 'excel' | 'json') => {
    if (!canExport || isExporting) return

    setIsExporting(true)

    // Clear an existing timeout
    if (exportTimeoutRef.current) {
      clearTimeout(exportTimeoutRef.current)
    }

    try {
      if (format === 'excel') {
        await exportToSpreadsheet()
      } else {
        exportToJSON()
      }

      toast({
        title: 'Export successful',
        description: `Your data has been exported as ${format === 'excel' ? 'Excel' : 'JSON'}.`,
      })

      // Reset loading state after a short delay
      exportTimeoutRef.current = setTimeout(() => {
        setIsExporting(false)
      }, 1000)
    } catch {
      setIsExporting(false)
      notifyFailure({
        title: 'Export failed',
        message: 'There was a problem exporting your data. Please try again.',
      })
    }
  }, [canExport, exportToSpreadsheet, exportToJSON, isExporting, toast])

  const handleExportExcel = useCallback(() => {
    void handleExport('excel')
  }, [handleExport])

  const handleExportJson = useCallback(() => {
    void handleExport('json')
  }, [handleExport])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || !canExport || isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportExcel}>
          <SvglExcelIcon className="mr-2 size-4" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJson}>
          <Download className="mr-2 size-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
