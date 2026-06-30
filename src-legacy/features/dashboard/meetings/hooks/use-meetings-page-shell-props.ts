'use client';
import { useCallback, useMemo } from 'react';
import { useMeetingsPageContext } from '../components/meetings-page-provider';
export function useMeetingsPageShellProps() {
    const { canSchedule, cancelDialogMeeting, cancellingMeetingId, closeMeetingRoom, description, durationMinutes, editingMeeting, handleCancelMeeting, handleConfirmCancelMeeting, handleConnectGoogleWorkspace: connectGoogleWorkspace, handleDisconnectGoogleWorkspace: disconnectGoogleWorkspace, handleMarkCompleted, handleMeetingUpdated, handleRescheduleMeeting, handleScheduleMeeting, handleSubmitQuickMeet, googleWorkspaceStatusLoading, isPreviewMode, meetingDate, meetingTime, openInSiteMeeting, quickAttendeeDraft, quickAttendees, quickMeetDescription, quickMeetDialogOpen, quickMeetDurationMinutes, quickMeetTitle, quickStarting, resetQuickMeetForm, resetScheduleForm, scheduleAttendeeDraft, scheduleAttendees, scheduleDisabled, scheduleRequiresGoogleWorkspace, scheduling, setCancelDialogMeeting, setDescription, setDurationMinutes, setMeetingDate, setMeetingTime, setQuickMeetDescription, setQuickMeetDialogOpen, setQuickMeetDurationMinutes, setQuickMeetTitle, setTimezone, setTitle, timezone, title, upcomingMeetings, upcomingMeetingsLoading, resolvedGoogleWorkspaceStatus, } = useMeetingsPageContext();
    const handleConnectGoogleWorkspaceAction = () => {
        void connectGoogleWorkspace();
    };
    const handleDisconnectGoogleWorkspaceAction = () => {
        void disconnectGoogleWorkspace();
    };
    const handleStartQuickMeet = () => {
        setQuickMeetDialogOpen(true);
    };
    const handleMeetingCancelDialogOpenChange = (open: boolean) => {
        if (!open && !cancellingMeetingId) {
            setCancelDialogMeeting(null);
        }
    };
    const handleQuickMeetDialogOpenChange = (open: boolean) => {
        if (quickStarting)
            return;
        setQuickMeetDialogOpen(open);
        if (!open) {
            resetQuickMeetForm();
        }
    };
    const handleQuickMeetCancel = () => {
        if (quickStarting)
            return;
        setQuickMeetDialogOpen(false);
        resetQuickMeetForm();
    };
    const handleMarkCompletedClick = (legacyId: string) => {
        void handleMarkCompleted(legacyId);
    };
    const scheduleCardSharedProps = ({
        meetingDate,
        meetingTime,
        durationMinutes,
        timezone,
        title,
        description,
        attendeeInput: scheduleAttendees.input,
        attendeeEmails: scheduleAttendees.emails,
        attendeeSuggestions: scheduleAttendees.suggestions,
        scheduleRequiresGoogleWorkspace,
        googleWorkspaceConnected: Boolean(resolvedGoogleWorkspaceStatus?.connected),
        scheduleDisabled,
        submitDisabled: scheduleDisabled || !scheduleAttendeeDraft.hasParticipants,
        scheduling,
        onMeetingDateChange: setMeetingDate,
        onMeetingTimeChange: setMeetingTime,
        onDurationMinutesChange: setDurationMinutes,
        onTimezoneChange: setTimezone,
        onTitleChange: setTitle,
        onDescriptionChange: setDescription,
        onAttendeeInputChange: scheduleAttendees.setInput,
        onAttendeeKeyDown: scheduleAttendees.handleKeyDown,
        onCommitAttendeeInput: scheduleAttendees.commitInput,
        onRemoveAttendee: scheduleAttendees.removeEmail,
        onAddSuggestedAttendee: scheduleAttendees.addSuggestedEmail,
        onSubmit: handleScheduleMeeting,
    });
    const meetingsHeaderProps = ({
        googleWorkspaceConnected: Boolean(resolvedGoogleWorkspaceStatus?.connected),
        googleWorkspaceStatusLoading,
        canSchedule: canSchedule && !isPreviewMode,
        quickStarting,
        quickMeetDisabled: isPreviewMode || googleWorkspaceStatusLoading || !resolvedGoogleWorkspaceStatus?.connected,
        onStartQuickMeet: handleStartQuickMeet,
        onConnectGoogleWorkspace: handleConnectGoogleWorkspaceAction,
        onManageGoogleWorkspace: handleDisconnectGoogleWorkspaceAction,
    });
    const createMeetingCardProps = scheduleCardSharedProps;
    const meetingCancelDialogProps = ({
        meeting: cancelDialogMeeting,
        cancellingMeetingId,
        onOpenChange: handleMeetingCancelDialogOpenChange,
        onConfirm: handleConfirmCancelMeeting,
    });
    const quickMeetDialogProps = ({
        open: quickMeetDialogOpen,
        quickStarting,
        title: quickMeetTitle,
        description: quickMeetDescription,
        durationMinutes: quickMeetDurationMinutes,
        timezone,
        attendeeInput: quickAttendees.input,
        attendeeEmails: quickAttendees.emails,
        attendeeSuggestions: quickAttendees.suggestions,
        submitDisabled: !quickAttendeeDraft.hasParticipants,
        onOpenChange: handleQuickMeetDialogOpenChange,
        onCancel: handleQuickMeetCancel,
        onSubmit: handleSubmitQuickMeet,
        onTitleChange: setQuickMeetTitle,
        onDescriptionChange: setQuickMeetDescription,
        onDurationMinutesChange: setQuickMeetDurationMinutes,
        onTimezoneChange: setTimezone,
        onAttendeeInputChange: quickAttendees.setInput,
        onAttendeeKeyDown: quickAttendees.handleKeyDown,
        onCommitAttendeeInput: quickAttendees.commitInput,
        onRemoveAttendee: quickAttendees.removeEmail,
        onAddSuggestedAttendee: quickAttendees.addSuggestedEmail,
    });
    const rescheduleMeetingCardProps = ({ ...scheduleCardSharedProps, onReset: resetScheduleForm });
    const upcomingMeetingsCardProps = ({
        meetings: upcomingMeetings,
        loading: upcomingMeetingsLoading,
        canSchedule: canSchedule && !isPreviewMode,
        googleWorkspaceConnected: Boolean(resolvedGoogleWorkspaceStatus?.connected),
        cancellingMeetingId,
        onOpenInSiteMeeting: openInSiteMeeting,
        onRescheduleMeeting: handleRescheduleMeeting,
        onCancelMeeting: handleCancelMeeting,
        onMarkCompleted: handleMarkCompletedClick,
    });
    return {
        canSchedule,
        isPreviewMode,
        editingMeeting,
        closeMeetingRoom,
        handleMeetingUpdated,
        createMeetingCardProps,
        meetingsHeaderProps,
        meetingCancelDialogProps,
        quickMeetDialogProps,
        rescheduleMeetingCardProps,
        upcomingMeetingsCardProps,
        timezone,
    };
}
