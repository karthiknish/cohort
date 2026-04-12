'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { useMutation, useQuery } from 'convex/react'
import { api } from '/_generated/api'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { usePreview } from '@/shared/contexts/preview-context'
import { getPreviewAdminProblemReports } from '@/lib/preview-data'
import { useToast } from '@/shared/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  filterProblemReports,
  formatProblemReportDate,
  getProblemReportSeverityDisplay,
  getProblemReportStatusDisplay,
  type ProblemReport,
} from '../lib/problem-reports'
import { AdminPageShell } from '../components/admin-page-shell'

function AdminIssuesToolbarActions({
  loading,
  onRefresh,
}: {
  loading: boolean
  onRefresh: () => void
}) {
  return (
    <Button type="button" onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
      <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} aria-hidden />
      Refresh
    </Button>
  )
}

function renderSeverityBadge(severity: string) {
  const display = getProblemReportSeverityDisplay(severity)

  return (
    <Badge
      variant={display.variant === 'default' ? undefined : display.variant}
      className={display.className}
    >
      {display.label}
    </Badge>
  )
}

function renderStatusIcon(status: string) {
  const display = getProblemReportStatusDisplay(status)

  switch (display.icon) {
    case 'resolved':
      return <CheckCircle2 className={display.className} />
    case 'in-progress':
      return <Clock className={display.className} />
    case 'open':
      return <AlertCircle className={display.className} />
    default:
      return null
  }
}

function ProblemReportRow({
  deletingId,
  onDeleteTarget,
  onStatusUpdate,
  report,
  updatingId,
}: {
  deletingId: string | null
  onDeleteTarget: (report: ProblemReport) => void
  onStatusUpdate: (id: string, newStatus: string) => void
  report: ProblemReport
  updatingId: string | null
}) {
  const handleStatusChange = useCallback(
    (value: string) => onStatusUpdate(report.id, value),
    [onStatusUpdate, report.id]
  )

  const handleDeleteClick = useCallback(() => {
    onDeleteTarget(report)
  }, [onDeleteTarget, report])

  return (
    <TableRow key={report.id}>
      <th scope="row" className={cn('max-w-75 p-4 text-left align-middle font-normal')}>
        <div className="font-medium">{report.title}</div>
        <div className="truncate text-xs text-muted-foreground" title={report.description}>
          {report.description}
        </div>
      </th>
      <TableCell>
        <div className="text-sm">{report.userName}</div>
        <div className="text-xs text-muted-foreground">{report.userEmail}</div>
      </TableCell>
      <TableCell>{renderSeverityBadge(report.severity)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {renderStatusIcon(report.status)}
          <Select
            value={report.status}
            onValueChange={handleStatusChange}
            disabled={updatingId === report.id}
          >
            <SelectTrigger className="h-8 w-32.5 border-none bg-transparent p-0 hover:bg-accent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TableCell>
      <TableCell className="text-sm whitespace-nowrap">
        {formatProblemReportDate(report.createdAt, (value) => format(value, 'MMM d, h:mm a'))}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteClick}
          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={deletingId === report.id}
          aria-label={`Delete report ${report.title}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function AdminIssuesPage() {
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProblemReport | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewReports, setPreviewReports] = useState<ProblemReport[]>(() => getPreviewAdminProblemReports())

  const reports = useQuery(
    api.problemReports.list,
    isPreviewMode
      ? 'skip'
      : {
          status: statusFilter === 'all' ? null : statusFilter,
          limit: 200,
        }
  ) as ProblemReport[] | undefined

  const updateReport = useMutation(api.problemReports.update)
  const removeReport = useMutation(api.problemReports.remove)

  const resolvedReports = isPreviewMode ? previewReports : (reports ?? [])
  const loading = isPreviewMode ? false : reports === undefined

  const handleStatusUpdate = useCallback((id: string, newStatus: string) => {
    if (isPreviewMode) {
      setPreviewReports((current) => current.map((report) => (
        report.id === id
          ? { ...report, status: newStatus, updatedAt: new Date().toISOString() }
          : report
      )))
      toast({ title: 'Preview mode', description: `Sample issue marked as ${newStatus}.` })
      return
    }

    setUpdatingId(id)

    void updateReport({ legacyId: id, status: newStatus })
      .then(() => {
        toast({ title: 'Status updated', description: `Report marked as ${newStatus}` })
      })
      .catch((error) => {
        console.error('Error updating status:', error)
        toast({
          title: 'Error',
          description: 'Failed to update report status',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setUpdatingId(null)
      })
  }, [isPreviewMode, toast, updateReport])

  const handleDelete = useCallback(() => {
    if (!deleteTarget || deletingId === deleteTarget.id) return

    if (isPreviewMode) {
      setPreviewReports((current) => current.filter((report) => report.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast({ title: 'Preview mode', description: 'Sample issue removed locally for this session.' })
      return
    }

    setDeletingId(deleteTarget.id)

    void removeReport({ legacyId: deleteTarget.id })
      .then(() => {
        toast({ title: 'Report deleted', description: 'The report has been removed.' })
        setDeleteTarget(null)
      })
      .catch((error) => {
        console.error('Error deleting report:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete report',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setDeletingId(null)
      })
  }, [deleteTarget, deletingId, isPreviewMode, removeReport, toast])

  const handleRefresh = useCallback(() => {
    if (isPreviewMode) {
      setPreviewReports(getPreviewAdminProblemReports())
      toast({ title: 'Preview data refreshed', description: 'Showing sample admin issue reports.' })
    }
  }, [isPreviewMode, toast])

  const handleSearchTermChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }, [])

  const handleDeleteTargetChange = useCallback((report: ProblemReport) => {
    setDeleteTarget(report)
  }, [])

  const handleDeleteDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open && deletingId !== deleteTarget?.id) {
        setDeleteTarget(null)
      }
    },
    [deleteTarget?.id, deletingId]
  )

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  const filteredReports = filterProblemReports(resolvedReports, {
    searchTerm,
    statusFilter,
  })

  const issuesToolbarActions = useMemo(
    () => <AdminIssuesToolbarActions loading={loading} onRefresh={handleRefresh} />,
    [loading, handleRefresh],
  )

  return (
    <AdminPageShell
      title="Reported issues"
      description="Review, triage, and resolve user-submitted problem reports from across the product."
      isPreviewMode={isPreviewMode}
      actions={issuesToolbarActions}
    >
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, user, or email…"
                className="pl-9"
                value={searchTerm}
                onChange={handleSearchTermChange}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && resolvedReports.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              <LoaderCircle className="mb-4 h-8 w-8 animate-spin" aria-hidden />
              <p>Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg border-dashed">
              <AlertCircle className="mb-4 h-8 w-8 opacity-20" />
              <p>No issues found matching your criteria.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption className="sr-only">Problem reports from workspace users</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Issue</TableHead>
                    <TableHead scope="col">User</TableHead>
                    <TableHead scope="col">Severity</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Reported</TableHead>
                    <TableHead scope="col" className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report: ProblemReport) => (
                    <ProblemReportRow
                      key={report.id}
                      deletingId={deletingId}
                      onDeleteTarget={handleDeleteTargetChange}
                      onStatusUpdate={handleStatusUpdate}
                      report={report}
                      updatingId={updatingId}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={handleDeleteDialogOpenChange}
        title="Delete reported issue"
        description={deleteTarget ? `Delete “${deleteTarget.title}”? This action cannot be undone.` : 'This action cannot be undone.'}
        confirmLabel="Delete report"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={deletingId === deleteTarget?.id}
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      />
    </AdminPageShell>
  )
}
