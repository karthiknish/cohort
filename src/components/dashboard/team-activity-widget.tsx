'use client'

import { useState, useCallback, useMemo } from 'react'
import { Users, TrendingUp, TrendingDown, Activity, MoreHorizontal, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn, formatRelativeTime } from '@/lib/utils'

export interface TeamMember {
  id: string
  name: string
  avatarUrl?: string
  role?: string
  status: 'online' | 'away' | 'offline' | 'busy'
  lastSeen?: string | null
  tasksCompleted?: number
  tasksInProgress?: number
  hoursLogged?: number
}

export interface TeamActivityData {
  members: TeamMember[]
  periodStart: string
  periodEnd: string
}

interface TeamActivityWidgetProps {
  data: TeamActivityData
  userCount?: number
  onMemberClick?: (memberId: string) => void
  onViewAllClick?: () => void
  className?: string
  compact?: boolean
}

/**
 * Widget showing team activity overview
 */
export function TeamActivityWidget({
  data,
  userCount = 0,
  onMemberClick,
  onViewAllClick,
  className,
  compact = false,
}: TeamActivityWidgetProps) {
  // Calculate stats
  const stats = useMemo(() => {
    const onlineCount = data.members.filter((m) => m.status === 'online').length
    const awayCount = data.members.filter((m) => m.status === 'away').length
    const busyCount = data.members.filter((m) => m.status === 'busy').length

    const totalTasks = data.members.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0)
    const totalHours = data.members.reduce((sum, m) => sum + (m.hoursLogged || 0), 0)

    const topPerformer = data.members.reduce((best, member) =>
      (member.tasksCompleted || 0) > (best?.tasksCompleted || 0) ? member : best
    , undefined as TeamMember | undefined)

    return {
      onlineCount,
      awayCount,
      busyCount,
      offlineCount: data.members.length - onlineCount - awayCount - busyCount,
      totalTasks,
      totalHours,
      topPerformer,
    }
  }, [data.members])

  // Sort members by activity
  const sortedMembers = useMemo(() => {
    return [...data.members].sort((a, b) => {
      // Online members first
      const statusOrder = { online: 0, away: 1, busy: 2, offline: 3 }
      const aStatus = statusOrder[a.status] ?? 3
      const bStatus = statusOrder[b.status] ?? 3

      if (aStatus !== bStatus) return aStatus - bStatus

      // Then by tasks completed
      return (b.tasksCompleted || 0) - (a.tasksCompleted || 0)
    })
  }, [data.members])

  // Display members (limit in compact mode)
  const displayMembers = compact ? sortedMembers.slice(0, 3) : sortedMembers

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm">Team Activity</CardTitle>
        </div>
        {onViewAllClick && (
          <Button variant="ghost" size="sm" onClick={onViewAllClick}>
            View All
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Summary stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">
              {stats.onlineCount} online
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">
              {stats.awayCount} away
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">
              {stats.busyCount} busy
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-muted-foreground">
              {stats.offlineCount} offline
            </span>
          </div>
        </div>

        {/* Top performer badge */}
        {!compact && stats.topPerformer && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10">
            <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Top Performer
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400">
                {stats.topPerformer.name} • {stats.topPerformer.tasksCompleted} tasks
              </p>
            </div>
          </div>
        )}

        {/* Team members list */}
        <div className="space-y-2">
          {displayMembers.map((member) => (
            <TeamMemberItem
              key={member.id}
              member={member}
              onClick={() => onMemberClick?.(member.id)}
            />
          ))}

          {compact && sortedMembers.length > 3 && (
            <Button
              variant="link"
              size="sm"
              className="text-xs p-0 h-auto"
              onClick={onViewAllClick}
            >
              +{sortedMembers.length - 3} more
            </Button>
          )}
        </div>

        {/* Activity summary */}
        {!compact && (
          <div className="pt-3 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Tasks Completed</p>
                <p className="text-lg font-semibold">{stats.totalTasks}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Hours Logged</p>
                <p className="text-lg font-semibold">{stats.totalHours}h</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface TeamMemberItemProps {
  member: TeamMember
  onClick?: () => void
}

function TeamMemberItem({ member, onClick }: TeamMemberItemProps) {
  const statusColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      {/* Status indicator */}
      <div
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          'flex-shrink-0',
          statusColors[member.status]
        )}
      />

      {/* Avatar */}
      <Avatar className="h-8 w-8">
        {member.avatarUrl ? (
          <AvatarImage src={member.avatarUrl} alt={member.name} />
        ) : (
          <AvatarFallback className="text-xs">
            {member.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Name and details */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate group-hover:text-primary">
          {member.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {member.role && <span>{member.role}</span>}
          {(member.tasksInProgress || 0) > 0 && (
            <span>{member.tasksInProgress} in progress</span>
          )}
          {member.hoursLogged && member.hoursLogged > 0 && (
            <span>{member.hoursLogged}h logged</span>
          )}
        </div>
      </div>

      {/* Tasks progress */}
      {(member.tasksCompleted || 0) > 0 && (
        <div className="text-xs text-muted-foreground">
          {member.tasksCompleted} done
        </div>
      )}
    </button>
  )
}

/**
 * Compact team presence strip
 */
export function TeamPresenceStrip({
  members,
  maxVisible = 6,
  onClick,
  className,
}: {
  members: TeamMember[]
  maxVisible?: number
  onClick?: () => void
  className?: string
}) {
  const onlineMembers = members.filter((m) => m.status === 'online')
  const displayMembers = onlineMembers.slice(0, maxVisible)
  const remainingCount = onlineMembers.length - maxVisible

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 cursor-pointer',
        onClick && 'hover:opacity-80 transition-opacity'
      )}
    >
      {displayMembers.map((member) => (
        <Avatar
          key={member.id}
          className="h-7 w-7 border-2 border-background"
          title={`${member.name} - ${member.status}`}
        >
          {member.avatarUrl ? (
            <AvatarImage src={member.avatarUrl} alt={member.name} />
          ) : (
            <AvatarFallback className="text-[10px]">
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <div className="h-7 w-7 rounded-full border-2 border-background flex items-center justify-center bg-muted text-[10px] font-medium">
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

/**
 * Workload distribution component
 */
export function WorkloadDistribution({
  members,
  className,
}: {
  members: TeamMember[]
  className?: string
}) {
  const totalTasks = members.reduce((sum, m) => sum + (m.tasksInProgress || 0), 0)

  return (
    <div className={cn('space-y-2', className)}>
      {members.map((member) => {
        const tasks = member.tasksInProgress || 0
        const percentage = totalTasks > 0 ? (tasks / totalTasks) * 100 : 0

        return (
          <div key={member.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate flex-1">{member.name}</span>
              <span className="text-muted-foreground">{tasks} tasks</span>
            </div>
            <Progress value={percentage} className="h-1.5" />
          </div>
        )
      })}
    </div>
  )
}
