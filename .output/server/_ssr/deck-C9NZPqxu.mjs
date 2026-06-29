import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { H as getPreviewProposals, at as mergeProposalForm } from "./preview-data-CXkRNfsX.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as useParams$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { U as proposalsApi } from "./convex-api-msEHRhRb.mjs";
import { $ as Rocket, An as FileText, D as Target, F as Sparkles, Sr as ChartColumn, Vn as Download, Yt as LoaderCircle, Zn as Clock, an as Layers, c as Wallet, ct as Presentation, nn as Lightbulb, u as Users, wr as Calendar } from "../_libs/lucide-react.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs, r as TabsContent } from "./tabs-BP_mm-cH.mjs";
import { t as ViewTransition } from "./view-transition-DFCVhmkH.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as BackLink } from "./back-link-CKMy253H.mjs";
import { t as DirectionalPageTransition } from "./page-transition-Ds_W2a1a.mjs";
import { n as useProposalArtifactUrls, t as resolveProposalDeckUrls } from "./use-proposal-artifact-urls-BCuD2CyY.mjs";
import { t as DeckDocumentViewer } from "./deck-document-viewer-DYOkkoJk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deck-C9NZPqxu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DeckPageViewerSection({ pdfUrl, pptxUrl, proposalDisplayName }) {
	const [tab, setTab] = (0, import_react.useState)(pdfUrl ? "pdf" : "pptx");
	const activeSrc = (() => {
		if (tab === "pdf" && pdfUrl) return pdfUrl;
		if (tab === "pptx" && pptxUrl) return pptxUrl;
		return pdfUrl ?? pptxUrl;
	})();
	const handleTabChange = (value) => {
		setTab(value);
	};
	if (!pdfUrl && !pptxUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-12 text-center text-sm text-muted-foreground",
		children: "No presentation file is available for this proposal yet."
	});
	if (!Boolean(pdfUrl && pptxUrl) && activeSrc) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckDocumentViewer, {
		src: activeSrc,
		embedded: true,
		subtitle: proposalDisplayName
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: tab,
			onValueChange: handleTabChange,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "inline-flex h-auto w-full max-w-md gap-1 rounded-xl bg-muted/40 p-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "pdf",
						disabled: !pdfUrl,
						className: "flex-1 gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
							className: "size-3.5 shrink-0",
							"aria-hidden": true
						}), "PDF"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "pptx",
						disabled: !pptxUrl,
						className: "flex-1 gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presentation, {
							className: "size-3.5 shrink-0",
							"aria-hidden": true
						}), "PowerPoint"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "pdf",
					className: "mt-4 focus-visible:outline-none",
					children: pdfUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckDocumentViewer, {
						src: pdfUrl,
						embedded: true,
						subtitle: `${proposalDisplayName} · PDF`
					}) : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "pptx",
					className: "mt-4 focus-visible:outline-none",
					children: pptxUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckDocumentViewer, {
						src: pptxUrl,
						embedded: true,
						subtitle: `${proposalDisplayName} · Slides`
					}) : null
				})
			]
		})
	});
}
var getSlideIcon = (index) => {
	const icons = [
		Presentation,
		Target,
		Lightbulb,
		Users,
		Sparkles,
		Layers,
		ChartColumn,
		Wallet,
		Calendar,
		Rocket
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(icons[index % icons.length] ?? Presentation, { className: "size-4" });
};
function ProposalDeckPage() {
	const proposalId = useParams$1()?.proposalId;
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	const workspaceId = user?.agencyId ?? null;
	const proposalRow = useQuery(proposalsApi.getByLegacyId, !isPreviewMode && workspaceId && proposalId ? {
		workspaceId,
		legacyId: proposalId
	} : "skip");
	const previewProposal = isPreviewMode && proposalId ? getPreviewProposals(null).find((proposal) => proposal.id === proposalId) ?? null : null;
	const isLoading = !isPreviewMode && proposalRow === void 0;
	const error = isPreviewMode ? previewProposal ? null : "Proposal not found" : !isLoading && proposalRow === null ? "Proposal not found" : null;
	const proposal = (() => {
		if (isPreviewMode) return previewProposal;
		if (!proposalRow) return null;
		return {
			id: proposalRow.legacyId,
			status: proposalRow.status,
			stepProgress: proposalRow.stepProgress,
			formData: mergeProposalForm(proposalRow.formData),
			aiInsights: proposalRow.aiInsights ?? null,
			aiSuggestions: proposalRow.aiSuggestions ?? null,
			pdfUrl: proposalRow.pdfUrl ?? null,
			pptUrl: proposalRow.pptUrl ?? null,
			createdAt: proposalRow.createdAtMs ? new Date(proposalRow.createdAtMs).toISOString() : null,
			updatedAt: proposalRow.updatedAtMs ? new Date(proposalRow.updatedAtMs).toISOString() : null,
			lastAutosaveAt: proposalRow.lastAutosaveAtMs ? new Date(proposalRow.lastAutosaveAtMs).toISOString() : null,
			clientId: proposalRow.clientId ?? null,
			clientName: proposalRow.clientName ?? null,
			presentationDeck: proposalRow.presentationDeck ?? null
		};
	})();
	const artifactUrls = useProposalArtifactUrls(workspaceId, proposalId ?? null);
	const { pdfUrl: pdfViewerUrl, pptUrl: pptxViewerUrl } = resolveProposalDeckUrls({
		artifactUrls,
		pdfUrl: proposal?.pdfUrl,
		pptUrl: proposal?.pptUrl,
		presentationDeck: proposal?.presentationDeck
	});
	const pdfDownloadUrl = pdfViewerUrl;
	const pptDownloadUrl = pptxViewerUrl;
	const cloudCopyPending = Boolean(proposal && workspaceId && (proposal.pdfUrl && !artifactUrls?.pdfArchived || proposal.pptUrl && !artifactUrls?.pptArchived));
	const lastUpdated = (() => {
		if (!proposal?.updatedAt) return null;
		const parsed = new Date(proposal.updatedAt);
		return Number.isNaN(parsed.getTime()) ? proposal.updatedAt : parsed.toLocaleString();
	})();
	const slideGuidance = (() => {
		const text = proposal?.presentationDeck?.instructions;
		if (!text) return [];
		return text.split(/(?=Slide \d+:)/).filter(Boolean).map((s, index) => {
			const titleMatch = s.match(/Slide \d+:\s*([^*]+)/);
			const title = typeof titleMatch?.[1] === "string" ? titleMatch[1].trim() : `Slide ${index + 1}`;
			const points = s.split("*").slice(1).flatMap((p) => {
				const t = p.trim();
				return t ? [t] : [];
			});
			return {
				id: index + 1,
				title,
				points
			};
		});
	})();
	const proposalDisplayName = proposal?.clientName ?? "Strategy Proposal";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DirectionalPageTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: isLoading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-[60vh] items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-3 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Loading proposal deck…" })]
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackLink, {
						label: "Back to proposals",
						href: "/dashboard/proposals",
						transitionTypes: ["nav-back"]
					}), proposal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
						name: `proposal-title-${proposal.id}`,
						share: "text-morph",
						default: "none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-semibold tracking-tight text-foreground",
							children: proposalDisplayName
						})
					}) : null]
				}), proposal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
					name: `proposal-status-${proposal.id}`,
					share: "morph",
					default: "none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: proposal.status === "ready" ? "default" : "outline",
						className: "uppercase tracking-wide",
						children: proposal.status
					})
				}) : null]
			}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-h-[60vh] items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-3 text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Loading proposal deck…" })]
				})
			}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-destructive/40 bg-destructive/5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-destructive",
					children: "Unable to load deck"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "text-destructive/80",
					children: error
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: "/dashboard/proposals",
						children: "Return to proposals"
					})
				}) })]
			}) : proposal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-muted/60 bg-background",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-xl",
							children: "Presentation deck"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: proposal.clientName ? `Prepared for ${proposal.clientName}` : "Presentation preview" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
									children: lastUpdated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-muted/20 text-[11px] font-medium",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }),
											"Updated: ",
											lastUpdated
										]
									})
								}), slideGuidance.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-1 bg-primary rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "text-sm uppercase tracking-widest text-foreground/80",
											children: "Slide-by-Slide Guidance"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Strategic walkthrough of your proposal deck"
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
										children: slideGuidance.map((slide, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
											className: "relative overflow-hidden border-muted/40 bg-muted/5 motion-chromatic hover:bg-muted/10 hover:border-accent/20 group",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-4xl font-black text-primary/10",
														children: ["0", slide.id]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
													className: "p-4 pb-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2 text-primary",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "p-1.5 rounded-lg bg-accent/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
															children: getSlideIcon(index)
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60",
															children: ["Slide ", slide.id]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
														className: "text-sm font-bold leading-tight mt-1",
														children: slide.title
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
													className: "p-4 pt-2",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
														className: "space-y-2",
														children: slide.points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
															className: "flex gap-2 text-[12px] leading-relaxed text-muted-foreground",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 size-1 shrink-0 rounded-full bg-accent/40" }), point]
														}, `${slide.id}-${point}`))
													})
												})
											]
										}, slide.id))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-3",
								children: [
									pdfDownloadUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: pdfDownloadUrl,
											target: "_blank",
											rel: "noreferrer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), "Download PDF"]
										})
									}) : null,
									pptDownloadUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: pptDownloadUrl,
											target: "_blank",
											rel: "noreferrer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 size-4" }), "Download PowerPoint"]
										})
									}) : null,
									cloudCopyPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Cloud copies are syncing to durable storage…"
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckPageViewerSection, {
								pdfUrl: pdfViewerUrl,
								pptxUrl: pptxViewerUrl,
								proposalDisplayName
							})
						]
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Proposal not found" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "The requested proposal could not be located." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: "/dashboard/proposals",
					transitionTypes: ["nav-back"],
					children: "Return to proposals"
				})
			}) })] })]
		})
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDeckPage, {});
//#endregion
export { SplitComponent as component };
