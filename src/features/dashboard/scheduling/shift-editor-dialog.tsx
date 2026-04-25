'use client'

import { useState } from 'react'
import { LoaderCircle, MapPin, Plus, CalendarClock } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

export type CreateShiftFormValues = {
  title: string
  team: string
  locationLabel: string
  notes: string
  timeLabel: string
}

const defaultForm: CreateShiftFormValues = {
  title: 'Client escalation desk',
  team: 'Client success',
  locationLabel: 'HQ or remote',
  notes: 'Cover escalations in the shared inbox.',
  timeLabel: '13:00 - 17:00',
}

interface ShiftEditorDialogProps {
  pending: boolean
  onCreateShift: (values: CreateShiftFormValues) => void
  onBlockNext8h?: () => void
  blockPending?: boolean
}

export function ShiftEditorDialog({ pending, onCreateShift, onBlockNext8h, blockPending }: ShiftEditorDialogProps) {
  const [form, setForm] = useState<CreateShiftFormValues>(defaultForm)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create open coverage shift</CardTitle>
        <CardDescription>Publish a block the team can claim. Conflicts with availability and approved leave show on the board.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shift-title">Title</Label>
          <Input
            id="shift-title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-xl"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shift-team">Team</Label>
          <Input
            id="shift-team"
            value={form.team}
            onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))}
            className="rounded-xl"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shift-time">Time window (label)</Label>
          <Input
            id="shift-time"
            value={form.timeLabel}
            onChange={(e) => setForm((f) => ({ ...f, timeLabel: e.target.value }))}
            className="rounded-xl"
            placeholder="13:00 - 17:00"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shift-loc" className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Location
          </Label>
          <Input
            id="shift-loc"
            value={form.locationLabel}
            onChange={(e) => setForm((f) => ({ ...f, locationLabel: e.target.value }))}
            className="rounded-xl"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shift-notes">Notes</Label>
          <Textarea
            id="shift-notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="min-h-[80px] rounded-xl"
            disabled={pending}
          />
        </div>
        <Button
          type="button"
          variant="default"
          className="w-full gap-2 rounded-xl"
          onClick={() => onCreateShift(form)}
          disabled={pending}
        >
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create open shift
        </Button>
        {onBlockNext8h ? (
          <div className="border-t border-muted/60 pt-4">
            <p className="mb-2 text-xs text-muted-foreground">Mark yourself unavailable (tests conflict detection on overlapping shifts).</p>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 rounded-xl"
              onClick={onBlockNext8h}
              disabled={blockPending}
            >
              {blockPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
              Block next 8h on my calendar
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
