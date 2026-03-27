'use client'

import { useCallback, useState } from 'react'
import { Download, FileImage, FileJson, FileSpreadsheet, LoaderCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Checkbox } from '@/shared/ui/checkbox'
import { cn } from '@/lib/utils'
import { useToast } from '@/shared/ui/use-toast'
import type { ChartDataPoint } from './interactive-chart'

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json' | 'png'

interface ExportOption {
  value: ExportFormat
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

function DashboardExportMenuOption({
  option,
  isExporting,
  onSelect,
}: {
  option: ExportOption
  isExporting: boolean
  onSelect: (format: ExportFormat) => void
}) {
  const handleClick = useCallback(() => {
    onSelect(option.value)
  }, [onSelect, option.value])

  return (
    <DropdownMenuItem onClick={handleClick} disabled={isExporting}>
      <option.icon className="mr-2 h-4 w-4" />
      <div>
        <div className="font-medium">{option.label}</div>
        <div className="text-xs text-muted-foreground">{option.description}</div>
      </div>
    </DropdownMenuItem>
  )
}

function DashboardExportGridOption({
  option,
  isExporting,
  onSelect,
}: {
  option: ExportOption
  isExporting: boolean
  onSelect: (format: ExportFormat) => void
}) {
  const handleClick = useCallback(() => {
    onSelect(option.value)
  }, [onSelect, option.value])
  const Icon = option.icon

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isExporting}
      className={cn(
        'flex items-center gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-accent',
        isExporting && 'pointer-events-none opacity-50'
      )}
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="font-medium">{option.label}</p>
        <p className="text-xs text-muted-foreground">{option.description}</p>
      </div>
      {isExporting && <LoaderCircle className="ml-auto h-4 w-4 animate-spin" />}
    </button>
  )
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    value: 'csv',
    label: 'CSV',
    icon: FileSpreadsheet,
    description: 'Comma-separated values for spreadsheets',
  },
  {
    value: 'excel',
    label: 'Excel',
    icon: FileSpreadsheet,
    description: 'Excel formatted spreadsheet',
  },
  {
    value: 'pdf',
    label: 'PDF',
    icon: FileSpreadsheet,
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
]

interface DashboardExportProps {
  data: ChartDataPoint[] | Record<string, unknown>[]
  filename?: string
  title?: string
  formats?: ExportOption[]
  includeFormats?: ExportOption[]
  onExport?: (format: ExportFormat, options: ExportOptions) => Promise<void>
  trigger?: React.ReactNode
  buttonVariant?: 'default' | 'outline' | 'ghost'
  buttonSize?: 'default' | 'sm' | 'icon'
  className?: string
}

export interface ExportOptions {
  includeHeaders?: boolean
  includeMetadata?: boolean
  dateRange?: { start: Date; end: Date }
  selectedFields?: string[]
}

/**
 * Export button with multiple format support
 */
export function DashboardExport({
  formats = EXPORT_OPTIONS,
  onExport,
  trigger,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  className,
}: DashboardExportProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(false)
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setIsExporting(true)
      await Promise.resolve(onExport?.(format, {
        includeHeaders,
        includeMetadata,
      }))
        .then(() => {
          toast({
            title: 'Export successful',
            description: `Your data has been exported as ${format.toUpperCase()}.`,
          })
          setOpen(false)
        })
        .catch((error) => {
          console.error('Export failed:', error)
          toast({
            title: 'Export failed',
            description: 'An error occurred while exporting your data.',
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsExporting(false)
        })
    },
    [onExport, includeHeaders, includeMetadata, toast]
  )

  const defaultTrigger = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {formats.map((option) => (
          <DashboardExportMenuOption key={option.value} option={option} isExporting={isExporting} onSelect={handleExport} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {trigger || defaultTrigger}
      {/* Full export dialog with options */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
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
                  return (
                    <DashboardExportGridOption key={option.value} option={option} isExporting={isExporting} onSelect={handleExport} />
                  )
                })}
              </div>
            </div>

            {/* Export options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="headers">Include column headers</Label>
                <Checkbox
                  id="headers"
                  checked={includeHeaders}
                  onCheckedChange={setIncludeHeaders}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="metadata">Include metadata (dates, IDs)</Label>
                <Checkbox
                  id="metadata"
                  checked={includeMetadata}
                  onCheckedChange={setIncludeMetadata}
                />
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
    </>
  )
}

/**
 * Quick export button for single format
 */
export function QuickExportButton({
  format,
  data,
  filename,
  icon: Icon,
  disabled,
  onComplete,
}: {
  format: ExportFormat
  data: ChartDataPoint[] | Record<string, unknown>[]
  filename?: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
  onComplete?: () => void
}) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    await Promise.resolve()
      .then(() => {
        let content: string
        let mimeType: string
        let extension: string

        switch (format) {
          case 'csv': {
            const headers = Object.keys(data[0] as Record<string, unknown>)
            const rows = data.map((row) =>
              headers.map((h) => {
                const value = (row as Record<string, unknown>)[h]
                return escapeCsvValue(value)
              })
            )
            content = [headers.join(','), ...rows].join('\n')
            mimeType = 'text/csv;charset=utf-8;'
            extension = 'csv'
            break
          }

          case 'json':
            content = JSON.stringify(data, null, 2)
            mimeType = 'application/json;charset=utf-8;'
            extension = 'json'
            break

          default:
            throw new Error(`Unsupported format: ${format}`)
        }

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename || 'export'}.${extension}`
        link.click()
        URL.revokeObjectURL(url)

        toast({
          title: 'Export complete',
          description: `Your data has been exported as ${extension.toUpperCase()}.`,
        })
        onComplete?.()
      })
      .catch((error) => {
        console.error('Export failed:', error)
        toast({
          title: 'Export failed',
          description: 'An error occurred while exporting your data.',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setIsExporting(false)
      })
  }, [data, filename, format, toast, onComplete])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="gap-1.5"
    >
      {isExporting ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {isExporting ? 'Exporting...' : format.toUpperCase()}
    </Button>
  )
}

// Helper function to escape CSV values
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Scheduled export configuration dialog
 */
export function ScheduledExportDialog({
  trigger,
  onSchedule,
}: {
  trigger?: React.ReactNode
  onSchedule?: (config: {
    format: ExportFormat
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }) => void
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [isScheduling, setIsScheduling] = useState(false)
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])
  const handleFormatChange = useCallback((value: ExportFormat) => {
    setFormat(value)
  }, [])
  const handleFrequencyChange = useCallback((value: 'daily' | 'weekly' | 'monthly') => {
    setFrequency(value)
  }, [])

  const handleSchedule = useCallback(() => {
    const recipients: string[] = []
    setIsScheduling(true)
    Promise.resolve()
      .then(() => {
        onSchedule?.({ format, frequency, recipients })
        toast({
          title: 'Scheduled export created',
          description: `You'll receive ${format.toUpperCase()} exports ${frequency}.`,
        })
        setOpen(false)
      })
      .catch((error) => {
        console.error('Failed to schedule export:', error)
        toast({
          title: 'Failed to schedule',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setIsScheduling(false)
      })
  }, [format, frequency, onSchedule, toast])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Schedule Export
          </Button>
        )}
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
                <SelectItem value="csv">CSV</SelectItem>
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
    </Dialog>
  )
}
