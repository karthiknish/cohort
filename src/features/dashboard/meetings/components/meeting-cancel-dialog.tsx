'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'

import type { MeetingRecord } from '../types'

type MeetingCancelDialogProps = {
  meeting: MeetingRecord | null
  cancellingMeetingId: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function MeetingCancelDialog(props: MeetingCancelDialogProps) {
  const { meeting, cancellingMeetingId, onOpenChange, onConfirm } = props

  return (
    <AlertDialog open={Boolean(meeting)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel meeting</AlertDialogTitle>
          <AlertDialogDescription>
            {meeting
              ? `Cancel "${meeting.title}" and send cancellation updates to invited attendees.`
              : 'Cancel this meeting and notify invited attendees.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={Boolean(cancellingMeetingId)}>Keep meeting</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={Boolean(cancellingMeetingId)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {cancellingMeetingId ? 'Cancelling…' : 'Cancel meeting'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}