import type { ProposedImportProject } from './projects-document-import-types';
export function projectNeedsClientReview(project: ProposedImportProject): boolean {
    if (project.clientStatus === 'resolved' || project.clientStatus === 'preferred') {
        return false;
    }
    if (project.clientStatus === 'ambiguous') {
        return true;
    }
    return project.clientStatus === 'unassigned' && Boolean(project.documentClientName?.trim());
}
export function projectNeedsStartDateReview(project: ProposedImportProject): boolean {
    return project.startDateStatus === 'unclear';
}
export function projectNeedsEndDateReview(project: ProposedImportProject): boolean {
    return project.endDateStatus === 'unclear';
}
export function projectNeedsImportReview(project: ProposedImportProject): boolean {
    return (projectNeedsClientReview(project) ||
        projectNeedsStartDateReview(project) ||
        projectNeedsEndDateReview(project));
}
export function needsProjectImportReview(projects: ProposedImportProject[]): boolean {
    return projects.some(projectNeedsImportReview);
}
export function buildClientReviewPrompt(project: ProposedImportProject): string {
    const documentName = project.documentClientName?.trim();
    if (project.clientStatus === 'ambiguous') {
        if (project.suggestions.length > 0) {
            return documentName
                ? `The document ties this project to “${documentName}”, but that name matches multiple clients. Did you mean ${project.suggestions.join(', ')}?`
                : `The client is unclear — did you mean ${project.suggestions.join(', ')}?`;
        }
        return documentName
            ? `The document ties this project to “${documentName}”, but we couldn't match that name confidently. Pick the right client below.`
            : 'The client is unclear. Pick the right client below.';
    }
    if (documentName && project.suggestions.length > 0) {
        return `The document names “${documentName}”. We found ${project.suggestions.join(', ')} but couldn't link them automatically — pick the matching client below.`;
    }
    if (documentName) {
        return `The document names “${documentName}”, but that client isn't linked in this workspace yet. Pick a client below or leave unassigned.`;
    }
    return 'Pick a workspace client for this project, or leave unassigned.';
}
export function getProjectImportReviewBlocker(projects: ProposedImportProject[]): string | null {
    const selected = projects.filter((project) => project.include && project.name.trim());
    if (selected.length === 0) {
        return 'Select at least one project to create.';
    }
    const clientReviewProjects = selected.filter((project) => projectNeedsClientReview(project));
    if (clientReviewProjects.length > 0) {
        const ambiguousCount = clientReviewProjects.filter((project) => project.clientStatus === 'ambiguous').length;
        const unmatchedCount = clientReviewProjects.length - ambiguousCount;
        if (ambiguousCount > 0 && unmatchedCount > 0) {
            return `Confirm clients for ${clientReviewProjects.length} projects — some names were unclear or couldn't be matched.`;
        }
        if (ambiguousCount > 0) {
            return `Confirm clients for ${ambiguousCount} project${ambiguousCount === 1 ? '' : 's'} — the document name matched multiple clients.`;
        }
        return `Pick workspace clients for ${clientReviewProjects.length} project${clientReviewProjects.length === 1 ? '' : 's'}.`;
    }
    const unclearStartDates = selected.filter((project) => projectNeedsStartDateReview(project) && !project.startDate.trim());
    if (unclearStartDates.length > 0) {
        return `Confirm start dates for ${unclearStartDates.length} project${unclearStartDates.length === 1 ? '' : 's'}.`;
    }
    const unclearEndDates = selected.filter((project) => projectNeedsEndDateReview(project) && !project.endDate.trim());
    if (unclearEndDates.length > 0) {
        return `Confirm end dates for ${unclearEndDates.length} project${unclearEndDates.length === 1 ? '' : 's'}.`;
    }
    return null;
}
export function buildProjectImportReviewDescription(documentSummary: string | null, projects: ProposedImportProject[], preferredClientName: string | null): string {
    if (documentSummary) {
        if (preferredClientName && !projects.some(projectNeedsClientReview)) {
            return `${documentSummary} Projects will be created under ${preferredClientName} unless you change them below.`;
        }
        return documentSummary;
    }
    const needsClients = projects.some(projectNeedsClientReview);
    const needsDates = projects.some((project) => projectNeedsStartDateReview(project) || projectNeedsEndDateReview(project));
    if (preferredClientName && !needsClients) {
        return `Review extracted projects before creating them under ${preferredClientName}.`;
    }
    if (needsClients && needsDates) {
        return 'Some clients and dates need clarification. Confirm details below before creating projects.';
    }
    if (needsDates) {
        return 'Some dates were unclear in the document. Confirm timelines before creating projects.';
    }
    return 'Some clients were unclear or could not be matched. Confirm who each project belongs to below.';
}
