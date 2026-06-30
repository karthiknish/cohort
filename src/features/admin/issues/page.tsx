'use client';
import { notifyInfo, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { AdminQueryErrorAlert } from '../components/admin-query-error-alert';
import { useCallback, useMemo, useReducer } from 'react';
import { AlertCircle, CheckCircle2, Clock, LoaderCircle, RefreshCw, Search, Trash2, } from 'lucide-react';
import { format } from 'date-fns';
import { useMutation, useQuery } from 'convex/react';
import { api } from '/_generated/api';
import { Card, CardContent, CardHeader, } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, } from '@/shared/ui/table';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { usePreview } from '@/shared/contexts/preview-context';
import { getPreviewAdminProblemReports } from '@/lib/preview-data';
import { cn } from '@/lib/utils';
import { filterProblemReports, formatProblemReportDate, getProblemReportSeverityDisplay, getProblemReportStatusDisplay, type ProblemReport, } from '../lib/problem-reports';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { AdminTablePageSkeleton } from '@/features/admin/components/admin-table-page-skeleton';
import { AdminPageShell } from '../components/admin-page-shell';
function AdminIssuesToolbarActions({ loading, onRefresh, }: {
    loading: boolean;
    onRefresh: () => void;
}) {
    return (<Button type="button" onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
      <RefreshCw className={cn('mr-2 size-4', loading && 'animate-spin')} aria-hidden/>
      Refresh
    </Button>);
}
function SeverityBadge({ severity }: {
    severity: string;
}) {
    const display = getProblemReportSeverityDisplay(severity);
    return (<Badge variant={display.variant === 'default' ? undefined : display.variant} className={display.className}>
      {display.label}
    </Badge>);
}
function StatusIcon({ status }: {
    status: string;
}) {
    const display = getProblemReportStatusDisplay(status);
    switch (display.icon) {
        case 'resolved':
            return <CheckCircle2 className={display.className}/>;
        case 'in-progress':
            return <Clock className={display.className}/>;
        case 'open':
            return <AlertCircle className={display.className}/>;
        default:
            return null;
    }
}
function ProblemReportRow({ deletingId, onDeleteTarget, onStatusUpdate, report, updatingId, }: {
    deletingId: string | null;
    onDeleteTarget: (report: ProblemReport) => void;
    onStatusUpdate: (id: string, newStatus: string) => void;
    report: ProblemReport;
    updatingId: string | null;
}) {
    const handleStatusChange = (value: string) => onStatusUpdate(report.id, value);
    const handleDeleteClick = () => {
        onDeleteTarget(report);
    };
    return (<TableRow key={report.id}>
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
      <TableCell>
        <SeverityBadge severity={report.severity}/>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusIcon status={report.status}/>
          <Select value={report.status} onValueChange={handleStatusChange} disabled={updatingId === report.id}>
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
        <Button variant="ghost" size="icon" onClick={handleDeleteClick} className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={deletingId === report.id} aria-label={`Delete report ${report.title}`}>
          <Trash2 className="size-4" aria-hidden/>
        </Button>
      </TableCell>
    </TableRow>);
}
type AdminIssuesState = {
    statusFilter: string;
    searchTerm: string;
    updatingId: string | null;
    deleteTarget: ProblemReport | null;
    deletingId: string | null;
    previewReports: ProblemReport[];
};
type AdminIssuesAction = {
    type: 'setStatusFilter';
    value: string;
} | {
    type: 'setSearchTerm';
    value: string;
} | {
    type: 'setUpdatingId';
    value: string | null;
} | {
    type: 'setDeleteTarget';
    value: ProblemReport | null;
} | {
    type: 'setDeletingId';
    value: string | null;
} | {
    type: 'updatePreviewReports';
    updater: (current: ProblemReport[]) => ProblemReport[];
};
function adminIssuesReducer(state: AdminIssuesState, action: AdminIssuesAction): AdminIssuesState {
    switch (action.type) {
        case 'setStatusFilter':
            return { ...state, statusFilter: action.value };
        case 'setSearchTerm':
            return { ...state, searchTerm: action.value };
        case 'setUpdatingId':
            return { ...state, updatingId: action.value };
        case 'setDeleteTarget':
            return { ...state, deleteTarget: action.value };
        case 'setDeletingId':
            return { ...state, deletingId: action.value };
        case 'updatePreviewReports':
            return { ...state, previewReports: action.updater(state.previewReports) };
        default:
            return state;
    }
}
export default function AdminIssuesPage() {
    const { isPreviewMode } = usePreview();
    const [state, dispatch] = useReducer(adminIssuesReducer, {
        statusFilter: 'all',
        searchTerm: '',
        updatingId: null,
        deleteTarget: null,
        deletingId: null,
        previewReports: getPreviewAdminProblemReports(),
    });
    const { statusFilter, searchTerm, updatingId, deleteTarget, deletingId, previewReports } = state;
    const reports = useQuery(api.problemReports.list, isPreviewMode
        ? 'skip'
        : {
            status: statusFilter === 'all' ? null : statusFilter,
            limit: 200,
        }) as ProblemReport[] | undefined;
    const updateReport = useMutation(api.problemReports.update);
    const removeReport = useMutation(api.problemReports.remove);
    const resolvedReports = isPreviewMode ? previewReports : (reports ?? []);
    const loading = isPreviewMode ? false : reports === undefined;
    const reportsQueryError = useConvexQueryError({
        data: reports,
        skipped: isPreviewMode,
        loading,
        fallbackMessage: 'Unable to load problem reports.',
    });
    const handleStatusUpdate = (id: string, newStatus: string) => {
        if (isPreviewMode) {
            dispatch({
                type: 'updatePreviewReports',
                updater: (current) => current.map((report) => (report.id === id
                    ? { ...report, status: newStatus, updatedAt: new Date().toISOString() }
                    : report)),
            });
            notifyInfo({ title: 'Preview mode', message: `Sample issue marked as ${newStatus}.` });
            return;
        }
        dispatch({ type: 'setUpdatingId', value: id });
        void updateReport({ legacyId: id, status: newStatus })
            .then(() => {
            notifySuccess({ title: 'Status updated', message: `Report marked as ${newStatus}` });
        })
            .catch((error) => {
            reportConvexFailure({
                error,
                context: 'AdminIssuesPage:updateStatus',
                title: 'Status update failed',
                fallbackMessage: 'Unable to update report status.',
            });
        })
            .finally(() => {
            dispatch({ type: 'setUpdatingId', value: null });
        });
    };
    const handleDelete = () => {
        if (!deleteTarget || deletingId === deleteTarget.id)
            return;
        if (isPreviewMode) {
            dispatch({
                type: 'updatePreviewReports',
                updater: (current) => current.filter((report) => report.id !== deleteTarget.id),
            });
            dispatch({ type: 'setDeleteTarget', value: null });
            notifyInfo({ title: 'Preview mode', message: 'Sample issue removed locally for this session.' });
            return;
        }
        dispatch({ type: 'setDeletingId', value: deleteTarget.id });
        void removeReport({ legacyId: deleteTarget.id })
            .then(() => {
            notifySuccess({ title: 'Report deleted', message: 'The report has been removed.' });
            dispatch({ type: 'setDeleteTarget', value: null });
        })
            .catch((error) => {
            reportConvexFailure({
                error,
                context: 'AdminIssuesPage:deleteReport',
                title: 'Delete failed',
                fallbackMessage: 'Unable to delete report.',
            });
        })
            .finally(() => {
            dispatch({ type: 'setDeletingId', value: null });
        });
    };
    const handleRefresh = () => {
        if (isPreviewMode) {
            dispatch({ type: 'updatePreviewReports', updater: () => getPreviewAdminProblemReports() });
            notifyInfo({ title: 'Preview data refreshed', message: 'Showing sample admin issue reports.' });
        }
    };
    const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setSearchTerm', value: event.target.value });
    };
    const handleDeleteTargetChange = (report: ProblemReport) => {
        dispatch({ type: 'setDeleteTarget', value: report });
    };
    const handleDeleteDialogOpenChange = (open: boolean) => {
        if (!open && deletingId !== deleteTarget?.id) {
            dispatch({ type: 'setDeleteTarget', value: null });
        }
    };
    const handleCancelDelete = () => {
        dispatch({ type: 'setDeleteTarget', value: null });
    };
    const handleStatusFilterChange = (value: string) => {
        dispatch({ type: 'setStatusFilter', value });
    };
    const filteredReports = filterProblemReports(resolvedReports, {
        searchTerm,
        statusFilter,
    });
    const issuesToolbarActions = <AdminIssuesToolbarActions loading={loading} onRefresh={handleRefresh}/>;
    return (<PageSkeletonBoundary loading={loading && resolvedReports.length === 0} loadingContent={<AdminTablePageSkeleton />}>
    <AdminPageShell title="Reported issues" description="Review, triage, and resolve user-submitted problem reports from across the product." isPreviewMode={isPreviewMode} actions={issuesToolbarActions}>
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"/>
              <Input placeholder="Search by title, user, or email…" className="pl-9" value={searchTerm} onChange={handleSearchTermChange}/>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="Status Filter"/>
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
        <CardContent className="space-y-4">
          <AdminQueryErrorAlert error={reportsQueryError} title="Unable to load reports"/>
          {loading && resolvedReports.length === 0 ? (<output className="flex flex-col items-center justify-center py-12 text-muted-foreground" aria-live="polite" aria-busy="true">
              <LoaderCircle className="mb-4 size-8 animate-spin" aria-hidden/>
              <p>Loading reports…</p>
            </output>) : filteredReports.length === 0 ? (<div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg border-dashed">
              <AlertCircle className="mb-4 size-8 opacity-20"/>
              <p>
                {reportsQueryError
                ? reportsQueryError
                : 'No issues found matching your criteria.'}
              </p>
            </div>) : (<div className="rounded-md border">
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
                  {filteredReports.map((report: ProblemReport) => (<ProblemReportRow key={report.id} deletingId={deletingId} onDeleteTarget={handleDeleteTargetChange} onStatusUpdate={handleStatusUpdate} report={report} updatingId={updatingId}/>))}
                </TableBody>
              </Table>
            </div>)}
        </CardContent>
      </Card>

      <ConfirmDialog open={Boolean(deleteTarget)} onOpenChange={handleDeleteDialogOpenChange} title="Delete reported issue" description={deleteTarget ? `Delete “${deleteTarget.title}”? This action cannot be undone.` : 'This action cannot be undone.'} confirmLabel="Delete report" cancelLabel="Cancel" variant="destructive" isLoading={deletingId === deleteTarget?.id} onConfirm={handleDelete} onCancel={handleCancelDelete}/>
    </AdminPageShell>
    </PageSkeletonBoundary>);
}
