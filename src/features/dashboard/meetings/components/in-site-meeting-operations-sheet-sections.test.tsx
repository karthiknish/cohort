import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/shared/ui/sheet', () => ({
    SheetDescription: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    SheetHeader: ({ children, className }: {
        children: ReactNode;
        className?: string;
    }) => <div className={className}>{children}</div>,
    SheetTitle: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
}));
vi.mock('@/shared/contexts/auth-context', () => ({
    useAuth: () => ({ user: { workspaceId: 'workspace-1' } }),
}));
vi.mock('convex/react', () => ({
    useQuery: () => ({
        notesDownloadUrl: null,
        transcriptDownloadUrl: null,
        notesArchived: false,
        transcriptArchived: false,
    }),
}));
import { MeetingAutomationPipeline } from './meeting-automation-pipeline';
import { MeetingOperationsAlerts, MeetingOperationsAttendeesCard, MeetingOperationsAutomationCard, MeetingOperationsCaptureCard, MeetingOperationsLiveCapturePreview, MeetingOperationsSheetHeader, MeetingOperationsSummaryCard, MeetingOperationsSyncCards, } from './in-site-meeting-operations-sheet-sections';
const joinConfig = { roomName: 'room-1', serverUrl: 'wss://lk.example.com', token: 'token' };
const captureStatus = { error: null, listening: true, supported: true };
describe('meeting operations sheet sections', () => {
    it('renders header and status cards', () => {
        const markup = renderToStaticMarkup(<>
        <MeetingOperationsSheetHeader joinConfig={joinConfig} meetingRoomName="room-1"/>
        <MeetingOperationsCaptureCard canRecord captureStatus={captureStatus} joinConfig={joinConfig} onEnableRecording={vi.fn()} recordingEnabled={false} transcriptSource="livekit"/>
        <MeetingOperationsAttendeesCard meetingAttendeeEmails={['alex@example.com', 'sam@example.com']}/>
        <MeetingOperationsAutomationCard autoSyncing={true} finalizingSession={false} joinConfig={joinConfig} markCompleted={true} notesProcessingState="processing" retryingPostCallProcessing={false} transcriptProcessingState="idle"/>
        <MeetingOperationsSyncCards notesModel="deepseek-chat" summaryStatus="Generating summary now" transcriptLength={120} transcriptProcessingState="processing" transcriptSource="livekit" transcriptStatus="Finalizing transcript now" transcriptTruncatedForNotes={true}/>
        <MeetingAutomationPipeline captureListening={true} finalizingSession={false} hasTranscriptSaved={true} inRoom={true} notesProcessingState="processing" summaryReady={false} transcriptProcessingState="idle"/>
      </>);
        expect(markup).toContain('Room sidebar');
        expect(markup).toContain('room-1');
        expect(markup).toContain('Start recording transcript');
        expect(markup).toContain('Recording paused');
        expect(markup).toContain('2 attendees');
        expect(markup).toContain('AI notes generating');
        expect(markup).toContain('Transcript truncated');
        expect(markup).toContain('Automation pipeline');
        expect(markup).toContain('Capture → Transcript → AI notes');
        expect(markup).toContain('Generating');
    });
    it('renders alerts, summary states, and live capture', () => {
        const markup = renderToStaticMarkup(<>
        <MeetingOperationsAlerts captureError="Microphone unavailable" notesProcessingError="AI request failed" notesReason="generation_failed" canGenerateNotes={true} canRetryPostCallProcessing={true} generatingNotes={false} retryingPostCallProcessing={false} onGenerateNotes={vi.fn()} onRetryPostCallProcessing={vi.fn()} transcriptProcessingError="Transcript finalization failed"/>
        <MeetingOperationsSummaryCard canGenerateNotes={true} generatingNotes={false} legacyId="meeting-1" meetingTitle="Weekly sync" notesProcessingState="idle" onGenerateNotes={vi.fn()} postCallProcessingActive={true} summaryPreview={null} transcriptLength={42}/>
        <MeetingOperationsSummaryCard canGenerateNotes={true} generatingNotes={false} legacyId="meeting-1" meetingTitle="Weekly sync" notesProcessingState="idle" onGenerateNotes={vi.fn()} postCallProcessingActive={false} summaryPreview={'## Summary\n- Discussed scope\n\n## Decisions\n- Ship next week\n\n## Action Items\n- Draft plan\n\n## Risks / Blockers\n- None noted.'} transcriptLength={42} transcriptText="Discussed scope and timeline for the launch."/>
        <MeetingOperationsLiveCapturePreview interimTranscript="Discussing scope and timeline"/>
      </>);
        expect(markup).toContain('Capture warning');
        expect(markup).toContain('AI summary failed');
        expect(markup).toContain('Retry post-call processing');
        expect(markup).toContain('Retry AI notes');
        expect(markup).toContain('Generate notes');
        expect(markup).toContain('Latest AI summary');
        expect(markup).toContain('Discussed scope');
        expect(markup).toContain('Download PDF');
        expect(markup).toContain('Keep this page open until transcript finalization and notes generation finish.');
        expect(markup).toContain('Discussing scope and timeline');
    });
});
