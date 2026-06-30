'use client';
import { Sheet, SheetContent } from '@/shared/ui/sheet';
import type { MeetingProcessingState } from '../types';
import { formatLocalDateTime } from '../utils';
import { MeetingAutomationPipeline } from './meeting-automation-pipeline';
import type { CaptureStatus, LiveKitJoinPayload } from './in-site-meeting-card.shared';
import { MeetingOperationsAlerts, MeetingOperationsAttendeesCard, MeetingOperationsAutomationCard, MeetingOperationsCaptureCard, MeetingOperationsLiveCapturePreview, MeetingOperationsSheetHeader, MeetingOperationsSummaryCard, MeetingOperationsSyncCards, } from './in-site-meeting-operations-sheet-sections';
type MeetingOperationsSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    canRecord: boolean;
    joinConfig: LiveKitJoinPayload | null;
    captureStatus: CaptureStatus;
    onEnableRecording: () => void;
    recordingEnabled: boolean;
    meetingAttendeeEmails: string[];
    meetingRoomName: string;
    meetingTimezone: string;
    transcriptSource: string | null;
    transcriptSavedAt: number | null;
    transcriptProcessingState: MeetingProcessingState;
    transcriptProcessingError: string | null;
    notesUpdatedAt: number | null;
    notesModel: string | null;
    notesProcessingState: MeetingProcessingState;
    notesProcessingError: string | null;
    markCompleted: boolean;
    autoSyncing: boolean;
    finalizingSession: boolean;
    interimTranscript: string;
    summaryPreview: string | null;
    notesReason: 'ai_not_configured' | 'generation_failed' | null;
    notesStorageId: string | null;
    transcriptStorageId: string | null;
    transcriptTruncatedForNotes: boolean;
    transcriptLength: number;
    meetingLegacyId: string;
    meetingTitle: string;
    transcriptText: string;
    canGenerateNotes: boolean;
    generatingNotes: boolean;
    onGenerateNotes: () => void;
    retryingPostCallProcessing: boolean;
    canRetryPostCallProcessing: boolean;
    onRetryPostCallProcessing: () => void;
};
function formatSyncLabel(timestamp: number | null, timezone: string, emptyLabel: string): string {
    if (!timestamp) {
        return emptyLabel;
    }
    return `Updated ${formatLocalDateTime(timestamp, timezone)}`;
}
export function InSiteMeetingOperationsSheet(props: MeetingOperationsSheetProps) {
    const { open, onOpenChange, canRecord, joinConfig, captureStatus, onEnableRecording, recordingEnabled, meetingAttendeeEmails, meetingRoomName, meetingTimezone, transcriptSource, transcriptSavedAt, transcriptProcessingState, transcriptProcessingError, notesUpdatedAt, notesModel, notesProcessingState, notesProcessingError, markCompleted, autoSyncing, finalizingSession, interimTranscript, summaryPreview, notesReason, notesStorageId, transcriptStorageId, transcriptTruncatedForNotes, transcriptLength, meetingLegacyId, meetingTitle, transcriptText, canGenerateNotes, generatingNotes, onGenerateNotes, retryingPostCallProcessing, canRetryPostCallProcessing, onRetryPostCallProcessing, } = props;
    const transcriptStatus = transcriptProcessingState === 'processing'
        ? 'Finalizing transcript now'
        : transcriptProcessingState === 'failed'
            ? 'Transcript finalization needs attention'
            : formatSyncLabel(transcriptSavedAt, meetingTimezone, 'Waiting for first capture sync');
    const summaryStatus = notesProcessingState === 'processing' || generatingNotes
        ? 'Generating summary now'
        : notesProcessingState === 'failed'
            ? 'AI notes generation needs attention'
            : notesReason === 'ai_not_configured'
                ? 'AI note generation is unavailable in this environment'
                : notesReason === 'generation_failed'
                    ? 'Last summary generation attempt failed'
                    : formatSyncLabel(notesUpdatedAt, meetingTimezone, 'Waiting for transcript before summary');
    return (<Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-[440px]">
        <MeetingOperationsSheetHeader joinConfig={joinConfig} meetingRoomName={meetingRoomName}/>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <MeetingOperationsCaptureCard canRecord={canRecord} captureStatus={captureStatus} joinConfig={joinConfig} onEnableRecording={onEnableRecording} recordingEnabled={recordingEnabled} transcriptSource={transcriptSource}/>

          <MeetingOperationsAttendeesCard meetingAttendeeEmails={meetingAttendeeEmails}/>

          <MeetingOperationsAutomationCard autoSyncing={autoSyncing} finalizingSession={finalizingSession} joinConfig={joinConfig} markCompleted={markCompleted} notesProcessingState={notesProcessingState} retryingPostCallProcessing={retryingPostCallProcessing} transcriptProcessingState={transcriptProcessingState}/>

          <MeetingAutomationPipeline captureErrorPresent={Boolean(captureStatus.error)} captureListening={captureStatus.listening} finalizingSession={finalizingSession} hasTranscriptSaved={Boolean(transcriptSavedAt)} inRoom={Boolean(joinConfig)} notesProcessingState={notesProcessingState} recordingEnabled={recordingEnabled} summaryReady={Boolean(summaryPreview)} transcriptProcessingState={transcriptProcessingState}/>

          <MeetingOperationsSyncCards notesModel={notesModel} summaryStatus={summaryStatus} transcriptLength={transcriptLength} transcriptProcessingState={transcriptProcessingState} transcriptSource={transcriptSource} transcriptStatus={transcriptStatus} transcriptTruncatedForNotes={transcriptTruncatedForNotes}/>

          <MeetingOperationsAlerts captureError={captureStatus.error} notesProcessingError={notesProcessingError} notesReason={notesReason} canGenerateNotes={canGenerateNotes} canRetryPostCallProcessing={canRetryPostCallProcessing} generatingNotes={generatingNotes} retryingPostCallProcessing={retryingPostCallProcessing} onGenerateNotes={onGenerateNotes} onRetryPostCallProcessing={onRetryPostCallProcessing} transcriptProcessingError={transcriptProcessingError}/>

          <MeetingOperationsSummaryCard canGenerateNotes={canGenerateNotes} generatingNotes={generatingNotes} legacyId={meetingLegacyId} meetingTitle={meetingTitle} notesProcessingState={notesProcessingState} notesStorageId={notesStorageId} onGenerateNotes={onGenerateNotes} postCallProcessingActive={retryingPostCallProcessing || finalizingSession || transcriptProcessingState === 'processing' || notesProcessingState === 'processing'} summaryPreview={summaryPreview} transcriptLength={transcriptLength} transcriptStorageId={transcriptStorageId} transcriptText={transcriptText}/>

          {interimTranscript ? <MeetingOperationsLiveCapturePreview interimTranscript={interimTranscript}/> : null}
        </div>
      </SheetContent>
    </Sheet>);
}
