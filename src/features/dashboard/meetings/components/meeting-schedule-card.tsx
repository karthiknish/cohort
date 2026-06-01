'use client';
import { useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { getButtonClasses } from '@/lib/dashboard-theme';
import { MeetingScheduleCardFrame, type SharedMeetingScheduleCardProps, } from './meeting-schedule-card-sections';
export { MeetingScheduleCardFrame } from './meeting-schedule-card-sections';
type CreateMeetingCardProps = SharedMeetingScheduleCardProps;
type RescheduleMeetingCardProps = SharedMeetingScheduleCardProps & {
    onReset: () => void;
};
export function CreateMeetingCard(props: CreateMeetingCardProps) {
    return (<MeetingScheduleCardFrame {...props} cardTitle="Schedule Meeting" cardDescription="Pick a date, add attendees, and send calendar invites from one form." submittingLabel="Scheduling..." submitLabel="Schedule Room"/>);
}
export function RescheduleMeetingCard({ onReset, ...props }: RescheduleMeetingCardProps) {
    const footerAction = (<Button type="button" variant="outline" className={getButtonClasses('outline')} onClick={onReset} disabled={props.scheduling}>
        Cancel Edit
      </Button>);
    return (<MeetingScheduleCardFrame {...props} cardTitle="Reschedule Meeting" cardDescription="Update time, attendees, and details. Calendar invites and room access stay in sync automatically." submittingLabel="Saving…" submitLabel="Save Reschedule" footerAction={footerAction}/>);
}
