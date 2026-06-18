'use client';
import { notifyFailure } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCreateLayoutContext } from '@livekit/components-react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useToast } from '@/shared/ui/use-toast';
import type { CaptureStatus, LiveKitJoinPayload, MeetingRoomPageProps, TranscriptActionResult, } from '../components/in-site-meeting-card.shared';
import type { MeetingRecord } from '../types';
import { buildFallbackRoomName, extractRoomNameFromMeetingLink, formatMeetingTitleFromRoomName, normalizeMeetingProcessingState, } from '../utils';
import { useInSiteMeetingRoomPostCall } from './use-in-site-meeting-room-post-call';
export function useInSiteMeetingRoomController(props: MeetingRoomPageProps) {
    const { meeting, onClose, canRecord = true, onMeetingUpdated, fallbackRoomName } = props;
    const { toast } = useToast();
    const liveRoomLayoutContext = useCreateLayoutContext();
    const [transcriptDraft, setTranscriptDraft] = useState(meeting.transcriptText ?? '');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [markCompleted, setMarkCompleted] = useState(meeting.status === 'completed');
    const [transcriptSavedAt, setTranscriptSavedAt] = useState<number | null>(meeting.transcriptUpdatedAtMs ?? null);
    const [transcriptSource, setTranscriptSource] = useState(meeting.transcriptSource ?? null);
    const [transcriptProcessingState, setTranscriptProcessingState] = useState(() => normalizeMeetingProcessingState(meeting.transcriptProcessingState));
    const [transcriptProcessingError, setTranscriptProcessingError] = useState<string | null>(meeting.transcriptProcessingError ?? null);
    const [notesUpdatedAt, setNotesUpdatedAt] = useState<number | null>(meeting.notesUpdatedAtMs ?? null);
    const [notesModel, setNotesModel] = useState(meeting.notesModel ?? null);
    const [summaryPreview, setSummaryPreview] = useState(meeting.notesSummary ?? null);
    const [notesProcessingState, setNotesProcessingState] = useState(() => normalizeMeetingProcessingState(meeting.notesProcessingState));
    const [notesProcessingError, setNotesProcessingError] = useState<string | null>(meeting.notesProcessingError ?? null);
    const [notesReason, setNotesReason] = useState<'ai_not_configured' | 'generation_failed' | null>(null);
    const [notesStorageId, setNotesStorageId] = useState<string | null>(meeting.notesStorageId ?? null);
    const [transcriptStorageId, setTranscriptStorageId] = useState<string | null>(meeting.transcriptStorageId ?? null);
    const [transcriptTruncatedForNotes, setTranscriptTruncatedForNotes] = useState(false);
    const [operationsOpen, setOperationsOpen] = useState(false);
    const [generatingNotes, setGeneratingNotes] = useState(false);
    const [finalizingSession, setFinalizingSession] = useState(false);
    const [retryingPostCallProcessing, setRetryingPostCallProcessing] = useState(false);
    const [joinConfig, setJoinConfig] = useState<LiveKitJoinPayload | null>(null);
    const [joiningRoom, setJoiningRoom] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [isMinimizedPreference, setIsMinimizedPreference] = useState(false);
    const isMobileViewport = useSyncExternalStore((onStoreChange) => {
        if (typeof window === 'undefined') {
            return () => undefined;
        }
        const media = window.matchMedia('(max-width: 767px)');
        const updateViewport = () => {
            onStoreChange();
        };
        updateViewport();
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', updateViewport);
            return () => {
                media.removeEventListener('change', updateViewport);
            };
        }
        media.addListener(updateViewport);
        return () => {
            media.removeListener(updateViewport);
        };
    }, () => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia('(max-width: 767px)').matches;
    }, () => false);
    const pipSupported = typeof document !== 'undefined' &&
        Boolean(document.pictureInPictureEnabled ||
            (typeof HTMLVideoElement !== 'undefined' &&
                'webkitSetPresentationMode' in HTMLVideoElement.prototype));
    const isMinimized = Boolean(joinConfig) && !isMobileViewport && isMinimizedPreference;
    const [pipActive, setPipActive] = useState(false);
    const [transcriptRecordingEnabled, setTranscriptRecordingEnabled] = useState(() => Boolean(meeting.transcriptText?.trim()));
    const autoCaptureEnabled = transcriptRecordingEnabled && canRecord;
    const [captureStatus, setCaptureStatus] = useState<CaptureStatus>({
        supported: false,
        listening: false,
        error: null,
    });
    const [autoSyncing, setAutoSyncing] = useState(false);
    const [lastAutoSyncAt, setLastAutoSyncAt] = useState<number | null>(meeting.transcriptUpdatedAtMs ?? null);
    const [lastAutoSyncedTranscript, setLastAutoSyncedTranscript] = useState(meeting.transcriptText?.trim() ?? '');
    const settingsDrivenOpenRef = useRef(false);
    const finalizationInFlightRef = useRef(false);
    const roomViewportRef = useRef<HTMLDivElement | null>(null);
    const meetingLegacyId = typeof meeting.legacyId === 'string' ? meeting.legacyId : '';
    const meetingCalendarEventId = typeof meeting.calendarEventId === 'string' && meeting.calendarEventId.trim().length > 0 ? meeting.calendarEventId : null;
    const meetingStatus = typeof meeting.status === 'string' && meeting.status.length > 0 ? meeting.status : 'scheduled';
    const meetingTimezone = typeof meeting.timezone === 'string' && meeting.timezone.trim().length > 0 ? meeting.timezone : 'UTC';
    const meetingDescription = typeof meeting.description === 'string' && meeting.description.trim().length > 0 ? meeting.description : null;
    const meetingLink = typeof meeting.meetLink === 'string' && meeting.meetLink.length > 0 ? meeting.meetLink : null;
    const persistedMeetingRoomName = (typeof meeting.roomName === 'string' && meeting.roomName.trim().length > 0 ? meeting.roomName.trim() : null) ??
        extractRoomNameFromMeetingLink(meetingLink) ??
        (typeof fallbackRoomName === 'string' && fallbackRoomName.trim().length > 0 ? fallbackRoomName.trim() : null);
    const meetingRoomName = persistedMeetingRoomName ?? buildFallbackRoomName({
        title: meeting.title,
        startTimeMs: meeting.startTimeMs,
        endTimeMs: meeting.endTimeMs,
    });
    const meetingTitle = typeof meeting.title === 'string' && meeting.title.trim().length > 0
        ? meeting.title.trim()
        : formatMeetingTitleFromRoomName(meetingRoomName) ?? 'Meeting room';
    const meetingAttendeeEmails = Array.isArray(meeting.attendeeEmails) ? meeting.attendeeEmails : [];
    const isPreviewMeeting = meetingLegacyId.startsWith('preview-');
    const hasJoinReference = Boolean(meetingLegacyId || meetingCalendarEventId || meetingRoomName);
    const inlineJoinError = !isPreviewMeeting && !hasJoinReference
        ? 'This meeting record is missing its room reference. Refresh and reopen the room.'
        : joinError;
    const roomActionLabel = joiningRoom
        ? 'Joining...'
        : isPreviewMeeting
            ? 'Preview only'
            : persistedMeetingRoomName
                ? 'Join room'
                : 'Start meet';
    const normalizedTranscript = transcriptDraft.trim();
    const canPersist = canRecord && !isPreviewMeeting && meetingLegacyId.length > 0;
    const canGenerateNotes = canPersist && normalizedTranscript.length >= 20;
    const settingsWidgetOpen = Boolean(liveRoomLayoutContext.widget.state?.showSettings);
    const roomPinnedToMobileTray = Boolean(joinConfig && isMobileViewport && isMinimized);
    const canMinimizeRoom = Boolean(joinConfig && isMobileViewport);
    const hasTranscriptPendingSync = normalizedTranscript.length >= 20 && normalizedTranscript !== lastAutoSyncedTranscript;
    const setRoomViewportElement = (node: HTMLDivElement | null) => {
        roomViewportRef.current = node;
    };
    const getRoomVideoElement = (): HTMLVideoElement | null => {
        const root = roomViewportRef.current;
        if (!root) {
            return null;
        }
        const videos = Array.from(root.querySelectorAll('video'));
        return videos.find((video) => video.readyState >= 2) ?? videos[0] ?? null;
    };
    const appendTranscriptSnippet = (snippet: string) => {
        const normalized = snippet.trim();
        if (!normalized) {
            return;
        }
        setTranscriptDraft((current) => {
            const base = current.trim();
            if (!base) {
                return normalized;
            }
            if (base.endsWith(normalized)) {
                return current;
            }
            return `${base}\n${normalized}`;
        });
    };
    const buildMeetingSnapshot = (overrides: Partial<MeetingRecord> = {}): MeetingRecord => ({
        ...meeting,
        transcriptText: transcriptDraft,
        transcriptUpdatedAtMs: transcriptSavedAt,
        transcriptSource,
        transcriptProcessingState,
        transcriptProcessingError,
        notesSummary: summaryPreview,
        notesUpdatedAtMs: notesUpdatedAt,
        notesModel,
        notesProcessingState,
        notesProcessingError,
        status: markCompleted ? 'completed' : meeting.status,
        ...overrides,
    });
    const syncMeetingState = (updatedMeeting: MeetingRecord, options: {
        syncTranscript: boolean;
        syncNotes: boolean;
    }) => {
        onMeetingUpdated?.(updatedMeeting);
        setMarkCompleted(updatedMeeting.status === 'completed');
        if (options.syncTranscript) {
            setTranscriptDraft(updatedMeeting.transcriptText ?? '');
            setLastAutoSyncedTranscript(updatedMeeting.transcriptText?.trim() ?? '');
        }
        setTranscriptSavedAt(updatedMeeting.transcriptUpdatedAtMs ?? null);
        setLastAutoSyncAt(updatedMeeting.transcriptUpdatedAtMs ?? null);
        setTranscriptSource(updatedMeeting.transcriptSource ?? null);
        setTranscriptProcessingState(normalizeMeetingProcessingState(updatedMeeting.transcriptProcessingState));
        setTranscriptProcessingError(updatedMeeting.transcriptProcessingError ?? null);
        setNotesUpdatedAt(updatedMeeting.notesUpdatedAtMs ?? null);
        setNotesModel(updatedMeeting.notesModel ?? null);
        setSummaryPreview(updatedMeeting.notesSummary ?? null);
        setNotesProcessingState(normalizeMeetingProcessingState(updatedMeeting.notesProcessingState));
        setNotesProcessingError(updatedMeeting.notesProcessingError ?? null);
        setNotesStorageId(updatedMeeting.notesStorageId ?? null);
        setTranscriptStorageId(updatedMeeting.transcriptStorageId ?? null);
        setFinalizingSession(normalizeMeetingProcessingState(updatedMeeting.transcriptProcessingState) === 'processing' ||
            normalizeMeetingProcessingState(updatedMeeting.notesProcessingState) === 'processing');
        if (updatedMeeting.notesSummary) {
            setNotesReason(null);
        }
    };
    const applyTranscriptActionResult = (result: TranscriptActionResult) => {
        setNotesReason(result.notesReason ?? null);
        setTranscriptTruncatedForNotes(Boolean(result.transcriptTruncatedForNotes));
        if (result.notesReason !== 'generation_failed') {
            setNotesProcessingError(null);
        }
        if (typeof result.summary === 'string') {
            setSummaryPreview(result.summary);
        }
        if (result.model !== undefined) {
            setNotesModel(result.model ?? null);
        }
        if (result.meeting) {
            syncMeetingState(result.meeting, { syncTranscript: true, syncNotes: true });
        }
        if (!result.meeting) {
            setFinalizingSession(false);
        }
    };
    const { finalizeMeetingAfterRoomExit, handleGenerateNotes, handleRetryPostCallProcessing, performAutoSync, } = useInSiteMeetingRoomPostCall({
        meetingLegacyId,
        markCompleted,
        normalizedTranscript,
        transcriptDraft,
        transcriptSource,
        canPersist,
        canGenerateNotes,
        onClose,
        onMeetingUpdated,
        buildMeetingSnapshot,
        applyTranscriptActionResult,
        setMarkCompleted,
        setFinalizingSession,
        setTranscriptSource,
        setTranscriptProcessingState,
        setTranscriptProcessingError,
        setNotesProcessingState,
        setNotesProcessingError,
        setNotesReason,
        setGeneratingNotes,
        setRetryingPostCallProcessing,
        setOperationsOpen,
        setJoinConfig,
        setInterimTranscript,
        setAutoSyncing,
        setLastAutoSyncAt,
        setLastAutoSyncedTranscript,
        finalizationInFlightRef,
    });
    const handleJoinRoom = () => {
        if (isPreviewMeeting) {
            toast({
                title: 'Preview room',
                description: 'Live media is disabled in preview mode, but the workspace layout is available for review.',
            });
            return;
        }
        if (!hasJoinReference) {
            setJoinError('This meeting record is missing its room reference. Refresh and reopen the room.');
            return;
        }
        setJoiningRoom(true);
        setJoinError(null);
        void fetch('/api/meetings/livekit/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                legacyId: meetingLegacyId || undefined,
                calendarEventId: meetingCalendarEventId ?? undefined,
                roomName: meetingRoomName || undefined,
            }),
        })
            .then(async (response) => {
            const payload = (await response.json().catch(() => ({}))) as {
                success?: boolean;
                error?: string;
                data?: LiveKitJoinPayload;
            };
            if (!response.ok || payload.success === false || !payload.data) {
                throw new Error(payload.error || 'Unable to join the meeting room');
            }
            if (payload.data.meeting) {
                syncMeetingState(payload.data.meeting, { syncTranscript: false, syncNotes: false });
            }
            if (payload.data.migration?.created) {
                toast({
                    title: 'Native room prepared',
                    description: payload.data.migration.calendarSyncWarning ??
                        'This legacy meeting was upgraded to a Cohorts room automatically.',
                });
            }
            setJoinConfig(payload.data);
            setOperationsOpen(true);
            const hasExistingTranscript = Boolean(payload.data.meeting?.transcriptText?.trim() || transcriptDraft.trim());
            if (!hasExistingTranscript) {
                toast({
                    title: 'Room connected',
                    description: 'Start transcript recording when you are ready. Cohorts will transcribe speech, then generate guarded AI notes.',
                });
            }
            else {
                setTranscriptRecordingEnabled(true);
            }
        })
            .catch((error) => {
            const message = error instanceof Error ? error.message : 'Unable to join the meeting room';
            setJoinError(message);
        })
            .finally(() => {
            setJoiningRoom(false);
        });
    };
    const enableTranscriptRecording = () => {
        if (!canRecord) {
            notifyFailure({
                title: 'Recording unavailable',
                message: 'Transcript recording is disabled for this meeting room.',
            });
            return;
        }
        setTranscriptRecordingEnabled(true);
        setOperationsOpen(true);
        toast({
            title: 'Transcript recording enabled',
            description: 'Allow microphone access when prompted. Speak naturally and Cohorts will build the transcript in the background.',
        });
    };
    const togglePictureInPicture = async () => {
        if (!joinConfig) {
            notifyFailure({
                title: 'Join the room first',
                message: 'Picture in Picture becomes available once the LiveKit room is active.',
            });
            return;
        }
        const video = getRoomVideoElement();
        if (!video) {
            notifyFailure({
                title: 'Video unavailable',
                message: 'Turn on camera or wait for a participant video tile before entering Picture in Picture.',
            });
            return;
        }
        const webkitVideo = video as HTMLVideoElement & {
            webkitSetPresentationMode?: (mode: 'inline' | 'picture-in-picture' | 'fullscreen') => void;
            webkitSupportsPresentationMode?: (mode: 'inline' | 'picture-in-picture' | 'fullscreen') => boolean;
            webkitPresentationMode?: 'inline' | 'picture-in-picture' | 'fullscreen';
        };
        try {
            if (typeof document !== 'undefined' && document.pictureInPictureElement && document.exitPictureInPicture) {
                await document.exitPictureInPicture();
                setPipActive(false);
                return;
            }
            if (typeof video.requestPictureInPicture === 'function') {
                await video.requestPictureInPicture();
                setPipActive(true);
                return;
            }
            if (typeof webkitVideo.webkitSetPresentationMode === 'function' &&
                typeof webkitVideo.webkitSupportsPresentationMode === 'function' &&
                webkitVideo.webkitSupportsPresentationMode('picture-in-picture')) {
                const nextMode = webkitVideo.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture';
                webkitVideo.webkitSetPresentationMode(nextMode);
                setPipActive(nextMode === 'picture-in-picture');
                return;
            }
            throw new Error('Picture in Picture is not supported in this browser.');
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'useInSiteMeetingRoomController:enterPictureInPicture',
                title: 'Picture in Picture unavailable',
                fallbackMessage: 'Picture in Picture is not available in this browser.',
            });
        }
    };
    const toggleMinimizedRoom = () => {
        if (!canMinimizeRoom) {
            return;
        }
        setIsMinimizedPreference((current) => !current);
    };
    const [prevJoinConfig, setPrevJoinConfig] = useState(joinConfig);
    if (joinConfig !== prevJoinConfig) {
        setPrevJoinConfig(joinConfig);
        if (!joinConfig) {
            setPipActive(false);
        }
    }
    useEffect(() => {
        if (joinConfig) {
            return;
        }
        if (typeof document !== 'undefined' && document.pictureInPictureElement && document.exitPictureInPicture) {
            void document.exitPictureInPicture().catch(() => undefined);
        }
    }, [joinConfig]);
    useEffect(() => {
        if (settingsWidgetOpen) {
            settingsDrivenOpenRef.current = true;
            setOperationsOpen(true);
            return;
        }
        if (settingsDrivenOpenRef.current) {
            settingsDrivenOpenRef.current = false;
            setOperationsOpen(false);
        }
    }, [settingsWidgetOpen]);
    const handleOperationsOpenChange = (open: boolean) => {
        setOperationsOpen(open);
        if (!open && settingsWidgetOpen) {
            settingsDrivenOpenRef.current = false;
            liveRoomLayoutContext.widget.dispatch?.({ msg: 'toggle_settings' });
        }
    };
    useEffect(() => {
        if (!joinConfig || !canPersist || normalizedTranscript.length < 20) {
            return;
        }
        if (normalizedTranscript === lastAutoSyncedTranscript) {
            return;
        }
        const timeoutId = window.setTimeout(() => {
            performAutoSync(normalizedTranscript);
        }, 10000);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [canPersist, joinConfig, lastAutoSyncedTranscript, normalizedTranscript, performAutoSync]);
    return {
        liveRoomLayoutContext,
        appendTranscriptSnippet,
        interimTranscript,
        setInterimTranscript,
        markCompleted,
        transcriptSavedAt,
        transcriptSource,
        transcriptProcessingState,
        transcriptProcessingError,
        notesUpdatedAt,
        notesModel,
        summaryPreview,
        notesProcessingState,
        notesProcessingError,
        notesReason,
        notesStorageId,
        transcriptStorageId,
        transcriptTruncatedForNotes,
        operationsOpen,
        setJoinError,
        generatingNotes,
        finalizingSession,
        retryingPostCallProcessing,
        joinConfig,
        setJoinConfig,
        joiningRoom,
        joinError,
        autoCaptureEnabled,
        transcriptRecordingEnabled,
        enableTranscriptRecording,
        captureStatus,
        setCaptureStatus,
        autoSyncing,
        lastAutoSyncAt,
        meetingStatus,
        meetingTimezone,
        meetingDescription,
        meetingLink,
        meetingRoomName,
        meetingTitle,
        meetingAttendeeEmails,
        isPreviewMeeting,
        hasJoinReference,
        inlineJoinError,
        roomActionLabel,
        normalizedTranscript,
        canPersist,
        canGenerateNotes,
        hasTranscriptPendingSync,
        roomPinnedToMobileTray,
        canMinimizeRoom,
        isMinimized,
        setIsMinimized: setIsMinimizedPreference,
        isMobileViewport,
        pipSupported,
        pipActive,
        setRoomViewportElement,
        togglePictureInPicture,
        toggleMinimizedRoom,
        handleJoinRoom,
        finalizeMeetingAfterRoomExit,
        handleGenerateNotes,
        handleRetryPostCallProcessing,
        handleOperationsOpenChange,
    };
}
