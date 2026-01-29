'use client'

import { useState, useRef } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { useAnalyticsExport } from '../hooks/use-analytics-export'
import type { MetricRecord } from '../hooks/types'

interface AnalyticsExportButtonProps {
  metrics: MetricRecord[]
  disabled?: boolean
}

export function AnalyticsExportButton({ metrics, disabled }: AnalyticsExportButtonProps) {
  const { exportToCSV, exportToJSON, canExport } = useAnalyticsExport(metrics)
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const exportTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleExport = async (format: 'csv' | 'json') => {
    if (!canExport || isExporting) return

    setIsExporting(true)

    // Clear any existing timeout
    if (exportTimeoutRef.current) {
      clearTimeout(exportTimeoutRef.current)
    }

    try {
      if (format === 'csv') {
        exportToCSV()
      } else {
        exportToJSON()
      }

      toast({
        title: 'Export successful',
        description: `Your data has been exported as ${format.toUpperCase()}.`,
      })

      // Reset loading state after a short delay
      exportTimeoutRef.current = setTimeout(() => {
        setIsExporting(false)
      }, 1000)
    } catch (error) {
      setIsExporting(false)
      toast({
        title: 'Export failed',
        description: 'There was a problem exporting your data. Please try again.',
        variant: 'destructive',
      })
    }
  }

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
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <Download className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <Download className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
