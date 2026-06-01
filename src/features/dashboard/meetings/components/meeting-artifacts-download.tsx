'use client';
import { useQuery } from 'convex/react';
import { CloudDownload, Download } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useAuth } from '@/shared/contexts/auth-context';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { meetingArchivesApi } from '@/lib/convex-api';
import { buildMeetingArtifactFilename, downloadPdfArtifact, downloadTextArtifact, downloadUrlArtifact, } from '@/lib/meeting-artifact-download';
import { buildMeetingNotesPdfBlob } from '@/lib/meeting-notes-pdf';
import { cn, getWorkspaceId } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
type MeetingArtifactsDownloadProps = {
    className?: string;
    legacyId: string;
    meetingTitle: string;
    notesSummary?: string | null;
    notesStorageId?: string | null;
    transcriptText?: string | null;
    transcriptStorageId?: string | null;
    compact?: boolean;
};
export function MeetingArtifactsDownload({ className, legacyId, meetingTitle, notesSummary, notesStorageId, transcriptText, transcriptStorageId, compact = false, }: MeetingArtifactsDownloadProps) {
    const { user } = useAuth();
    const workspaceId = getWorkspaceId(user);
    const [downloading, setDownloading] = useState<'notes-pdf' | 'notes-cloud' | 'transcript' | 'transcript-cloud' | null>(null);
    const artifactUrls = useQuery(meetingArchivesApi.getArtifactDownloadUrls, workspaceId ? { workspaceId, legacyId } : 'skip');
    const hasNotes = Boolean(notesSummary?.trim());
    const hasTranscript = Boolean(transcriptText?.trim());
    const notesArchived = Boolean(notesStorageId) || Boolean(artifactUrls?.notesArchived);
    const transcriptArchived = Boolean(transcriptStorageId) || Boolean(artifactUrls?.transcriptArchived);
    const handleDownloadNotesPdf = () => {
        const content = notesSummary?.trim();
        if (!content) {
            return;
        }
        setDownloading('notes-pdf');
        try {
            const blob = buildMeetingNotesPdfBlob({
                meetingTitle,
                content,
            });
            downloadPdfArtifact(blob, buildMeetingArtifactFilename(meetingTitle, 'notes-pdf'));
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'MeetingArtifactsDownload:notesPdf',
                title: 'PDF download failed',
                fallbackMessage: 'Unable to download meeting notes as PDF.',
            });
        }
        finally {
            setDownloading(null);
        }
    };
    const handleDownloadTranscript = () => {
        const content = transcriptText?.trim();
        if (!content) {
            return;
        }
        setDownloading('transcript');
        try {
            downloadTextArtifact(content, buildMeetingArtifactFilename(meetingTitle, 'transcript'));
        }
        finally {
            setDownloading(null);
        }
    };
    const handleDownloadNotesFromCloud = async () => {
        setDownloading('notes-cloud');
        try {
            const url = artifactUrls?.notesDownloadUrl;
            if (!url) {
                throw new Error('Meeting notes are still syncing to cloud storage. Try again in a moment.');
            }
            await downloadUrlArtifact(url, buildMeetingArtifactFilename(meetingTitle, 'notes-pdf'));
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'MeetingArtifactsDownload:notesCloud',
                title: 'Cloud notes download failed',
                fallbackMessage: 'Unable to download archived meeting notes.',
            });
        }
        finally {
            setDownloading(null);
        }
    };
    const handleDownloadTranscriptFromCloud = async () => {
        setDownloading('transcript-cloud');
        try {
            const url = artifactUrls?.transcriptDownloadUrl;
            if (!url) {
                throw new Error('Meeting transcript is still syncing to cloud storage. Try again in a moment.');
            }
            await downloadUrlArtifact(url, buildMeetingArtifactFilename(meetingTitle, 'transcript'));
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'MeetingArtifactsDownload:transcriptCloud',
                title: 'Cloud transcript download failed',
                fallbackMessage: 'Unable to download archived meeting transcript.',
            });
        }
        finally {
            setDownloading(null);
        }
    };
    const handleNotesCloudClick = () => {
        void handleDownloadNotesFromCloud();
    };
    const handleTranscriptCloudClick = () => {
        void handleDownloadTranscriptFromCloud();
    };
    if (!hasNotes && !hasTranscript) {
        return null;
    }
    return (<div className={cn('flex flex-wrap gap-2', className)}>
      {hasNotes ? (<>
          <Button type="button" size={compact ? 'sm' : 'default'} variant="outline" onClick={handleDownloadNotesPdf} disabled={downloading !== null}>
            <Download className="size-4"/>
            {downloading === 'notes-pdf' ? 'Downloading…' : 'Download PDF'}
          </Button>
          {workspaceId ? (<Button type="button" size={compact ? 'sm' : 'default'} variant="ghost" onClick={handleNotesCloudClick} disabled={downloading !== null || !notesArchived}>
              <CloudDownload className="size-4"/>
              {downloading === 'notes-cloud' ? 'Fetching…' : notesArchived ? 'Cloud copy' : 'Cloud syncing…'}
            </Button>) : null}
        </>) : null}

      {hasTranscript ? (<>
          <Button type="button" size={compact ? 'sm' : 'default'} variant="outline" onClick={handleDownloadTranscript} disabled={downloading !== null}>
            <Download className="size-4"/>
            {downloading === 'transcript' ? 'Downloading…' : 'Download transcript'}
          </Button>
          {workspaceId ? (<Button type="button" size={compact ? 'sm' : 'default'} variant="ghost" onClick={handleTranscriptCloudClick} disabled={downloading !== null || !transcriptArchived}>
              <CloudDownload className="size-4"/>
              {downloading === 'transcript-cloud' ? 'Fetching…' : transcriptArchived ? 'Cloud copy' : 'Cloud syncing…'}
            </Button>) : null}
        </>) : null}
    </div>);
}
