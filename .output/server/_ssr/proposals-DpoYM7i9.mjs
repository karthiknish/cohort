import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, h as ConvexHttpClient, l as useMutation, o as ConvexReactClient, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { r as motion_exports } from "./motion-DtlbbvFg.mjs";
import { H as getPreviewProposals, Q as isPreviewModeEnabled, at as mergeProposalForm, c as createDefaultProposalForm, lt as withPreviewModeSearchParamIfEnabled } from "./preview-data-CXkRNfsX.mjs";
import { c as cn, m as formatRelativeTime$1 } from "./utils-hh4sibN0.mjs";
import { C as slideInRightVariants, O as transitions, S as slideInLeftVariants, d as fadeInUpVariants, h as listItemEnterClass, n as blobVariantsSlow, t as blobVariants, v as motionEasing, w as subtlePulseVariants, y as motionLoopSeconds } from "./motion-Cf6ujF0h.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as Skeleton } from "./skeleton-CQ4LJS0E.mjs";
import { s as logError, t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess, s as notifyWarning } from "./notifications-DQZKskhM.mjs";
import { i as useSearchParams, r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { f as authClient, g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { B as proposalGenerationApi, H as proposalVersionsApi, N as presentationDeckApi, U as proposalsApi, V as proposalTemplatesApi } from "./convex-api-msEHRhRb.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { An as FileText, Ar as Building2, F as Sparkles, Fn as Factory, Gt as MapPin, Hn as DollarSign, In as Eye, J as Send, Kn as Copy, Q as RotateCcw, Rn as ExternalLink, Vn as Download, X as Save, Yt as LoaderCircle, Zn as Clock, b as TriangleAlert, bt as PanelsTopLeft, cr as CircleAlert, ct as Presentation, d as UsersRound, er as ClipboardList, f as User, gr as Check, gt as Pencil, hn as History, hr as ChevronDown, i as X, j as Star, lt as Plus, mr as ChevronLeft, or as CircleCheck, pr as ChevronRight, rt as RefreshCw, w as Trash2, xn as Globe, zn as Ellipsis } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { n as FadeInItem, r as FadeInStagger, t as FadeIn } from "./animate-in-JYv0iBIt.mjs";
import { t as ViewTransition } from "./view-transition-DFCVhmkH.mjs";
import { t as SvglBrandLogo } from "./svgl-brand-logo-rIFZzPiw.mjs";
import { i as getButtonClasses, t as DASHBOARD_THEME } from "./dashboard-theme-DM5oBGdY.mjs";
import { n as FormField, t as FieldSection } from "./form-field-B6tt5YY-.mjs";
import { t as Checkbox } from "./checkbox-DP7YqpAp.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error-P2IX7lhG.mjs";
import { t as Textarea } from "./textarea-C0M2IvQZ.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { t as MotionCard } from "./motion-primitives-HmftJNmb.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Be-Tzxcj.mjs";
import { t as ScrollArea } from "./scroll-area-DnXuhDTw.mjs";
import { t as logger } from "./logger-0qFO0GgU.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { a as DropdownMenuLabel, c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { t as PageMotionShell } from "./page-motion-shell-Ci2leIYf.mjs";
import { t as DashboardPageHero } from "./dashboard-page-hero-BIWBoJtP.mjs";
import { i as can } from "./dashboard-access-q6oyjv-c.mjs";
import { r as useKeyboardShortcuts } from "./use-keyboard-shortcuts-CjHWs-Qm.mjs";
import { t as DashboardSkeleton } from "./dashboard-skeleton-pDCnFdEC.mjs";
import { a as useIsMobile, r as DrawerContent, t as Drawer$1 } from "./drawer-Cc1imAWb.mjs";
import { t as LiveRegion } from "./live-region-BmnQNfB0.mjs";
import { n as useProposalArtifactUrls, t as resolveProposalDeckUrls } from "./use-proposal-artifact-urls-BCuD2CyY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/proposals-DpoYM7i9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProposalsPageSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-44" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-72" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-40 rounded-md" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "border-b border-muted/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							"step-1",
							"step-2",
							"step-3",
							"step-4"
						].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-28 rounded-full" }, slot))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid gap-4 p-6 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-5/6" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-32 rounded-md" })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-36" }), [
					"proposal-1",
					"proposal-2",
					"proposal-3",
					"proposal-4"
				].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-muted/60 bg-background",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex items-center gap-4 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-12 rounded-lg" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-64" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-24 rounded-md" })
						]
					})
				}, slot))]
			})
		]
	});
}
/** Offline fallback when live themes cannot be loaded. */
var FALLBACK_PRESENTATION_THEMES = [{
	id: "fallback-dark",
	name: "Classic dark",
	description: "Bold contrast with a polished, executive feel."
}, {
	id: "fallback-light",
	name: "Classic light",
	description: "Clean layout with generous whitespace."
}];
function presentationThemesReducer(state, action) {
	switch (action.type) {
		case "beginLoad": return {
			...state,
			isLoading: true,
			loadError: null
		};
		case "loadSuccess": return {
			themes: action.themes,
			isLoading: false,
			loadError: null
		};
		case "loadFailure": return {
			themes: action.themes,
			isLoading: false,
			loadError: action.loadError
		};
		default: return state;
	}
}
function usePresentationThemes() {
	const listThemes = useAction(presentationDeckApi.listThemes);
	const [state, dispatch] = (0, import_react.useReducer)(presentationThemesReducer, {
		themes: FALLBACK_PRESENTATION_THEMES,
		isLoading: true,
		loadError: null
	});
	const { themes, isLoading, loadError } = state;
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const load = async () => {
			if (cancelled) return;
			dispatch({ type: "beginLoad" });
			try {
				const result = await listThemes({ limit: 50 });
				if (cancelled) return;
				const mapped = result.data.map((theme) => ({
					id: theme.id,
					name: theme.name,
					description: theme.type === "custom" ? "Workspace theme from your brand library." : "Curated visual style for client-ready decks.",
					thumbnailUrl: theme.thumbnailUrl ?? null
				}));
				dispatch({
					type: "loadSuccess",
					themes: mapped.length > 0 ? mapped : FALLBACK_PRESENTATION_THEMES
				});
			} catch {
				if (!cancelled) dispatch({
					type: "loadFailure",
					themes: FALLBACK_PRESENTATION_THEMES,
					loadError: "Showing default styles — live theme catalog will load when the engine is connected."
				});
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [listThemes]);
	return {
		themes,
		themeById: new Map(themes.map((theme) => [theme.id, theme])),
		isLoading,
		loadError
	};
}
var marketingPlatforms = [
	"Google Ads",
	"Meta Ads",
	"LinkedIn Ads",
	"TikTok Ads",
	"Other"
];
var socialHandles = [
	"Facebook",
	"Instagram",
	"LinkedIn",
	"TikTok",
	"X / Twitter",
	"YouTube"
];
var goalOptions = [
	"Lead generation",
	"Sales",
	"Brand awareness",
	"Recruitment",
	"Other"
];
var challenges = [
	"Low leads",
	"High cost per lead",
	"Lack of brand awareness",
	"Scaling issues",
	"Other"
];
var scopeOptions = [
	"PPC (Google Ads)",
	"Paid Social (Meta/TikTok/LinkedIn)",
	"SEO & Content Marketing",
	"Email Marketing",
	"Creative & Design",
	"Strategy & Consulting",
	"Other"
];
var startTimelineOptions = [
	"ASAP",
	"Within 1 month",
	"Within 3 months",
	"Flexible"
];
var proposalValueOptions = [
	"£2,000 – £5,000",
	"£5,000 – £10,000",
	"£10,000+"
];
var engagementOptions = ["One-off project", "Ongoing monthly support"];
var animatedStepClassName = ["space-y-6", listItemEnterClass].join(" ");
var interactiveCardClassName = "motion-chromatic hover:shadow-sm active:scale-[0.98]";
var LABEL_ICON_CLASS = "size-4 text-primary/70";
var companyNameLabelPrefix = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
	className: LABEL_ICON_CLASS,
	"aria-hidden": true
});
var websiteLabelPrefix = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
	className: LABEL_ICON_CLASS,
	"aria-hidden": true
});
var industryLabelPrefix = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Factory, {
	className: LABEL_ICON_CLASS,
	"aria-hidden": true
});
var companySizeLabelPrefix = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, {
	className: LABEL_ICON_CLASS,
	"aria-hidden": true
});
var locationsLabelPrefix = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
	className: LABEL_ICON_CLASS,
	"aria-hidden": true
});
function SelectionIndicator({ selected }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": "true",
		className: cn("flex size-5 items-center justify-center rounded-md border motion-chromatic", selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 bg-background/80"),
		children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }) : null
	});
}
var SOCIAL_HANDLE_SVGL = {
	Facebook: "facebook",
	Instagram: "instagram",
	LinkedIn: "linkedin",
	"X / Twitter": "x",
	YouTube: "youtube"
};
function socialHandleIcon(handle) {
	const brand = SOCIAL_HANDLE_SVGL[handle];
	if (brand) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SvglBrandLogo, {
		brand,
		className: "size-4 opacity-70 transition-opacity group-hover:opacity-100",
		labeled: false
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4 text-muted-foreground transition-colors group-hover:text-primary" });
}
function ProposalCompanyStepSection({ formState, validationErrors, onUpdateField }) {
	const onChangeCompanyName = (event) => onUpdateField(["company", "name"], event.target.value);
	const onChangeCompanyWebsite = (event) => onUpdateField(["company", "website"], event.target.value);
	const onChangeCompanyIndustry = (event) => onUpdateField(["company", "industry"], event.target.value);
	const onChangeCompanySize = (event) => onUpdateField(["company", "size"], event.target.value);
	const onChangeCompanyLocations = (event) => onUpdateField(["company", "locations"], event.target.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: animatedStepClassName,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
					id: "companyName",
					label: "Company Name",
					labelPrefix: companyNameLabelPrefix,
					error: validationErrors["company.name"],
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "companyName",
						name: "companyName",
						placeholder: "Acme Corporation",
						value: formState.company.name,
						onChange: onChangeCompanyName,
						className: cn("h-10 border-muted/60 bg-background/50 focus:bg-background motion-chromatic", validationErrors["company.name"] && "border-destructive/50 ring-destructive/20")
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
					id: "website",
					label: "Website URL",
					labelPrefix: websiteLabelPrefix,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "website",
						name: "website",
						type: "url",
						placeholder: "https://acme.com",
						value: formState.company.website,
						onChange: onChangeCompanyWebsite,
						className: "h-10 border-muted/60 bg-background/50 focus:bg-background motion-chromatic"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
					id: "industry",
					label: "Industry / Sector",
					labelPrefix: industryLabelPrefix,
					error: validationErrors["company.industry"],
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "industry",
						name: "industry",
						placeholder: "e.g. SaaS, Retail, Healthcare",
						value: formState.company.industry,
						onChange: onChangeCompanyIndustry,
						className: cn("h-10 border-muted/60 bg-background/50 focus:bg-background motion-chromatic", validationErrors["company.industry"] && "border-destructive/50 ring-destructive/20")
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
					id: "companySize",
					label: "Company Size",
					labelPrefix: companySizeLabelPrefix,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "companySize",
						name: "companySize",
						placeholder: "e.g. 25 employees",
						value: formState.company.size,
						onChange: onChangeCompanySize,
						className: "h-10 border-muted/60 bg-background/50 focus:bg-background motion-chromatic"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "locations",
				label: "Target Locations",
				labelPrefix: locationsLabelPrefix,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "locations",
					name: "locations",
					placeholder: "List primary offices or regions served",
					value: formState.company.locations,
					onChange: onChangeCompanyLocations,
					className: "min-h-[100px] resize-none border-muted/60 bg-background/50 motion-chromatic focus:bg-background"
				})
			})
		]
	});
}
function MarketingPlatformButton({ platform, isSelected, onToggleArrayValue }) {
	const onTogglePlatform = () => onToggleArrayValue?.(["marketing", "platforms"], platform);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onTogglePlatform,
		"aria-pressed": isSelected,
		className: cn(`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`, isSelected ? "border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm" : "border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/10"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground"),
			children: platform
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionIndicator, { selected: isSelected })]
	});
}
function SocialHandleInput({ handle, value, onChangeSocialHandle }) {
	const onSocialHandleChange = (event) => onChangeSocialHandle?.(handle, event.target.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border border-muted/50 bg-background/40 p-3 motion-chromatic hover:bg-background/80",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
			label: handle,
			labelPrefix: socialHandleIcon(handle),
			labelVariant: "title",
			className: "gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				name: `social-${handle}`,
				placeholder: "@company",
				value,
				onChange: onSocialHandleChange,
				className: "h-8 border-muted/40 bg-transparent text-xs motion-chromatic focus:bg-background"
			})
		})
	});
}
function ProposalMarketingStepSection({ formState, validationErrors, onUpdateField, onToggleArrayValue, onChangeSocialHandle }) {
	const onChangeBudget = (event) => onUpdateField(["marketing", "budget"], event.target.value);
	const onChangeAdAccounts = (value) => onUpdateField(["marketing", "adAccounts"], value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
					id: "budget",
					label: "Monthly marketing budget",
					error: validationErrors["marketing.budget"],
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "budget",
						name: "budget",
						placeholder: "e.g. £7,500",
						value: formState.marketing.budget,
						onChange: onChangeBudget
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
					id: "adAccounts",
					label: "Existing ad accounts?",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: formState.marketing.adAccounts,
						onValueChange: onChangeAdAccounts,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "adAccounts",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select an option" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "Yes",
							children: "Yes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "No",
							children: "No"
						})] })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSection, {
				title: "Current advertising platforms",
				description: "Which platforms are you already using for ads?",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: marketingPlatforms.map((platform) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketingPlatformButton, {
						platform,
						isSelected: formState.marketing.platforms.includes(platform),
						onToggleArrayValue
					}, platform))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSection, {
				title: "Social handles",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
					children: socialHandles.map((handle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialHandleInput, {
						handle,
						value: formState.marketing.socialHandles[handle] ?? "",
						onChangeSocialHandle
					}, handle))
				})
			})
		]
	});
}
function GoalOptionButton({ goal, isSelected, onToggleArrayValue }) {
	const onToggleGoal = () => onToggleArrayValue?.(["goals", "objectives"], goal);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onToggleGoal,
		"aria-pressed": isSelected,
		className: cn(`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`, isSelected ? "border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm" : "border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/10"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground"),
			children: goal
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionIndicator, { selected: isSelected })]
	});
}
function ChallengeButton({ challenge, isSelected, onToggleArrayValue }) {
	const onToggleChallenge = () => onToggleArrayValue?.(["goals", "challenges"], challenge);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onToggleChallenge,
		className: cn("rounded-full border px-4 py-2 text-xs font-semibold motion-chromatic", isSelected ? "scale-[1.02] border-primary bg-primary text-primary-foreground shadow-md" : "border-muted bg-background text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/5"),
		children: challenge
	});
}
function ProposalGoalsStepSection({ formState, validationErrors, onUpdateField, onToggleArrayValue }) {
	const onChangeAudience = (event) => onUpdateField(["goals", "audience"], event.target.value);
	const onChangeCustomChallenge = (event) => onUpdateField(["goals", "customChallenge"], event.target.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: animatedStepClassName,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSection, {
				title: "Primary Business Goals",
				description: "What are you hoping to achieve in the next 6-12 months?",
				error: validationErrors["goals.objectives"],
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: goalOptions.map((goal) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalOptionButton, {
						goal,
						isSelected: formState.goals.objectives.includes(goal),
						onToggleArrayValue
					}, goal))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
				id: "audience",
				label: "Target Audience",
				description: "Describe your ideal customer persona.",
				labelVariant: "title",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "audience",
					name: "audience",
					placeholder: "e.g. Marketing Managers at B2B SaaS companies with 50-200 employees",
					value: formState.goals.audience,
					onChange: onChangeAudience,
					className: "min-h-[100px] resize-none border-muted/60 bg-background/50 shadow-inner motion-chromatic focus:bg-background"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldSection, {
				title: "Key Challenges",
				description: "What's currently standing in your way?",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: challenges.map((challenge) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChallengeButton, {
						challenge,
						isSelected: formState.goals.challenges.includes(challenge),
						onToggleArrayValue
					}, challenge))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					name: "customChallenge",
					placeholder: "Other specific challenge…",
					value: formState.goals.customChallenge,
					onChange: onChangeCustomChallenge,
					className: "mt-2 h-10 border-muted/60 bg-background/50 text-sm motion-chromatic focus:bg-background"
				})]
			})
		]
	});
}
function ScopeServiceButton({ service, isSelected, onToggleArrayValue }) {
	const onToggleService = () => onToggleArrayValue?.(["scope", "services"], service);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: cn(`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`, isSelected ? "border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm" : "border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/10"),
		onClick: onToggleService,
		"aria-pressed": isSelected,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-0.5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground"),
				children: service
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionIndicator, { selected: isSelected })]
	});
}
function ProposalScopeStepSection({ formState, validationErrors, onUpdateField, onToggleArrayValue }) {
	const onChangeOtherService = (event) => onUpdateField(["scope", "otherService"], event.target.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: animatedStepClassName,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSection, {
			title: "Scope of Engagement",
			description: "Select the services where you need our expertise.",
			error: validationErrors["scope.services"],
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: scopeOptions.map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScopeServiceButton, {
					service,
					isSelected: formState.scope.services.includes(service),
					onToggleArrayValue
				}, service))
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
			id: "otherService",
			label: "Specific Requirements",
			description: "Any other service or specific deliverable you need?",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				id: "otherService",
				name: "otherService",
				placeholder: "e.g. CRO Audit, Landing Page Design, etc.",
				value: formState.scope.otherService,
				onChange: onChangeOtherService,
				className: "min-h-[100px] resize-none border-muted/60 bg-background/50 shadow-inner motion-chromatic focus:bg-background"
			})
		})]
	});
}
function TimelineOptionButton({ option, isSelected, onUpdateField }) {
	const onSelectStartTime = () => onUpdateField(["timelines", "startTime"], option);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelectStartTime,
		className: cn(`flex items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`, isSelected ? "border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm" : "border-muted/60 bg-background/50 hover:bg-muted/10"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground"),
			children: option
		}), isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-primary" }) : null]
	});
}
function ProposalTimelinesStepSection({ formState, onUpdateField }) {
	const onChangeUpcomingEvents = (event) => onUpdateField(["timelines", "upcomingEvents"], event.target.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: animatedStepClassName,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSection, {
			title: "Project Timeline",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: startTimelineOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineOptionButton, {
					option,
					isSelected: formState.timelines.startTime === option,
					onUpdateField
				}, option))
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
			id: "upcomingEvents",
			label: "Upcoming Campaigns or Events",
			description: "Share launches or milestones we should plan for.",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				id: "upcomingEvents",
				name: "upcomingEvents",
				placeholder: "e.g. Q1 Product Launch, Black Friday Sales, etc.",
				value: formState.timelines.upcomingEvents,
				onChange: onChangeUpcomingEvents,
				className: "min-h-[100px] resize-none border-muted/60 bg-background/50 shadow-inner motion-chromatic focus:bg-background"
			})
		})]
	});
}
function ProposalValueButton({ option, isSelected, onUpdateField }) {
	const onSelectProposalSize = () => onUpdateField(["value", "proposalSize"], option);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelectProposalSize,
		className: cn("flex flex-col items-center justify-center gap-2 rounded-2xl border p-6 motion-chromatic-lg", isSelected ? "scale-[1.05] border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-lg" : "border-muted/60 bg-background/50 hover:border-muted-foreground/30 hover:bg-muted/5"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-lg font-bold", isSelected ? "text-primary" : "text-foreground"),
			children: option
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60",
			children: "Per Month"
		})]
	});
}
function EngagementTypeButton({ option, isSelected, onUpdateField }) {
	const onSelectEngagementType = () => onUpdateField(["value", "engagementType"], option);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelectEngagementType,
		className: cn(`flex items-center justify-between rounded-xl border p-4 ${interactiveCardClassName}`, isSelected ? "border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-sm" : "border-muted/60 bg-background/50 hover:bg-muted/10"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("text-sm font-semibold", isSelected ? "text-primary" : "text-muted-foreground"),
			children: option
		}), isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-primary" }) : null]
	});
}
function PresentationThemeButton({ theme, isSelected, onUpdateField }) {
	const onSelectPresentationTheme = () => onUpdateField(["value", "presentationTheme"], theme.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelectPresentationTheme,
		className: cn("group relative flex flex-col gap-2 rounded-xl border p-4 motion-chromatic-lg", isSelected ? "border-primary bg-accent/[0.03] ring-1 ring-primary/20 shadow-md" : "border-muted/60 bg-background hover:border-muted-foreground/30 hover:shadow-sm"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("text-sm font-bold", isSelected ? "text-primary" : "text-foreground"),
				children: theme.name
			}), isSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-primary" }) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-left text-[10px] text-muted-foreground",
			children: theme.description
		})]
	});
}
function ProposalValueStepSection({ formState, summary, validationErrors, onUpdateField }) {
	const { themes, isLoading: themesLoading, loadError: themesLoadError } = usePresentationThemes();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: animatedStepClassName,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSection, {
				title: "Estimated Project Value",
				description: "Choose the budget range that best fits the project.",
				error: validationErrors["value.proposalSize"],
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: proposalValueOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalValueButton, {
						option,
						isSelected: formState.value.proposalSize === option,
						onUpdateField
					}, option))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldSection, {
				title: "Engagement Type",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: engagementOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EngagementTypeButton, {
						option,
						isSelected: formState.value.engagementType === option,
						onUpdateField
					}, option))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FieldSection, {
				title: "Deck style",
				description: "Choose how your strategy deck should look when we generate it.",
				className: "border-t border-muted/20 pt-4",
				children: [themesLoadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs text-muted-foreground",
					children: themesLoadError
				}) : null, themesLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: [
						"theme-skeleton-1",
						"theme-skeleton-2",
						"theme-skeleton-3"
					].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-xl border border-muted/40 bg-muted/30" }, key))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: themes.map((theme) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PresentationThemeButton, {
						theme,
						isSelected: formState.value.presentationTheme === theme.id,
						onUpdateField
					}, theme.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-dashed border-accent/20 bg-accent/5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg",
						children: "Proposal summary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Review the information before submitting." })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid gap-6 text-sm sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-xs font-semibold uppercase tracking-wider text-foreground",
									children: "Company"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: [
										summary.company.name || "—",
										" · ",
										summary.company.industry || "—"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: summary.company.website
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
									className: "text-xs font-semibold uppercase tracking-wider text-foreground",
									children: "Marketing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: ["Budget: ", summary.marketing.budget || "—"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: summary.marketing.platforms.length ? summary.marketing.platforms.join(", ") : "No platforms"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-xs font-semibold uppercase tracking-wider text-foreground",
								children: "Goals"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: summary.goals.objectives.length ? summary.goals.objectives.join(", ") : "Not specified"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "text-xs font-semibold uppercase tracking-wider text-foreground",
								children: "Scope"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground",
								children: summary.scope.services.length ? summary.scope.services.join(", ") : "Not selected"
							})]
						})
					]
				})]
			})
		]
	});
}
function ProposalStepContentComponent({ stepId, formState, summary, validationErrors, onUpdateField, onToggleArrayValue, onChangeSocialHandle }) {
	switch (stepId) {
		case "company": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalCompanyStepSection, {
			formState,
			summary,
			validationErrors,
			onUpdateField,
			onToggleArrayValue,
			onChangeSocialHandle
		});
		case "marketing": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalMarketingStepSection, {
			formState,
			summary,
			validationErrors,
			onUpdateField,
			onToggleArrayValue,
			onChangeSocialHandle
		});
		case "goals": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalGoalsStepSection, {
			formState,
			summary,
			validationErrors,
			onUpdateField,
			onToggleArrayValue,
			onChangeSocialHandle
		});
		case "scope": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalScopeStepSection, {
			formState,
			summary,
			validationErrors,
			onUpdateField,
			onToggleArrayValue,
			onChangeSocialHandle
		});
		case "timelines": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalTimelinesStepSection, {
			formState,
			summary,
			validationErrors,
			onUpdateField,
			onToggleArrayValue,
			onChangeSocialHandle
		});
		case "value": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalValueStepSection, {
			formState,
			summary,
			validationErrors,
			onUpdateField,
			onToggleArrayValue,
			onChangeSocialHandle
		});
		default: return null;
	}
}
var ProposalStepContent = ProposalStepContentComponent;
function DeckProgressOverlayShell({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", {
		className,
		"aria-live": "polite",
		children
	});
}
function ProposalGenerationStatusIcon({ isComplete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-full bg-accent/20 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative flex size-24 items-center justify-center rounded-full border-4 border-accent/20 bg-background shadow-xl",
			children: isComplete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "animate-in zoom-in fill-mode-forwards duration-500 text-success",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-12" })
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-12 animate-[spin_3s_linear_infinite] text-primary" })
			})
		})]
	});
}
function ProposalGenerationOverlayContent({ currentStageHelper, currentStageLabel, isComplete, progressPercent, stageIndex, stageLabels }) {
	const progressStyle = { width: `${progressPercent}%` };
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto flex w-full max-w-lg flex-col items-center gap-8 p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalGenerationStatusIcon, { isComplete }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "z-10 flex flex-col items-center gap-4 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-2xl tracking-tight text-foreground",
							children: isComplete ? "Proposal Generated!" : currentStageLabel
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-sm text-sm font-medium text-muted-foreground/80",
							children: isComplete ? "Your strategy and presentation deck are ready for review." : currentStageHelper
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 w-full space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 w-full overflow-hidden rounded-full border border-muted/20 bg-muted/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative h-full bg-primary motion-chromatic-xslow",
								style: progressStyle,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60",
								children: "Processing Strategy"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] font-bold text-primary",
								children: [Math.round(progressPercent), "%"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid w-full grid-cols-5 gap-2",
						children: stageLabels.map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-1 rounded-full motion-chromatic-slow", index <= stageIndex ? "bg-primary" : "bg-muted/40", index === stageIndex && !isComplete && "animate-pulse") }, label))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-8 top-1/4 size-16 animate-pulse rounded-full bg-accent/5 blur-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-8 bottom-1/4 size-20 animate-pulse rounded-full bg-accent/10 blur-2xl delay-700" })
		]
	});
}
function DeckProgressStageIcon({ stage }) {
	if (stage === "launching") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-10 text-primary" });
	if (stage === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-10 text-destructive" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-10 animate-spin text-primary" });
}
function DeckProgressOverlayContent({ copy, stage }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-3 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckProgressStageIcon, { stage }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-semibold text-foreground",
			children: copy.title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 max-w-sm text-sm text-muted-foreground",
			children: copy.description
		})] })]
	});
}
var deckStageMessages = {
	initializing: {
		title: "Starting deck request...",
		description: "Collecting your proposal details and preparing the presentation export."
	},
	polling: {
		title: "Generating slides & saving...",
		description: "We are exporting the PPT and saving a copy for you."
	},
	launching: {
		title: "Deck ready",
		description: "We saved a copy and are opening it for you now."
	},
	queued: {
		title: "Still processing",
		description: "The presentation export is still processing. We'll save it automatically as soon as it lands."
	},
	error: {
		title: "Deck preparation failed",
		description: "We could not finish the export. Please retry or regenerate the proposal."
	}
};
function getDeckStageCopy(stage) {
	return deckStageMessages[stage];
}
var generationFlow = [
	{
		label: "Analyzing your input...",
		helper: "Reviewing your responses and goals to set the brief.",
		icon: LoaderCircle,
		duration: 3e3
	},
	{
		label: "Gathering market insights...",
		helper: "Pulling benchmarks, comps, and audience signals.",
		icon: LoaderCircle,
		duration: 4e3
	},
	{
		label: "Drafting strategy...",
		helper: "Writing tailored recommendations and messaging.",
		icon: LoaderCircle,
		duration: 6e3
	},
	{
		label: "Formatting sections...",
		helper: "Structuring slides, pricing, and CTA blocks.",
		icon: LoaderCircle,
		duration: 8e3
	},
	{
		label: "Generating presentation...",
		helper: "We are creating your presentation slides. This may take a moment.",
		icon: LoaderCircle,
		duration: null
	}
];
var INITIAL_PROPOSAL_GENERATION_OVERLAY_STATE = {
	stageIndex: 0,
	shouldShowOverlay: false,
	showCompletionState: false
};
function proposalGenerationOverlayReducer(state, action) {
	switch (action.type) {
		case "startSubmitting": return {
			stageIndex: 0,
			shouldShowOverlay: true,
			showCompletionState: false
		};
		case "showCompletionState": return {
			...state,
			showCompletionState: true
		};
		case "dismissOverlay": return INITIAL_PROPOSAL_GENERATION_OVERLAY_STATE;
		case "advanceStage": return {
			...state,
			stageIndex: Math.min(state.stageIndex + 1, generationFlow.length - 1)
		};
		default: return state;
	}
}
function ProposalGenerationOverlay({ isSubmitting, isPresentationReady = false }) {
	const [{ stageIndex, shouldShowOverlay, showCompletionState }, dispatch] = (0, import_react.useReducer)(proposalGenerationOverlayReducer, INITIAL_PROPOSAL_GENERATION_OVERLAY_STATE);
	(0, import_react.useEffect)(() => {
		if (!isSubmitting) return;
		const frameId = requestAnimationFrame(() => {
			dispatch({ type: "startSubmitting" });
		});
		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [isSubmitting]);
	(0, import_react.useEffect)(() => {
		if (!isPresentationReady || !shouldShowOverlay) return;
		const frameId = requestAnimationFrame(() => {
			dispatch({ type: "showCompletionState" });
		});
		const dismissTimer = setTimeout(() => {
			dispatch({ type: "dismissOverlay" });
		}, 1500);
		return () => {
			cancelAnimationFrame(frameId);
			clearTimeout(dismissTimer);
		};
	}, [isPresentationReady, shouldShowOverlay]);
	(0, import_react.useEffect)(() => {
		if (!shouldShowOverlay || showCompletionState) return;
		const current = generationFlow[stageIndex];
		if (!current || current.duration === null) return;
		const id = setTimeout(() => {
			dispatch({ type: "advanceStage" });
		}, current.duration);
		return () => clearTimeout(id);
	}, [
		shouldShowOverlay,
		showCompletionState,
		stageIndex
	]);
	if (!shouldShowOverlay) return null;
	const currentStage = generationFlow[stageIndex];
	const currentStageLabel = currentStage?.label ?? "Generating presentation...";
	const currentStageHelper = currentStage?.helper ?? "We are creating your presentation slides. This may take a moment.";
	const isFinalStage = stageIndex === generationFlow.length - 1;
	const isComplete = showCompletionState || isFinalStage && isPresentationReady;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckProgressOverlayShell, {
		className: "fixed inset-0 z-[2100] flex items-center justify-center animate-in fade-in bg-background/40 backdrop-blur-xl duration-500",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalGenerationOverlayContent, {
			currentStageHelper,
			currentStageLabel,
			isComplete,
			progressPercent: (stageIndex + (isComplete ? 1 : 0)) / generationFlow.length * 100,
			stageIndex,
			stageLabels: generationFlow.map((flowStage) => flowStage.label)
		})
	});
}
function DeckProgressOverlay({ stage, isVisible }) {
	if (!isVisible) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckProgressOverlayShell, {
		className: "fixed inset-0 z-[2100] flex flex-col items-center justify-center gap-6 bg-background/80 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckProgressOverlayContent, {
			copy: getDeckStageCopy(stage),
			stage
		})
	});
}
function ProposalDeleteDialogContent({ isDeleting, onConfirm, onOpenChange, proposalName }) {
	const handleCancel = () => {
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Delete proposal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
		"This action cannot be undone. ",
		proposalName ? `${proposalName} ` : "",
		"and its data will be removed permanently."
	] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "outline",
		onClick: handleCancel,
		disabled: isDeleting,
		children: "Cancel"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "destructive",
		onClick: onConfirm,
		disabled: isDeleting,
		children: isDeleting ? "Deleting…" : "Delete"
	})] })] });
}
function ProposalDeleteDialogComponent({ open, isDeleting, proposalName, onOpenChange, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDeleteDialogContent, {
			isDeleting,
			onConfirm,
			onOpenChange,
			proposalName
		})
	});
}
var ProposalDeleteDialog = ProposalDeleteDialogComponent;
function proposalStatusBadgeClass(status) {
	if (status === "ready") return cn(DASHBOARD_THEME.badges.base, DASHBOARD_THEME.badges.success);
	if (status === "sent") return cn(DASHBOARD_THEME.badges.base, "border-accent/25 bg-accent/10 text-accent-foreground");
	if (status === "in_progress") return cn(DASHBOARD_THEME.badges.base, DASHBOARD_THEME.badges.warning);
	return cn(DASHBOARD_THEME.badges.base, DASHBOARD_THEME.badges.secondary);
}
function formatProposalUpdatedAt(updatedAt) {
	if (!updatedAt) return "Recently updated";
	const date = new Date(updatedAt);
	if (Number.isNaN(date.getTime())) return "Recently updated";
	return formatRelativeTime$1(date);
}
function ProposalHistoryHeader({ isLoading, onRefresh, proposalCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/15 px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-foreground",
				children: isLoading ? "Refreshing…" : `${proposalCount} ${proposalCount === 1 ? "proposal" : "proposals"}`
			}), !isLoading && proposalCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "For the active client workspace"
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: onRefresh,
			disabled: isLoading,
			className: "h-8 shrink-0 gap-1.5 rounded-full px-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
				className: cn("size-3.5", isLoading && "animate-spin"),
				"aria-hidden": true
			}), "Refresh"]
		})]
	});
}
function ProposalHistoryEmptyState({ actions, onCreateNew }) {
	const { canCreate, canManage = true, creating: isCreating, generating: isGenerating } = actions;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/25 bg-linear-to-b from-muted/10 to-transparent px-6 py-14 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
					className: "size-7 text-primary/80",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-lg font-semibold tracking-tight",
				children: "No proposals yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground",
				children: canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "Start the guided builder to capture client context and generate your first strategy deck." }) : "When your agency shares a proposal or deck, it will appear here for you to review."
			}),
			canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: onCreateNew,
				disabled: !canCreate || isCreating || isGenerating,
				className: "gap-2 rounded-full shadow-sm",
				children: [isCreating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New proposal"]
			}) : null
		]
	});
}
function ProposalHistoryRow({ canManage = true, deletingProposalId, onDownloadDeck, onRequestDelete, onResume, row }) {
	const { deckRequestable, displayName, isActiveDraft, isDeckPreparing, presentationUrl, proposal, resumeDisabled, resumeLabel } = row;
	const handleResumeAsEdit = () => {
		onResume(proposal, true);
	};
	const handleResume = () => {
		onResume(proposal, false);
	};
	const handleDownloadDeck = () => {
		onDownloadDeck(proposal);
	};
	const handleRequestDelete = () => {
		onRequestDelete(proposal);
	};
	const updatedLabel = formatProposalUpdatedAt(proposal.updatedAt);
	const isDeleting = deletingProposalId === proposal.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("group relative overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow]", "hover:border-primary/20 hover:shadow-md", isActiveDraft && "border-primary/30 bg-primary/[0.03] ring-1 ring-primary/15"),
		children: [isActiveDraft ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-y-0 left-0 w-1 bg-primary",
			"aria-hidden": true
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-2 pl-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
							name: `proposal-title-${proposal.id}`,
							share: "text-morph",
							default: "none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "truncate text-base font-semibold tracking-tight text-foreground",
								children: displayName
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
							name: `proposal-status-${proposal.id}`,
							share: "morph",
							default: "none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: proposalStatusBadgeClass(proposal.status),
								children: proposal.status
							})
						}),
						isActiveDraft && proposal.status !== "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "rounded-full border-warning/30 bg-warning/10 text-[10px] font-semibold uppercase tracking-wide text-warning",
							children: "Active draft"
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							suppressHydrationWarning: true,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
								className: "size-3.5 shrink-0",
								"aria-hidden": true
							}), updatedLabel]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden h-3 w-px bg-border sm:inline",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-[10px] tracking-tight text-muted-foreground/80",
							children: ["#", proposal.id.slice(0, 8).toUpperCase()]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-wrap items-center gap-2 sm:justify-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: isActiveDraft ? "default" : "secondary",
						onClick: handleResume,
						disabled: resumeDisabled,
						className: "h-9 min-w-[8.5rem] gap-1.5 rounded-full font-medium",
						children: [resumeDisabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-3.5 animate-spin",
							"aria-hidden": true
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelsTopLeft, {
							className: "size-3.5",
							"aria-hidden": true
						}), resumeLabel]
					}),
					presentationUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "outline",
						className: "h-9 rounded-full px-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
							href: `/dashboard/proposals/${proposal.id}/deck`,
							transitionTypes: ["nav-forward"],
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
								className: "mr-1.5 size-3.5",
								"aria-hidden": true
							}), "Preview"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "sm",
						variant: "ghost",
						className: "h-9 rounded-full px-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: presentationUrl,
							target: "_blank",
							rel: "noopener noreferrer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
								className: "mr-1.5 size-3.5",
								"aria-hidden": true
							}), "PPT"]
						})
					})] }) : canManage && deckRequestable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: handleDownloadDeck,
						disabled: isDeckPreparing,
						className: "h-9 gap-1.5 rounded-full border-dashed px-3",
						children: [isDeckPreparing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "size-3.5 animate-spin",
							"aria-hidden": true
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
							className: "size-3.5 text-primary",
							"aria-hidden": true
						}), isDeckPreparing ? "Preparing…" : "Generate Deck"]
					}) : null,
					canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							className: "size-9 rounded-full text-muted-foreground",
							"aria-label": `More actions for ${displayName}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-44",
						children: [
							proposal.status === "draft" && !isActiveDraft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: handleResumeAsEdit,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 size-4" }), "Edit draft"]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								className: "text-destructive focus:text-destructive",
								onClick: handleRequestDelete,
								disabled: isDeleting,
								children: [isDeleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Delete"]
							})
						]
					})] }) : null
				]
			})]
		})]
	});
}
function extractAiSummary(insights, depth = 0) {
	if (!insights || depth > 4) return null;
	if (typeof insights === "string") {
		const trimmed = insights.trim();
		return trimmed.length > 0 ? trimmed : null;
	}
	if (typeof insights !== "object") return null;
	if (Array.isArray(insights)) {
		for (const entry of insights) {
			const match = extractAiSummary(entry, depth + 1);
			if (match) return match;
		}
		return null;
	}
	const record = insights;
	for (const key of [
		"summary",
		"proposalSummary",
		"executiveSummary",
		"overview"
	]) {
		const value = record[key];
		if (typeof value === "string") {
			const trimmed = value.trim();
			if (trimmed.length > 0) return trimmed;
		}
	}
	for (const value of Object.values(record)) {
		const match = extractAiSummary(value, depth + 1);
		if (match) return match;
	}
	return null;
}
function ProposalHistoryComponent({ proposals, draftId, workflow, capabilities, deletingProposalId, queryError, onRefresh, onResume, onRequestDelete, downloadingDeckId, onDownloadDeck, onCreateNew }) {
	const { loading: isLoading, generating: isGenerating, creating: isCreating } = workflow;
	const { canCreate, canManage = true } = capabilities;
	const emptyStateActions = {
		canCreate,
		canManage,
		creating: isCreating,
		generating: isGenerating
	};
	const rows = proposals.map((proposal) => {
		const isActiveDraft = proposal.id === draftId;
		const presentationUrl = proposal.pptUrl ?? proposal.presentationDeck?.storageUrl ?? proposal.presentationDeck?.pptxUrl ?? null;
		const suggestionText = (typeof proposal.aiSuggestions === "string" ? proposal.aiSuggestions.trim() : "") || extractAiSummary(proposal.aiInsights);
		const displayName = proposal.clientName?.trim().length ? proposal.clientName : "Unnamed company";
		const isGenerationInFlight = isGenerating && isActiveDraft || proposal.status === "in_progress";
		const resumeLabel = proposal.status === "ready" ? "View proposal" : isGenerationInFlight ? "Generating…" : isActiveDraft ? "Continue editing" : "Resume editing";
		return {
			deckRequestable: !presentationUrl && Boolean(suggestionText),
			displayName,
			isActiveDraft,
			isDeckPreparing: downloadingDeckId === proposal.id,
			presentationUrl,
			proposal,
			resumeDisabled: proposal.status !== "ready" && isGenerationInFlight,
			resumeLabel
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionCard, {
		className: cn(DASHBOARD_THEME.cards.base, "overflow-hidden"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: DASHBOARD_THEME.cards.header,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn(DASHBOARD_THEME.icons.container, "size-10 shrink-0"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, {
						className: "size-5",
						"aria-hidden": true
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg font-semibold tracking-tight",
						children: "Proposal history"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-sm leading-relaxed",
						children: "Drafts, generated decks, and sent proposals for this client - resume work or open materials in one place."
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalHistoryHeader, {
					isLoading,
					onRefresh,
					proposalCount: proposals.length
				}),
				queryError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					variant: "destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: queryError })]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInStagger, {
					className: "space-y-3",
					children: proposals.length === 0 && !isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalHistoryEmptyState, {
						actions: emptyStateActions,
						onCreateNew
					}) : rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, {
						y: 14,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalHistoryRow, {
							canManage,
							deletingProposalId,
							onDownloadDeck,
							onRequestDelete,
							onResume,
							row
						})
					}, row.proposal.id))
				})
			]
		})]
	}) });
}
var ProposalHistory = ProposalHistoryComponent;
var METRIC_ICONS = {
	"Total Proposals": FileText,
	"Ready for Pitch": Sparkles,
	"Sent to Clients": Send,
	"Pipeline Value": DollarSign
};
function ProposalMetricCard({ stat }) {
	const Icon = stat.icon ?? METRIC_ICONS[stat.label] ?? FileText;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionCard, {
		className: cn(DASHBOARD_THEME.stats.card, "group relative overflow-hidden"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "relative p-5 sm:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: DASHBOARD_THEME.stats.label,
							children: stat.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn(DASHBOARD_THEME.stats.value, "tabular-nums"),
							children: stat.value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: DASHBOARD_THEME.stats.description,
							children: stat.description
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50", stat.bg, stat.color),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-5",
						"aria-hidden": true
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("pointer-events-none absolute inset-x-0 bottom-0 h-1 opacity-60", stat.bg.replace("/10", "/40")),
				"aria-hidden": true
			})]
		})
	});
}
function ProposalMetricsGrid({ stats }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: DASHBOARD_THEME.stats.container,
		children: stats.map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalMetricCard, { stat }, stat.label))
	});
}
function ProposalMetricsLoadingGrid() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: DASHBOARD_THEME.stats.container,
		children: [
			"proposal-metric-skeleton-1",
			"proposal-metric-skeleton-2",
			"proposal-metric-skeleton-3",
			"proposal-metric-skeleton-4"
		].map((slotKey) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-[7.5rem] animate-pulse rounded-2xl border border-muted/50 bg-muted/30",
			"aria-hidden": true
		}, slotKey))
	});
}
function getDefaultStats() {
	return [
		{
			label: "Total Proposals",
			value: "0",
			description: "Drafts and submitted",
			color: "text-info",
			bg: "bg-info/10"
		},
		{
			label: "Ready for Pitch",
			value: "0",
			description: "Generated decks",
			color: "text-success",
			bg: "bg-success/10"
		},
		{
			label: "Sent to Clients",
			value: "0",
			description: "Awaiting approval",
			color: "text-warning",
			bg: "bg-warning/10"
		},
		{
			label: "Pipeline Value",
			value: "$0",
			description: "Estimated total",
			color: "text-info",
			bg: "bg-info/10"
		}
	];
}
function ProposalMetrics({ proposals, isLoading = false }) {
	const stats = (() => {
		if (!proposals || !Array.isArray(proposals)) return getDefaultStats();
		try {
			const validProposals = proposals.filter((p) => p != null && typeof p === "object");
			const total = validProposals.length;
			const ready = validProposals.filter((p) => p.status === "ready").length;
			const sent = validProposals.filter((p) => p.status === "sent").length;
			let totalValue = 0;
			for (const p of validProposals) try {
				const sizeStr = p?.formData?.value?.proposalSize;
				if (typeof sizeStr !== "string" || !sizeStr) continue;
				const upperValueMatch = sizeStr.match(/\$(\d+)(?:k|m)?/g);
				if (upperValueMatch && upperValueMatch.length > 0) {
					const values = upperValueMatch.map((v) => {
						const num = parseInt(v.replace(/[^0-9]/g, ""), 10);
						if (v.toLowerCase().includes("m")) return num * 1e6;
						if (v.toLowerCase().includes("k")) return num * 1e3;
						return num;
					});
					totalValue += Math.max(...values);
				}
			} catch {}
			const formatValue = (val) => {
				if (typeof val !== "number" || Number.isNaN(val)) return "$0";
				if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}m`;
				if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}k`;
				return `$${val}`;
			};
			return [
				{
					label: "Total Proposals",
					value: total.toString(),
					description: "Drafts and submitted",
					color: "text-info",
					bg: "bg-info/10"
				},
				{
					label: "Ready for Pitch",
					value: ready.toString(),
					description: "Generated decks",
					color: "text-success",
					bg: "bg-success/10"
				},
				{
					label: "Sent to Clients",
					value: sent.toString(),
					description: "Awaiting approval",
					color: "text-warning",
					bg: "bg-warning/10"
				},
				{
					label: "Pipeline Value",
					value: formatValue(totalValue),
					description: "Estimated total",
					color: "text-info",
					bg: "bg-info/10"
				}
			];
		} catch (error) {
			logError(error, "ProposalMetrics:stats");
			return getDefaultStats();
		}
	})();
	const proposalCount = Array.isArray(proposals) ? proposals.length : 0;
	if (isLoading && proposalCount === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalMetricsLoadingGrid, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalMetricsGrid, { stats });
}
function Kbd({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
		"data-slot": "kbd",
		className: cn("pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground", className),
		...props
	});
}
function ProposalBuilderJourneyBar({ isSubmitting, isRecheckingDeck, submitted, isPresentationReady, activeProposalIdForDeck, deckDownloadUrl, autosaveStatus }) {
	const deckHref = activeProposalIdForDeck ? withPreviewModeSearchParamIfEnabled(`/dashboard/proposals/${activeProposalIdForDeck}/deck`, isPreviewModeEnabled()) : null;
	if (isSubmitting || isRecheckingDeck) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-5 shrink-0 animate-spin text-primary",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-foreground",
					children: isRecheckingDeck ? "Checking deck status…" : "Generating your proposal deck"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "This usually takes a few minutes. You can keep this panel open - we'll update when it's ready."
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-medium text-muted-foreground",
			children: "Step 5 of 5"
		})]
	});
	if (submitted && isPresentationReady) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/25 bg-success/5 px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
				className: "size-5 shrink-0 text-success",
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-foreground",
				children: "Deck is ready"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Open the presentation or download a copy."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [deckHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
					href: deckHref,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {
						className: "mr-1.5 size-3.5",
						"aria-hidden": true
					}), "View deck"]
				})
			}) : null, deckDownloadUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: deckDownloadUrl,
					target: "_blank",
					rel: "noopener noreferrer",
					children: "Download"
				})
			}) : null]
		})]
	});
	if (submitted) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		className: "flex items-center gap-3 rounded-xl border border-muted/50 bg-muted/20 px-4 py-3",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
			className: "size-5 shrink-0 text-primary",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Submission received. We're finishing your deck - check back here or in proposal history."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/15 px-3 py-2 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("font-medium", autosaveStatus === "error" ? "text-destructive" : autosaveStatus === "saving" ? "text-primary" : "text-muted-foreground"),
			children: autosaveStatus === "saving" ? "Saving…" : autosaveStatus === "error" ? "Autosave issue—retry with ⌘S" : autosaveStatus === "saved" ? "All changes saved" : "Autosave on"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: "⌘S save · ⌘Z undo · Esc close"
		})]
	});
}
function ProposalDraftStatusStrip({ autosaveLabel, autosaveStatus, draftId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-xs font-medium text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("size-2 shrink-0 rounded-full", autosaveStatus === "saving" ? "animate-pulse bg-primary" : autosaveStatus === "error" ? "bg-destructive" : autosaveStatus === "idle" ? "bg-warning" : "bg-success"),
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: autosaveLabel })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-mono text-[10px] tracking-tight text-muted-foreground/80",
			children: ["Draft #", draftId?.slice(0, 8).toUpperCase() ?? "NEW"]
		})]
	});
}
function ProposalStepFeedbackValidationBody({ hasErrors, validationMessages }) {
	if (hasErrors) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1 text-sm text-muted-foreground",
		children: validationMessages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 size-3.5 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message })]
		}, message))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Everything required for this step is in place. You can continue now or refine the optional details first."
	});
}
/** Compact validation strip — step title/progress live in the step nav rail. */
function ProposalStepFeedback(props) {
	const { validationMessages } = props;
	if (!(validationMessages.length > 0)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"),
		role: "alert",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center gap-2 text-sm font-medium text-destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
				className: "size-4 shrink-0",
				"aria-hidden": true
			}), "Fix these before continuing"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStepFeedbackValidationBody, {
			hasErrors: true,
			validationMessages
		})]
	});
}
function ProposalDraftContentShell({ stepContent, validationMessages }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative min-h-[280px] rounded-2xl border border-border/50 bg-background p-4 shadow-sm sm:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStepFeedback, { validationMessages }), stepContent]
		})
	});
}
function ProposalDraftFooter({ currentStep, isFirstStep, isLastStep, isSubmitting, onBack, onNext, totalSteps }) {
	const progressPercent = Math.round((currentStep + 1) / totalSteps * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-auto shrink-0 space-y-3 border-t border-border/50 pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("progress", {
			className: "h-1 w-full overflow-hidden rounded-full bg-muted/60 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted/60 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:transition-[width] duration-300 ease-out",
			value: progressPercent,
			max: 100,
			"aria-label": `Step ${currentStep + 1} of ${totalSteps}`
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-between gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: onBack,
					disabled: isFirstStep,
					className: "h-10 gap-1.5 rounded-full px-4 font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
						className: "size-4",
						"aria-hidden": true
					}), "Previous"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "hidden text-center text-xs text-muted-foreground sm:block",
					children: [
						"Step ",
						currentStep + 1,
						" of ",
						totalSteps,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mx-1.5 text-border",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium text-foreground",
							children: [progressPercent, "%"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onNext,
					disabled: isSubmitting,
					className: cn("h-10 gap-1.5 rounded-full px-6 font-semibold shadow-sm", isLastStep && "bg-success text-success-foreground hover:bg-success/90"),
					children: isLastStep ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
						className: "size-4",
						"aria-hidden": true
					}), isSubmitting ? "Generating…" : "Generate strategy"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [isSubmitting ? "Saving…" : "Continue", !isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
						className: "size-4",
						"aria-hidden": true
					}) : null] })
				})
			]
		})]
	});
}
function ProposalDraftPanel({ draftId, autosaveStatus, stepContent, onBack, onNext, isFirstStep, isLastStep, currentStep, totalSteps, isSubmitting, validationMessages }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDraftStatusStrip, {
				autosaveLabel: autosaveStatus === "saving" ? "Saving progress…" : autosaveStatus === "error" ? "Autosave needs attention" : autosaveStatus === "saved" ? "All changes saved" : "Draft ready to save",
				autosaveStatus,
				draftId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-0.5 [-webkit-overflow-scrolling:touch]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDraftContentShell, {
					stepContent,
					validationMessages
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDraftFooter, {
				currentStep,
				isFirstStep,
				isLastStep,
				isSubmitting,
				onBack,
				onNext,
				totalSteps
			})
		]
	});
}
function ProposalStepIndicatorRail({ steps, currentStep, submitted }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "flex flex-wrap items-center gap-2",
		"aria-label": "Proposal steps overview",
		children: steps.map((step, index) => {
			const isComplete = submitted || index < currentStep;
			const isCurrent = !submitted && index === currentStep;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				"aria-current": isCurrent ? "step" : void 0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					title: step.title,
					className: cn("block size-2.5 rounded-full transition-[background-color,box-shadow,transform] duration-200 motion-reduce:transition-none", isComplete && "bg-success ring-1 ring-success/25", isCurrent && "scale-110 bg-primary ring-[3px] ring-primary/20", !isComplete && !isCurrent && "bg-muted-foreground/25")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "sr-only",
					children: [
						index + 1,
						". ",
						step.title,
						isComplete ? " (completed)" : isCurrent ? " (current)" : ""
					]
				})]
			}, step.id);
		})
	});
}
function ProposalStepIndicatorSummary({ activeStepTitle, currentStep, percentage, totalSteps }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-xs font-medium",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-bold text-primary",
					children: ["Step ", currentStep + 1]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: ["of ", totalSteps]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mx-1 text-muted-foreground/30",
					children: "•"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-foreground",
					children: activeStepTitle
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-primary/70",
			children: [Math.round(percentage), "%"]
		})]
	});
}
function ProposalStepIndicatorProgressBar({ percentage }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative h-1.5 w-full overflow-hidden rounded-full bg-muted/30",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full bg-primary motion-chromatic-slow-inout",
			style: { width: `${percentage}%` }
		})
	});
}
function ProposalStepIndicatorComponent({ steps, currentStep, submitted }) {
	const progress = (currentStep + 1) / steps.length * 100;
	const activeStep = steps[currentStep];
	const percentage = submitted ? 100 : progress;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStepIndicatorRail, {
				currentStep,
				steps,
				submitted
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStepIndicatorSummary, {
				activeStepTitle: activeStep?.title ?? "Proposal step",
				currentStep,
				percentage,
				totalSteps: steps.length
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStepIndicatorProgressBar, { percentage })
		]
	});
}
var ProposalStepIndicator = ProposalStepIndicatorComponent;
function ProposalStepNavComponent({ steps, currentStep, submitted, onGoToStep }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		"aria-label": "Proposal steps",
		className: "relative flex flex-col gap-1 pl-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute left-[1.15rem] top-4 bottom-4 w-px bg-border/70",
			"aria-hidden": true
		}), steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStepNavItem, {
			step,
			index,
			submitted,
			currentStep,
			onGoToStep
		}, step.id))]
	});
}
function ProposalStepNavItem({ step, index, submitted, currentStep, onGoToStep }) {
	const isComplete = submitted || index < currentStep;
	const isCurrent = !submitted && index === currentStep;
	const canNavigate = !submitted && index <= currentStep;
	const onGoToProposalStep = () => {
		onGoToStep(index);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled: !canNavigate,
		onClick: onGoToProposalStep,
		"aria-current": isCurrent ? "step" : void 0,
		className: cn("relative z-[1] flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow]", isCurrent && "border-primary/35 bg-primary/[0.06] shadow-sm ring-1 ring-primary/10", !isCurrent && canNavigate && "border-transparent bg-background/80 hover:border-border/60 hover:bg-muted/40", !canNavigate && "cursor-default border-transparent bg-transparent opacity-55"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold", isComplete && "bg-success/15 text-success", isCurrent && "bg-primary text-primary-foreground", !isComplete && !isCurrent && "bg-muted text-muted-foreground"),
			children: isComplete && !isCurrent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
				className: "size-3.5",
				"aria-hidden": true
			}) : index + 1
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm font-medium text-foreground",
				children: step.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "line-clamp-2 text-xs text-muted-foreground",
				children: step.description
			})]
		})]
	});
}
var ProposalStepNav = ProposalStepNavComponent;
var deckTrackDurationSeconds = motionLoopSeconds.trackLong;
var proposalSubmittedHeroTransition = {
	...transitions.slow,
	delay: .2
};
var proposalAssetDeliveryTransition = {
	...transitions.slow,
	delay: .3
};
var proposalPulseAnimate = {
	scale: [
		1,
		1.2,
		1
	],
	opacity: [
		.2,
		.5,
		.2
	]
};
var proposalPulseTransition = {
	duration: motionLoopSeconds.pulse,
	repeat: Infinity,
	ease: motionEasing.inOut
};
var proposalTrackInitial = { width: 0 };
var proposalTrackAnimate = { width: "100%" };
var proposalTrackTransition = {
	duration: deckTrackDurationSeconds,
	ease: "linear"
};
var proposalTrackShimmerAnimate = { x: ["-100%", "100%"] };
function ProposalSubmittedHero({ activeProposalIdForDeck, canResumeSubmission, deckDownloadUrl, isSubmitting, onResumeSubmission }) {
	const presentationHref = activeProposalIdForDeck ? withPreviewModeSearchParamIfEnabled(`/dashboard/proposals/${activeProposalIdForDeck}/deck`, isPreviewModeEnabled()) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion_exports.m.div, {
		initial: "hidden",
		animate: "visible",
		variants: fadeInUpVariants,
		className: "relative overflow-hidden rounded-[2rem] border border-accent/20 bg-background p-10 shadow-2xl shadow-primary/5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0 overflow-hidden opacity-40",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
					animate: "animate",
					variants: blobVariants,
					className: "absolute -right-[10%] -top-[20%] size-[300px] rounded-full bg-accent/10 blur-[100px]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
					animate: "animate",
					variants: blobVariantsSlow,
					className: "absolute -bottom-[20%] -left-[5%] size-[400px] rounded-full bg-accent/5 blur-[120px]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,transparent_0%,rgb(from_var(--background)_r_g_b_/_0.75)_100%)]" })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col items-center gap-10 md:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
					initial: "initial",
					animate: "animate",
					variants: subtlePulseVariants,
					className: "absolute inset-0 rounded-3xl bg-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative flex size-24 items-center justify-center rounded-3xl bg-primary shadow-2xl shadow-primary/30",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-12 stroke-[2.5px] text-primary-foreground" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-4 text-center md:text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-4xl tracking-tight text-foreground lg:text-5xl",
							children: "Your Proposal is Ready!"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xl break-words text-lg font-medium leading-relaxed text-muted-foreground",
						children: "Success! We've synthesized your inputs into a strategic brief and an AI-powered presentation deck, ready for your next big pitch."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap justify-center gap-4 pt-4 md:justify-start",
						children: [deckDownloadUrl && presentationHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							className: "h-14 rounded-2xl bg-primary px-8 text-base font-bold shadow-xl shadow-primary/25 motion-chromatic hover:scale-105 hover:bg-accent/90 active:scale-95",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
								href: presentationHref,
								transitionTypes: ["nav-forward"],
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presentation, { className: "mr-3 size-6" }), "View Presentation"]
							})
						}) : null, canResumeSubmission ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							variant: "outline",
							className: "h-14 rounded-2xl border-muted/60 px-8 text-base font-bold backdrop-blur-sm motion-chromatic hover:bg-muted/10",
							onClick: onResumeSubmission,
							disabled: isSubmitting,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-3 size-5" }), "Edit Responses"]
						}) : null]
					})
				]
			})]
		})]
	});
}
function ProposalStrategyBriefCard({ onCopySummary, summary }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
		initial: "hidden",
		animate: "visible",
		variants: slideInLeftVariants,
		transition: proposalSubmittedHeroTransition,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex h-full flex-col overflow-hidden border-muted/60 bg-background/50 shadow-sm backdrop-blur-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "border-b border-muted/40 bg-muted/30 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg bg-accent/10 p-1.5 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-bold uppercase tracking-wider",
							children: "Strategy Brief"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-8 rounded-full transition-colors hover:bg-accent/10 hover:text-primary",
						onClick: onCopySummary,
						"aria-label": "Copy strategy brief",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "flex-1 space-y-6 pt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60",
								children: "Target Client"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-xl bg-muted p-2 text-foreground ring-1 ring-muted-foreground/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelsTopLeft, { className: "size-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-bold tracking-tight",
									children: summary.company.name || "Unnamed Client"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] font-medium text-muted-foreground",
									children: summary.company.industry || "Industry focus"
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60",
								children: "Value Proposition"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: summary.goals.objectives.length ? summary.goals.objectives.map((objective) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "border-accent/10 bg-accent/5 px-2 py-0.5 text-[10px] font-semibold text-primary",
									children: objective
								}, objective)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs italic text-muted-foreground",
									children: "None yet"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60",
								children: "Project Scope"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl border border-muted/50 bg-muted/30 p-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium leading-relaxed text-muted-foreground",
									children: summary.scope.services.join(", ") || "No services selected"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60",
								children: "Proposed Timeline"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-2 text-xs font-bold text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3 text-primary" }), summary.timelines.startTime || "Not scheduled"]
							})]
						})
					]
				})
			})]
		})
	});
}
function ProposalDeckReadyState({ activeProposalIdForDeck, deckDownloadUrl, isRecheckingDeck, onCopyShareLink, onRecheckDeck, presentationDeck, viewerHref }) {
	const presentationHref = activeProposalIdForDeck ? withPreviewModeSearchParamIfEnabled(`/dashboard/proposals/${activeProposalIdForDeck}/deck`, isPreviewModeEnabled()) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 sm:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "group relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-muted motion-chromatic hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgb(from_var(--primary)_r_g_b_/_0.05)_0%,transparent_70%)]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-1/3 rounded-full bg-accent/20" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-3/4 rounded-full bg-accent/10" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2 pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-video rounded-lg bg-muted-foreground/10" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-video rounded-lg bg-muted-foreground/10" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center bg-background/20 p-4 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "scale-0 rounded-full bg-primary p-4 shadow-2xl shadow-primary/40 transition-transform duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none group-hover:scale-100",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presentation, { className: "size-8 text-primary-foreground" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs font-black uppercase tracking-widest text-foreground",
							children: "Open deck preview"
						})]
					}),
					presentationHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
						href: presentationHref,
						className: "absolute inset-0 z-10"
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60",
					children: "Export & Share"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						deckDownloadUrl || presentationDeck.storageUrl || presentationDeck.pptxUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "group h-14 w-full justify-start rounded-2xl border-muted/60 motion-chromatic hover:border-accent/30 hover:bg-accent/[0.03]",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: deckDownloadUrl || presentationDeck.storageUrl || presentationDeck.pptxUrl || "#",
								target: "_blank",
								rel: "noreferrer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mr-4 rounded-xl bg-muted p-2 transition-colors group-hover:bg-accent/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4 text-muted-foreground transition-colors group-hover:text-primary" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[13px] font-bold tracking-tight",
										children: "PowerPoint (PPTX)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
										children: "Download for offline use"
									})]
								})]
							})
						}) : null,
						viewerHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							className: "group h-14 w-full justify-start rounded-2xl border-muted/60 motion-chromatic hover:border-accent/30 hover:bg-accent/[0.03]",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
								href: viewerHref,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mr-4 rounded-xl bg-muted p-2 transition-colors group-hover:bg-accent/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4 text-muted-foreground transition-colors group-hover:text-primary" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[13px] font-bold tracking-tight",
										children: "In-app preview"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
										children: "Slides & PDF in browser"
									})]
								})]
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "h-10 w-full justify-center rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground motion-chromatic hover:bg-accent/5 hover:text-primary",
							onClick: onCopyShareLink,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-2 size-3.5" }), "Copy Share Link"]
						})
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-auto flex items-center justify-between border-t border-muted/40 pt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-[11px] font-bold text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-2 rounded-full bg-success shadow-[0_0_8px_rgb(from_var(--success)_r_g_b_/_0.45)]" }), "AUTHENTICATED & VERIFIED"]
			}), onRecheckDeck && (presentationDeck.status === "pending" || presentationDeck.status === "processing") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: onRecheckDeck,
				disabled: isRecheckingDeck,
				className: "h-8 rounded-xl border border-accent/10 px-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-accent/5",
				children: [isRecheckingDeck ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-3" }), "Sync"]
			}) : null]
		})]
	});
}
function ProposalDeckGeneratingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col items-center justify-center py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
					animate: proposalPulseAnimate,
					transition: proposalPulseTransition,
					className: "absolute inset-0 rounded-full bg-accent/20 blur-2xl"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative rounded-[2rem] border border-muted bg-muted/40 p-6 ring-1 ring-muted-foreground/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-12 animate-spin text-primary/40" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mb-2 text-xl tracking-tight",
				children: "Architecting Your Deck"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-[280px] text-sm leading-relaxed text-muted-foreground",
				children: "Our AI engine is currently structuring your presentation slides. It usually takes less than 60 seconds."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
				initial: proposalTrackInitial,
				animate: proposalTrackAnimate,
				transition: proposalTrackTransition,
				className: "relative mt-8 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-accent/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
					animate: proposalTrackShimmerAnimate,
					transition: transitions.shimmer,
					className: "absolute inset-0 w-1/3 bg-primary"
				})
			})
		]
	});
}
function ProposalAssetDeliveryCard({ activeProposalIdForDeck, deckDownloadUrl, isRecheckingDeck, onCopyShareLink, onRecheckDeck, presentationDeck, viewerHref }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.m.div, {
		initial: "hidden",
		animate: "visible",
		variants: slideInRightVariants,
		transition: proposalAssetDeliveryTransition,
		className: "lg:col-span-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex h-full flex-col overflow-hidden border-muted/60 bg-background/50 shadow-sm backdrop-blur-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "border-b border-muted/40 bg-muted/30 pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-lg bg-accent/10 p-1.5 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Presentation, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-bold uppercase tracking-wider",
							children: "Asset Delivery"
						})]
					}), presentationDeck ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: cn("h-6 rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-[0.1em]", presentationDeck.status === "ready" ? "border-success/20 bg-success/10 text-success" : "border-accent/20 bg-accent/5 text-primary"),
						children: presentationDeck.status
					}) : null]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "flex flex-1 flex-col pt-6",
				children: presentationDeck ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDeckReadyState, {
					activeProposalIdForDeck,
					deckDownloadUrl,
					isRecheckingDeck,
					onCopyShareLink,
					onRecheckDeck,
					presentationDeck,
					viewerHref
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDeckGeneratingState, {})
			})]
		})
	});
}
function ProposalSubmittedPanelLayout({ activeProposalIdForDeck, canResumeSubmission, deckDownloadUrl, isRecheckingDeck, isSubmitting, onCopyShareLink, onCopySummary, onRecheckDeck, onResumeSubmission, presentationDeck, summary, viewerHref }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion_exports.LazyMotion, {
		features: motion_exports.domAnimation,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalSubmittedHero, {
				activeProposalIdForDeck,
				canResumeSubmission,
				deckDownloadUrl,
				isSubmitting,
				onResumeSubmission
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStrategyBriefCard, {
					onCopySummary,
					summary
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalAssetDeliveryCard, {
					activeProposalIdForDeck,
					deckDownloadUrl,
					isRecheckingDeck,
					onCopyShareLink,
					onRecheckDeck,
					presentationDeck,
					viewerHref
				})]
			})]
		})
	});
}
function ProposalSubmittedPanel({ summary, presentationDeck, deckDownloadUrl, activeProposalIdForDeck, canResumeSubmission, onResumeSubmission, onRecheckDeck, isRecheckingDeck = false, isSubmitting }) {
	const viewerHref = activeProposalIdForDeck ? withPreviewModeSearchParamIfEnabled(`/dashboard/proposals/${activeProposalIdForDeck}/deck`, isPreviewModeEnabled()) : deckDownloadUrl ? `/dashboard/proposals/viewer?src=${encodeURIComponent(deckDownloadUrl)}` : null;
	const handleCopySummary = () => {
		const text = `
Company: ${summary.company.name}
Industry: ${summary.company.industry}
Website: ${summary.company.website}

Marketing Budget: ${summary.marketing.budget}
Platforms: ${summary.marketing.platforms.join(", ")}

Goals: ${summary.goals.objectives.join(", ")}
Challenges: ${summary.goals.challenges.join(", ")}

Scope: ${summary.scope.services.join(", ")}
Timeline: ${summary.timelines.startTime}
    `.trim();
		navigator.clipboard.writeText(text);
		notifySuccess({ message: "Summary copied to clipboard" });
	};
	const handleCopyShareLink = () => {
		if (activeProposalIdForDeck) {
			const sharePath = withPreviewModeSearchParamIfEnabled(`/dashboard/proposals/${activeProposalIdForDeck}/deck`, isPreviewModeEnabled());
			const shareLink = `${window.location.origin}${sharePath}`;
			navigator.clipboard.writeText(shareLink);
			notifySuccess({ message: "Share link copied!" });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalSubmittedPanelLayout, {
		activeProposalIdForDeck,
		canResumeSubmission,
		deckDownloadUrl,
		isRecheckingDeck,
		isSubmitting,
		onCopyShareLink: handleCopyShareLink,
		onCopySummary: handleCopySummary,
		onRecheckDeck,
		onResumeSubmission,
		presentationDeck,
		summary,
		viewerHref
	});
}
function ProposalTemplateDropdownContent(props) {
	const { templates, loading, deletingTemplateId, canManageTemplates, onApplyTemplate, onDeleteTemplate, onOpenSaveDialog } = props;
	const handleSaveSelect = (event) => {
		event.preventDefault();
		onOpenSaveDialog();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-72",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Proposal Templates" }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "text-[10px]",
					children: [templates.length, " saved"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2 p-2",
				children: [
					0,
					1,
					2
				].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" }, slot))
			}) : templates.length > 0 ? templates.map((template) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalTemplateMenuItem, {
				template,
				deletingTemplateId,
				onApplyTemplate,
				onDeleteTemplate
			}, template.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-2 py-4 text-center text-sm text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mx-auto mb-2 size-8 opacity-30" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No templates yet" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs",
						children: "Save this proposal once the basics look good so future proposals can start faster."
					})
				]
			}),
			!canManageTemplates ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 pb-2 text-[11px] text-muted-foreground",
				children: "Open a workspace to load and save proposal templates."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				className: "cursor-pointer gap-2",
				disabled: !canManageTemplates,
				onSelect: handleSaveSelect,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "Save current as template"]
			})
		]
	});
}
function ProposalTemplateMenuItem({ template, deletingTemplateId, onApplyTemplate, onDeleteTemplate }) {
	const handleSelect = (event) => {
		event.preventDefault();
		onApplyTemplate(template);
	};
	const handleDelete = (event) => {
		event.stopPropagation();
		onDeleteTemplate(template.id, template.name);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
		className: "flex cursor-pointer items-start gap-3 p-3",
		onSelect: handleSelect,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 space-y-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: template.name
					}), template.isDefault ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "size-3 fill-warning text-warning" }) : null]
				}),
				template.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 text-xs text-muted-foreground",
					children: template.description
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [template.industry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "text-[10px]",
						children: template.industry
					}) : null, template.tags.slice(0, 2).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-[10px]",
						children: tag
					}, tag))]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "size-6 shrink-0 text-muted-foreground hover:text-destructive",
			disabled: deletingTemplateId === template.id,
			"aria-label": `Delete ${template.name} template`,
			onClick: handleDelete,
			children: deletingTemplateId === template.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3" })
		})]
	});
}
function ProposalTemplateSaveDialog(props) {
	const { open, saving, templateName, templateDescription, templateIndustry, isDefault, onOpenChange, onTemplateNameChange, onTemplateDescriptionChange, onTemplateIndustryChange, onDefaultChange, onSave } = props;
	const handleTemplateNameChange = (event) => {
		onTemplateNameChange(event.target.value);
	};
	const handleTemplateDescriptionChange = (event) => {
		onTemplateDescriptionChange(event.target.value);
	};
	const handleTemplateIndustryChange = (event) => {
		onTemplateIndustryChange(event.target.value);
	};
	const handleDefaultChange = (checked) => {
		onDefaultChange(checked === true);
	};
	const handleCancel = () => {
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Save as Template" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Save your current proposal configuration as a reusable starting point." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-xl border border-muted/60 bg-muted/20 p-3 text-xs text-muted-foreground",
							children: "This stores your current company, goals, scope, timelines, and proposal value so the next draft can start from a stronger baseline."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "template-name",
								children: "Template Name *"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "template-name",
								value: templateName,
								onChange: handleTemplateNameChange,
								placeholder: "e.g., E-commerce Growth Package"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "template-description",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "template-description",
								value: templateDescription,
								onChange: handleTemplateDescriptionChange,
								placeholder: "Brief description of when to use this template…",
								rows: 2
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "template-industry",
								children: "Industry"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "template-industry",
								value: templateIndustry,
								onChange: handleTemplateIndustryChange,
								placeholder: "e.g., E-commerce, SaaS, Healthcare"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-x-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								id: "is-default",
								checked: isDefault,
								onCheckedChange: handleDefaultChange
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "is-default",
								className: "cursor-pointer text-sm font-normal",
								children: "Set as the default starting template for new proposals"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: handleCancel,
					disabled: saving,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onSave,
					disabled: saving || !templateName.trim(),
					children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Saving…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 size-4" }), "Save Template"] })
				})] })
			]
		})
	});
}
function createInitialSelectorState() {
	return {
		open: false,
		saveDialogOpen: false,
		saving: false,
		deleting: null,
		templateName: "",
		templateDescription: "",
		templateIndustry: "",
		isDefault: false
	};
}
function proposalTemplateSelectorReducer(state, action) {
	switch (action.type) {
		case "setOpen": return {
			...state,
			open: action.value
		};
		case "setSaveDialogOpen": return {
			...state,
			saveDialogOpen: action.value
		};
		case "openSaveDialog": return {
			...state,
			open: false,
			saveDialogOpen: true
		};
		case "setSaving": return {
			...state,
			saving: action.value
		};
		case "setDeleting": return {
			...state,
			deleting: action.value
		};
		case "setTemplateName": return {
			...state,
			templateName: action.value
		};
		case "setTemplateDescription": return {
			...state,
			templateDescription: action.value
		};
		case "setTemplateIndustry": return {
			...state,
			templateIndustry: action.value
		};
		case "setIsDefault": return {
			...state,
			isDefault: action.value
		};
		case "resetSaveForm": return {
			...state,
			saveDialogOpen: false,
			templateName: "",
			templateDescription: "",
			templateIndustry: "",
			isDefault: false
		};
		case "applyTemplate": return {
			...state,
			open: false
		};
		default: return state;
	}
}
function ProposalTemplateSelector({ currentFormData, onApplyTemplate, disabled = false }) {
	const { user } = useAuth();
	const workspaceId = user?.agencyId ?? null;
	const templatesRows = useQuery(proposalTemplatesApi.list, workspaceId ? {
		workspaceId,
		limit: 50
	} : "skip");
	const createTemplate = useMutation(proposalTemplatesApi.create);
	const deleteTemplate = useMutation(proposalTemplatesApi.remove);
	const templates = (() => {
		if (!Array.isArray(templatesRows)) return [];
		return templatesRows.map((row) => {
			const typedRow = row;
			return {
				id: String(row.legacyId),
				name: typeof typedRow.name === "string" ? typedRow.name : "Untitled Template",
				description: typeof typedRow.description === "string" ? typedRow.description : null,
				formData: typedRow.formData,
				industry: typeof typedRow.industry === "string" ? typedRow.industry : null,
				tags: Array.isArray(typedRow.tags) ? typedRow.tags.filter((t) => typeof t === "string") : [],
				isDefault: typedRow.isDefault === true,
				createdAt: typeof typedRow.createdAtMs === "number" ? new Date(typedRow.createdAtMs).toISOString() : null,
				updatedAt: typeof typedRow.updatedAtMs === "number" ? new Date(typedRow.updatedAtMs).toISOString() : null
			};
		});
	})();
	const [selectorState, dispatch] = (0, import_react.useReducer)(proposalTemplateSelectorReducer, void 0, createInitialSelectorState);
	const { open, saveDialogOpen, saving, deleting, templateName, templateDescription, templateIndustry, isDefault } = selectorState;
	const loading = templatesRows === void 0;
	const canManageTemplates = Boolean(workspaceId);
	const handleApplyTemplate = (template) => {
		onApplyTemplate(template.formData);
		dispatch({ type: "applyTemplate" });
		notifySuccess({
			title: "Template applied",
			message: `"${template.name}" has been applied to your proposal.`
		});
	};
	const handleSaveAsTemplate = async () => {
		if (!templateName.trim()) {
			notifyFailure({
				title: "Name required",
				message: "Please enter a name for the template."
			});
			return;
		}
		dispatch({
			type: "setSaving",
			value: true
		});
		if (!workspaceId) {
			notifyFailure({
				title: "Error",
				message: "Workspace context missing"
			});
			dispatch({
				type: "setSaving",
				value: false
			});
			return;
		}
		await createTemplate({
			workspaceId,
			name: templateName.trim(),
			description: templateDescription.trim() || null,
			formData: currentFormData,
			industry: templateIndustry.trim() || null,
			tags: [],
			isDefault,
			createdBy: user?.id ?? null
		}).then(() => {
			dispatch({ type: "resetSaveForm" });
			notifySuccess({
				title: "Template saved",
				message: `"${templateName.trim()}" has been saved.`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "ProposalTemplateSelector:save",
				title: "Could not save template",
				fallbackMessage: "Could not save template"
			});
		}).finally(() => {
			dispatch({
				type: "setSaving",
				value: false
			});
		});
	};
	const handleDeleteTemplate = async (templateId, templateName) => {
		dispatch({
			type: "setDeleting",
			value: templateId
		});
		if (!workspaceId) {
			notifyFailure({
				title: "Error",
				message: "Workspace context missing"
			});
			dispatch({
				type: "setDeleting",
				value: null
			});
			return;
		}
		await deleteTemplate({
			workspaceId,
			legacyId: templateId
		}).then(() => {
			notifySuccess({
				title: "Template deleted",
				message: `"${templateName}" has been deleted.`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "ProposalTemplateSelector:delete",
				title: "Could not delete template",
				fallbackMessage: "Could not delete template"
			});
		}).finally(() => {
			dispatch({
				type: "setDeleting",
				value: null
			});
		});
	};
	const handleOpenSaveDialog = () => {
		dispatch({ type: "openSaveDialog" });
	};
	const handleOpenChange = (value) => {
		dispatch({
			type: "setOpen",
			value
		});
	};
	const handleSaveDialogOpenChange = (value) => {
		dispatch({
			type: "setSaveDialogOpen",
			value
		});
	};
	const handleTemplateNameChange = (value) => {
		dispatch({
			type: "setTemplateName",
			value
		});
	};
	const handleTemplateDescriptionChange = (value) => {
		dispatch({
			type: "setTemplateDescription",
			value
		});
	};
	const handleTemplateIndustryChange = (value) => {
		dispatch({
			type: "setTemplateIndustry",
			value
		});
	};
	const handleDefaultChange = (value) => {
		dispatch({
			type: "setIsDefault",
			value
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
		open,
		onOpenChange: handleOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				disabled,
				className: "gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4" }),
					"Templates",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 opacity-50" })
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalTemplateDropdownContent, {
			templates,
			loading,
			deletingTemplateId: deleting,
			canManageTemplates,
			onApplyTemplate: handleApplyTemplate,
			onDeleteTemplate: handleDeleteTemplate,
			onOpenSaveDialog: handleOpenSaveDialog
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalTemplateSaveDialog, {
		open: saveDialogOpen,
		saving,
		templateName,
		templateDescription,
		templateIndustry,
		isDefault,
		onOpenChange: handleSaveDialogOpenChange,
		onTemplateNameChange: handleTemplateNameChange,
		onTemplateDescriptionChange: handleTemplateDescriptionChange,
		onTemplateIndustryChange: handleTemplateIndustryChange,
		onDefaultChange: handleDefaultChange,
		onSave: handleSaveAsTemplate
	})] });
}
function formatRelativeTime(dateString) {
	if (!dateString) return "Unknown";
	const date = new Date(dateString);
	const diffMs = (/* @__PURE__ */ new Date()).getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 6e4);
	const diffHours = Math.floor(diffMs / 36e5);
	const diffDays = Math.floor(diffMs / 864e5);
	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function formatFullDate(dateString) {
	if (!dateString) return "Unknown date";
	return new Date(dateString).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function ProposalVersionHistoryTrigger({ disabled, open, proposalId, versionCount, versionSummary }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			disabled: disabled || !proposalId,
			className: "gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "size-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: "History"
				}),
				versionSummary && open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					className: "ml-1 text-xs",
					children: versionCount
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3 opacity-50" })
			]
		})
	});
}
function ProposalVersionHistoryRow({ onPreview, onRestore, restoring, version }) {
	const handlePreview = () => {
		onPreview(version);
	};
	const handleRestore = () => {
		onRestore(version);
	};
	const handleSelect = (event) => {
		event.preventDefault();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
		className: "flex cursor-default flex-col items-start gap-1 p-2",
		onSelect: handleSelect,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "text-xs",
					children: ["v", version.versionNumber]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: formatRelativeTime(version.createdAt)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "size-6",
					onClick: handlePreview,
					"aria-label": `Preview version ${version.versionNumber}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "size-6",
					disabled: restoring,
					onClick: handleRestore,
					"aria-label": `Restore version ${version.versionNumber}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-xs text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatFullDate(version.createdAt) }),
				version.createdBy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground/40",
						children: "·"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: version.createdBy })
				] }) : null
			]
		})]
	});
}
function ProposalVersionHistoryMenuContent({ handleSaveVersion, latestVersion, loading, proposalId, queryError, restoring, saving, setPreviewVersion, setRestoreConfirmVersion, versions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-80",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-2 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-medium",
					children: "Version History"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: handleSaveVersion,
					disabled: saving || !proposalId,
					className: "h-7 gap-1 text-xs",
					children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-3" }), "Save Point"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			queryError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-2 py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
					variant: "destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: queryError })]
				})
			}) : loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center py-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-muted-foreground" })
			}) : versions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-2 py-6 text-center text-sm text-muted-foreground",
				children: "No versions yet. Click \"Save Point\" to create one."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "max-h-64",
				children: versions.map((version) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalVersionHistoryRow, {
					onPreview: setPreviewVersion,
					onRestore: setRestoreConfirmVersion,
					restoring,
					version
				}, version.id))
			}),
			latestVersion?.createdAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 px-2 pb-1 text-xs text-muted-foreground",
				children: ["Latest: ", formatFullDate(latestVersion.createdAt)]
			}) : null
		]
	});
}
function ProposalVersionPreviewDialog({ currentFormData, previewVersion, setPreviewVersion }) {
	const handleClose = () => {
		setPreviewVersion(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: "max-w-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }),
					" Version ",
					previewVersion?.versionNumber
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: ["Saved ", formatFullDate(previewVersion?.createdAt ?? null)] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md border bg-muted/30 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "max-h-[50vh] overflow-auto text-xs",
					children: JSON.stringify(previewVersion?.formData ?? currentFormData, null, 2)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: handleClose,
				children: "Close"
			}) })
		]
	});
}
function ProposalVersionRestoreDialog({ open, onOpenChange, handleRestoreVersion, restoreConfirmVersion, restoring }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, {
			className: "max-w-md border-destructive/25",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, {
				className: "flex items-center gap-2 text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					className: "size-4 shrink-0",
					"aria-hidden": true
				}), "Replace form with this version?"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, {
				className: "text-left text-foreground/90",
				children: [
					"This permanently replaces the current proposal form with version ",
					restoreConfirmVersion?.versionNumber,
					". Your current editor state is saved as a new backup version before the restore runs. This action cannot be undone from here."
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, {
				className: "gap-2 sm:gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					type: "button",
					disabled: restoring,
					className: "mt-0",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "destructive",
					onClick: handleRestoreVersion,
					disabled: restoring,
					className: "gap-2",
					children: [restoring ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "size-4 animate-spin",
						"aria-hidden": true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
						className: "size-4",
						"aria-hidden": true
					}), "Yes, restore this version"]
				})]
			})]
		})
	});
}
var INITIAL_PROPOSAL_VERSION_HISTORY_STATE = {
	open: false,
	saving: false,
	restoring: false,
	previewVersion: null,
	restoreConfirmVersion: null
};
function proposalVersionHistoryReducer(state, action) {
	switch (action.type) {
		case "setOpen": return {
			...state,
			open: action.open
		};
		case "setSaving": return {
			...state,
			saving: action.saving
		};
		case "setRestoring": return {
			...state,
			restoring: action.restoring
		};
		case "setPreviewVersion": return {
			...state,
			previewVersion: action.version
		};
		case "setRestoreConfirmVersion": return {
			...state,
			restoreConfirmVersion: action.version
		};
		default: return state;
	}
}
function ProposalVersionHistory({ proposalId, currentFormData, onVersionRestored, disabled = false }) {
	const { user } = useAuth();
	const workspaceId = user?.agencyId ?? null;
	const rows = useQuery(proposalVersionsApi.list, workspaceId && proposalId ? {
		workspaceId,
		proposalLegacyId: proposalId,
		limit: 50
	} : "skip");
	const versionsQueryError = useConvexQueryError({
		data: rows,
		skipped: !workspaceId || !proposalId,
		fallbackMessage: "Unable to load version history."
	});
	const createSnapshot = useMutation(proposalVersionsApi.createSnapshot);
	const restoreToVersion = useMutation(proposalVersionsApi.restoreToVersion);
	const versions = (() => {
		if (!rows) return [];
		if (!Array.isArray(rows)) return [];
		return rows.map((row) => {
			const typedRow = row;
			return {
				id: String(row.legacyId),
				proposalId: String(typedRow.proposalLegacyId ?? ""),
				versionNumber: typeof typedRow.versionNumber === "number" ? typedRow.versionNumber : 1,
				formData: typedRow.formData,
				status: typeof typedRow.status === "string" ? typedRow.status : "draft",
				stepProgress: typeof typedRow.stepProgress === "number" ? typedRow.stepProgress : 0,
				changeDescription: typeof typedRow.changeDescription === "string" ? typedRow.changeDescription : null,
				createdBy: typeof typedRow.createdBy === "string" ? typedRow.createdBy : "",
				createdByName: typeof typedRow.createdByName === "string" ? typedRow.createdByName : null,
				createdAt: typeof typedRow.createdAtMs === "number" ? new Date(typedRow.createdAtMs).toISOString() : null
			};
		});
	})();
	const loading = rows === void 0;
	const [{ open, saving, restoring, previewVersion, restoreConfirmVersion }, dispatch] = (0, import_react.useReducer)(proposalVersionHistoryReducer, INITIAL_PROPOSAL_VERSION_HISTORY_STATE);
	const handleOpenChange = (isOpen) => {
		dispatch({
			type: "setOpen",
			open: isOpen
		});
	};
	const setPreviewVersion = (version) => {
		dispatch({
			type: "setPreviewVersion",
			version
		});
	};
	const setRestoreConfirmVersion = (version) => {
		dispatch({
			type: "setRestoreConfirmVersion",
			version
		});
	};
	const handleSaveVersion = async () => {
		if (!proposalId) {
			notifyFailure({
				title: "Cannot save version",
				message: "Please save the proposal first before creating a version."
			});
			return;
		}
		if (typeof window !== "undefined" && isPreviewModeEnabled()) {
			notifyInfo({
				title: "Not available in preview mode",
				message: "Version history is disabled for preview/demo proposals."
			});
			return;
		}
		dispatch({
			type: "setSaving",
			saving: true
		});
		if (!workspaceId) {
			notifyFailure({
				title: "Failed to save version",
				message: "Workspace context missing"
			});
			dispatch({
				type: "setSaving",
				saving: false
			});
			return;
		}
		await createSnapshot({
			workspaceId,
			proposalLegacyId: proposalId,
			changeDescription: "Manual save point",
			createdBy: user?.id ?? "",
			createdByName: user?.email ?? null
		}).then((res) => {
			const created = res?.version;
			if (!created) throw new Error("Failed to create version");
			notifySuccess({
				title: "Version saved",
				message: `Version ${created.versionNumber} has been saved.`
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "ProposalVersionHistory:saveVersion",
				title: "Failed to save version",
				fallbackMessage: "Failed to save version"
			});
		}).finally(() => {
			dispatch({
				type: "setSaving",
				saving: false
			});
		});
	};
	const handlePreviewOpenChange = (isOpen) => {
		if (!isOpen) setPreviewVersion(null);
	};
	const handleRestoreOpenChange = (isOpen) => {
		if (!isOpen) setRestoreConfirmVersion(null);
	};
	const handleRestoreVersion = async () => {
		if (!proposalId || !restoreConfirmVersion) return;
		if (typeof window !== "undefined" && isPreviewModeEnabled()) {
			notifyInfo({
				title: "Not available in preview mode",
				message: "Restoring versions is disabled for preview/demo proposals."
			});
			setRestoreConfirmVersion(null);
			return;
		}
		dispatch({
			type: "setRestoring",
			restoring: true
		});
		if (!workspaceId) {
			notifyFailure({
				title: "Failed to restore version",
				message: "Workspace context missing"
			});
			dispatch({
				type: "setRestoring",
				restoring: false
			});
			return;
		}
		await restoreToVersion({
			workspaceId,
			proposalLegacyId: proposalId,
			versionLegacyId: restoreConfirmVersion.id,
			createdBy: user?.id ?? "",
			createdByName: user?.email ?? null
		}).then((result) => {
			onVersionRestored(restoreConfirmVersion.formData);
			notifySuccess({
				title: "Version restored",
				message: `Restored to version ${result.restoredFromVersion}. Your previous state was saved as version ${result.newVersion - 1}.`
			});
			setRestoreConfirmVersion(null);
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "ProposalVersionHistory:restoreVersion",
				title: "Failed to restore version",
				fallbackMessage: "Failed to restore version"
			});
		}).finally(() => {
			dispatch({
				type: "setRestoring",
				restoring: false
			});
		});
	};
	const versionSummary = (() => {
		if (versions.length === 0) return null;
		return `${versions.length} version${versions.length === 1 ? "" : "s"}`;
	})();
	const latestVersion = versions[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
			open,
			onOpenChange: handleOpenChange,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalVersionHistoryTrigger, {
				disabled,
				open,
				proposalId,
				versionCount: versions.length,
				versionSummary
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalVersionHistoryMenuContent, {
				handleSaveVersion,
				latestVersion,
				loading,
				proposalId,
				queryError: versionsQueryError,
				restoring,
				saving,
				setPreviewVersion,
				setRestoreConfirmVersion,
				versions
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: Boolean(previewVersion),
			onOpenChange: handlePreviewOpenChange,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalVersionPreviewDialog, {
				currentFormData,
				previewVersion,
				setPreviewVersion
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalVersionRestoreDialog, {
			open: Boolean(restoreConfirmVersion),
			onOpenChange: handleRestoreOpenChange,
			handleRestoreVersion,
			restoreConfirmVersion,
			restoring
		})
	] });
}
function ProposalWizardHeader({ clientName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0 space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(DASHBOARD_THEME.icons.container, "size-11 shrink-0"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, {
					className: "size-5",
					"aria-hidden": true
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
						className: "mr-1 inline size-3.5 text-primary",
						"aria-hidden": true
					}), "Proposal studio"]
				}), clientName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					className: "max-w-[200px] truncate font-normal",
					children: clientName
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: "font-normal text-muted-foreground",
					children: "No client selected"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
				children: "Build a tailored proposal in minutes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]",
				children: "Six guided sections with autosave. When you finish, we generate a client-ready deck you can preview, download, or refine."
			})]
		})]
	}) });
}
function ProposalPageActions(props) {
	const { canManage = true, currentFormData, draftId, isSubmitting, selectedClientId, isCreatingDraft, onApplyTemplate, onVersionRestored, onStartProposal } = props;
	if (!canManage) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex w-full flex-col gap-2 sm:w-auto sm:items-end",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center justify-end gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalTemplateSelector, {
				currentFormData,
				onApplyTemplate
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalVersionHistory, {
				proposalId: draftId,
				currentFormData,
				onVersionRestored,
				disabled: !draftId || isSubmitting
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			onClick: onStartProposal,
			disabled: !selectedClientId || isCreatingDraft,
			className: cn(getButtonClasses("primary"), "w-full shrink-0 shadow-sm sm:w-auto"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), "New proposal"]
		})]
	});
}
function ProposalStartStateCard(props) {
	const { canStart, canManage = true, blockedHint } = props;
	if (canStart) return null;
	if (!canManage) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		className: "rounded-2xl border border-dashed border-muted-foreground/25 bg-muted/15",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertTitle, {
			className: "flex items-center gap-2 text-base",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
				className: "size-4 text-primary",
				"aria-hidden": true
			}), "Shared proposals"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
			className: "text-sm leading-relaxed",
			children: "Your agency publishes proposals and decks here. Open a row below to preview or download when ready."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		className: "rounded-2xl border border-dashed border-warning/25 bg-warning/5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertTitle, {
			className: "flex items-center gap-2 text-base",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
				className: "size-4 text-warning",
				"aria-hidden": true
			}), "Select a client to create proposals"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
			className: "text-sm leading-relaxed",
			children: blockedHint
		})]
	});
}
function ProposalBuilderOverlay(props) {
	const { open, onClose, isBootstrapping, submitted, isPresentationReady, summary, presentationDeck, deckDownloadUrl, activeProposalIdForDeck, canResumeSubmission, onResumeSubmission, isSubmitting, onRecheckDeck, isRecheckingDeck, steps, currentStep, draftId, autosaveStatus, stepContent, onBack, onNext, onGoToStep, isFirstStep, isLastStep, validationMessages } = props;
	const isMobile = useIsMobile();
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKeyDown = (event) => {
			if (event.key !== "Escape" || isSubmitting) return;
			event.preventDefault();
			onClose();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [
		open,
		isSubmitting,
		onClose
	]);
	const activeStep = steps[currentStep];
	const handleDrawerOpenChange = (next) => {
		if (!next && !isSubmitting) onClose();
	};
	const builderBody = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col overflow-hidden bg-linear-to-b from-muted/15 via-background to-background supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex shrink-0 items-start justify-between gap-4 border-b border-border/50 bg-background/90 p-4 backdrop-blur-md sm:items-center sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Proposal builder"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
						children: submitted ? "Deck and next steps" : activeStep?.title ?? "Proposal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-pretty text-sm leading-relaxed text-muted-foreground",
						children: submitted ? "Review your generated materials or jump back in to adjust inputs." : activeStep?.description ?? "Complete each section—your work saves automatically."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				onClick: onClose,
				disabled: isSubmitting,
				className: "shrink-0 gap-2 rounded-full border-muted-foreground/25",
				"aria-label": isSubmitting ? "Close when generation finishes" : "Close proposal builder",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-4",
						"aria-hidden": true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Close"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, {
						className: "hidden sm:inline",
						children: "Esc"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-y-auto p-4 sm:px-6 sm:py-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalBuilderJourneyBar, {
					isSubmitting,
					isRecheckingDeck,
					submitted,
					isPresentationReady,
					activeProposalIdForDeck,
					deckDownloadUrl,
					autosaveStatus
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-h-0 flex-col gap-4",
				children: isBootstrapping ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/60 bg-background shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSkeleton, { showStepIndicator: true })
					})
				}) : submitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/60 bg-background shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalSubmittedPanel, {
							summary,
							presentationDeck,
							deckDownloadUrl,
							activeProposalIdForDeck,
							canResumeSubmission,
							onResumeSubmission,
							isSubmitting,
							onRecheckDeck,
							isRecheckingDeck
						})
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-h-0 gap-4 lg:grid-cols-[minmax(240px,280px)_1fr] lg:gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden min-h-0 lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sticky top-0 rounded-2xl border border-border/50 bg-card/80 p-3 shadow-sm backdrop-blur-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Sections"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStepNav, {
								steps,
								currentStep,
								submitted,
								onGoToStep
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-col gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "lg:hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStepIndicator, {
								steps,
								currentStep,
								submitted
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
							className: "flex min-h-0 flex-col overflow-hidden border-border/60 bg-background shadow-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "flex min-h-0 flex-col p-4 sm:p-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDraftPanel, {
									draftId,
									autosaveStatus,
									stepContent,
									onBack,
									onNext,
									isFirstStep,
									isLastStep,
									currentStep,
									totalSteps: steps.length,
									isSubmitting,
									validationMessages
								})
							})
						})]
					})]
				})
			})]
		})]
	});
	if (isMobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Drawer$1, {
		open,
		onOpenChange: handleDrawerOpenChange,
		direction: "right",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrawerContent, {
			className: "inset-y-0 left-auto mt-0 h-full max-h-none w-full max-w-none rounded-none border-0 data-[vaul-drawer-direction=right]:w-full",
			children: builderBody
		})
	});
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-2000 isolate bg-background",
		children: builderBody
	});
}
function ProposalsPageHeroSection({ clientName, workflow, formState, draftId, selectedClientId, onApplyTemplate, onVersionRestored, onStartProposal }) {
	const { canManageProposals, isSubmitting, isCreatingDraft } = workflow;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DashboardPageHero, {
		innerClassName: "relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalWizardHeader, { clientName }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalPageActions, {
			canManage: canManageProposals,
			currentFormData: formState,
			draftId,
			isSubmitting,
			selectedClientId,
			isCreatingDraft,
			onApplyTemplate,
			onVersionRestored,
			onStartProposal
		})]
	});
}
function ProposalsPageMainView({ wizardRef, submissionAnnouncement, clientName, workflow, viewState, formState, draftId, selectedClientId, onApplyTemplate, onVersionRestored, onStartProposal, displayedProposals, displayedDraftId, proposalHistoryWorkflow, proposalHistoryCapabilities, proposalsQueryError, deletingProposalId, onRefresh, onResume, onRequestDelete, downloadingDeckId, onDownloadDeck, onCreateNew, proposalPendingDelete, onDeleteDialogChange, onConfirmDelete, activeDeckStage, onCloseWizard, summary, presentationDeck, deckDownloadUrl, activeProposalIdForDeck, onResumeSubmission, onRecheckDeck, steps, currentStep, autosaveStatus, stepContent, onBack, onNext, onGoToStep, validationMessages }) {
	const { canManageProposals, isPreviewMode, isSubmitting } = workflow;
	const { displayedLoadingState, isWizardOpen, isDeleteDialogOpen, isPresentationReady, isBootstrapping, submitted, canResumeSubmission, isRecheckingDeck, isFirstStep, isLastStep } = viewState;
	const handleRecheckDeck = () => Promise.resolve(onRecheckDeck());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wizardRef,
		className: DASHBOARD_THEME.layout.container,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveRegion, { message: submissionAnnouncement }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalsPageHeroSection, {
				clientName,
				workflow,
				formState,
				draftId,
				selectedClientId,
				onApplyTemplate,
				onVersionRestored,
				onStartProposal
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalMetrics, {
				proposals: displayedProposals,
				isLoading: displayedLoadingState
			}) }),
			!isWizardOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStartStateCard, {
				canManage: canManageProposals,
				canStart: canManageProposals && Boolean(selectedClientId),
				blockedHint: selectedClientId ? null : "Pick a client from the workspace switcher in the header. Proposals are always created for the active client."
			}) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalHistory, {
				proposals: displayedProposals,
				draftId: displayedDraftId,
				workflow: proposalHistoryWorkflow,
				capabilities: proposalHistoryCapabilities,
				queryError: isPreviewMode ? null : proposalsQueryError,
				deletingProposalId,
				onRefresh,
				onResume,
				onRequestDelete,
				downloadingDeckId,
				onDownloadDeck,
				onCreateNew
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDeleteDialog, {
				open: isDeleteDialogOpen,
				isDeleting: Boolean(deletingProposalId),
				proposalName: proposalPendingDelete?.clientName ?? proposalPendingDelete?.id ?? null,
				onOpenChange: onDeleteDialogChange,
				onConfirm: onConfirmDelete
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalGenerationOverlay, {
				isSubmitting: isSubmitting && !isWizardOpen,
				isPresentationReady: isPresentationReady && !isWizardOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckProgressOverlay, {
				stage: activeDeckStage,
				isVisible: Boolean(downloadingDeckId && !isSubmitting)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalBuilderOverlay, {
				open: isWizardOpen,
				onClose: onCloseWizard,
				isBootstrapping,
				submitted,
				isPresentationReady,
				summary,
				presentationDeck,
				deckDownloadUrl,
				activeProposalIdForDeck,
				canResumeSubmission,
				onResumeSubmission,
				isSubmitting,
				onRecheckDeck: handleRecheckDeck,
				isRecheckingDeck,
				steps,
				currentStep,
				draftId,
				autosaveStatus,
				stepContent,
				onBack,
				onNext,
				onGoToStep,
				isFirstStep,
				isLastStep,
				validationMessages
			})
		]
	});
}
var proposalSteps = [
	{
		id: "company",
		title: "Company Information",
		description: "Tell us who you are and where you operate."
	},
	{
		id: "marketing",
		title: "Marketing & Advertising",
		description: "Share how you currently market and advertise."
	},
	{
		id: "goals",
		title: "Business Goals",
		description: "Help us understand what success looks like."
	},
	{
		id: "scope",
		title: "Scope of Work",
		description: "Choose the services you need support with."
	},
	{
		id: "timelines",
		title: "Timelines & Priorities",
		description: "Let us know when you want to get started."
	},
	{
		id: "value",
		title: "Proposal Value",
		description: "Set expectations around budget and engagement."
	}
];
function createInitialProposalFormState() {
	return createDefaultProposalForm();
}
var stepErrorPaths = {
	company: ["company.name", "company.industry"],
	marketing: ["marketing.budget"],
	goals: ["goals.objectives"],
	scope: ["scope.services"],
	timelines: ["timelines.startTime"],
	value: ["value.proposalSize", "value.engagementType"]
};
function validateProposalStep(stepId, form) {
	switch (stepId) {
		case "company": return form.company.name.trim().length > 0 && form.company.industry.trim().length > 0;
		case "marketing": return form.marketing.budget.trim().length > 0;
		case "goals": return form.goals.objectives.length > 0;
		case "scope": return form.scope.services.length > 0;
		case "timelines": return form.timelines.startTime.trim().length > 0;
		case "value": return form.value.proposalSize.trim().length > 0 && form.value.engagementType.trim().length > 0;
		default: return true;
	}
}
function collectStepValidationErrors(stepId, form) {
	const errors = {};
	switch (stepId) {
		case "company":
			if (!form.company.name.trim()) errors["company.name"] = "Company name is required.";
			if (!form.company.industry.trim()) errors["company.industry"] = "Industry is required.";
			break;
		case "marketing":
			if (!form.marketing.budget.trim()) errors["marketing.budget"] = "Please provide your monthly marketing budget.";
			break;
		case "goals":
			if (form.goals.objectives.length === 0) errors["goals.objectives"] = "Select at least one primary goal.";
			break;
		case "scope":
			if (form.scope.services.length === 0) errors["scope.services"] = "Select at least one service.";
			break;
		case "timelines":
			if (!form.timelines.startTime.trim()) errors["timelines.startTime"] = "Choose a preferred start timeline.";
			break;
		case "value":
			if (!form.value.proposalSize.trim()) errors["value.proposalSize"] = "Select an expected proposal value.";
			if (!form.value.engagementType.trim()) errors["value.engagementType"] = "Select an engagement preference.";
			break;
		default: break;
	}
	return errors;
}
function hasCompletedAnyStepData(form) {
	if (form.company.name.trim() && form.company.industry.trim()) return true;
	if (form.marketing.budget.trim().length > 0) return true;
	if (form.goals.objectives.length > 0) return true;
	if (form.scope.services.length > 0) return true;
	if (form.timelines.startTime.trim().length > 0) return true;
	if (form.value.proposalSize.trim().length > 0 && form.value.engagementType.trim().length > 0) return true;
	return false;
}
function getConvexHttpClient() {
	return new ConvexHttpClient("https://grand-sparrow-698.convex.cloud");
}
async function getConvexToken() {
	if (typeof window === "undefined") return null;
	try {
		const result = await authClient.convex.token();
		const payload = result && typeof result === "object" && "data" in result ? result.data : result;
		const token = payload && typeof payload === "object" && "token" in payload ? payload.token : null;
		return typeof token === "string" && token.trim().length > 0 ? token : null;
	} catch (error) {
		return null;
	}
}
(0, import_react.cache)(async (functionName, args) => {
	const client = getConvexHttpClient();
	const token = await getConvexToken();
	if (token) client.setAuth(token);
	try {
		return await client.query(functionName, args);
	} catch (error) {
		logger.error(`Convex Query Error: ${functionName}`, error, {
			type: "convex_error",
			method: "query",
			name: functionName,
			workspaceId: args.workspaceId
		});
		throw error;
	}
});
async function mutateConvex(functionName, args) {
	const client = getConvexHttpClient();
	const token = await getConvexToken();
	if (token) client.setAuth(token);
	try {
		return await client.mutation(functionName, args);
	} catch (error) {
		logger.error(`Convex Mutation Error: ${functionName}`, error, {
			type: "convex_error",
			method: "mutation",
			name: functionName,
			workspaceId: args.workspaceId
		});
		throw error;
	}
}
/**
* Track a proposal analytics event
*/
async function trackProposalEvent(input) {
	return { id: (await mutateConvex("proposalAnalytics:addEvent", {
		workspaceId: input.workspaceId,
		eventType: input.eventType,
		proposalId: input.proposalId,
		clientId: input.clientId ?? null,
		clientName: input.clientName ?? null,
		metadata: input.metadata ?? {},
		duration: input.duration ?? null,
		error: input.error ?? null
	})).legacyId };
}
/**
* Track draft creation event
*/
async function trackDraftCreated(workspaceId, proposalId, clientId, clientName) {
	await trackProposalEvent({
		workspaceId,
		eventType: "draft_created",
		proposalId,
		clientId,
		clientName
	});
}
/**
* Track AI generation start
*/
async function trackAiGenerationStarted(workspaceId, proposalId, clientId, clientName) {
	await trackProposalEvent({
		workspaceId,
		eventType: "ai_generation_started",
		proposalId,
		clientId,
		clientName
	});
}
/**
* Track AI generation completion
*/
async function trackAiGenerationCompleted(workspaceId, proposalId, duration, clientId, clientName) {
	await trackProposalEvent({
		workspaceId,
		eventType: "ai_generation_completed",
		proposalId,
		duration,
		clientId,
		clientName
	});
}
/**
* Track AI generation failure
*/
async function trackAiGenerationFailed(workspaceId, proposalId, error, clientId, clientName) {
	await trackProposalEvent({
		workspaceId,
		eventType: "ai_generation_failed",
		proposalId,
		error,
		clientId,
		clientName
	});
}
/**
* Track deck generation start
*/
async function trackDeckGenerationStarted(workspaceId, proposalId, clientId, clientName) {
	await trackProposalEvent({
		workspaceId,
		eventType: "deck_generation_started",
		proposalId,
		clientId,
		clientName
	});
}
/**
* Track deck generation completion
*/
async function trackDeckGenerationCompleted(workspaceId, proposalId, duration, clientId, clientName) {
	await trackProposalEvent({
		workspaceId,
		eventType: "deck_generation_completed",
		proposalId,
		duration,
		clientId,
		clientName
	});
}
/**
* Track deck generation failure
*/
async function trackDeckGenerationFailed(workspaceId, proposalId, error, clientId, clientName) {
	await trackProposalEvent({
		workspaceId,
		eventType: "deck_generation_failed",
		proposalId,
		error,
		clientId,
		clientName
	});
}
/**
* Track proposal submission
*/
async function trackProposalSubmitted(workspaceId, proposalId, clientId, clientName) {
	await trackProposalEvent({
		workspaceId,
		eventType: "proposal_submitted",
		proposalId,
		clientId,
		clientName
	});
}
function resolveProposalDeck(payload) {
	const deck = payload.presentationDeck ?? payload.gammaDeck;
	if (!deck) {
		const fallbackUrl = payload.pptUrl ?? null;
		if (fallbackUrl && payload.pptUrl !== fallbackUrl) return {
			...payload,
			pptUrl: fallbackUrl,
			aiSuggestions: payload.aiSuggestions ?? null
		};
		return {
			...payload,
			aiSuggestions: payload.aiSuggestions ?? null
		};
	}
	const resolvedStorage = deck.storageUrl ?? payload.pptUrl ?? null;
	if (!resolvedStorage || deck.storageUrl === resolvedStorage && payload.pptUrl === resolvedStorage) return {
		...payload,
		presentationDeck: deck,
		aiSuggestions: payload.aiSuggestions ?? null
	};
	return {
		...payload,
		pptUrl: payload.pptUrl ?? resolvedStorage,
		presentationDeck: {
			...deck,
			storageUrl: resolvedStorage
		},
		aiSuggestions: payload.aiSuggestions ?? null
	};
}
function requireConvexUrl() {
	return "https://grand-sparrow-698.convex.cloud";
}
function createAuthedConvexClient(token) {
	const convex = new ConvexReactClient(requireConvexUrl());
	convex.setAuth(async () => token);
	return convex;
}
/**
* Executes a Convex query with error handling and logging.
*/
async function executeQuery(convex, name, args, context = {}) {
	try {
		return await convex.query(name, args);
	} catch (error) {
		logger.error(`Convex Query Error: ${name}`, error, {
			type: "convex_error",
			method: "query",
			name,
			...context
		});
		throw error;
	}
}
function mapConvexProposalToDraft(row) {
	return resolveProposalDeck({
		id: String(row.legacyId),
		status: row.status ?? "draft",
		stepProgress: typeof row.stepProgress === "number" ? row.stepProgress : 0,
		formData: mergeProposalForm(row.formData ?? null),
		aiInsights: row.aiInsights ?? null,
		aiSuggestions: row.aiSuggestions ?? null,
		pdfUrl: row.pdfUrl ?? null,
		pptUrl: row.pptUrl ?? null,
		createdAt: typeof row.createdAtMs === "number" ? new Date(row.createdAtMs).toISOString() : null,
		updatedAt: typeof row.updatedAtMs === "number" ? new Date(row.updatedAtMs).toISOString() : null,
		lastAutosaveAt: typeof row.lastAutosaveAtMs === "number" ? new Date(row.lastAutosaveAtMs).toISOString() : null,
		clientId: row.clientId ?? null,
		clientName: row.clientName ?? null,
		presentationDeck: row.presentationDeck ? {
			generationId: null,
			status: "unknown",
			instructions: null,
			webUrl: null,
			shareUrl: null,
			pptxUrl: null,
			pdfUrl: null,
			generatedFiles: [],
			storageUrl: row.presentationDeck.storageUrl ?? row.pptUrl ?? null,
			...row.presentationDeck
		} : null
	});
}
async function listProposalsInternal(params) {
	return (await executeQuery(createAuthedConvexClient(params.convexToken), "proposals:list", {
		workspaceId: params.workspaceId,
		limit: typeof params.pageSize === "number" && Number.isFinite(params.pageSize) ? params.pageSize : 100,
		status: params.status,
		clientId: params.clientId
	}, { workspaceId: params.workspaceId })).map(mapConvexProposalToDraft);
}
(0, import_react.cache)(listProposalsInternal);
async function getProposalByIdInternal(id, auth) {
	const row = await executeQuery(createAuthedConvexClient(auth.convexToken), "proposals:getByLegacyId", {
		workspaceId: auth.workspaceId,
		legacyId: id
	}, {
		workspaceId: auth.workspaceId,
		legacyId: id
	});
	if (!row) throw new Error("Proposal not found");
	return mapConvexProposalToDraft(row);
}
var getProposalById = (0, import_react.cache)(getProposalByIdInternal);
async function refreshProposalDraft(id, auth) {
	return getProposalById(id, auth);
}
function useDeckPreparation(options) {
	const { refreshProposals, setProposals } = options;
	const { user, getIdToken } = useAuth();
	const workspaceId = user?.agencyId ?? null;
	const [downloadingDeckId, setDownloadingDeckId] = (0, import_react.useState)(null);
	const [deckProgressStage, setDeckProgressStage] = (0, import_react.useState)(null);
	const pendingDeckWindowRef = (0, import_react.useRef)(null);
	const openDeckUrl = (url, pendingWindow) => {
		if (typeof window === "undefined") return;
		if (pendingWindow && !pendingWindow.closed) {
			pendingWindow.location.href = url;
			return;
		}
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.target = "_blank";
		anchor.rel = "noopener";
		anchor.style.display = "none";
		document.body.appendChild(anchor);
		anchor.click();
		document.body.removeChild(anchor);
	};
	const handleDownloadDeck = async (proposal) => {
		const localDeckUrl = proposal.pptUrl ?? proposal.presentationDeck?.storageUrl ?? proposal.presentationDeck?.pptxUrl ?? null;
		console.log("[ProposalDownload] URL priority check:", {
			pptUrl: proposal.pptUrl,
			storageUrl: proposal.presentationDeck?.storageUrl,
			pptxUrl: proposal.presentationDeck?.pptxUrl,
			selectedUrl: localDeckUrl
		});
		if (localDeckUrl) {
			console.log("[ProposalDownload] Using existing URL:", localDeckUrl);
			openDeckUrl(localDeckUrl);
			return;
		}
		if (downloadingDeckId) {
			console.log("[ProposalDownload] Download already in progress for:", downloadingDeckId);
			notifySuccess({
				title: "Deck already preparing",
				message: "Please wait for the current deck request to finish."
			});
			return;
		}
		setDeckProgressStage("initializing");
		const pendingWindow = pendingDeckWindowRef.current;
		if (pendingWindow && !pendingWindow.closed) pendingWindow.close();
		pendingDeckWindowRef.current = null;
		try {
			console.log("[ProposalDownload] Starting deck preparation for proposal:", proposal.id);
			if (typeof window !== "undefined") {
				const popup = window.open("about:blank", "_blank");
				if (popup) {
					pendingDeckWindowRef.current = popup;
					try {
						popup.document.open();
						popup.document.write(`<!doctype html><title>Preparing presentation...</title><style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; display: flex; min-height: 100vh; align-items: center; justify-content: center; background: #0f172a; color: white; }
              .container { text-align: center; max-width: 360px; padding: 24px; }
              .spinner { width: 48px; height: 48px; border-radius: 9999px; border: 4px solid rgba(255,255,255,0.2); border-top-color: white; animation: spin 1s linear infinite; margin: 0 auto 16px; }
              @keyframes spin { to { transform: rotate(360deg); } }
            </style><body><div class="container"><div class="spinner" aria-hidden="true"></div><h1 style="font-size: 20px; margin-bottom: 12px;">Preparing your deck...</h1><p style="font-size: 14px; line-height: 1.5; opacity: 0.85;">We're generating your presentation and saving a copy to your workspace. Keep this tab open &mdash; the download launches automatically once it's ready.</p></div></body>`);
						popup.document.close();
					} catch (popupError) {
						logError(popupError, "useDeckPreparation:popupDocument");
					}
				}
			}
			setDeckProgressStage("polling");
			setDownloadingDeckId(proposal.id);
			const deckStartTime = Date.now();
			if (workspaceId) trackDeckGenerationStarted(workspaceId, proposal.id, proposal.clientId, proposal.clientName).catch((e) => logError(e, "useDeckPreparation:trackDeckGenerationStarted"));
			const token = await getIdToken();
			if (!token || !workspaceId) throw new Error("Missing auth token or workspace");
			const pollMaxAttempts = 30;
			const pollIntervalMs = 2e3;
			const pollDeck = async (attempt) => {
				const row = await refreshProposalDraft(proposal.id, {
					workspaceId,
					convexToken: token
				});
				const deckUrl = row.pptUrl ?? row.presentationDeck?.storageUrl ?? null;
				if (deckUrl) {
					const result = row;
					const deckDuration = Date.now() - deckStartTime;
					if (workspaceId) trackDeckGenerationCompleted(workspaceId, proposal.id, deckDuration, proposal.clientId, proposal.clientName).catch((e) => logError(e, "useDeckPreparation:trackDeckGenerationCompleted"));
					setDeckProgressStage("launching");
					openDeckUrl(deckUrl, pendingDeckWindowRef.current ?? void 0);
					pendingDeckWindowRef.current = null;
					setProposals((prev) => prev.map((item) => item.id !== proposal.id ? item : {
						...item,
						pptUrl: deckUrl,
						presentationDeck: result.presentationDeck ? {
							...result.presentationDeck,
							storageUrl: deckUrl
						} : item.presentationDeck ? {
							...item.presentationDeck,
							storageUrl: deckUrl
						} : null
					}));
					await refreshProposals();
					notifySuccess({
						title: "Deck ready",
						message: "We saved the PPT and opened it in a new tab."
					});
					return;
				}
				if (attempt < pollMaxAttempts - 1) {
					await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
					return pollDeck(attempt + 1);
				}
				setDeckProgressStage("queued");
				const pendingWindow = pendingDeckWindowRef.current;
				if (pendingWindow && !pendingWindow.closed) pendingWindow.close();
				pendingDeckWindowRef.current = null;
			};
			await pollDeck(0);
		} catch (error) {
			logError(error, "useDeckPreparation:handleDownloadDeck");
			setDeckProgressStage("error");
			const message = asErrorMessage(error);
			if (workspaceId) trackDeckGenerationFailed(workspaceId, proposal.id, message, proposal.clientId, proposal.clientName).catch((e) => logError(e, "useDeckPreparation:trackDeckGenerationFailed"));
			notifyFailure({
				title: "Unable to prepare deck",
				message
			});
			const pendingWindow = pendingDeckWindowRef.current;
			if (pendingWindow && !pendingWindow.closed) pendingWindow.close();
			pendingDeckWindowRef.current = null;
		} finally {
			console.log("[ProposalDownload] Clearing downloading state for proposal:", proposal.id);
			setDownloadingDeckId(null);
			setDeckProgressStage(null);
		}
	};
	return {
		downloadingDeckId,
		deckProgressStage,
		handleDownloadDeck,
		openDeckUrl
	};
}
function buildSnapshotKey(snapshot) {
	return JSON.stringify({
		clientId: snapshot.clientId,
		step: snapshot.step,
		form: snapshot.form
	});
}
function proposalBootstrapReducer(state, action) {
	switch (action.type) {
		case "setDraftId": return {
			...state,
			draftId: action.value
		};
		case "bootstrapStart": return {
			...state,
			isBootstrapping: true
		};
		case "bootstrapFinish": return {
			draftId: action.draftId,
			isBootstrapping: false
		};
		default: return state;
	}
}
function useProposalDrafts(options) {
	const { isPreviewMode, formState, currentStep, hasPersistableData, onFormStateChange, onStepChange, onSubmittedChange, onPresentationDeckChange, onAiSuggestionsChange, onLastSubmissionSnapshotChange, steps } = options;
	const { user, isSyncing, authError } = useAuth();
	const { selectedClient, selectedClientId } = useClientContext();
	const workspaceId = user?.agencyId ?? null;
	const canQuery = Boolean(workspaceId && selectedClientId && !isSyncing && !authError);
	const convexProposals = useQuery(proposalsApi.list, isPreviewMode || !canQuery ? "skip" : {
		workspaceId,
		clientId: selectedClientId ?? void 0,
		limit: 100
	});
	const proposalsQueryError = useConvexQueryError({
		data: convexProposals,
		skipped: isPreviewMode || !canQuery,
		fallbackMessage: "Unable to load proposals."
	});
	const convexCreateProposal = useMutation(proposalsApi.create);
	const convexUpdateProposal = useMutation(proposalsApi.update);
	const convexRemoveProposal = useMutation(proposalsApi.remove);
	const proposals = (() => {
		if (!workspaceId || !selectedClientId) return [];
		return (Array.isArray(convexProposals) ? convexProposals : []).map((row) => ({
			id: String(row.legacyId),
			status: row.status ?? "draft",
			stepProgress: typeof row.stepProgress === "number" ? row.stepProgress : 0,
			formData: mergeProposalForm(row.formData ?? null),
			aiInsights: row.aiInsights ?? null,
			aiSuggestions: row.aiSuggestions ?? null,
			pdfUrl: row.pdfUrl ?? null,
			pptUrl: row.pptUrl ?? null,
			createdAt: typeof row.createdAtMs === "number" ? new Date(row.createdAtMs).toISOString() : null,
			updatedAt: typeof row.updatedAtMs === "number" ? new Date(row.updatedAtMs).toISOString() : null,
			lastAutosaveAt: typeof row.lastAutosaveAtMs === "number" ? new Date(row.lastAutosaveAtMs).toISOString() : null,
			clientId: row.clientId ?? null,
			clientName: row.clientName ?? null,
			presentationDeck: row.presentationDeck ? {
				...row.presentationDeck,
				storageUrl: row.presentationDeck.storageUrl ?? row.pptUrl ?? null
			} : null
		}));
	})();
	const [bootstrapState, dispatchBootstrap] = (0, import_react.useReducer)(proposalBootstrapReducer, {
		draftId: null,
		isBootstrapping: true
	});
	const { draftId, isBootstrapping } = bootstrapState;
	const setDraftId = (value) => dispatchBootstrap({
		type: "setDraftId",
		value
	});
	const [isCreatingDraft, setIsCreatingDraft] = (0, import_react.useState)(false);
	const [autosaveStatus, setAutosaveStatus] = (0, import_react.useState)("idle");
	const [deletingProposalId, setDeletingProposalId] = (0, import_react.useState)(null);
	const [proposalPendingDelete, setProposalPendingDelete] = (0, import_react.useState)(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = (0, import_react.useState)(false);
	const [isHydrated, setIsHydrated] = (0, import_react.useState)(false);
	const draftIdRef = (0, import_react.useRef)(draftId);
	const wizardRef = (0, import_react.useRef)(null);
	const lastBootstrapKeyRef = (0, import_react.useRef)(null);
	const lastSavedSnapshotRef = (0, import_react.useRef)(null);
	const [lastSavedSnapshotKey, setLastSavedSnapshotKey] = (0, import_react.useState)(null);
	const onFormStateChangeRef = (0, import_react.useRef)(onFormStateChange);
	const onStepChangeRef = (0, import_react.useRef)(onStepChange);
	const onSubmittedChangeRef = (0, import_react.useRef)(onSubmittedChange);
	const onPresentationDeckChangeRef = (0, import_react.useRef)(onPresentationDeckChange);
	const onAiSuggestionsChangeRef = (0, import_react.useRef)(onAiSuggestionsChange);
	const onLastSubmissionSnapshotChangeRef = (0, import_react.useRef)(onLastSubmissionSnapshotChange);
	(0, import_react.useEffect)(() => {
		draftIdRef.current = draftId;
	}, [draftId]);
	(0, import_react.useEffect)(() => {
		onFormStateChangeRef.current = onFormStateChange;
		onStepChangeRef.current = onStepChange;
		onSubmittedChangeRef.current = onSubmittedChange;
		onPresentationDeckChangeRef.current = onPresentationDeckChange;
		onAiSuggestionsChangeRef.current = onAiSuggestionsChange;
		onLastSubmissionSnapshotChangeRef.current = onLastSubmissionSnapshotChange;
	}, [
		onAiSuggestionsChange,
		onFormStateChange,
		onLastSubmissionSnapshotChange,
		onPresentationDeckChange,
		onStepChange,
		onSubmittedChange
	]);
	const markSnapshotSaved = (snapshotKey) => {
		lastSavedSnapshotRef.current = snapshotKey;
		setLastSavedSnapshotKey(snapshotKey);
	};
	const isLoadingProposals = Boolean(selectedClientId && workspaceId && convexProposals === void 0);
	const currentSnapshotKey = buildSnapshotKey({
		form: formState,
		step: currentStep,
		clientId: selectedClientId
	});
	const refreshProposals = async () => {
		return proposals;
	};
	const ensureDraftId = async () => {
		if (draftId) return draftId;
		if (!hasPersistableData) {
			notifyFailure({
				title: "Draft not ready",
				message: "Fill in the proposal form before generating."
			});
			return null;
		}
		if (isCreatingDraft) {
			notifySuccess({
				title: "Preparing proposal",
				message: "Please wait while we prepare your proposal for generation."
			});
			return null;
		}
		try {
			setIsCreatingDraft(true);
			setAutosaveStatus("saving");
			if (!workspaceId) throw new Error("Workspace is required to create a proposal draft");
			const newDraftId = (await convexCreateProposal({
				workspaceId,
				ownerId: user?.id ?? null,
				status: "draft",
				stepProgress: currentStep,
				formData: formState,
				clientId: selectedClientId ?? null,
				clientName: selectedClient?.name ?? null
			})).legacyId;
			setDraftId(newDraftId);
			markSnapshotSaved(currentSnapshotKey);
			setAutosaveStatus("saved");
			return newDraftId;
		} catch (error) {
			logError(error, "useProposalDrafts:ensureDraftId");
			setAutosaveStatus("error");
			reportConvexFailure({
				error,
				context: "use-proposal-drafts.ts:catch",
				title: "Unable to create draft",
				fallbackMessage: "Unable to create draft"
			});
			return null;
		} finally {
			setIsCreatingDraft(false);
		}
	};
	const saveDraftNow = (0, import_react.useEffectEvent)(async (saveOptions) => {
		if (isPreviewMode || !hasPersistableData || !selectedClientId) return;
		let activeDraftId = draftIdRef.current;
		if (!activeDraftId) {
			activeDraftId = await ensureDraftId();
			if (!activeDraftId) return;
		}
		try {
			setAutosaveStatus("saving");
			if (!workspaceId) throw new Error("Workspace is required to save a proposal draft");
			const timestamp = Date.now();
			await convexUpdateProposal({
				workspaceId,
				legacyId: activeDraftId,
				formData: formState,
				stepProgress: currentStep,
				status: "draft",
				clientId: selectedClientId,
				clientName: selectedClient?.name ?? null,
				updatedAtMs: timestamp,
				lastAutosaveAtMs: timestamp
			});
			markSnapshotSaved(currentSnapshotKey);
			setAutosaveStatus("saved");
			if (saveOptions?.showToast) notifySuccess({
				title: "Draft saved",
				message: "Your proposal changes are saved."
			});
		} catch (error) {
			logError(error, "useProposalDrafts:saveDraftNow");
			setAutosaveStatus("error");
			const message = asErrorMessage(error);
			if (saveOptions?.showToast) notifyFailure({
				title: "Unable to save draft",
				message
			});
		}
	});
	const handleCreateNewProposal = async () => {
		if (!selectedClientId) {
			notifyFailure({
				title: "Select a client",
				message: "Choose a client from the sidebar before starting a proposal."
			});
			return;
		}
		if (isCreatingDraft) {
			notifySuccess({
				title: "Preparing proposal",
				message: "Please wait for the current draft to finish initializing."
			});
			return;
		}
		try {
			setIsCreatingDraft(true);
			setAutosaveStatus("saving");
			const initialForm = createInitialProposalFormState();
			if (!workspaceId) throw new Error("Workspace is required to create a proposal draft");
			const newDraftId = (await convexCreateProposal({
				workspaceId,
				ownerId: user?.id ?? null,
				status: "draft",
				stepProgress: 0,
				formData: initialForm,
				clientId: selectedClientId ?? null,
				clientName: selectedClient?.name ?? null
			})).legacyId;
			setDraftId(newDraftId);
			onFormStateChange(initialForm);
			onStepChange(0);
			onSubmittedChange(false);
			onPresentationDeckChange(null);
			onAiSuggestionsChange(null);
			onLastSubmissionSnapshotChange(null);
			markSnapshotSaved(buildSnapshotKey({
				form: initialForm,
				step: 0,
				clientId: selectedClientId
			}));
			setAutosaveStatus("saved");
			if (workspaceId) trackDraftCreated(workspaceId, newDraftId, selectedClientId, selectedClient?.name).catch(console.error);
			notifySuccess({
				title: "New proposal started",
				message: selectedClient?.name ? `Working on a fresh plan for ${selectedClient.name}.` : "You can begin filling out the proposal steps."
			});
		} catch (error) {
			logError(error, "useProposalDrafts:handleCreateNewProposal");
			setAutosaveStatus("error");
			reportConvexFailure({
				error,
				context: "use-proposal-drafts.ts:catch",
				title: "Unable to create draft",
				fallbackMessage: "Unable to create draft"
			});
		} finally {
			setIsCreatingDraft(false);
		}
	};
	const handleResumeProposal = (proposal, forceEdit) => {
		const mergedForm = mergeProposalForm(proposal.formData);
		const targetStep = Math.min(proposal.stepProgress ?? 0, steps.length - 1);
		setDraftId(proposal.id);
		onFormStateChange(mergedForm, { resetHistory: true });
		onStepChange(targetStep);
		onSubmittedChange(forceEdit ? false : proposal.status === "ready");
		onPresentationDeckChange(proposal.presentationDeck ? {
			...proposal.presentationDeck,
			storageUrl: proposal.presentationDeck.storageUrl ?? proposal.pptUrl ?? null
		} : null);
		onAiSuggestionsChange(proposal.aiSuggestions ?? null);
		if (proposal.status === "ready" && !forceEdit) onLastSubmissionSnapshotChange({
			draftId: proposal.id,
			form: structuredClone(mergedForm),
			step: targetStep,
			clientId: proposal.clientId ?? null,
			clientName: proposal.clientName ?? null
		});
		else onLastSubmissionSnapshotChange(null);
		markSnapshotSaved(buildSnapshotKey({
			form: mergedForm,
			step: targetStep,
			clientId: proposal.clientId ?? selectedClientId
		}));
		wizardRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
	};
	const handleDeleteProposal = async (proposal) => {
		if (deletingProposalId && deletingProposalId !== proposal.id) return;
		try {
			setDeletingProposalId(proposal.id);
			if (!workspaceId) throw new Error("Workspace is required to delete a proposal");
			await convexRemoveProposal({
				workspaceId,
				legacyId: proposal.id
			});
			if (draftId === proposal.id) {
				setDraftId(null);
				onFormStateChange(createInitialProposalFormState(), { resetHistory: true });
				onStepChange(0);
				onSubmittedChange(false);
				onPresentationDeckChange(null);
				onAiSuggestionsChange(null);
				onLastSubmissionSnapshotChange(null);
				markSnapshotSaved(buildSnapshotKey({
					form: createInitialProposalFormState(),
					step: 0,
					clientId: selectedClientId
				}));
			}
			notifySuccess({
				title: "Proposal deleted",
				message: "The proposal has been removed."
			});
		} catch (err) {
			logError(err, "useProposalDrafts:handleDeleteProposal");
			notifyFailure({
				title: "Unable to delete proposal",
				message: asErrorMessage(err)
			});
		} finally {
			setDeletingProposalId(null);
			setProposalPendingDelete(null);
			setIsDeleteDialogOpen(false);
		}
	};
	const requestDeleteProposal = (proposal) => {
		setProposalPendingDelete(proposal);
		setIsDeleteDialogOpen(true);
	};
	const handleDeleteDialogChange = (open) => {
		setIsDeleteDialogOpen(open);
		if (!open) setProposalPendingDelete(null);
	};
	const proposalsKey = (() => {
		if (!proposals.length) return "none";
		return proposals.map((proposal) => `${proposal.id}:${proposal.updatedAt ?? ""}:${proposal.status ?? ""}`).join("|");
	})();
	(0, import_react.useEffect)(() => {
		const bootstrapKey = `${selectedClientId ?? "none"}:${proposalsKey}:${steps.length}`;
		if (bootstrapKey === lastBootstrapKeyRef.current) return;
		lastBootstrapKeyRef.current = bootstrapKey;
		setIsHydrated(false);
		let cancelled = false;
		const bootstrapDraft = async () => {
			dispatchBootstrap({ type: "bootstrapStart" });
			let resolvedDraftId = null;
			try {
				if (!selectedClientId) {
					const initialForm = createInitialProposalFormState();
					onFormStateChangeRef.current(initialForm, { resetHistory: true });
					onStepChangeRef.current(0);
					onSubmittedChangeRef.current(false);
					onPresentationDeckChangeRef.current(null);
					onAiSuggestionsChangeRef.current(null);
					onLastSubmissionSnapshotChangeRef.current(null);
					markSnapshotSaved(buildSnapshotKey({
						form: initialForm,
						step: 0,
						clientId: null
					}));
				} else {
					const allProposals = proposals;
					if (cancelled) return;
					const draft = allProposals.find((proposal) => proposal.status === "draft") ?? allProposals[0];
					if (draft) {
						resolvedDraftId = draft.id;
						const mergedForm = mergeProposalForm(draft.formData);
						const targetStep = Math.min(draft.stepProgress ?? 0, steps.length - 1);
						onFormStateChangeRef.current(mergedForm, { resetHistory: true });
						onStepChangeRef.current(targetStep);
						onSubmittedChangeRef.current(draft.status === "ready");
						onPresentationDeckChangeRef.current(draft.presentationDeck ? {
							...draft.presentationDeck,
							storageUrl: draft.presentationDeck.storageUrl ?? draft.pptUrl ?? null
						} : null);
						onAiSuggestionsChangeRef.current(draft.aiSuggestions ?? null);
						onLastSubmissionSnapshotChangeRef.current(null);
						markSnapshotSaved(buildSnapshotKey({
							form: mergedForm,
							step: targetStep,
							clientId: draft.clientId ?? selectedClientId
						}));
					} else {
						const initialForm = createInitialProposalFormState();
						onFormStateChangeRef.current(initialForm, { resetHistory: true });
						onStepChangeRef.current(0);
						onSubmittedChangeRef.current(false);
						onPresentationDeckChangeRef.current(null);
						onAiSuggestionsChangeRef.current(null);
						onLastSubmissionSnapshotChangeRef.current(null);
						markSnapshotSaved(buildSnapshotKey({
							form: initialForm,
							step: 0,
							clientId: selectedClientId
						}));
					}
				}
			} catch (err) {
				if (cancelled) return;
				reportConvexFailure({
					error: err,
					context: "useProposalDrafts:bootstrapDraft",
					title: "Unable to start proposal wizard",
					fallbackMessage: "Unable to start proposal wizard."
				});
			} finally {
				if (!cancelled) {
					setIsHydrated(true);
					dispatchBootstrap({
						type: "bootstrapFinish",
						draftId: resolvedDraftId
					});
				}
			}
		};
		bootstrapDraft();
		return () => {
			cancelled = true;
		};
	}, [
		proposals,
		proposalsKey,
		selectedClientId,
		steps.length
	]);
	const shouldScheduleAutosave = !isPreviewMode && !isBootstrapping && isHydrated && hasPersistableData && Boolean(selectedClientId) && lastSavedSnapshotKey !== currentSnapshotKey;
	const resolvedAutosaveStatus = (() => {
		if (shouldScheduleAutosave && autosaveStatus === "idle") return "saving";
		return autosaveStatus;
	})();
	(0, import_react.useEffect)(() => {
		if (!shouldScheduleAutosave) return;
		const timeoutId = window.setTimeout(() => {
			saveDraftNow();
		}, 900);
		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [currentSnapshotKey, shouldScheduleAutosave]);
	return {
		draftId,
		proposals,
		isLoadingProposals,
		isCreatingDraft,
		isBootstrapping,
		proposalsQueryError,
		autosaveStatus: resolvedAutosaveStatus,
		deletingProposalId,
		proposalPendingDelete,
		isDeleteDialogOpen,
		setDraftId,
		setAutosaveStatus,
		refreshProposals,
		ensureDraftId,
		saveDraftNow,
		handleCreateNewProposal,
		handleResumeProposal,
		handleDeleteProposal,
		requestDeleteProposal,
		handleDeleteDialogChange,
		draftIdRef,
		wizardRef
	};
}
function useProposalPageInteractions(props) {
	const { routerPush, setIsWizardOpen, setFormState, setCurrentStep, handleCreateNewProposal, handleResumeProposal, handleContinueEditingFromSnapshot } = props;
	const buildProposalDeckHref = (proposalId) => {
		return withPreviewModeSearchParamIfEnabled(`/dashboard/proposals/${proposalId}/deck`, isPreviewModeEnabled());
	};
	const handleSelectTemplate = (templateFormData) => {
		setFormState(templateFormData, { resetHistory: true });
		setCurrentStep(0);
		notifySuccess({
			title: "Template applied",
			message: "The template has been applied to your proposal. You can customize it as needed."
		});
	};
	const handleVersionRestored = (restoredFormData) => {
		setFormState(restoredFormData, { resetHistory: true });
		setCurrentStep(0);
		notifySuccess({
			title: "Version restored",
			message: "The proposal has been restored to the selected version."
		});
	};
	const handleStartProposal = async () => {
		await handleCreateNewProposal();
		setIsWizardOpen(true);
	};
	const handleResumeProposalInModal = (proposal, forceEdit) => {
		if (proposal.status === "ready" && !forceEdit) {
			routerPush(buildProposalDeckHref(proposal.id));
			return;
		}
		handleResumeProposal(proposal, forceEdit);
		setIsWizardOpen(true);
	};
	const handleContinueEditingInModal = async () => {
		await handleContinueEditingFromSnapshot();
		setIsWizardOpen(true);
	};
	const handlePreviewRefresh = () => {
		notifyInfo({
			title: "Preview data refreshed",
			message: "Showing sample proposal history."
		});
	};
	const handlePreviewResume = (proposal) => {
		if (proposal.status === "ready" || proposal.status === "sent") {
			routerPush(buildProposalDeckHref(proposal.id));
			return;
		}
		notifyInfo({
			title: "Preview mode",
			message: "Sample proposals are read-only. Exit preview mode to create or edit live proposals."
		});
	};
	const handlePreviewRequestDelete = () => {
		notifyInfo({
			title: "Preview mode",
			message: "Sample proposals cannot be deleted."
		});
	};
	const handlePreviewDownloadDeck = (proposal) => {
		routerPush(buildProposalDeckHref(proposal.id));
	};
	const handlePreviewCreateNew = () => {
		notifyInfo({
			title: "Preview mode",
			message: "Switch off preview mode to start a real proposal."
		});
	};
	return {
		handleSelectTemplate,
		handleVersionRestored,
		handleStartProposal,
		handleResumeProposalInModal,
		handleContinueEditingInModal,
		handlePreviewRefresh,
		handlePreviewResume,
		handlePreviewRequestDelete,
		handlePreviewDownloadDeck,
		handlePreviewCreateNew
	};
}
function toProposalDeckState(value) {
	const record = value && typeof value === "object" ? value : null;
	return {
		status: typeof record?.status === "string" ? record.status : "draft",
		pptUrl: typeof record?.pptUrl === "string" ? record.pptUrl : record?.pptUrl === null ? null : null,
		presentationDeck: record?.presentationDeck && typeof record.presentationDeck === "object" ? record.presentationDeck : null,
		aiSuggestions: typeof record?.aiSuggestions === "string" ? record.aiSuggestions : record?.aiSuggestions === null ? null : null
	};
}
function getDeckWarnings(deck) {
	if (!Array.isArray(deck?.warnings)) return void 0;
	return deck.warnings.filter((warning) => typeof warning === "string");
}
function getDeckError(deck) {
	return typeof deck?.error === "string" ? deck.error : void 0;
}
function getPreviewProposalSimulation(clientId) {
	const scopedProposals = getPreviewProposals(clientId);
	const fallbackProposals = getPreviewProposals(null).filter((proposal) => proposal.clientId !== clientId);
	const previewProposal = [...scopedProposals, ...fallbackProposals].find((proposal) => proposal.presentationDeck);
	if (!previewProposal?.presentationDeck) return null;
	return {
		aiSuggestions: previewProposal.aiSuggestions ?? null,
		draftId: previewProposal.id,
		presentationDeck: {
			...previewProposal.presentationDeck,
			storageUrl: previewProposal.presentationDeck.storageUrl ?? previewProposal.pptUrl ?? previewProposal.presentationDeck.pptxUrl ?? null
		}
	};
}
function useProposalSubmission(options) {
	const { draftId, formState, currentStep, ensureDraftId, refreshProposals, setDraftId, setFormState, setCurrentStep, setAutosaveStatus, clearErrors, steps } = options;
	const { user, getIdToken, isSyncing, authError } = useAuth();
	const { selectedClient, selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const workspaceId = user?.agencyId ?? null;
	const convexUpdateProposal = useMutation(proposalsApi.update);
	const generateProposalDeck = useAction(proposalGenerationApi.generateFromProposal);
	const canQuery = Boolean(workspaceId && draftId && !isSyncing && !authError);
	const activeConvexProposal = useQuery(proposalsApi.getByLegacyId, !canQuery ? "skip" : {
		workspaceId,
		legacyId: draftId
	});
	const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const [isPresentationReady, setIsPresentationReady] = (0, import_react.useState)(false);
	const [presentationDeck, setPresentationDeck] = (0, import_react.useState)(null);
	const [aiSuggestions, setAiSuggestions] = (0, import_react.useState)(null);
	const [lastSubmissionSnapshot, setLastSubmissionSnapshot] = (0, import_react.useState)(null);
	const [isRecheckingDeck, setIsRecheckingDeck] = (0, import_react.useState)(false);
	const submittedRef = (0, import_react.useRef)(submitted);
	(0, import_react.useEffect)(() => {
		submittedRef.current = submitted;
	}, [submitted]);
	const activeProposalIdForDeck = lastSubmissionSnapshot?.draftId ?? draftId;
	const { pptUrl: deckDownloadUrl } = resolveProposalDeckUrls({
		artifactUrls: useProposalArtifactUrls(workspaceId, activeProposalIdForDeck ?? null),
		presentationDeck
	});
	const canResumeSubmission = Boolean(lastSubmissionSnapshot && !isSubmitting && lastSubmissionSnapshot.draftId && lastSubmissionSnapshot.clientId === (selectedClientId ?? null));
	const submitProposal = async () => {
		try {
			setIsSubmitting(true);
			setIsPresentationReady(false);
			clearErrors(stepErrorPaths.value);
			setAiSuggestions(null);
			if (isPreviewMode) {
				const previewSimulation = getPreviewProposalSimulation(selectedClientId ?? null);
				if (!previewSimulation) {
					notifyFailure({
						title: "Preview result unavailable",
						message: "Sample proposal output is not available right now."
					});
					return;
				}
				const formSnapshot = structuredClone(formState);
				setLastSubmissionSnapshot({
					draftId: previewSimulation.draftId,
					form: formSnapshot,
					step: currentStep,
					clientId: selectedClientId ?? null,
					clientName: selectedClient?.name ?? null
				});
				setSubmitted(true);
				setPresentationDeck(previewSimulation.presentationDeck);
				setAiSuggestions(previewSimulation.aiSuggestions);
				setIsPresentationReady(true);
				setFormState(createInitialProposalFormState(), { resetHistory: true });
				setCurrentStep(0);
				setDraftId(null);
				setAutosaveStatus("idle");
				notifyInfo({
					title: "Preview proposal ready",
					message: "Showing a simulated proposal result using sample deck output."
				});
				return;
			}
			let activeDraftId = draftId;
			if (!activeDraftId) {
				activeDraftId = await ensureDraftId();
				if (!activeDraftId) {
					setIsSubmitting(false);
					return;
				}
			}
			try {
				setAutosaveStatus("saving");
				if (!workspaceId) throw new Error("Workspace is required to save a proposal");
				const timestamp = Date.now();
				await convexUpdateProposal({
					workspaceId,
					legacyId: activeDraftId,
					formData: formState,
					stepProgress: currentStep,
					updatedAtMs: timestamp,
					lastAutosaveAtMs: timestamp
				});
				setAutosaveStatus("saved");
			} catch (updateError) {
				setAutosaveStatus("error");
				reportConvexFailure({
					error: updateError,
					context: "useProposalSubmission:submitProposal:saveDraft",
					title: "Unable to save proposal",
					fallbackMessage: "Unable to save proposal"
				});
				setIsSubmitting(false);
				return;
			}
			setLastSubmissionSnapshot(null);
			if (workspaceId) generateProposalDeck({
				workspaceId,
				legacyId: activeDraftId
			}).catch((error) => {
				reportConvexFailure({
					error,
					context: "useProposalSubmission:submitProposal:generate",
					title: "Deck generation failed to start",
					fallbackMessage: "Deck generation failed to start"
				});
			});
			const aiStartTime = Date.now();
			if (workspaceId) trackAiGenerationStarted(workspaceId, activeDraftId, selectedClientId, selectedClient?.name).catch((e) => logError(e, "useProposalSubmission:trackAiGenerationStarted"));
			let response = toProposalDeckState(activeConvexProposal);
			const aiDuration = Date.now() - aiStartTime;
			const maxAttempts = 75;
			const pollIntervalMs = 4e3;
			const pollAiStatus = async (attempt) => {
				const latest = await refreshProposalDraft(activeDraftId, {
					workspaceId: workspaceId ?? "",
					convexToken: await getIdToken() ?? ""
				});
				response = toProposalDeckState(latest);
				if (latest.status === "ready" || latest.status === "partial_success" || latest.status === "failed") return;
				if (attempt < maxAttempts - 1) {
					await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
					return pollAiStatus(attempt + 1);
				}
			};
			await pollAiStatus(0);
			const isReady = response?.status === "ready" || response?.status === "partial_success";
			const isFailed = response?.status === "failed";
			if (isReady || isFailed) {
				if (workspaceId) if (isReady) {
					trackAiGenerationCompleted(workspaceId, activeDraftId, aiDuration, selectedClientId, selectedClient?.name).catch((e) => logError(e, "useProposalSubmission:trackAiGenerationCompleted"));
					trackProposalSubmitted(workspaceId, activeDraftId, selectedClientId, selectedClient?.name).catch((e) => logError(e, "useProposalSubmission:trackProposalSubmitted"));
				} else trackAiGenerationFailed(workspaceId, activeDraftId, "Generation failed", selectedClientId, selectedClient?.name).catch((e) => logError(e, "useProposalSubmission:trackAiGenerationFailed"));
			} else if (workspaceId) trackAiGenerationFailed(workspaceId, activeDraftId, "AI generation incomplete", selectedClientId, selectedClient?.name).catch((e) => logError(e, "useProposalSubmission:trackAiGenerationIncomplete"));
			let finalPptUrl = response.pptUrl ?? response.presentationDeck?.storageUrl ?? null;
			let finalDeck = response.presentationDeck ?? null;
			if (isReady && !finalPptUrl) {
				const maxAttempts = 30;
				const pollInterval = 2e3;
				const pollDeckUrl = async (attempt) => {
					if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, pollInterval));
					try {
						const refreshedProposal = await refreshProposalDraft(activeDraftId, {
							workspaceId: workspaceId ?? "",
							convexToken: await getIdToken() ?? ""
						});
						const deckUrl = refreshedProposal.pptUrl ?? refreshedProposal.presentationDeck?.storageUrl ?? null;
						if (deckUrl) {
							finalPptUrl = deckUrl;
							finalDeck = refreshedProposal.presentationDeck ?? null;
							console.log("[ProposalWizard] Presentation deck ready after polling:", deckUrl);
							return;
						}
					} catch (pollError) {
						logError(pollError, "useProposalSubmission:pollDeckUrl");
					}
					if (attempt < maxAttempts - 1) return pollDeckUrl(attempt + 1);
				};
				await pollDeckUrl(0);
			}
			setIsPresentationReady(true);
			setSubmitted(isReady);
			setPresentationDeck(finalDeck ? {
				...finalDeck,
				storageUrl: finalPptUrl ?? finalDeck.storageUrl ?? null
			} : null);
			setAiSuggestions(response.aiSuggestions ?? null);
			const hasPdfWarning = getDeckWarnings(response.presentationDeck)?.some((w) => w.toLowerCase().includes("pdf"));
			const isPartialSuccess = response?.status === "partial_success";
			if (isReady) {
				const formSnapshot = structuredClone(formState);
				setLastSubmissionSnapshot({
					draftId: activeDraftId,
					form: formSnapshot,
					step: currentStep,
					clientId: selectedClientId ?? null,
					clientName: selectedClient?.name ?? null
				});
			}
			if (isReady) {
				setFormState(createInitialProposalFormState(), { resetHistory: true });
				setCurrentStep(0);
				setDraftId(null);
				setAutosaveStatus("idle");
			}
			if (finalPptUrl) if (isPartialSuccess || hasPdfWarning) notifyWarning({
				title: "Presentation ready (PPTX only)",
				message: "The PowerPoint presentation is ready for download. PDF generation encountered an issue, but you can still download the PPTX file."
			});
			else notifySuccess({
				title: "Presentation ready",
				message: "We saved the presentation for instant download."
			});
			else if (isFailed) notifyFailure({
				title: "Generation failed",
				message: "The presentation could not be generated. Please try again or contact support if the issue persists."
			});
			else notifySuccess({
				title: "Presentation still generating",
				message: "The presentation is taking longer than expected. You can download it from the proposal history once ready."
			});
			if (!isReady && !isFailed) notifySuccess({
				title: "AI plan pending",
				message: "We could not finish the AI proposal yet. Please try again in a few minutes."
			});
			else if (!isFailed) notifySuccess({
				title: "Proposal ready",
				message: "Your AI-generated recommendations are ready for review."
			});
			await refreshProposals();
		} catch (err) {
			logError(err, "useProposalSubmission:submitProposal");
			const message = asErrorMessage(err);
			if (draftId) {
				if (workspaceId) trackAiGenerationFailed(workspaceId, draftId, message, selectedClientId, selectedClient?.name).catch((e) => logError(e, "useProposalSubmission:trackAiGenerationFailedOnSubmit"));
			}
			setSubmitted(false);
			setPresentationDeck(null);
			setAiSuggestions(null);
			setLastSubmissionSnapshot(null);
			notifyFailure({
				title: "Failed to submit proposal",
				message
			});
		} finally {
			setIsSubmitting(false);
		}
	};
	const handleContinueEditingFromSnapshot = async () => {
		if (!lastSubmissionSnapshot) return;
		if (lastSubmissionSnapshot.clientId && lastSubmissionSnapshot.clientId !== selectedClientId) {
			notifyFailure({
				title: "Switch back to original client",
				message: "Return to the client associated with this proposal to continue editing."
			});
			return;
		}
		const restoredForm = structuredClone(lastSubmissionSnapshot.form);
		const restoredStep = Math.min(lastSubmissionSnapshot.step, steps.length - 1);
		setFormState(restoredForm, { resetHistory: true });
		setCurrentStep(restoredStep);
		setSubmitted(false);
		setPresentationDeck(null);
		setAiSuggestions(null);
		setDraftId(isPreviewMode ? null : lastSubmissionSnapshot.draftId);
		setLastSubmissionSnapshot(null);
		setAutosaveStatus("idle");
		if (isPreviewMode) {
			notifyInfo({
				title: "Editing restored",
				message: "Your preview responses have been reloaded."
			});
			return;
		}
		try {
			if (!workspaceId) throw new Error("Workspace is required to save a proposal");
			const timestamp = Date.now();
			await convexUpdateProposal({
				workspaceId,
				legacyId: lastSubmissionSnapshot.draftId,
				formData: restoredForm,
				stepProgress: restoredStep,
				status: "draft",
				updatedAtMs: timestamp,
				lastAutosaveAtMs: timestamp
			});
			await refreshProposals();
			notifySuccess({
				title: "Editing restored",
				message: "Your previous responses have been reloaded."
			});
		} catch (error) {
			logError(error, "useProposalSubmission:handleContinueEditingFromSnapshot");
			notifyFailure({
				title: "Unable to resume editing",
				message: asErrorMessage(error)
			});
		}
	};
	const handleRecheckDeck = async () => {
		const proposalId = lastSubmissionSnapshot?.draftId ?? draftId;
		if (!proposalId) {
			notifyFailure({
				title: "No proposal selected",
				message: "Cannot check deck status without an active proposal."
			});
			return;
		}
		setIsRecheckingDeck(true);
		try {
			const activeProposal = toProposalDeckState(activeConvexProposal);
			const convexDeckUrl = activeProposal.pptUrl ?? null;
			const proposalStatus = activeProposal.status ?? "unknown";
			if (convexDeckUrl && (proposalStatus === "ready" || proposalStatus === "partial_success")) {
				setPresentationDeck(activeProposal.presentationDeck ? {
					...activeProposal.presentationDeck,
					storageUrl: activeProposal.presentationDeck.storageUrl ?? convexDeckUrl
				} : presentationDeck ? {
					...presentationDeck,
					storageUrl: convexDeckUrl,
					status: proposalStatus
				} : null);
				setIsPresentationReady(true);
				setSubmitted(true);
				await refreshProposals();
				const deckWarnings = getDeckWarnings(activeProposal.presentationDeck);
				if (deckWarnings?.length) notifyWarning({
					title: "Presentation ready with warnings",
					message: deckWarnings.join(". ")
				});
				else notifySuccess({
					title: "Presentation ready!",
					message: "Your slide deck has been generated and is ready for download."
				});
				return;
			}
			if (proposalStatus === "failed") {
				notifyFailure({
					title: "Generation failed",
					message: getDeckError(activeProposal.presentationDeck)
				});
				return;
			}
			const maxPollAttempts = 30;
			const pollInterval = 3e3;
			const pollRecheckDeck = async (attempt) => {
				const currentProposal = await refreshProposalDraft(proposalId, {
					workspaceId: workspaceId ?? "",
					convexToken: await getIdToken() ?? ""
				});
				const newDeckUrl = currentProposal.pptUrl ?? currentProposal.presentationDeck?.storageUrl ?? null;
				const newStatus = currentProposal.status;
				if (newDeckUrl && (newStatus === "ready" || newStatus === "partial_success")) {
					setPresentationDeck(currentProposal.presentationDeck ? {
						...currentProposal.presentationDeck,
						storageUrl: newDeckUrl
					} : presentationDeck ? {
						...presentationDeck,
						storageUrl: newDeckUrl,
						status: newStatus
					} : null);
					setIsPresentationReady(true);
					setSubmitted(true);
					await refreshProposals();
					const deckWarnings = getDeckWarnings(currentProposal.presentationDeck);
					if (deckWarnings?.length) notifyWarning({
						title: "Presentation ready with warnings",
						message: deckWarnings.join(". ")
					});
					else notifySuccess({
						title: "Presentation ready!",
						message: "Your slide deck has been generated and is ready for download."
					});
					return;
				}
				if (newStatus === "failed") {
					notifyFailure({
						title: "Generation failed",
						message: getDeckError(currentProposal.presentationDeck)
					});
					return;
				}
				if (attempt < maxPollAttempts - 1) {
					await new Promise((resolve) => setTimeout(resolve, pollInterval));
					return pollRecheckDeck(attempt + 1);
				}
				notifySuccess({
					title: "Still processing",
					message: "The presentation is still being generated. Please try again in a few moments."
				});
			};
			await pollRecheckDeck(0);
		} catch (error) {
			logError(error, "useProposalSubmission:handleRecheckDeck");
			notifyFailure({
				title: "Unable to check status",
				message: asErrorMessage(error)
			});
		} finally {
			setIsRecheckingDeck(false);
		}
	};
	return {
		isSubmitting,
		isRecheckingDeck,
		submitted,
		isPresentationReady,
		presentationDeck,
		aiSuggestions,
		lastSubmissionSnapshot,
		setSubmitted,
		setPresentationDeck,
		setAiSuggestions,
		setLastSubmissionSnapshot,
		submitProposal,
		handleContinueEditingFromSnapshot,
		handleRecheckDeck,
		canResumeSubmission,
		deckDownloadUrl,
		activeProposalIdForDeck
	};
}
var HISTORY_LIMIT = 50;
function cloneFormState(state) {
	return structuredClone(state);
}
function formsEqual(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}
function useProposalWizard(options = {}) {
	const { onSubmit } = options;
	const [currentStep, setCurrentStep] = (0, import_react.useState)(0);
	const [formState, setFormStateState] = (0, import_react.useState)(() => createInitialProposalFormState());
	const [manualErrors, setManualErrors] = (0, import_react.useState)({});
	const [undoStack, setUndoStack] = (0, import_react.useState)([]);
	const [redoStack, setRedoStack] = (0, import_react.useState)([]);
	const setFormState = (state, options = {}) => {
		setFormStateState((prev) => {
			const next = typeof state === "function" ? state(prev) : state;
			if (options.resetHistory) {
				setUndoStack([]);
				setRedoStack([]);
				return next;
			}
			if (options.recordHistory && !formsEqual(prev, next)) {
				setUndoStack((current) => [cloneFormState(prev), ...current].slice(0, HISTORY_LIMIT));
				setRedoStack([]);
			}
			return next;
		});
	};
	const clearHistory = () => {
		setUndoStack([]);
		setRedoStack([]);
	};
	const undo = () => {
		setUndoStack((current) => {
			const [next, ...rest] = current;
			if (!next) return current;
			setRedoStack((redoCurrent) => [cloneFormState(formState), ...redoCurrent].slice(0, HISTORY_LIMIT));
			setFormStateState(next);
			setManualErrors({});
			return rest;
		});
	};
	const redo = () => {
		setRedoStack((current) => {
			const [next, ...rest] = current;
			if (!next) return current;
			setUndoStack((undoCurrent) => [cloneFormState(formState), ...undoCurrent].slice(0, HISTORY_LIMIT));
			setFormStateState(next);
			setManualErrors({});
			return rest;
		});
	};
	const canUndo = undoStack.length > 0;
	const canRedo = redoStack.length > 0;
	const steps = proposalSteps;
	const step = steps[currentStep] ?? steps[0];
	const stepId = step.id;
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === steps.length - 1;
	const hasPersistableData = hasCompletedAnyStepData(formState);
	const clearErrors = (paths) => {
		const keys = Array.isArray(paths) ? paths : [paths];
		setManualErrors((prev) => {
			const next = { ...prev };
			let changed = false;
			keys.forEach((key) => {
				if (key in next) {
					delete next[key];
					changed = true;
				}
			});
			return changed ? next : prev;
		});
	};
	const toggleArrayValue = (path, value) => {
		setFormState((prev) => {
			const field = path.at(-1);
			if (!field) return prev;
			const updated = structuredClone(prev);
			let target = updated;
			path.slice(0, -1).forEach((key) => {
				const next = target[key];
				if (next && typeof next === "object") target = next;
			});
			const array = Array.isArray(target[field]) ? target[field] : [];
			target[field] = array.includes(value) ? array.filter((item) => item !== value) : [...array, value];
			return updated;
		}, { recordHistory: true });
		clearErrors(path.join("."));
	};
	const updateField = (path, value) => {
		setFormState((prev) => {
			const field = path.at(-1);
			if (!field) return prev;
			const updated = structuredClone(prev);
			let target = updated;
			path.slice(0, -1).forEach((key) => {
				const next = target[key];
				if (next && typeof next === "object") target = next;
			});
			target[field] = value;
			return updated;
		}, { recordHistory: true });
		clearErrors(path.join("."));
	};
	const handleSocialHandleChange = (handle, value) => {
		setFormState((prev) => ({
			...prev,
			marketing: {
				...prev.marketing,
				socialHandles: {
					...prev.marketing.socialHandles,
					[handle]: value
				}
			}
		}), { recordHistory: true });
	};
	const stepErrors = collectStepValidationErrors(stepId, formState);
	const validationErrors = (() => {
		const next = { ...manualErrors };
		stepErrorPaths[stepId].forEach((key) => {
			if (stepErrors[key]) next[key] = stepErrors[key];
			else delete next[key];
		});
		return next;
	})();
	const handleNext = () => {
		if (!validateProposalStep(stepId, formState)) {
			notifyFailure({
				title: "Complete required fields",
				message: "Please complete the required fields before continuing."
			});
			const stepErrors = collectStepValidationErrors(stepId, formState);
			setManualErrors((prev) => ({
				...prev,
				...stepErrors
			}));
			return;
		}
		clearErrors(stepErrorPaths[stepId]);
		if (!isLastStep) setCurrentStep((prev) => prev + 1);
		else if (onSubmit) onSubmit();
	};
	const handleBack = () => {
		if (!isFirstStep) setCurrentStep((prev) => prev - 1);
	};
	const goToStep = (targetIndex) => {
		if (targetIndex < 0 || targetIndex >= proposalSteps.length) return;
		if (targetIndex === currentStep) return;
		if (targetIndex > currentStep) for (let index = currentStep; index < targetIndex; index += 1) {
			const stepToValidate = proposalSteps[index]?.id;
			if (!stepToValidate || !validateProposalStep(stepToValidate, formState)) {
				notifyFailure({
					title: "Complete required fields",
					message: "Complete required fields on earlier steps before jumping ahead."
				});
				setManualErrors((prev) => ({
					...prev,
					...collectStepValidationErrors(stepToValidate ?? stepId, formState)
				}));
				setCurrentStep(index);
				return;
			}
			clearErrors(stepErrorPaths[stepToValidate]);
		}
		setCurrentStep(targetIndex);
	};
	const resetWizard = () => {
		setFormState(createInitialProposalFormState(), { resetHistory: true });
		setCurrentStep(0);
		setManualErrors({});
	};
	return {
		currentStep,
		formState,
		validationErrors,
		steps,
		step,
		isFirstStep,
		isLastStep,
		hasPersistableData,
		setCurrentStep,
		setFormState,
		setValidationErrors: setManualErrors,
		updateField,
		toggleArrayValue,
		handleSocialHandleChange,
		clearErrors,
		clearHistory,
		undo,
		redo,
		canUndo,
		canRedo,
		handleNext,
		handleBack,
		goToStep,
		resetWizard
	};
}
function useProposalsPageContent() {
	const { push } = useRouter$1();
	const { user } = useAuth();
	const { selectedClient, selectedClientId } = useClientContext();
	const { isPreviewMode } = usePreview();
	const canManageProposals = isPreviewMode || can(user?.role, "proposals.manage");
	const [isWizardOpen, setIsWizardOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!isWizardOpen) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isWizardOpen]);
	const [proposals, setProposals] = (0, import_react.useState)([]);
	const wizard = useProposalWizard();
	const { currentStep, formState, validationErrors, steps, step, isFirstStep, isLastStep, hasPersistableData, setCurrentStep, setFormState, updateField, toggleArrayValue, handleSocialHandleChange, clearErrors, undo, redo, canUndo, canRedo, handleBack, goToStep } = wizard;
	const { draftId, isLoadingProposals, isCreatingDraft, isBootstrapping, proposalsQueryError, autosaveStatus, deletingProposalId, proposalPendingDelete, isDeleteDialogOpen, setDraftId, setAutosaveStatus, refreshProposals, ensureDraftId, saveDraftNow, handleCreateNewProposal, handleResumeProposal, handleDeleteProposal, requestDeleteProposal, handleDeleteDialogChange, wizardRef } = useProposalDrafts({
		isPreviewMode,
		formState,
		currentStep,
		hasPersistableData,
		onFormStateChange: setFormState,
		onStepChange: setCurrentStep,
		onSubmittedChange: (submitted) => submission.setSubmitted(submitted),
		onPresentationDeckChange: (deck) => submission.setPresentationDeck(deck),
		onAiSuggestionsChange: (suggestions) => submission.setAiSuggestions(suggestions),
		onLastSubmissionSnapshotChange: (snapshot) => submission.setLastSubmissionSnapshot(snapshot),
		steps
	});
	const submission = useProposalSubmission({
		draftId,
		formState,
		currentStep,
		ensureDraftId,
		refreshProposals: async () => {
			const result = await refreshProposals();
			setProposals(result);
			return result;
		},
		setDraftId,
		setFormState,
		setCurrentStep,
		setAutosaveStatus,
		clearErrors,
		steps
	});
	const { isSubmitting, isRecheckingDeck, submitted, isPresentationReady, presentationDeck, lastSubmissionSnapshot, submitProposal, handleContinueEditingFromSnapshot, handleRecheckDeck, canResumeSubmission, deckDownloadUrl, activeProposalIdForDeck } = submission;
	const { downloadingDeckId, deckProgressStage, handleDownloadDeck } = useDeckPreparation({
		draftId,
		refreshProposals: async () => {
			const result = await refreshProposals();
			setProposals(result);
			return result;
		},
		setPresentationDeck: submission.setPresentationDeck,
		setAiSuggestions: submission.setAiSuggestions,
		setProposals,
		presentationDeck
	});
	const hasSelectedClient = Boolean(selectedClientId);
	(0, import_react.useEffect)(() => {
		const loadProposals = async () => {
			setProposals(await refreshProposals());
		};
		if (!isBootstrapping && hasSelectedClient) loadProposals();
	}, [
		hasSelectedClient,
		isBootstrapping,
		refreshProposals
	]);
	const handleNext = () => {
		if (isLastStep) submitProposal();
		else wizard.handleNext();
	};
	const summary = (() => {
		if (submitted && lastSubmissionSnapshot) return structuredClone(lastSubmissionSnapshot.form);
		return structuredClone(formState);
	})();
	const activeDeckStage = deckProgressStage ?? "polling";
	const previewProposals = getPreviewProposals(selectedClientId ?? null);
	const previewDraftId = previewProposals.find((proposal) => proposal.status === "draft")?.id ?? null;
	const displayedProposals = isPreviewMode ? previewProposals : proposals;
	const displayedDraftId = isPreviewMode ? previewDraftId : draftId;
	const displayedLoadingState = isPreviewMode ? false : isLoadingProposals;
	const isInitialLoading = displayedLoadingState && displayedProposals.length === 0 && !isWizardOpen;
	const handleStartPreviewProposal = () => {
		const initialForm = createInitialProposalFormState();
		submission.setSubmitted(false);
		submission.setPresentationDeck(null);
		submission.setAiSuggestions(null);
		submission.setLastSubmissionSnapshot(null);
		setDraftId(null);
		setAutosaveStatus("idle");
		setFormState({
			...initialForm,
			company: {
				...initialForm.company,
				name: selectedClient?.name ?? initialForm.company.name
			}
		}, { resetHistory: true });
		setCurrentStep(0);
		setIsWizardOpen(true);
	};
	useKeyboardShortcuts([
		{
			combo: "mod+s",
			description: "Save draft now",
			callback: () => {
				saveDraftNow({ showToast: true });
			},
			enabled: isWizardOpen && !submitted && !isPreviewMode
		},
		{
			combo: "mod+z",
			description: "Undo last proposal edit",
			callback: () => {
				undo();
			},
			enabled: isWizardOpen && !submitted && canUndo
		},
		{
			combo: "mod+shift+z",
			description: "Redo proposal edit",
			callback: () => {
				redo();
			},
			enabled: isWizardOpen && !submitted && canRedo
		}
	], {
		enabled: isWizardOpen,
		allowInInput: true
	});
	const { handleSelectTemplate, handleVersionRestored, handleStartProposal, handleResumeProposalInModal, handleContinueEditingInModal, handlePreviewRefresh, handlePreviewRequestDelete, handlePreviewDownloadDeck } = useProposalPageInteractions({
		routerPush: push,
		setIsWizardOpen,
		setFormState,
		setCurrentStep,
		handleCreateNewProposal,
		handleResumeProposal,
		handleContinueEditingFromSnapshot
	});
	const handleRefreshProposals = () => {
		refreshProposals().then(setProposals);
	};
	const handleConfirmDeleteProposal = () => {
		if (proposalPendingDelete) handleDeleteProposal(proposalPendingDelete);
	};
	const handleCloseWizard = () => {
		setIsWizardOpen(false);
	};
	const submissionAnnouncement = (() => {
		if (isSubmitting) return "Generating proposal deck. This can take a few minutes.";
		if (isRecheckingDeck) return "Rechecking proposal deck status.";
		if (submitted && isPresentationReady) return "Proposal deck is ready.";
		return "";
	})();
	const proposalHistoryWorkflow = {
		loading: displayedLoadingState,
		generating: isSubmitting,
		creating: isCreatingDraft
	};
	const proposalHistoryCapabilities = {
		canManage: canManageProposals,
		canCreate: canManageProposals && Boolean(selectedClientId)
	};
	const proposalWorkflow = {
		canManageProposals,
		isSubmitting,
		isCreatingDraft,
		isPreviewMode
	};
	const proposalViewState = {
		displayedLoadingState,
		isWizardOpen,
		isDeleteDialogOpen,
		isPresentationReady,
		isBootstrapping,
		submitted,
		canResumeSubmission,
		isRecheckingDeck,
		isFirstStep,
		isLastStep
	};
	const stepContent = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalStepContent, {
		stepId: step.id,
		formState,
		summary,
		validationErrors,
		onUpdateField: updateField,
		onToggleArrayValue: toggleArrayValue,
		onChangeSocialHandle: handleSocialHandleChange
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: isInitialLoading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalsPageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalsPageMainView, {
			wizardRef,
			submissionAnnouncement,
			clientName: selectedClient?.name ?? null,
			workflow: proposalWorkflow,
			viewState: proposalViewState,
			formState,
			draftId,
			selectedClientId,
			onApplyTemplate: handleSelectTemplate,
			onVersionRestored: handleVersionRestored,
			onStartProposal: isPreviewMode ? handleStartPreviewProposal : handleStartProposal,
			displayedProposals,
			displayedDraftId,
			proposalHistoryWorkflow,
			proposalHistoryCapabilities,
			proposalsQueryError,
			deletingProposalId,
			onRefresh: isPreviewMode ? handlePreviewRefresh : handleRefreshProposals,
			onResume: handleResumeProposalInModal,
			onRequestDelete: isPreviewMode ? handlePreviewRequestDelete : requestDeleteProposal,
			downloadingDeckId,
			onDownloadDeck: isPreviewMode ? handlePreviewDownloadDeck : handleDownloadDeck,
			onCreateNew: isPreviewMode ? handleStartPreviewProposal : handleStartProposal,
			proposalPendingDelete,
			onDeleteDialogChange: handleDeleteDialogChange,
			onConfirmDelete: handleConfirmDeleteProposal,
			activeDeckStage,
			onCloseWizard: handleCloseWizard,
			summary,
			presentationDeck,
			deckDownloadUrl,
			activeProposalIdForDeck,
			onResumeSubmission: handleContinueEditingInModal,
			onRecheckDeck: handleRecheckDeck,
			steps,
			currentStep,
			autosaveStatus,
			stepContent,
			onBack: handleBack,
			onNext: handleNext,
			onGoToStep: goToStep,
			validationMessages: Object.values(validationErrors)
		})
	});
}
function ProposalsPageContent() {
	const clientIdParam = useSearchParams().get("clientId");
	const { selectClient } = useClientContext();
	(0, import_react.useEffect)(() => {
		if (clientIdParam) selectClient(clientIdParam);
	}, [clientIdParam, selectClient]);
	return useProposalsPageContent();
}
var PROPOSALS_PAGE_SKELETON = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardSkeleton, {});
function ProposalsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMotionShell, {
		reveal: false,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: PROPOSALS_PAGE_SKELETON,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalsPageContent, {})
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalsPage, {});
//#endregion
export { SplitComponent as component };
