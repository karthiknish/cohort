import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, r as useConvexAuth, s as useAction, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Hn as DollarSign, Yt as LoaderCircle, cr as CircleAlert, dt as Play, rt as RefreshCw, w as Trash2, x as TrendingUp, yt as Pause } from "../_libs/lucide-react.mjs";
import { S as getCurrencyInfo, T as normalizeCurrencyCode, t as cn, w as isSupportedCurrency, x as formatMoney } from "./utils.mjs";
import "./motion.mjs";
import { t as Badge } from "./badge.mjs";
import { t as Button } from "./button.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card.mjs";
import { a as SkeletonTable, i as SkeletonList, n as SkeletonCard, r as SkeletonDashboardCard, t as Skeleton } from "./skeleton.mjs";
import { t as asErrorMessage } from "./convex-errors.mjs";
import { a as notifySuccess, c as reportConvexFailure, r as notifyFailure } from "./notifications.mjs";
import { i as useRouter } from "./navigation.mjs";
import { t as api } from "./api.mjs";
import { ct as isPreviewModeEnabled, i as useAuth, n as useClientContext, pt as withPreviewModeSearchParamIfEnabled } from "./client-context.mjs";
import { i as adsCampaignGroupsApi, o as adsCampaignsApi } from "./convex-api.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select.mjs";
import { n as DataTableColumnHeader, r as VirtualizedDataTable, t as Checkbox } from "./checkbox.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog.mjs";
import { t as Input } from "./input.mjs";
import { t as Label } from "./label.mjs";
import { a as EmptyState, i as FormField, o as NoDataEmptyState, t as metaDatetimeLocalToIso } from "./meta-datetime.mjs";
import { a as TabsList, i as TabsTrigger, t as Tabs } from "./tabs.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip.mjs";
import { t as ViewTransition } from "./view-transition.mjs";
import { l as toAdsProviderId } from "./utils2.mjs";
//#region src/shared/ui/spinner.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var sizeClasses = {
	xs: "size-3",
	sm: "size-4",
	md: "size-6",
	lg: "size-8",
	xl: "size-12"
};
var variantClasses = {
	default: "text-foreground",
	primary: "text-primary",
	muted: "text-muted-foreground"
};
function Spinner({ className, size = "md", variant = "default", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
		"aria-label": "Loading",
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: cn("animate-spin", sizeClasses[size], variantClasses[variant], className) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Loading…"
		})]
	});
}
//#endregion
//#region src/shared/ui/state-wrapper.tsx
function ErrorState({ title, description, onRetry, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		"aria-live": "assertive",
		className: cn("flex flex-col items-center justify-center py-12 px-4", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-14 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/5 mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-7 text-destructive" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold text-foreground",
				children: title || "Something went wrong"
			}),
			description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-sm text-sm text-muted-foreground text-center",
				children: description
			}),
			onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: onRetry,
				size: "sm",
				variant: "outline",
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 size-4" }), "Try again"]
			})
		]
	});
}
function LoadingState({ variant, message, rows, columns, items }) {
	if (variant === "spinner") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-live": "polite",
		"aria-busy": "true",
		className: "flex flex-col items-center justify-center py-12 px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {
			size: "lg",
			variant: "primary"
		}), message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted-foreground animate-pulse",
			children: message
		})]
	});
	if (variant === "overlay") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-live": "polite",
		"aria-busy": "true",
		className: "flex flex-col items-center justify-center inset-0 bg-background/50 backdrop-blur-sm z-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {
			size: "lg",
			variant: "primary"
		}), message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted-foreground animate-pulse",
			children: message
		})]
	});
	if (variant === "skeleton-table") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonTable, {
		rows,
		columns
	});
	if (variant === "skeleton-list") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonList, { items });
	if (variant === "skeleton-dashboard") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonDashboardCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonDashboardCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonDashboardCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonDashboardCard, {})
		]
	});
	if (variant === "skeleton-card") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkeletonCard, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-live": "polite",
		"aria-busy": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {})
	});
}
function resolveViewState({ state, isLoading, isEmpty, isError }) {
	if (state) return state;
	if (isError) return "error";
	if (isLoading) return "loading";
	if (isEmpty) return "empty";
	return "ready";
}
function StateWrapper({ state, isLoading = false, isEmpty = false, isError = false, children, loadingVariant = "spinner", loadingMessage, skeletonRows = 5, skeletonColumns = 4, skeletonItems = 5, emptyTitle, emptyDescription, emptyIcon, emptyAction, errorTitle, errorDescription, error, onRetry, className, contentClassName }) {
	const resolvedState = resolveViewState({
		state,
		isLoading,
		isEmpty,
		isError
	});
	if (resolvedState === "error") {
		const errorMessage = typeof error === "string" ? error : error?.message;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			title: errorTitle,
			description: errorDescription || errorMessage,
			onRetry,
			className
		});
	}
	if (resolvedState === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {
			variant: loadingVariant,
			message: loadingMessage,
			rows: skeletonRows,
			columns: skeletonColumns,
			items: skeletonItems
		})
	});
	if (resolvedState === "empty") {
		if (emptyIcon || emptyTitle) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: emptyIcon,
				title: emptyTitle || "No data",
				description: emptyDescription,
				action: emptyAction
			})
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoDataEmptyState, { action: emptyAction })
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: contentClassName,
		children
	});
}
//#endregion
//#region src/features/dashboard/ads/components/campaign-management-card-sections.tsx
function isActiveStatus(status) {
	const normalized = (status || "").toLowerCase();
	return normalized === "enabled" || normalized === "enable" || normalized === "active";
}
function isHistoricalCampaign(campaign) {
	return campaign.isHistorical === true;
}
function ActionTooltipButton({ actionLabel, buttonVariant = "outline", disabled, icon, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: buttonVariant,
			size: "sm",
			onClick,
			disabled,
			"aria-label": actionLabel,
			children: icon
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: actionLabel }) })] });
}
var pauseIcon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" });
var playIcon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" });
var dollarSignIcon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "size-4" });
var trendingUpIcon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" });
var trash2Icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" });
function CampaignRowActions({ actionLoading, biddingDisabled, biddingDisabledReason, campaign, onAction, onOpenBiddingDialog, onOpenBudgetDialog }) {
	const isActive = isActiveStatus(campaign.status);
	const isHistorical = isHistoricalCampaign(campaign);
	const historicalActionLabel = "Historical campaign rows are read-only";
	const handleToggleActive = (event) => {
		event.stopPropagation();
		onAction(campaign.id, isActive ? "pause" : "enable");
	};
	const handleOpenBudget = (event) => {
		event.stopPropagation();
		onOpenBudgetDialog(campaign);
	};
	const handleOpenBidding = (event) => {
		event.stopPropagation();
		onOpenBiddingDialog(campaign);
	};
	const handleRemove = (event) => {
		event.stopPropagation();
		onAction(campaign.id, "remove");
	};
	const toggleIcon = isActive ? pauseIcon : playIcon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-end gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTooltipButton, {
				actionLabel: isHistorical ? historicalActionLabel : isActive ? "Pause campaign" : "Enable campaign",
				disabled: isHistorical || actionLoading === campaign.id,
				icon: toggleIcon,
				onClick: handleToggleActive
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTooltipButton, {
				actionLabel: isHistorical ? historicalActionLabel : "Update budget",
				disabled: isHistorical || actionLoading === campaign.id,
				icon: dollarSignIcon,
				onClick: handleOpenBudget
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTooltipButton, {
				actionLabel: isHistorical ? historicalActionLabel : biddingDisabledReason ?? "Bidding strategy",
				disabled: isHistorical || actionLoading === campaign.id || Boolean(biddingDisabled),
				icon: trendingUpIcon,
				onClick: handleOpenBidding
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTooltipButton, {
				actionLabel: isHistorical ? historicalActionLabel : "Remove campaign",
				buttonVariant: "destructive",
				disabled: isHistorical || actionLoading === campaign.id,
				icon: trash2Icon,
				onClick: handleRemove
			})
		]
	}) });
}
function CampaignGroupRowActions({ actionLoading, group, onAction, onOpenBudgetDialog }) {
	const isActive = isActiveStatus(group.status);
	const handleToggleActive = (event) => {
		event.stopPropagation();
		onAction(group.id, isActive ? "pause" : "enable");
	};
	const handleOpenBudget = (event) => {
		event.stopPropagation();
		onOpenBudgetDialog(group);
	};
	const toggleIcon = isActive ? pauseIcon : playIcon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-end gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			onClick: handleToggleActive,
			disabled: actionLoading === group.id,
			"aria-label": isActive ? "Pause campaign group" : "Enable campaign group",
			children: toggleIcon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			onClick: handleOpenBudget,
			disabled: actionLoading === group.id,
			"aria-label": "Update campaign group budget",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "size-4" })
		})]
	});
}
function CampaignManagementHeader({ isRefreshing, onCreateCampaign, onRefresh, onViewChange, providerId, providerName, view }) {
	const handleViewChange = (value) => {
		onViewChange(value);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-row items-center justify-between gap-y-0 pb-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-lg",
					children: "Campaign Management"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
					"Manage ",
					providerName,
					" ",
					providerId === "linkedin" ? view === "groups" ? "campaign groups" : "campaigns" : "campaigns"
				] }),
				providerId === "linkedin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
					value: view,
					onValueChange: handleViewChange,
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid w-[300px] grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "campaigns",
							children: "Campaigns"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "groups",
							children: "Group (Ad Sets)"
						})]
					})
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [onCreateCampaign ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "default",
				size: "sm",
				onClick: onCreateCampaign,
				children: "New campaign"
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: onRefresh,
				disabled: isRefreshing,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `mr-2 size-4 ${isRefreshing ? "animate-spin" : ""}` }), "Refresh"]
			})]
		})]
	});
}
function CampaignManagementTableSection({ campaignColumns, campaigns, groupColumns, groups, groupsLoading, loading, onRowClick, providerName, view }) {
	const showingGroups = view === "groups";
	const tableData = showingGroups ? groups : campaigns;
	const handleRowClick = (row) => {
		onRowClick(row.id, row.name);
	};
	const getRowId = (row) => row.id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StateWrapper, {
		isLoading: loading || groupsLoading,
		loadingVariant: "skeleton-table",
		skeletonRows: 5,
		skeletonColumns: showingGroups ? 3 : 6,
		isEmpty: tableData.length === 0,
		emptyTitle: `No ${showingGroups ? "campaign groups" : "campaigns"} found`,
		emptyDescription: `Connect ${providerName} and create ${showingGroups ? "campaign groups" : "campaigns"} to see them here.`,
		children: showingGroups ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualizedDataTable, {
			columns: groupColumns,
			data: groups,
			maxHeight: 420,
			rowHeight: 48,
			onRowClick: handleRowClick,
			rowClassName: "cursor-pointer",
			getRowId
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VirtualizedDataTable, {
			columns: campaignColumns,
			data: campaigns,
			maxHeight: 420,
			rowHeight: 48,
			onRowClick: handleRowClick,
			rowClassName: "cursor-pointer",
			getRowId
		})
	});
}
function BudgetUpdateDialog({ currencyCode, currencyLabel, isSubmitting, onBudgetChange, onOpenChange, onSubmit, open, targetName, value }) {
	const handleBudgetChange = (event) => {
		onBudgetChange(event.target.value);
	};
	const handleCancel = () => {
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Update Budget" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: ["Update the budget for ", targetName] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
						htmlFor: "budget",
						children: [
							"New Budget (",
							currencyLabel,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "budget",
						type: "number",
						step: "0.01",
						value,
						onChange: handleBudgetChange,
						placeholder: `Enter new budget amount (${currencyCode})`
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: handleCancel,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: onSubmit,
				disabled: isSubmitting,
				children: "Update Budget"
			})] })
		] })
	});
}
function BiddingStrategyDialog({ isSubmitting, onChange, onOpenChange, onSubmit, open, selectedCampaignName, value }) {
	const handleTypeChange = (event) => {
		onChange({
			...value,
			type: event.target.value
		});
	};
	const handleValueChange = (event) => {
		onChange({
			...value,
			value: event.target.value
		});
	};
	const handleCancel = () => {
		onOpenChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Bidding Strategy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: ["Update bidding strategy for ", selectedCampaignName] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "biddingType",
						children: "Strategy Type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "biddingType",
						value: value.type,
						onChange: handleTypeChange,
						placeholder: "e.g. TARGET_CPA, MAXIMIZE_CONVERSIONS"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "biddingValue",
						children: "Target Value / Bid Ceiling"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "biddingValue",
						type: "number",
						step: "0.01",
						value: value.value,
						onChange: handleValueChange,
						placeholder: "0.00"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: handleCancel,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: onSubmit,
				disabled: isSubmitting,
				children: "Update Bidding"
			})] })
		] })
	});
}
function CampaignManagementDisconnectedTitle({ providerName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
		className: "text-lg",
		children: "Campaign Management"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
		"Connect ",
		providerName,
		" to manage campaigns"
	] })] });
}
function CampaignManagementSetupTitle({ providerName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
		className: "text-lg",
		children: "Campaign Management"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [
		"Finish ",
		providerName,
		" setup before loading campaigns"
	] })] });
}
function CampaignManagementDialogs({ actionLoading, biddingDialogOpen, budgetDialogOpen, newBidding, newBudget, onBiddingChange, onBiddingOpenChange, onBudgetChange, onBudgetOpenChange, onSubmitBidding, onSubmitBudget, selectedCampaignName, selectedCurrencyCode, selectedCurrencyLabel, selectedTargetName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetUpdateDialog, {
		currencyCode: selectedCurrencyCode,
		currencyLabel: selectedCurrencyLabel,
		isSubmitting: actionLoading !== null,
		onBudgetChange,
		onOpenChange: onBudgetOpenChange,
		onSubmit: onSubmitBudget,
		open: budgetDialogOpen,
		targetName: selectedTargetName,
		value: newBudget
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BiddingStrategyDialog, {
		isSubmitting: actionLoading !== null,
		onChange: onBiddingChange,
		onOpenChange: onBiddingOpenChange,
		onSubmit: onSubmitBidding,
		open: biddingDialogOpen,
		selectedCampaignName,
		value: newBidding
	})] });
}
function CampaignManagementDisconnectedState({ providerName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignManagementDisconnectedTitle, { providerName }) }) });
}
function CampaignManagementSetupState({ onSetupAction, providerName, setupActionLabel, setupDescription, setupTitle }) {
	const action = onSetupAction ? {
		label: setupActionLabel ?? "Complete setup",
		onClick: onSetupAction
	} : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignManagementSetupTitle, { providerName }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		icon: CircleAlert,
		variant: "default",
		title: setupTitle ?? `Complete ${providerName} setup`,
		description: setupDescription ?? `Finish the remaining ${providerName} configuration step before loading campaigns and controls.`,
		action,
		className: "py-10"
	}) })] });
}
function CampaignManagementConnectedView({ actionLoading, biddingDialogOpen, budgetDialogOpen, campaignColumns, campaigns, error, groupColumns, groups, groupsLoading, loading, newBidding, newBudget, onBiddingChange, onBiddingOpenChange, onBudgetChange, onBudgetOpenChange, onCreateCampaign, onRefresh, onRowClick, onSubmitBidding, onSubmitBudget, onViewChange, providerId, providerName, selectedCampaignName, selectedCurrencyCode, selectedCurrencyLabel, selectedTargetName, view }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 shrink-0" }), error]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "w-full",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignManagementHeader, {
				isRefreshing: loading || groupsLoading,
				onCreateCampaign,
				onRefresh,
				onViewChange,
				providerId,
				providerName,
				view
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignManagementTableSection, {
				campaignColumns,
				campaigns,
				groupColumns,
				groups,
				groupsLoading,
				loading,
				onRowClick,
				providerName,
				view
			}) })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignManagementDialogs, {
			actionLoading,
			biddingDialogOpen,
			budgetDialogOpen,
			newBidding,
			newBudget,
			onBiddingChange,
			onBiddingOpenChange,
			onBudgetChange,
			onBudgetOpenChange,
			onSubmitBidding,
			onSubmitBudget,
			selectedCampaignName,
			selectedCurrencyCode,
			selectedCurrencyLabel,
			selectedTargetName
		})
	] });
}
//#endregion
//#region src/features/dashboard/ads/components/campaign-management-card-state.ts
var INITIAL_CAMPAIGN_MANAGEMENT_STATE = {
	campaigns: [],
	loading: false,
	actionLoading: null,
	budgetDialogOpen: false,
	biddingDialogOpen: false,
	selectedCampaign: null,
	selectedGroup: null,
	newBudget: "",
	newBidding: {
		type: "",
		value: ""
	},
	view: "campaigns",
	groups: [],
	groupsLoading: false
};
function campaignManagementReducer(state, action) {
	switch (action.type) {
		case "setCampaigns": return {
			...state,
			campaigns: action.campaigns
		};
		case "setLoading": return {
			...state,
			loading: action.loading
		};
		case "setActionLoading": return {
			...state,
			actionLoading: action.actionLoading
		};
		case "openCampaignBudgetDialog": return {
			...state,
			selectedGroup: null,
			selectedCampaign: action.campaign,
			newBudget: action.campaign.budget?.toString() || "",
			budgetDialogOpen: true
		};
		case "openGroupBudgetDialog": return {
			...state,
			selectedCampaign: null,
			selectedGroup: action.group,
			newBudget: action.group.totalBudget?.toString() || "",
			budgetDialogOpen: true
		};
		case "setBudgetDialogOpen": return {
			...state,
			budgetDialogOpen: action.open
		};
		case "resetBudgetDialog": return {
			...state,
			budgetDialogOpen: false,
			selectedCampaign: null,
			selectedGroup: null,
			newBudget: ""
		};
		case "openCampaignBiddingDialog": return {
			...state,
			selectedGroup: null,
			selectedCampaign: action.campaign,
			newBidding: {
				type: action.campaign.biddingStrategy?.type || "",
				value: (action.campaign.biddingStrategy?.targetCpa || action.campaign.biddingStrategy?.targetRoas || action.campaign.biddingStrategy?.bidCeiling || 0).toString()
			},
			biddingDialogOpen: true
		};
		case "setBiddingDialogOpen": return {
			...state,
			biddingDialogOpen: action.open
		};
		case "closeBiddingDialog": return {
			...state,
			biddingDialogOpen: false,
			selectedCampaign: null
		};
		case "setNewBudget": return {
			...state,
			newBudget: action.newBudget
		};
		case "setNewBidding": return {
			...state,
			newBidding: action.newBidding
		};
		case "setView": return {
			...state,
			view: action.view
		};
		case "setGroups": return {
			...state,
			groups: action.groups
		};
		case "setGroupsLoading": return {
			...state,
			groupsLoading: action.groupsLoading
		};
		default: return state;
	}
}
//#endregion
//#region src/features/dashboard/ads/components/campaign-management-card-date-utils.ts
function formatRelativeDate(date) {
	const now = /* @__PURE__ */ new Date();
	const diffTime = date.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	if (diffDays === -1) return "Yesterday";
	if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
	if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
	return date.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : void 0
	});
}
function formatCampaignDateRange(startTime, stopTime) {
	const now = /* @__PURE__ */ new Date();
	const start = startTime ? new Date(startTime) : null;
	const stop = stopTime ? new Date(stopTime) : null;
	const hasStart = Boolean(start && !Number.isNaN(start.getTime()));
	const hasStop = Boolean(stop && !Number.isNaN(stop.getTime()));
	if (!hasStart && !hasStop) return "Always running";
	if (hasStart && !hasStop) {
		const validStart = start;
		if (validStart > now) return `Starts ${formatRelativeDate(validStart)}`;
		return `Since ${formatRelativeDate(validStart)}`;
	}
	if (!hasStart && hasStop) {
		const validStop = stop;
		if (validStop > now) return `Until ${formatRelativeDate(validStop)}`;
		return `Ended ${formatRelativeDate(validStop)}`;
	}
	const validStart = start;
	const validStop = stop;
	const startStr = validStart.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
	const endStr = validStop.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
	if (validStart > now) return `${startStr} - ${endStr}`;
	if (validStop < now) return `Ended ${formatRelativeDate(validStop)}`;
	return `${startStr} - ${endStr}`;
}
//#endregion
//#region src/features/dashboard/ads/components/campaign-management-card-status-badge.tsx
function CampaignStatusBadge({ status }) {
	const statusLower = status.toLowerCase();
	if (statusLower === "enabled" || statusLower === "enable" || statusLower === "active") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "default",
		className: "bg-success",
		children: "Active"
	});
	if (statusLower === "paused" || statusLower === "disable") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "secondary",
		children: "Paused"
	});
	if (statusLower === "removed" || statusLower === "archived" || statusLower === "delete") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "destructive",
		children: "Removed"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		children: status
	});
}
//#endregion
//#region src/features/dashboard/ads/components/campaign-management-card-table-context.tsx
var CampaignManagementActionContext = (0, import_react.createContext)(null);
function useCampaignManagementActions() {
	const context = (0, import_react.use)(CampaignManagementActionContext);
	if (!context) throw new Error("CampaignManagementActionContext is missing");
	return context;
}
//#endregion
//#region src/features/dashboard/ads/components/campaign-management-card-table-cells.tsx
function CampaignNameHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Name"
	});
}
function CampaignNameCell({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
		name: `campaign-title-${row.original.providerId}-${row.original.id}`,
		share: "text-morph",
		default: "none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium hover:underline",
				children: row.getValue("name")
			}), row.original.isHistorical ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
				children: "Historical"
			}) : null]
		})
	});
}
function CampaignStatusHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Status"
	});
}
function CampaignStatusCell({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewTransition, {
		name: `campaign-status-${row.original.providerId}-${row.original.id}`,
		share: "morph",
		default: "none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignStatusBadge, { status: String(row.getValue("status")) })
	});
}
function CampaignRunsCell({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-sm text-muted-foreground",
		children: formatCampaignDateRange(row.original.startTime, row.original.stopTime)
	});
}
function CampaignBudgetHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Budget"
	});
}
function CampaignBudgetCell({ row }) {
	const budget = row.getValue("budget");
	if (budget === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted-foreground",
		children: "-"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
		formatMoney(budget, row.original.currency),
		"/",
		row.original.budgetType || "day"
	] });
}
function CampaignObjectiveHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Objective"
	});
}
function CampaignObjectiveCell({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "capitalize text-sm text-muted-foreground",
		children: row.getValue("objective")?.toLowerCase().replace(/_/g, " ") || "-"
	});
}
function CampaignActionsHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-right",
		children: "Actions"
	});
}
function CampaignActionsCell({ row }) {
	const { actionLoading, handleAction, openCampaignBiddingDialog, openCampaignBudgetDialog } = useCampaignManagementActions();
	const isTikTok = toAdsProviderId(row.original.providerId) === "tiktok";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignRowActions, {
		actionLoading,
		biddingDisabled: isTikTok,
		biddingDisabledReason: isTikTok ? "TikTok bidding is managed in TikTok Ads Manager (ad group level)" : void 0,
		campaign: row.original,
		onAction: handleAction,
		onOpenBiddingDialog: openCampaignBiddingDialog,
		onOpenBudgetDialog: openCampaignBudgetDialog
	});
}
function GroupNameHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Name"
	});
}
function GroupNameCell({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-medium hover:underline",
		children: row.getValue("name")
	});
}
function GroupStatusHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Status"
	});
}
function GroupStatusCell({ row }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignStatusBadge, { status: String(row.getValue("status")) });
}
function GroupBudgetHeader({ column }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableColumnHeader, {
		column,
		title: "Budget"
	});
}
function GroupBudgetCell({ row }) {
	const budget = row.getValue("totalBudget");
	if (budget === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted-foreground",
		children: "-"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [formatMoney(budget, row.original.currency), " total"] });
}
function GroupActionsHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-right",
		children: "Actions"
	});
}
function GroupActionsCell({ row }) {
	const { actionLoading, handleGroupAction, openGroupBudgetDialog } = useCampaignManagementActions();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignGroupRowActions, {
		actionLoading,
		group: row.original,
		onAction: handleGroupAction,
		onOpenBudgetDialog: openGroupBudgetDialog
	});
}
//#endregion
//#region src/features/dashboard/ads/components/campaign-management-card-columns.ts
function buildCampaignColumns() {
	return [
		{
			accessorKey: "name",
			header: CampaignNameHeader,
			cell: CampaignNameCell
		},
		{
			accessorKey: "status",
			header: CampaignStatusHeader,
			cell: CampaignStatusCell
		},
		{
			id: "runs",
			header: "Runs",
			cell: CampaignRunsCell
		},
		{
			accessorKey: "budget",
			header: CampaignBudgetHeader,
			cell: CampaignBudgetCell
		},
		{
			accessorKey: "objective",
			header: CampaignObjectiveHeader,
			cell: CampaignObjectiveCell
		},
		{
			id: "actions",
			header: CampaignActionsHeader,
			cell: CampaignActionsCell
		}
	];
}
function buildGroupColumns() {
	return [
		{
			accessorKey: "name",
			header: GroupNameHeader,
			cell: GroupNameCell
		},
		{
			accessorKey: "status",
			header: GroupStatusHeader,
			cell: GroupStatusCell
		},
		{
			accessorKey: "totalBudget",
			header: GroupBudgetHeader,
			cell: GroupBudgetCell
		},
		{
			id: "actions",
			header: GroupActionsHeader,
			cell: GroupActionsCell
		}
	];
}
//#endregion
//#region src/lib/meta-special-ad-categories.ts
/** Meta Marketing API `special_ad_categories` values (v25+). */
var META_SPECIAL_AD_CATEGORIES = [
	{
		value: "NONE",
		label: "None (standard ads)"
	},
	{
		value: "HOUSING",
		label: "Housing"
	},
	{
		value: "EMPLOYMENT",
		label: "Employment"
	},
	{
		value: "CREDIT",
		label: "Credit"
	},
	{
		value: "ISSUES_ELECTIONS_POLITICS",
		label: "Social issues, elections, or politics"
	}
];
function normalizeMetaSpecialAdCategoriesForApi(selected) {
	const withoutNone = selected.filter((value) => value !== "NONE");
	return withoutNone.length > 0 ? withoutNone : [];
}
//#endregion
//#region src/features/dashboard/ads/components/create-meta-campaign-dialog.tsx
var META_OBJECTIVES = [
	{
		value: "OUTCOME_TRAFFIC",
		label: "Traffic"
	},
	{
		value: "OUTCOME_LEADS",
		label: "Leads"
	},
	{
		value: "OUTCOME_SALES",
		label: "Sales"
	},
	{
		value: "OUTCOME_AWARENESS",
		label: "Awareness"
	},
	{
		value: "OUTCOME_ENGAGEMENT",
		label: "Engagement"
	}
];
function createInitialCreateMetaCampaignState() {
	return {
		name: "",
		objective: META_OBJECTIVES[0].value,
		dailyBudget: "",
		startTime: "",
		stopTime: "",
		specialAdCategories: ["NONE"],
		loading: false
	};
}
function createMetaCampaignReducer(state, action) {
	switch (action.type) {
		case "setName": return {
			...state,
			name: action.value
		};
		case "setObjective": return {
			...state,
			objective: action.value
		};
		case "setDailyBudget": return {
			...state,
			dailyBudget: action.value
		};
		case "setStartTime": return {
			...state,
			startTime: action.value
		};
		case "setStopTime": return {
			...state,
			stopTime: action.value
		};
		case "toggleSpecialAdCategory": {
			const value = action.value;
			if (value === "NONE") return {
				...state,
				specialAdCategories: ["NONE"]
			};
			const withoutNone = state.specialAdCategories.filter((item) => item !== "NONE");
			const next = withoutNone.includes(value) ? withoutNone.filter((item) => item !== value) : [...withoutNone, value];
			return {
				...state,
				specialAdCategories: next.length > 0 ? next : ["NONE"]
			};
		}
		case "setLoading": return {
			...state,
			loading: action.value
		};
		case "resetAfterCreate": return {
			...state,
			name: "",
			dailyBudget: ""
		};
		default: return state;
	}
}
function CreateMetaCampaignDialog({ open, onOpenChange, onCreated }) {
	const { user } = useAuth();
	const { selectedClientId } = useClientContext();
	const createMetaCampaign = useAction(adsCampaignsApi.createMetaCampaign);
	const [state, dispatch] = (0, import_react.useReducer)(createMetaCampaignReducer, void 0, createInitialCreateMetaCampaignState);
	const { name, objective, dailyBudget, startTime, stopTime, specialAdCategories, loading } = state;
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const handleSubmit = async () => {
		if (!workspaceId || !name.trim()) return;
		dispatch({
			type: "setLoading",
			value: true
		});
		try {
			await createMetaCampaign({
				workspaceId,
				providerId: "facebook",
				clientId: selectedClientId,
				name: name.trim(),
				objective,
				status: "PAUSED",
				dailyBudget: dailyBudget ? Number(dailyBudget) : void 0,
				startTime: metaDatetimeLocalToIso(startTime),
				stopTime: metaDatetimeLocalToIso(stopTime),
				specialAdCategories: normalizeMetaSpecialAdCategoriesForApi(specialAdCategories)
			});
			notifySuccess({
				title: "Campaign created",
				message: `"${name.trim()}" is paused in Meta — add ad sets next.`
			});
			dispatch({ type: "resetAfterCreate" });
			onOpenChange(false);
			onCreated?.();
		} catch (error) {
			reportConvexFailure({
				error,
				context: "CreateMetaCampaignDialog",
				title: "Could not create campaign",
				fallbackMessage: asErrorMessage(error)
			});
		}
		dispatch({
			type: "setLoading",
			value: false
		});
	};
	const handleNameChange = (event) => {
		dispatch({
			type: "setName",
			value: event.target.value
		});
	};
	const handleDailyBudgetChange = (event) => {
		dispatch({
			type: "setDailyBudget",
			value: event.target.value
		});
	};
	const handleStartTimeChange = (event) => {
		dispatch({
			type: "setStartTime",
			value: event.target.value
		});
	};
	const handleStopTimeChange = (event) => {
		dispatch({
			type: "setStopTime",
			value: event.target.value
		});
	};
	const handleObjectiveChange = (value) => {
		dispatch({
			type: "setObjective",
			value
		});
	};
	const handleSpecialAdCategoryToggle = (value) => {
		return () => {
			dispatch({
				type: "toggleSpecialAdCategory",
				value
			});
		};
	};
	const handleCancel = () => {
		onOpenChange(false);
	};
	const handleSubmitClick = () => {
		handleSubmit();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Meta campaign" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Creates a classic (non Advantage+) campaign in your connected ad account. Add ad sets on the campaign page." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
							id: "meta-campaign-name",
							label: "Campaign name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "meta-campaign-name",
								value: name,
								onChange: handleNameChange,
								placeholder: "Spring promo"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
							id: "meta-campaign-objective",
							label: "Objective",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: objective,
								onValueChange: handleObjectiveChange,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									id: "meta-campaign-objective",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: META_OBJECTIVES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: item.value,
									children: item.label
								}, item.value)) })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
							id: "meta-campaign-special-categories",
							label: "Special ad categories",
							description: "Required by Meta. Select only if this campaign promotes housing, employment, credit, or political content.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-2 rounded-lg border border-border/60 p-3",
								children: META_SPECIAL_AD_CATEGORIES.map((item) => {
									const checked = specialAdCategories.includes(item.value);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
											id: `meta-special-${item.value}`,
											checked,
											onCheckedChange: handleSpecialAdCategoryToggle(item.value)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: `meta-special-${item.value}`,
											className: "text-sm font-normal leading-snug",
											children: item.label
										})]
									}, item.value);
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
							id: "meta-campaign-budget",
							label: "Daily budget (optional)",
							description: "Account currency",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "meta-campaign-budget",
								type: "number",
								min: 1,
								value: dailyBudget,
								onChange: handleDailyBudgetChange,
								placeholder: "50"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
								id: "meta-campaign-start",
								label: "Start (optional)",
								description: "Local time — saved as UTC for Meta",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "meta-campaign-start",
									type: "datetime-local",
									value: startTime,
									onChange: handleStartTimeChange
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormField, {
								id: "meta-campaign-stop",
								label: "End (optional)",
								description: "Local time — saved as UTC for Meta",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "meta-campaign-stop",
									type: "datetime-local",
									value: stopTime,
									onChange: handleStopTimeChange
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: handleCancel,
					disabled: loading,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: handleSubmitClick,
					disabled: loading || !name.trim(),
					children: loading ? "Creating…" : "Create campaign"
				})] })
			]
		})
	});
}
//#endregion
//#region src/features/dashboard/ads/components/use-campaign-management-card.tsx
function toIsoDateOnly(date) {
	return date.toISOString().split("T")[0] ?? "";
}
function buildHistoricalCampaigns(metrics, providerId) {
	if (!Array.isArray(metrics) || metrics.length === 0) return [];
	const historicalCampaignMap = /* @__PURE__ */ new Map();
	metrics.forEach((metric) => {
		const campaignId = typeof metric.campaignId === "string" ? metric.campaignId.trim() : "";
		if (!campaignId) return;
		const campaignName = typeof metric.campaignName === "string" ? metric.campaignName.trim() : "";
		const existing = historicalCampaignMap.get(campaignId);
		if (!existing) {
			historicalCampaignMap.set(campaignId, {
				id: campaignId,
				name: campaignName || campaignId,
				campaignName: campaignName || void 0,
				providerId,
				status: "Historical",
				currency: metric.currency ?? void 0,
				startTime: metric.date,
				stopTime: metric.date,
				isHistorical: true
			});
			return;
		}
		if (!existing.currency && metric.currency) existing.currency = metric.currency;
		if (!existing.campaignName && campaignName) {
			existing.campaignName = campaignName;
			existing.name = campaignName;
		}
		if (!existing.startTime || metric.date < existing.startTime) existing.startTime = metric.date;
		if (!existing.stopTime || metric.date > existing.stopTime) existing.stopTime = metric.date;
	});
	return Array.from(historicalCampaignMap.values()).sort((left, right) => (right.stopTime ?? "").localeCompare(left.stopTime ?? ""));
}
function mergeCampaigns(liveCampaigns, historicalCampaigns) {
	if (historicalCampaigns.length === 0) return liveCampaigns;
	if (liveCampaigns.length === 0) return historicalCampaigns;
	const merged = /* @__PURE__ */ new Map();
	liveCampaigns.forEach((campaign) => {
		merged.set(campaign.id, campaign);
	});
	historicalCampaigns.forEach((campaign) => {
		if (!merged.has(campaign.id)) merged.set(campaign.id, campaign);
	});
	return Array.from(merged.values());
}
function useCampaignManagementCard(props) {
	const { providerId, providerName, isConnected, dateRange, onRefresh, setupRequired = false, setupTitle, setupDescription, setupActionLabel, onSetupAction } = props;
	const { selectedClientId } = useClientContext();
	const { user } = useAuth();
	const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
	const workspaceId = user?.agencyId ? String(user.agencyId) : null;
	const canQueryConvex = isAuthenticated && !convexAuthLoading && Boolean(user?.id);
	const { push } = useRouter();
	const listCampaigns = useAction(adsCampaignsApi.listCampaigns);
	const updateCampaign = useAction(adsCampaignsApi.updateCampaign);
	const listCampaignGroups = useAction(adsCampaignGroupsApi.listCampaignGroups);
	const updateCampaignGroup = useAction(adsCampaignGroupsApi.updateCampaignGroup);
	const [state, dispatch] = (0, import_react.useReducer)(campaignManagementReducer, INITIAL_CAMPAIGN_MANAGEMENT_STATE);
	const [metaCreateOpen, setMetaCreateOpen] = (0, import_react.useState)(false);
	const adsProviderId = toAdsProviderId(providerId);
	const isMetaProvider = adsProviderId === "facebook";
	const { campaigns, loading, actionLoading, budgetDialogOpen, biddingDialogOpen, selectedCampaign, selectedGroup, newBudget, newBidding, view, groups, groupsLoading } = state;
	const startDate = toIsoDateOnly(dateRange.start);
	const endDate = toIsoDateOnly(dateRange.end);
	const historicalMetrics = useQuery(api.adsMetrics.listMetrics, !isConnected || setupRequired || !workspaceId || !canQueryConvex ? "skip" : {
		workspaceId,
		clientId: selectedClientId ?? null,
		providerIds: [adsProviderId],
		startDate,
		endDate,
		limit: 2e3
	});
	const historicalMetricsQueryError = useConvexQueryError({
		data: historicalMetrics,
		skipped: !isConnected || setupRequired || !workspaceId || !canQueryConvex,
		fallbackMessage: "Unable to load historical campaign metrics."
	});
	const historicalCampaigns = (0, import_react.useMemo)(() => buildHistoricalCampaigns(historicalMetrics, adsProviderId), [historicalMetrics, adsProviderId]);
	const selectedBudgetTarget = selectedGroup ?? selectedCampaign;
	const selectedCurrencyCode = normalizeCurrencyCode(selectedBudgetTarget?.currency);
	const selectedCurrencyInfo = isSupportedCurrency(selectedCurrencyCode) ? getCurrencyInfo(selectedCurrencyCode) : null;
	const selectedCurrencyLabel = selectedCurrencyInfo ? `${selectedCurrencyInfo.symbol} ${selectedCurrencyCode}` : selectedCurrencyCode;
	const openCampaignBudgetDialog = (0, import_react.useCallback)((campaign) => {
		dispatch({
			type: "openCampaignBudgetDialog",
			campaign
		});
	}, []);
	const openGroupBudgetDialog = (0, import_react.useCallback)((group) => {
		dispatch({
			type: "openGroupBudgetDialog",
			group
		});
	}, []);
	const openCampaignBiddingDialog = (0, import_react.useCallback)((campaign) => {
		dispatch({
			type: "openCampaignBiddingDialog",
			campaign
		});
	}, []);
	const fetchCampaigns = (0, import_react.useCallback)(async () => {
		if (!isConnected || setupRequired || !canQueryConvex) return;
		dispatch({
			type: "setLoading",
			loading: true
		});
		if (!workspaceId) {
			dispatch({
				type: "setLoading",
				loading: false
			});
			return;
		}
		await listCampaigns({
			workspaceId,
			providerId: adsProviderId,
			clientId: selectedClientId ?? null
		}).then((result) => {
			dispatch({
				type: "setCampaigns",
				campaigns: mergeCampaigns(Array.isArray(result) ? result : [], historicalCampaigns)
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CampaignManagementCard:fetchCampaigns",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			dispatch({
				type: "setLoading",
				loading: false
			});
		});
	}, [
		isConnected,
		setupRequired,
		canQueryConvex,
		workspaceId,
		listCampaigns,
		adsProviderId,
		selectedClientId,
		historicalCampaigns
	]);
	const fetchGroups = (0, import_react.useCallback)(async () => {
		if (!isConnected || setupRequired || adsProviderId !== "linkedin" || !canQueryConvex) return;
		dispatch({
			type: "setGroupsLoading",
			groupsLoading: true
		});
		if (!workspaceId) {
			dispatch({
				type: "setGroupsLoading",
				groupsLoading: false
			});
			return;
		}
		await listCampaignGroups({
			workspaceId,
			providerId: "linkedin",
			clientId: selectedClientId ?? null
		}).then((result) => {
			dispatch({
				type: "setGroups",
				groups: Array.isArray(result) ? result : []
			});
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CampaignManagementCard:fetchGroups",
				title: "Could not load campaign groups",
				fallbackMessage: "Could not load campaign groups"
			});
		}).finally(() => {
			dispatch({
				type: "setGroupsLoading",
				groupsLoading: false
			});
		});
	}, [
		isConnected,
		setupRequired,
		adsProviderId,
		canQueryConvex,
		workspaceId,
		listCampaignGroups,
		selectedClientId
	]);
	const handleRefresh = () => {
		if (view === "groups") {
			fetchGroups();
			return;
		}
		fetchCampaigns();
	};
	const handleMetaCampaignCreated = () => {
		fetchCampaigns();
	};
	const handleOpenMetaCreateDialog = () => {
		setMetaCreateOpen(true);
	};
	(0, import_react.useEffect)(() => {
		if (!isConnected || setupRequired || !workspaceId || !canQueryConvex) return;
		fetchCampaigns();
		if (adsProviderId === "linkedin") fetchGroups();
	}, [
		adsProviderId,
		canQueryConvex,
		isConnected,
		setupRequired,
		workspaceId,
		fetchCampaigns,
		fetchGroups
	]);
	const openInsightsPage = (campaignOrGroupId, name) => {
		const params = new URLSearchParams({
			startDate,
			endDate
		});
		if (selectedClientId) params.set("clientId", selectedClientId);
		params.set("campaignName", name);
		push(withPreviewModeSearchParamIfEnabled(`/dashboard/ads/campaigns/${adsProviderId}/${campaignOrGroupId}?${params.toString()}`, isPreviewModeEnabled()), { transitionTypes: ["nav-forward"] });
	};
	const handleAction = (0, import_react.useCallback)(async (campaignId, action) => {
		dispatch({
			type: "setActionLoading",
			actionLoading: campaignId
		});
		if (!workspaceId) {
			notifyFailure({
				title: "Error",
				message: "Sign in required"
			});
			dispatch({
				type: "setActionLoading",
				actionLoading: null
			});
			return;
		}
		await updateCampaign({
			workspaceId,
			providerId: adsProviderId,
			clientId: selectedClientId ?? null,
			campaignId,
			action
		}).then(() => {
			notifySuccess({
				title: "Success",
				message: `Campaign ${action}d successfully`
			});
			fetchCampaigns();
			onRefresh?.();
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CampaignManagementCard:handleAction",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			dispatch({
				type: "setActionLoading",
				actionLoading: null
			});
		});
	}, [
		workspaceId,
		adsProviderId,
		selectedClientId,
		updateCampaign,
		fetchCampaigns,
		onRefresh
	]);
	const handleGroupAction = (0, import_react.useCallback)(async (groupId, action) => {
		dispatch({
			type: "setActionLoading",
			actionLoading: groupId
		});
		if (!workspaceId) {
			notifyFailure({
				title: "Error",
				message: "Sign in required"
			});
			dispatch({
				type: "setActionLoading",
				actionLoading: null
			});
			return;
		}
		await updateCampaignGroup({
			workspaceId,
			providerId: "linkedin",
			clientId: selectedClientId ?? null,
			campaignGroupId: groupId,
			action
		}).then(() => {
			notifySuccess({
				title: "Success",
				message: `Campaign Group ${action}d successfully`
			});
			fetchGroups();
			onRefresh?.();
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CampaignManagementCard:handleGroupAction",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			dispatch({
				type: "setActionLoading",
				actionLoading: null
			});
		});
	}, [
		workspaceId,
		selectedClientId,
		updateCampaignGroup,
		fetchGroups,
		onRefresh
	]);
	const handleBudgetUpdate = async () => {
		const isGroup = view === "groups";
		const targetId = isGroup ? selectedGroup?.id : selectedCampaign?.id;
		if (!targetId || !newBudget) return;
		dispatch({
			type: "setActionLoading",
			actionLoading: targetId
		});
		const parsedBudget = parseFloat(newBudget);
		if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
			notifyFailure({
				title: "Invalid budget",
				message: "Enter a valid budget amount greater than 0."
			});
			dispatch({
				type: "setActionLoading",
				actionLoading: null
			});
			return;
		}
		if (!workspaceId) {
			notifyFailure({
				title: "Error",
				message: "Sign in required"
			});
			dispatch({
				type: "setActionLoading",
				actionLoading: null
			});
			return;
		}
		await (isGroup ? updateCampaignGroup({
			workspaceId,
			providerId: "linkedin",
			clientId: selectedClientId ?? null,
			campaignGroupId: targetId,
			action: "updateBudget",
			budget: parsedBudget
		}) : updateCampaign({
			workspaceId,
			providerId: adsProviderId,
			clientId: selectedClientId ?? null,
			campaignId: targetId,
			action: "updateBudget",
			budget: parsedBudget
		})).then(() => {
			notifySuccess({
				title: "Success",
				message: "Budget updated successfully"
			});
			dispatch({ type: "resetBudgetDialog" });
			if (isGroup) fetchGroups();
			else fetchCampaigns();
			onRefresh?.();
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CampaignManagementCard:handleBudgetUpdate",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			dispatch({
				type: "setActionLoading",
				actionLoading: null
			});
		});
	};
	const handleBiddingUpdate = async () => {
		if (!selectedCampaign || !newBidding.type) return;
		dispatch({
			type: "setActionLoading",
			actionLoading: selectedCampaign.id
		});
		if (!workspaceId) {
			notifyFailure({
				title: "Error",
				message: "Sign in required"
			});
			dispatch({
				type: "setActionLoading",
				actionLoading: null
			});
			return;
		}
		await updateCampaign({
			workspaceId,
			providerId: adsProviderId,
			clientId: selectedClientId ?? null,
			campaignId: selectedCampaign.id,
			action: "updateBidding",
			biddingType: newBidding.type,
			biddingValue: parseFloat(newBidding.value || "0")
		}).then(() => {
			notifySuccess({
				title: "Success",
				message: "Bidding strategy updated successfully"
			});
			dispatch({ type: "closeBiddingDialog" });
			fetchCampaigns();
			onRefresh?.();
		}).catch((error) => {
			reportConvexFailure({
				error,
				context: "CampaignManagementCard:handleBiddingUpdate",
				title: "Error",
				fallbackMessage: "Error"
			});
		}).finally(() => {
			dispatch({
				type: "setActionLoading",
				actionLoading: null
			});
		});
	};
	const handleBiddingChange = (value) => {
		dispatch({
			type: "setNewBidding",
			newBidding: value
		});
	};
	const handleBiddingOpenChange = (open) => {
		dispatch({
			type: "setBiddingDialogOpen",
			open
		});
	};
	const handleBudgetChange = (value) => {
		dispatch({
			type: "setNewBudget",
			newBudget: value
		});
	};
	const handleBudgetOpenChange = (open) => {
		dispatch({
			type: "setBudgetDialogOpen",
			open
		});
	};
	const handleViewChange = (nextView) => {
		dispatch({
			type: "setView",
			view: nextView
		});
	};
	const actionContextValue = (0, import_react.useMemo)(() => ({
		actionLoading,
		handleAction,
		openCampaignBiddingDialog,
		openCampaignBudgetDialog,
		handleGroupAction,
		openGroupBudgetDialog
	}), [
		actionLoading,
		handleAction,
		openCampaignBiddingDialog,
		openCampaignBudgetDialog,
		handleGroupAction,
		openGroupBudgetDialog
	]);
	const campaignColumns = buildCampaignColumns();
	const groupColumns = buildGroupColumns();
	if (!isConnected) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignManagementDisconnectedState, { providerName });
	if (setupRequired) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignManagementSetupState, {
		onSetupAction,
		providerName,
		setupActionLabel,
		setupDescription,
		setupTitle
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CampaignManagementActionContext.Provider, {
		value: actionContextValue,
		children: [isMetaProvider ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateMetaCampaignDialog, {
			open: metaCreateOpen,
			onOpenChange: setMetaCreateOpen,
			onCreated: handleMetaCampaignCreated
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignManagementConnectedView, {
			actionLoading,
			biddingDialogOpen,
			budgetDialogOpen,
			campaignColumns,
			campaigns,
			error: historicalMetricsQueryError,
			groupColumns,
			groups,
			groupsLoading,
			loading,
			newBidding,
			newBudget,
			onBiddingChange: handleBiddingChange,
			onBiddingOpenChange: handleBiddingOpenChange,
			onBudgetChange: handleBudgetChange,
			onBudgetOpenChange: handleBudgetOpenChange,
			onCreateCampaign: isMetaProvider ? handleOpenMetaCreateDialog : void 0,
			onRefresh: handleRefresh,
			onRowClick: openInsightsPage,
			onSubmitBidding: handleBiddingUpdate,
			onSubmitBudget: handleBudgetUpdate,
			onViewChange: handleViewChange,
			providerId,
			providerName,
			selectedCampaignName: selectedCampaign?.name,
			selectedCurrencyCode,
			selectedCurrencyLabel,
			selectedTargetName: selectedBudgetTarget?.name,
			view
		})]
	});
}
//#endregion
//#region src/features/dashboard/ads/components/campaign-management-card.tsx
function CampaignManagementCard(props) {
	return useCampaignManagementCard(props);
}
//#endregion
export { CampaignManagementCard };
