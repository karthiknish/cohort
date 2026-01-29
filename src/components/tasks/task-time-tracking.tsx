'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Play, Pause, Square, Clock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn, formatRelativeTime } from '@/lib/utils'
import { TimeEntry } from '@/types/tasks'

type TaskTimeTrackingProps = {
  taskId: string
  timeEntries: TimeEntry[]
  totalTimeMinutes: number
  isRunning?: boolean
  onStartTracking?: (note?: string) => void
  onStopTracking?: () => void
  onAddTime?: (minutes: number, note: string) => void
  onDeleteEntry?: (entryId: string) => void
  readonly?: boolean
}

export function TaskTimeTracking({
  taskId,
  timeEntries,
  totalTimeMinutes,
  isRunning = false,
  onStartTracking,
  onStopTracking,
  onAddTime,
  onDeleteEntry,
  readonly = false,
}: TaskTimeTrackingProps) {
  const [open, setOpen] = useState(false)
  const [trackingNote, setTrackingNote] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Timer for active tracking
  useEffect(() => {
    if (isRunning && !startTime) {
      setStartTime(new Date())
    } else if (!isRunning && startTime) {
      setStartTime(null)
      setElapsedSeconds(0)
    }
  }, [isRunning, startTime])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = useCallback(() => {
    onStartTracking?.(trackingNote || undefined)
    setTrackingNote('')
  }, [onStartTracking, trackingNote])

  const handleStop = useCallback(() => {
    onStopTracking?.()
  }, [onStopTracking])

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'h-4 w-4',
            isRunning ? 'text-green-500 animate-pulse' : 'text-muted-foreground'
          )} />
          <span className="text-sm font-medium">
            {totalTimeMinutes > 0
              ? `${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`
              : 'No time logged'
            }
          </span>
        </div>

        {!readonly && (
          <div className="flex items-center gap-1">
            {isRunning ? (
              <Button size="sm" variant="destructive" onClick={handleStop} className="h-7 gap-1">
                <Square className="h-3 w-3" />
                Stop
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleStart} className="h-7 gap-1">
                <Play className="h-3 w-3" />
                Start
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Active timer display */}
      {isRunning && (
        <div className="flex items-center gap-2 text-sm font-mono bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg">
          <span className="animate-pulse">●</span>
          {formatTime(elapsedSeconds)}
        </div>
      )}

      {/* Quick add time dialog */}
      {!readonly && onAddTime && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 w-full justify-start">
              <Plus className="h-3 w-3" />
              Add time manually
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Time Entry</DialogTitle>
              <DialogDescription>
                Manually log time spent on this task
              </DialogDescription>
            </DialogHeader>
            <ManualTimeEntry
              onSubmit={(minutes, note) => {
                onAddTime(minutes, note)
                setOpen(false)
              }}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Recent entries */}
      {timeEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Entries ({timeEntries.length})
          </p>
          <ScrollArea className="h-[150px]">
            <div className="space-y-2 pr-2">
              {timeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">
                      {entry.duration
                        ? `${Math.floor(entry.duration / 60)}h ${entry.duration % 60}m`
                        : formatTime(Math.floor((new Date(entry.endTime || Date.now()).getTime() - new Date(entry.startTime).getTime()) / 1000))
                      }
                    </span>
                    <span className="text-muted-foreground truncate">
                      {entry.userName}
                    </span>
                  </div>
                  {!readonly && onDeleteEntry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEntry(entry.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

function ManualTimeEntry({
  onSubmit,
  onCancel,
}: {
  onSubmit: (minutes: number, note: string) => void
  onCancel: () => void
}) {
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('0')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0)
    if (totalMinutes > 0) {
      onSubmit(totalMinutes, note)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hours">Hours</Label>
          <Input
            id="hours"
            type="number"
            min="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="text-center"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minutes">Minutes</Label>
          <Input
            id="minutes"
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="text-center"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          placeholder="What did you work on?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Time
        </Button>
      </div>
    </form>
  )
}
