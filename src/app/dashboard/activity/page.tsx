'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'
import { 
  Clock, 
  Filter, 
  Search, 
  Briefcase, 
  CheckCircle, 
  MessageSquare, 
  Calendar,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtimeActivity } from '@/app/dashboard/activity/hooks/use-realtime-activity'
import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import { PreviewDataBanner } from '@/components/dashboard/preview-data-banner'
import type { Activity, ActivityType } from '@/types/activity'

const ACTIVITY_ICONS = {
  project_updated: Briefcase,
  task_completed: CheckCircle,
  message_posted: MessageSquare,
}

const ACTIVITY_COLORS = {
  project_updated: 'bg-blue-100 text-blue-700',
  task_completed: 'bg-emerald-100 text-emerald-700',
  message_posted: 'bg-purple-100 text-purple-700',
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  project_updated: 'Project Update',
  task_completed: 'Task Activity',
  message_posted: 'New Message',
}

export default function ActivityPage() {
  const { selectedClient } = useClientContext()
  const { toast } = useToast()
  const { activities, loading, error, retry } = useRealtimeActivity(50)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all')

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesType = typeFilter === 'all' || activity.type === typeFilter
      const matchesSearch = 
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.entityName.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesType && matchesSearch
    })
  }, [activities, typeFilter, searchQuery])

  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {}
    
    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp)
      let key = format(date, 'MMMM d, yyyy')
      
      if (isToday(date)) key = 'Today'
      else if (isYesterday(date)) key = 'Yesterday'
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(activity)
    })
    
    return groups
  }, [filteredActivities])

  useEffect(() => {
    if (error) {
      toast({
        title: 'Activity sync failed',
        description: `${error}. Try refreshing.`,
        variant: 'destructive',
      })
    }
  }, [error, toast])

  const handleRetry = () => {
    toast({
      title: 'Refreshing activity',
      description: 'Syncing latest updates...',
    })
    retry()
  }

  const groupKeys = Object.keys(groupedActivities).sort((a, b) => {
    if (a === 'Today') return -1
    if (b === 'Today') return 1
    if (a === 'Yesterday') return -1
    if (b === 'Yesterday') return 1
    return new Date(b).getTime() - new Date(a).getTime()
  })

  if (!selectedClient) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Clock className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No client selected</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Select a client workspace to view their activity log.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Activity Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time timeline of updates, tasks, and collaboration across the workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRetry} disabled={loading}>
            <Clock className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <PreviewDataBanner />

      <Card>
        <CardHeader className="border-b border-muted/40 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activity..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActivityType | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activity</SelectItem>
                  <SelectItem value="task_completed">Tasks</SelectItem>
                  <SelectItem value="message_posted">Messages</SelectItem>
                  <SelectItem value="project_updated">Projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="p-6">
              {loading && activities.length === 0 ? (
                <div className="space-y-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-6 w-32" />
                      <div className="space-y-4 pl-4 border-l-2 border-muted">
                        {[1, 2].map((j) => (
                          <div key={j} className="flex gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button variant="outline" onClick={retry}>Try Again</Button>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="font-medium">No activities found</p>
                  <p className="text-sm">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {groupKeys.map((dateGroup) => (
                    <div key={dateGroup} className="relative">
                      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-4 pt-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {dateGroup}
                        </h3>
                      </div>
                      <div className="ml-2 space-y-6 border-l-2 border-muted pl-6 pb-2">
                        {groupedActivities[dateGroup].map((activity) => {
                          const Icon = ACTIVITY_ICONS[activity.type]
                          const colorClass = ACTIVITY_COLORS[activity.type]
                          
                          return (
                            <div key={activity.id} className="relative group">
                              <div className={`absolute -left-[31px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-background ${colorClass}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col gap-1 rounded-lg border border-transparent p-3 transition-colors hover:bg-muted/50 hover:border-muted">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                        {ACTIVITY_LABELS[activity.type]}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(activity.timestamp), 'h:mm a')}
                                      </span>
                                    </div>
                                    <p className="text-sm font-medium leading-none">
                                      {activity.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {activity.entityName}
                                    </p>
                                  </div>
                                  {activity.navigationUrl && (
                                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Link href={activity.navigationUrl}>
                                        <ArrowUpRight className="h-4 w-4" />
                                        <span className="sr-only">View details</span>
                                      </Link>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
