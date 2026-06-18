'use client';
import { useAction, useMutation } from 'convex/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { readFileAsBase64, getPdfUploadSizeError } from '@/lib/agent-attachments';
import { asErrorMessage } from '@/lib/convex-errors';
import { agentApi, filesApi, projectsApi, projectsDocumentImportApi } from '@/lib/convex-api';
import { notifyFailure, notifySuccess, notifyWarning } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { emitDashboardRefresh } from '@/lib/refresh-bus';
import { isPreviewModeEnabled } from '@/lib/preview-data';
import type { ProjectRecord } from '@/types/projects';
import { buildTaskImportFileName, combineExtractedDocumentText, filterTasksDocumentFiles, isFileDragEvent, prepareTaskImportDocument, } from '../tasks/lib/extract-document-text';
import { uploadTaskImportDocument } from '../tasks/lib/upload-import-document';
import type { ProposedImportProject, ProposedImportProjectFromServer, ProjectDocumentImportPhase, } from './projects-document-import-types';
import { getProjectImportReviewBlocker, needsProjectImportReview, projectNeedsClientReview, projectNeedsEndDateReview, projectNeedsStartDateReview, } from './projects-document-import-review';
function formatDateInput(dateMs: number | null): string {
    if (dateMs == null)
        return '';
    const date = new Date(dateMs);
    if (Number.isNaN(date.getTime()))
        return '';
    return format(date, 'yyyy-MM-dd');
}
function mapServerProposal(project: ProposedImportProjectFromServer, index: number): ProposedImportProject {
    return {
        localId: `import-${index}-${crypto.randomUUID()}`,
        name: project.name,
        description: project.description ?? '',
        status: project.status,
        clientId: project.clientId ?? '',
        documentClientName: project.documentClientName,
        clientStatus: project.clientStatus,
        startDate: formatDateInput(project.startDateMs),
        endDate: formatDateInput(project.endDateMs),
        startDateStatus: project.startDateStatus,
        endDateStatus: project.endDateStatus,
        startDateHint: project.startDateHint,
        endDateHint: project.endDateHint,
        tags: project.tags,
        suggestions: project.suggestions,
        sourceExcerpt: project.sourceExcerpt,
        include: true,
    };
}
export type UseProjectsDocumentImportArgs = {
    workspaceId: string | null;
    ownerId: string | undefined;
    clients: Array<{
        id: string;
        name: string;
    }>;
    preferredClientId: string | null | undefined;
    preferredClientName: string | null | undefined;
    disabledReason: string | null;
    isPreviewMode: boolean;
    onProjectCreated: (project: ProjectRecord) => void;
};
export function useProjectsDocumentImport({ workspaceId, ownerId, clients, preferredClientId, preferredClientName, disabledReason, isPreviewMode, onProjectCreated, }: UseProjectsDocumentImportArgs) {
    const extractPdfTextAction = useAction(agentApi.extractPdfText);
    const extractProjectsFromDocument = useAction(projectsDocumentImportApi.extractProjectsFromDocument);
    const createProject = useMutation(projectsApi.create);
    const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
    const syncMetadata = useMutation(filesApi.syncMetadata);
    const [phase, setPhase] = useState<ProjectDocumentImportPhase>('idle');
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [proposedProjects, setProposedProjects] = useState<ProposedImportProject[]>([]);
    const [documentSummary, setDocumentSummary] = useState<string | null>(null);
    const dragDepthRef = useRef(0);
    const abortRef = useRef(false);
    const resetImport = useCallback(() => {
        abortRef.current = false;
        dragDepthRef.current = 0;
        setPhase('idle');
        setStatusMessage(null);
        setErrorMessage(null);
        setProposedProjects([]);
        setDocumentSummary(null);
    }, []);
    const extractPdfOnServer = async (file: File) => {
        if (!workspaceId || isPreviewModeEnabled())
            return null;
        const sizeError = getPdfUploadSizeError(file);
        if (sizeError) {
            return { extractionStatus: 'failed' as const, errorMessage: sizeError };
        }
        try {
            const dataBase64 = await readFileAsBase64(file);
            return await extractPdfTextAction({
                workspaceId,
                fileName: file.name,
                dataBase64,
            });
        }
        catch {
            return null;
        }
    };
    const uploadForVision = async (file: File) => {
        return await uploadTaskImportDocument({
            file,
            generateUploadUrl: () => generateUploadUrl({}),
            syncMetadata: (args) => syncMetadata(args),
        });
    };
    const createProjectsFromProposals = async (projects: ProposedImportProject[]) => {
        if (!workspaceId || !ownerId) {
            throw new Error('Sign in to import projects from a document.');
        }
        const selected = projects.filter((project) => project.include && project.name.trim());
        const reviewBlocker = getProjectImportReviewBlocker(projects);
        if (reviewBlocker) {
            throw new Error(reviewBlocker);
        }
        if (selected.length === 0) {
            throw new Error('Select at least one project to create.');
        }
        setPhase('creating');
        setStatusMessage(`Creating ${selected.length} project${selected.length === 1 ? '' : 's'}…`);
        if (abortRef.current) {
            resetImport();
            return;
        }
        const clientsById = new Map(clients.map((client) => [client.id, client.name]));
        const createResults = await Promise.all(selected.map(async (project) => {
            if (abortRef.current)
                return false;
            const clientId = project.clientId || preferredClientId || undefined;
            const clientName = clientsById.get(clientId ?? '') ?? preferredClientName ?? undefined;
            const legacyId = uuidv4();
            await createProject({
                workspaceId,
                legacyId,
                name: project.name.trim(),
                description: project.description.trim() || null,
                status: project.status,
                clientId: clientId ?? null,
                clientName: clientName ?? null,
                startDateMs: project.startDate ? new Date(project.startDate).getTime() : null,
                endDateMs: project.endDate ? new Date(project.endDate).getTime() : null,
                tags: project.tags,
                ownerId,
            });
            const nowMs = Date.now();
            onProjectCreated({
                id: legacyId,
                name: project.name.trim(),
                description: project.description.trim() || null,
                status: project.status,
                clientId: clientId ?? null,
                clientName: clientName ?? null,
                startDate: project.startDate ? new Date(project.startDate).toISOString() : null,
                endDate: project.endDate ? new Date(project.endDate).toISOString() : null,
                tags: project.tags,
                ownerId,
                createdAt: new Date(nowMs).toISOString(),
                updatedAt: new Date(nowMs).toISOString(),
                taskCount: 0,
                openTaskCount: 0,
                recentActivityAt: null,
                deletedAt: null,
            });
            emitDashboardRefresh({ reason: 'project-mutated', clientId: clientId ?? null });
            return true;
        }));
        const createdCount = createResults.filter(Boolean).length;
        notifySuccess({
            title: 'Projects imported',
            message: `Created ${createdCount} project${createdCount === 1 ? '' : 's'} from your document.`,
        });
        resetImport();
    };
    const runDocumentImport = async (files: File[]) => {
        if (disabledReason) {
            notifyFailure({ title: 'Cannot import', message: disabledReason });
            return;
        }
        if (isPreviewMode || isPreviewModeEnabled()) {
            notifyFailure({
                title: 'Preview mode',
                message: 'Document import is unavailable in preview mode.',
            });
            return;
        }
        if (!workspaceId) {
            notifyFailure({ title: 'Cannot import', message: 'Sign in to import projects from documents.' });
            return;
        }
        const documentFiles = filterTasksDocumentFiles(files);
        if (documentFiles.length === 0) {
            notifyFailure({
                title: 'Unsupported file',
                message: 'Drop a PDF, Word file, or image (including photos of handwritten notes).',
            });
            return;
        }
        abortRef.current = false;
        setErrorMessage(null);
        setPhase('extracting');
        setStatusMessage('Reading document…');
        try {
            if (abortRef.current)
                return;
            const preparedDocuments = await Promise.all(documentFiles.map((file) => prepareTaskImportDocument(file, { extractPdfOnServer, uploadForVision })));
            const textDocuments = preparedDocuments.flatMap((document) => document.kind === 'text' ? [{ fileName: document.fileName, text: document.text }] : []);
            const visualDocuments = preparedDocuments.flatMap((document) => document.kind === 'vision'
                ? [{
                        fileName: document.fileName,
                        mimeType: document.mimeType,
                        storageId: document.storageId,
                    }]
                : []);
            const combinedText = textDocuments.length > 0 ? combineExtractedDocumentText(textDocuments) : undefined;
            const primaryFileName = buildTaskImportFileName(documentFiles);
            const usesVision = visualDocuments.length > 0;
            setPhase('analyzing');
            setStatusMessage(usesVision
                ? 'Reading handwriting and finding projects…'
                : preferredClientName
                    ? `Finding projects for ${preferredClientName}…`
                    : 'Finding projects and timelines…');
            if (abortRef.current)
                return;
            const result = (await extractProjectsFromDocument({
                workspaceId,
                fileName: primaryFileName,
                extractedText: combinedText,
                visualDocuments: visualDocuments.length > 0 ? visualDocuments : undefined,
                preferredClientId: preferredClientId ?? null,
            })) as {
                proposedProjects: ProposedImportProjectFromServer[];
                documentSummary: string | null;
            };
            const mapped = result.proposedProjects.map((project, index) => mapServerProposal(project, index));
            setDocumentSummary(result.documentSummary ?? null);
            if (needsProjectImportReview(mapped)) {
                setProposedProjects(mapped);
                setPhase('review');
                setStatusMessage(null);
                const clientIssues = mapped.filter((project) => projectNeedsClientReview(project)).length;
                const dateIssues = mapped.filter((project) => projectNeedsStartDateReview(project) || projectNeedsEndDateReview(project)).length;
                if (clientIssues > 0 && dateIssues > 0) {
                    notifyWarning({
                        title: 'Review imported projects',
                        message: `${clientIssues} project${clientIssues === 1 ? '' : 's'} need client confirmation and ${dateIssues} need dates before creating.`,
                    });
                }
                else if (clientIssues > 0) {
                    notifyWarning({
                        title: 'Clients need confirmation',
                        message: `${clientIssues} project${clientIssues === 1 ? '' : 's'} have unclear or unmatched clients. Pick clients in the review sheet.`,
                    });
                }
                else if (dateIssues > 0) {
                    notifyWarning({
                        title: 'Dates need confirmation',
                        message: `${dateIssues} project${dateIssues === 1 ? '' : 's'} have unclear timelines. Add dates in the review sheet.`,
                    });
                }
                return;
            }
            await createProjectsFromProposals(mapped);
        }
        catch (error) {
            if (abortRef.current)
                return;
            const message = asErrorMessage(error);
            setErrorMessage(message);
            setPhase('error');
            setStatusMessage(null);
            reportConvexFailure({
                error,
                context: 'useProjectsDocumentImport:runDocumentImport',
                title: 'Import failed',
                fallbackMessage: message,
            });
        }
    };
    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        if (!isFileDragEvent(event) || disabledReason)
            return;
        event.preventDefault();
        dragDepthRef.current += 1;
        if (phase === 'idle' || phase === 'dragging') {
            setPhase('dragging');
        }
    };
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        if (!isFileDragEvent(event) || disabledReason)
            return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };
    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        if (!isFileDragEvent(event))
            return;
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0 && (phase === 'dragging' || phase === 'idle')) {
            setPhase('idle');
        }
    };
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        if (!isFileDragEvent(event))
            return;
        event.preventDefault();
        dragDepthRef.current = 0;
        const files = event.dataTransfer.files;
        if (files.length === 0)
            return;
        void runDocumentImport(Array.from(files));
    };
    const handleCancel = useCallback(() => {
        abortRef.current = true;
        resetImport();
    }, [resetImport]);
    const handleConfirmReview = () => {
        void createProjectsFromProposals(proposedProjects);
    };
    const updateProposedProject = (localId: string, patch: Partial<ProposedImportProject>) => {
        setProposedProjects((current) => current.map((project) => (project.localId === localId ? { ...project, ...patch } : project)));
    };
    useEffect(() => {
        if (phase !== 'extracting' && phase !== 'analyzing')
            return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCancel();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [phase, handleCancel]);
    const overlayVisible = phase === 'dragging' ||
        phase === 'extracting' ||
        phase === 'analyzing' ||
        phase === 'creating' ||
        phase === 'error';
    return {
        phase,
        statusMessage,
        errorMessage,
        proposedProjects,
        documentSummary,
        overlayVisible,
        reviewOpen: phase === 'review',
        importDragHandlers: {
            onDragEnter: handleDragEnter,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
        },
        handleCancel,
        handleConfirmReview,
        handleDismissReview: resetImport,
        updateProposedProject,
    };
}
