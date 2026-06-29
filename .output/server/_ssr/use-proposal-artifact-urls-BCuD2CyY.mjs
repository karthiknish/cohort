import { u as useQuery } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { z as proposalArchivesApi } from "./convex-api-msEHRhRb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-proposal-artifact-urls-BCuD2CyY.js
function useProposalArtifactUrls(workspaceId, legacyId) {
	return useQuery(proposalArchivesApi.getArtifactDownloadUrls, workspaceId && legacyId ? {
		workspaceId,
		legacyId
	} : "skip");
}
function resolveProposalDeckUrls(args) {
	const deck = args.presentationDeck;
	return {
		pdfUrl: args.artifactUrls?.pdfDownloadUrl ?? args.pdfUrl ?? deck?.pdfUrl ?? deck?.pdfStorageUrl ?? null,
		pptUrl: args.artifactUrls?.pptDownloadUrl ?? args.pptUrl ?? deck?.storageUrl ?? deck?.pptxUrl ?? null
	};
}
//#endregion
export { useProposalArtifactUrls as n, resolveProposalDeckUrls as t };
