'use client';
import { useQuery } from 'convex/react';
import { proposalArchivesApi } from '@/lib/convex-api';
export function useProposalArtifactUrls(workspaceId: string | null, legacyId: string | null) {
    return useQuery(proposalArchivesApi.getArtifactDownloadUrls, workspaceId && legacyId ? { workspaceId, legacyId } : 'skip');
}
export function resolveProposalDeckUrls(args: {
    artifactUrls?: {
        pdfDownloadUrl: string | null;
        pptDownloadUrl: string | null;
    } | null;
    pdfUrl?: string | null;
    pptUrl?: string | null;
    presentationDeck?: {
        pdfUrl?: string | null;
        pdfStorageUrl?: string | null;
        pptxUrl?: string | null;
        storageUrl?: string | null;
    } | null;
}) {
    const deck = args.presentationDeck;
    const pdfUrl = args.artifactUrls?.pdfDownloadUrl ??
        args.pdfUrl ??
        deck?.pdfUrl ??
        deck?.pdfStorageUrl ??
        null;
    const pptUrl = args.artifactUrls?.pptDownloadUrl ??
        args.pptUrl ??
        deck?.storageUrl ??
        deck?.pptxUrl ??
        null;
    return { pdfUrl, pptUrl };
}
