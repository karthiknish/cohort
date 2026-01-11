'use client'

import { useMemo, useState } from 'react'
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
import { useAuth } from '@/contexts/auth-context'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface ProblemReport {
  id: string
  userId: string
  userEmail: string
  userName: string
  workspaceId: string | null
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: any
  updatedAt: any
}

export default function AdminIssuesPage() {
  const { toast } = useToast()

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const reports = useQuery(api.problemReports.list, {
    status: statusFilter === 'all' ? null : statusFilter,
    limit: 200,
  })

  const updateReport = useMutation(api.problemReports.update)
  const removeReport = useMutation(api.problemReports.remove)

  const loading = reports === undefined

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    try {
      await updateReport({ legacyId: id, status: newStatus })
      toast({ title: 'Status updated', description: `Report marked as ${newStatus}` })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update report status',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return

    try {
      await removeReport({ legacyId: id })
      toast({ title: 'Report deleted', description: 'The report has been removed.' })
    } catch (error) {
      console.error('Error deleting report:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete report',
        variant: 'destructive',
      })
    }
  }

  const filteredReports = (reports ?? []).filter((r) => {
    const search = searchTerm.toLowerCase()
    return (
      r.title.toLowerCase().includes(search) ||
      (r.userEmail ?? '').toLowerCase().includes(search) ||
      (r.userName ?? '').toLowerCase().includes(search)
    )
  })

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>
      case 'high': return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>
      case 'medium': return <Badge variant="secondary">Medium</Badge>
      case 'low': return <Badge variant="outline">Low</Badge>
      default: return <Badge>{severity}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'open': return <AlertCircle className="h-4 w-4 text-orange-500" />
      default: return null
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const parsed = typeof date === 'string' ? new Date(date) : new Date(date)
    return format(parsed, 'MMM d, h:mm a')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reported Issues</h1>
          <p className="text-muted-foreground">Manage and track user-submitted problem reports.</p>
        </div>
        <Button onClick={() => { /* Convex is realtime */ }} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, user, or email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
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
          {loading && (reports ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <LoaderCircle className="mb-4 h-8 w-8 animate-spin" />
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
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="max-w-[300px]">
                        <div className="font-medium">{report.title}</div>
                        <div className="truncate text-xs text-muted-foreground" title={report.description}>
                          {report.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{report.userName}</div>
                        <div className="text-xs text-muted-foreground">{report.userEmail}</div>
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(report.severity)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <Select
                            value={report.status}
                            onValueChange={(val) => handleStatusUpdate(report.id, val)}
                            disabled={updatingId === report.id}
                          >
                            <SelectTrigger className="h-8 w-[130px] border-none bg-transparent p-0 hover:bg-accent focus:ring-0">
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
                        {formatDate(report.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(report.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
