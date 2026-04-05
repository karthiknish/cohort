export interface ProblemReport {
  id: string
  userId: string | null
  userEmail: string | null
  userName: string | null
  workspaceId: string | null
  title: string
  description: string
  severity: string
  status: string
  fixed: boolean | null
  resolution: string | null
  createdAt: string
  updatedAt: string
}

export type ProblemReportSeverityDisplay = {
  label: string
  variant: 'default' | 'destructive' | 'secondary' | 'outline'
  className?: string
}

export type ProblemReportStatusDisplay = {
  icon: 'resolved' | 'in-progress' | 'open' | null
  className?: string
}

const HIGH_SEVERITY_CLASS_NAME = 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20'

export function getProblemReportSeverityDisplay(severity: string): ProblemReportSeverityDisplay {
  switch (severity) {
    case 'critical':
      return { label: 'Critical', variant: 'destructive' }
    case 'high':
      return { label: 'High', variant: 'default', className: HIGH_SEVERITY_CLASS_NAME }
    case 'medium':
      return { label: 'Medium', variant: 'secondary' }
    case 'low':
      return { label: 'Low', variant: 'outline' }
    default:
      return { label: severity, variant: 'default' }
  }
}

export function getProblemReportStatusDisplay(status: string): ProblemReportStatusDisplay {
  switch (status) {
    case 'resolved':
      return { icon: 'resolved', className: 'h-4 w-4 text-success' }
    case 'in-progress':
      return { icon: 'in-progress', className: 'h-4 w-4 text-info' }
    case 'open':
      return { icon: 'open', className: 'h-4 w-4 text-warning' }
    default:
      return { icon: null }
  }
}

export function formatProblemReportDate(date: string | null, formatDate: (value: Date) => string) {
  if (!date) return 'N/A'
  return formatDate(new Date(date))
}

export function filterProblemReports(
  reports: ProblemReport[],
  options: { searchTerm: string; statusFilter: string },
) {
  const normalizedSearch = options.searchTerm.trim().toLowerCase()

  return reports.filter((report) => {
    if (options.statusFilter !== 'all' && report.status !== options.statusFilter) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    return (
      report.title.toLowerCase().includes(normalizedSearch) ||
      (report.userEmail ?? '').toLowerCase().includes(normalizedSearch) ||
      (report.userName ?? '').toLowerCase().includes(normalizedSearch)
    )
  })
}