'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { logError } from '@/lib/convex-errors';
import type { TranscriptActionResult, TranscriptMode } from '../components/in-site-meeting-card.shared';
import { postMeetingTranscriptAction } from '../lib/in-site-meeting-transcript-client';
import type { MeetingProcessingState, MeetingRecord } from '../types';
import { normalizeMeetingProcessingState } from '../utils';
type UseInSiteMeetingRoomPostCallArgs = {
    meetingLegacyId: string;
    markCompleted: boolean;
    normalizedTranscript: string;
    transcriptDraft: string;
    transcriptSource: string | null;
    canPersist: boolean;
    canGenerateNotes: boolean;
    onClose: () => void;
    onMeetingUpdated?: (meeting: MeetingRecord) => void;
    buildMeetingSnapshot: (overrides?: Partial<MeetingRecord>) => MeetingRecord;
    applyTranscriptActionResult: (result: TranscriptActionResult) => void;
    setMarkCompleted: (value: boolean) => void;
    setFinalizingSession: (value: boolean | ((prev: boolean) => boolean)) => void;
    setTranscriptSource: (value: string | null | ((prev: string | null) => string | null)) => void;
    setTranscriptProcessingState: (value: MeetingProcessingState) => void;
    setTranscriptProcessingError: (value: string | null) => void;
    setNotesProcessingState: (value: MeetingProcessingState) => void;
    setNotesProcessingError: (value: string | null) => void;
    setNotesReason: (value: 'ai_not_configured' | 'generation_failed' | null) => void;
    setGeneratingNotes: (value: boolean) => void;
    setRetryingPostCallProcessing: (value: boolean) => void;
    setOperationsOpen: (value: boolean) => void;
    setJoinConfig: (value: null) => void;
    setInterimTranscript: (value: string) => void;
    setAutoSyncing: (value: boolean) => void;
    setLastAutoSyncAt: (value: number | null) => void;
    setLastAutoSyncedTranscript: Dispatch<SetStateAction<string>>;
    finalizationInFlightRef: RefObject<boolean>;
};
export function useInSiteMeetingRoomPostCall({ meetingLegacyId, markCompleted, normalizedTranscript, transcriptDraft, transcriptSource, canPersist, canGenerateNotes, onClose, onMeetingUpdated, buildMeetingSnapshot, applyTranscriptActionResult, setMarkCompleted, setFinalizingSession, setTranscriptSource, setTranscriptProcessingState, setTranscriptProcessingError, setNotesProcessingState, setNotesProcessingError, setNotesReason, setGeneratingNotes, setRetryingPostCallProcessing, setOperationsOpen, setJoinConfig, setInterimTranscript, setAutoSyncing, setLastAutoSyncAt, setLastAutoSyncedTranscript, finalizationInFlightRef, }: UseInSiteMeetingRoomPostCallArgs) {
    const submitTranscriptAction = async (mode: TranscriptMode, overrides?: {
        transcriptText?: string;
        notesSummary?: string;
        source?: string;
        markCompleted?: boolean;
        keepalive?: boolean;
    }) => {
        if (!meetingLegacyId) {
            throw new Error('This meeting record is missing an ID. Refresh and reopen the room.');
        }
        return postMeetingTranscriptAction({
            legacyId: meetingLegacyId,
            mode,
            markCompleted: overrides?.markCompleted ?? markCompleted,
            source: overrides?.source ?? 'in-site-voice',
            transcriptText: overrides?.transcriptText,
            notesSummary: overrides?.notesSummary,
            keepalive: overrides?.keepalive,
        });
    };
    const finalizeMeetingAfterRoomExit = (closeAfterKickoff: boolean) => {
        if (!canPersist || finalizationInFlightRef.current) {
            if (closeAfterKickoff) {
                onClose();
            }
            return;
        }
        finalizationInFlightRef.current = true;
        const hasEnoughTranscript = normalizedTranscript.length >= 20;
        const optimisticMeeting = buildMeetingSnapshot({
            status: 'completed',
            transcriptText: normalizedTranscript || transcriptDraft,
            transcriptSource: 'livekit-browser-voice',
            transcriptProcessingState: hasEnoughTranscript ? 'processing' : 'idle',
            transcriptProcessingError: null,
            notesProcessingState: hasEnoughTranscript ? 'processing' : 'idle',
            notesProcessingError: null,
        });
        setMarkCompleted(true);
        setFinalizingSession(hasEnoughTranscript);
        setTranscriptSource('livekit-browser-voice');
        setTranscriptProcessingState(hasEnoughTranscript ? 'processing' : 'idle');
        setTranscriptProcessingError(null);
        setNotesProcessingState(hasEnoughTranscript ? 'processing' : 'idle');
        setNotesProcessingError(null);
        setOperationsOpen(true);
        onMeetingUpdated?.(optimisticMeeting);
        const finalizePromise = submitTranscriptAction('finalize-post-meeting', {
            transcriptText: normalizedTranscript,
            source: 'livekit-browser-voice',
            markCompleted: true,
            keepalive: closeAfterKickoff,
        });
        if (closeAfterKickoff) {
            setJoinConfig(null);
            setInterimTranscript('');
            onClose();
            void finalizePromise
                .catch((error) => {
                const message = error instanceof Error ? error.message : 'Meeting finalization failed';
                onMeetingUpdated?.(buildMeetingSnapshot({
                    status: 'completed',
                    transcriptProcessingState: 'failed',
                    transcriptProcessingError: message,
                    notesProcessingState: 'failed',
                    notesProcessingError: 'AI notes could not be generated because post-call finalization failed.',
                }));
            })
                .finally(() => {
                finalizationInFlightRef.current = false;
            });
            return;
        }
        void finalizePromise
            .then((result) => {
            setLastAutoSyncedTranscript(normalizedTranscript);
            applyTranscriptActionResult(result);
        })
            .catch((error) => {
            const message = error instanceof Error ? error.message : 'Meeting finalization failed';
            setTranscriptProcessingState('failed');
            setTranscriptProcessingError(message);
            setNotesProcessingState('failed');
            setNotesProcessingError('AI notes could not be generated because post-call finalization failed.');
            setFinalizingSession(false);
            onMeetingUpdated?.(buildMeetingSnapshot({
                status: 'completed',
                transcriptProcessingState: 'failed',
                transcriptProcessingError: message,
                notesProcessingState: 'failed',
                notesProcessingError: 'AI notes could not be generated because post-call finalization failed.',
            }));
        })
            .finally(() => {
            finalizationInFlightRef.current = false;
        });
    };
    const handleGenerateNotes = async () => {
        if (!canGenerateNotes) {
            notifyFailure({
                title: 'Transcript too short',
                message: 'Capture a bit more conversation before generating AI meeting notes.',
            });
            return;
        }
        setGeneratingNotes(true);
        setNotesProcessingState('processing');
        setNotesProcessingError(null);
        try {
            const result = await submitTranscriptAction('save-transcript-and-generate-notes', {
                transcriptText: normalizedTranscript,
                source: 'livekit-browser-voice',
            });
            setLastAutoSyncedTranscript(normalizedTranscript);
            applyTranscriptActionResult(result);
            if (result.notesGenerated) {
                notifySuccess({
                    title: 'AI summary updated',
                    message: 'The room sidebar now reflects the latest generated summary.',
                });
            }
            else if (result.notesReason === 'ai_not_configured') {
                notifyFailure({
                    title: 'AI notes unavailable',
                    message: 'Gemini is not configured for meeting note generation in this environment.',
                });
            }
            else if (result.notesReason === 'generation_failed') {
                notifyFailure({
                    title: 'AI summary failed',
                    message: 'The request completed, but note generation failed. Try again after more transcript is captured.',
                });
            }
        }
        catch (error) {
            setNotesProcessingState('failed');
            setNotesProcessingError(error instanceof Error ? error.message : 'Unknown error');
            reportConvexFailure({
                error,
                context: 'useInSiteMeetingRoomPostCall:generateNotes',
                title: 'AI summary failed',
                fallbackMessage: 'Unable to generate meeting notes.',
            });
        }
        finally {
            setGeneratingNotes(false);
        }
    };
    const handleRetryPostCallProcessing = async () => {
        if (!canPersist) {
            notifyFailure({
                title: 'Post-call retry unavailable',
                message: 'This meeting cannot persist transcript updates in the current environment.',
            });
            return;
        }
        if (normalizedTranscript.length < 20) {
            notifyFailure({
                title: 'Transcript too short',
                message: 'Capture a little more conversation before retrying post-call processing.',
            });
            return;
        }
        if (finalizationInFlightRef.current) {
            return;
        }
        finalizationInFlightRef.current = true;
        setRetryingPostCallProcessing(true);
        setMarkCompleted(true);
        setFinalizingSession(true);
        setNotesReason(null);
        setTranscriptSource((current) => current ?? 'livekit-browser-voice');
        setTranscriptProcessingState('processing');
        setTranscriptProcessingError(null);
        setNotesProcessingState('processing');
        setNotesProcessingError(null);
        setOperationsOpen(true);
        onMeetingUpdated?.(buildMeetingSnapshot({
            status: 'completed',
            transcriptSource: transcriptSource ?? 'livekit-browser-voice',
            transcriptProcessingState: 'processing',
            transcriptProcessingError: null,
            notesProcessingState: 'processing',
            notesProcessingError: null,
        }));
        try {
            const result = await submitTranscriptAction('finalize-post-meeting', {
                transcriptText: normalizedTranscript,
                source: transcriptSource ?? 'livekit-browser-voice',
                markCompleted: true,
            });
            setLastAutoSyncedTranscript(normalizedTranscript);
            applyTranscriptActionResult(result);
            notifySuccess({
                title: 'Post-call processing retried',
                message: 'Transcript finalization and AI notes generation are running again.',
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Meeting finalization failed';
            setTranscriptProcessingState('failed');
            setTranscriptProcessingError(message);
            setNotesProcessingState('failed');
            setNotesProcessingError('AI notes could not be generated because post-call finalization failed.');
            setFinalizingSession(false);
            onMeetingUpdated?.(buildMeetingSnapshot({
                status: 'completed',
                transcriptProcessingState: 'failed',
                transcriptProcessingError: message,
                notesProcessingState: 'failed',
                notesProcessingError: 'AI notes could not be generated because post-call finalization failed.',
            }));
            notifyFailure({
                title: 'Post-call retry failed',
                message,
            });
        }
        finally {
            setRetryingPostCallProcessing(false);
            finalizationInFlightRef.current = false;
        }
    };
    const performAutoSync = (transcript: string) => {
        setAutoSyncing(true);
        const mode: TranscriptMode = transcript.length >= 80 ? 'save-transcript-and-generate-notes' : 'save-transcript';
        void submitTranscriptAction(mode, {
            transcriptText: transcript,
            source: 'livekit-browser-voice',
        })
            .then((data) => {
            setLastAutoSyncedTranscript(transcript);
            setLastAutoSyncAt(Date.now());
            applyTranscriptActionResult(data);
        })
            .catch((error) => {
            const message = error instanceof Error ? error.message : 'Room automation sync failed';
            logError(error, 'useInSiteMeetingRoomPostCall:autoSyncTranscript');
            if (mode === 'save-transcript-and-generate-notes') {
                setNotesReason('generation_failed');
                setNotesProcessingState('failed');
                setNotesProcessingError(message);
            }
            else {
                setTranscriptProcessingError(message);
            }
        })
            .finally(() => {
            setAutoSyncing(false);
        });
    };
    return {
        submitTranscriptAction,
        finalizeMeetingAfterRoomExit,
        handleGenerateNotes,
        handleRetryPostCallProcessing,
        performAutoSync,
    };
}
