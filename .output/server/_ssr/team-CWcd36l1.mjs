import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { p as getPreviewAdminClients, y as getPreviewAdminUsers } from "./preview-data-CXkRNfsX.mjs";
import { c as cn, d as formatDate$1, n as DATE_FORMATS } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { a as notifyInfo, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { t as usePaginatedQuery } from "../_libs/convex.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { V as ShieldCheck, Yt as LoaderCircle, cr as CircleAlert, h as UserCheck, m as UserMinus, p as UserPlus, rt as RefreshCw, u as Users } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, c as DialogTrigger, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { t as Checkbox } from "./checkbox-DP7YqpAp.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as AdminPageShell } from "./admin-page-shell-DKKo3NPm.mjs";
import { t as AdminTablePageSkeleton } from "./admin-table-page-skeleton-THYDnWPV.mjs";
import { t as AdminQueryErrorAlert } from "./admin-query-error-alert-Clikw_eH.mjs";
import { t as buildClientAllocationSummary } from "./client-allocation-BUDT7CTa.mjs";
import { i as useAdminActionError, n as ADMIN_USER_STATUSES, r as AdminActionErrorAlert, t as ADMIN_USER_ROLES } from "./use-admin-action-error-uHYce7YY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team-CWcd36l1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLE_OPTIONS = ADMIN_USER_ROLES.filter((role) => role !== "client");
var STATUS_OPTIONS = ["all", ...ADMIN_USER_STATUSES];
var EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function looksLikeEmail(value) {
	return EMAIL_LIKE.test(value.trim());
}
function isAdminUserRole(value) {
	return typeof value === "string" && ADMIN_USER_ROLES.includes(value);
}
function isAdminUserStatus(value) {
	return typeof value === "string" && ADMIN_USER_STATUSES.includes(value);
}
function createInitialAdminTeamPageState() {
	return {
		usersOverride: null,
		previewUsers: getPreviewAdminUsers(),
		loadingMore: false,
		statusFilter: "all",
		roleFilter: "all",
		searchTerm: "",
		savingId: null,
		inviteOpen: false,
		inviteEmail: "",
		inviteRole: "team",
		inviteSending: false
	};
}
function adminTeamPageReducer(state, action) {
	switch (action.type) {
		case "setUsersOverride": return {
			...state,
			usersOverride: typeof action.value === "function" ? action.value(state.usersOverride) : action.value
		};
		case "setPreviewUsers": return {
			...state,
			previewUsers: typeof action.value === "function" ? action.value(state.previewUsers) : action.value
		};
		case "setLoadingMore": return {
			...state,
			loadingMore: action.value
		};
		case "setStatusFilter": return {
			...state,
			statusFilter: action.value
		};
		case "setRoleFilter": return {
			...state,
			roleFilter: action.value
		};
		case "setSearchTerm": return {
			...state,
			searchTerm: action.value
		};
		case "setSavingId": return {
			...state,
			savingId: action.value
		};
		case "setInviteOpen": return {
			...state,
			inviteOpen: action.value
		};
		case "setInviteEmail": return {
			...state,
			inviteEmail: action.value
		};
		case "setInviteRole": return {
			...state,
			inviteRole: action.value
		};
		case "setInviteSending": return {
			...state,
			inviteSending: action.value
		};
		case "resetInviteForm": return {
			...state,
			inviteOpen: false,
			inviteEmail: "",
			inviteRole: "team"
		};
		case "clearFilters": return {
			...state,
			statusFilter: "all",
			roleFilter: "all",
			searchTerm: ""
		};
		case "refresh": return {
			...state,
			statusFilter: "all",
			roleFilter: "all",
			searchTerm: "",
			usersOverride: null,
			previewUsers: action.previewUsers
		};
		default: return state;
	}
}
function deriveNextStatus(status) {
	if (status === "disabled" || status === "suspended") return "active";
	if (status === "active") return "disabled";
	return "active";
}
function statusActionLabel(status) {
	switch (status) {
		case "active": return "Disable access";
		case "disabled": return "Activate";
		case "suspended": return "Reinstate";
		case "pending": return "Approve access";
		case "invited": return "Activate";
		default: return "Activate";
	}
}
function statusToVariant(status) {
	switch (status) {
		case "active": return "default";
		case "disabled":
		case "suspended": return "destructive";
		case "invited":
		case "pending": return "secondary";
	}
}
function formatDate(value) {
	return formatDate$1(value, DATE_FORMATS.WITH_TIME, void 0, "—");
}
function ActionIcon({ status }) {
	if (status === "active") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "size-4" });
	if (status === "disabled" || status === "suspended") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-4" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4" });
}
function AdminTeamSignInRequired() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "max-w-md border-muted/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: "Sign in required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Log in to an admin account to manage your team." })] })
		})
	});
}
function AdminTeamSummaryCards({ summary, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-y-0 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-medium",
						children: "Total teammates"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: cn("size-4 text-muted-foreground", loading && "animate-spin") })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-8 w-14 animate-pulse rounded-md bg-muted",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-2xl font-semibold",
					children: summary.total
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "In this workspace"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-y-0 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-medium",
						children: "Active accounts"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-4 text-success" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-8 w-14 animate-pulse rounded-md bg-muted",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-2xl font-semibold",
					children: summary.active
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Currently enabled"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-y-0 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-medium",
						children: "Administrators"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-8 w-14 animate-pulse rounded-md bg-muted",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-2xl font-semibold",
					children: summary.admins
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Including yourself"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-y-0 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-medium",
						children: "Allocated to clients"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-muted-foreground" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-8 w-14 animate-pulse rounded-md bg-muted",
					"aria-hidden": true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-2xl font-semibold",
					children: summary.allocated
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Internal users attached to at least one client"
				})] })]
			})
		]
	});
}
function AdminTeamInviteDialog({ inviteOpen, inviteEmail, inviteEmailTrimmed, inviteEmailValid, inviteRole, inviteSending, onOpenChange, onEmailChange, onRoleChange, onClose, onSubmit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open: inviteOpen,
		onOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Invite user"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Invite new user" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Send an invitation email to add a team member, client contact, or admin to your organization." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "admin-team-invite-email",
							children: "Email address"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "admin-team-invite-email",
							name: "email",
							type: "email",
							autoComplete: "email",
							placeholder: "colleague@company.com",
							value: inviteEmail,
							onChange: onEmailChange,
							"aria-invalid": inviteEmailTrimmed.length > 0 && !inviteEmailValid
						}),
						inviteEmailTrimmed.length > 0 && !inviteEmailValid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-destructive",
							children: "Enter a valid email address."
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "admin-team-invite-role",
						children: "Role"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: inviteRole,
						onValueChange: onRoleChange,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							id: "admin-team-invite-role",
							className: "w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "team",
								children: "Team Member"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "client",
								children: "Client"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "admin",
								children: "Admin"
							})
						] })]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onClose,
				disabled: inviteSending,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: !inviteEmailValid || inviteSending,
				children: inviteSending ? "Sending…" : "Send invitation"
			})] })]
		})] })]
	});
}
function AdminTeamDirectorySection({ loading, internalUsers, filteredUsers, hasActiveFilters, workspaceQueryError, actionError, clearActionError, searchTerm, statusFilter, roleFilter, savingId, allocationSummary, paginatedStatus, loadingMore, onSearchChange, onStatusFilterChange, onRoleFilterChange, onOpenInviteDialog, onClearFilters, onLoadMore, createRoleChangeHandler, createAdminToggleHandler, createStatusActionHandler }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-muted/60 bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: "Team directory"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: ["Search internal teammates, manage permissions, and review their current client allocation load.", !loading && internalUsers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-1 block text-xs text-muted-foreground/90",
				children: [
					"Showing ",
					filteredUsers.length,
					" of ",
					internalUsers.length
				]
			}) : null] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search by name or email",
						value: searchTerm,
						onChange: onSearchChange,
						className: "lg:w-64",
						"aria-label": "Search team by name or email"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: statusFilter,
						onValueChange: onStatusFilterChange,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "lg:w-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Filter by status" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUS_OPTIONS.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: status,
							children: status === "all" ? "All statuses" : status.charAt(0).toUpperCase() + status.slice(1)
						}, status)) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: roleFilter,
						onValueChange: onRoleFilterChange,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "lg:w-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Filter by role" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All roles"
						}), ROLE_OPTIONS.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: role,
							children: role.charAt(0).toUpperCase() + role.slice(1)
						}, role))] })]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminQueryErrorAlert, {
					error: workspaceQueryError,
					title: "Unable to load workspace data"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminActionErrorAlert, {
					error: actionError,
					onDismiss: clearActionError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto rounded-md border border-muted/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "min-w-full table-fixed text-left text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
								className: "sr-only",
								children: "Team members, roles, and client allocation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-64 py-2 pr-3 font-medium",
										children: "Team member"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-32 py-2 pr-3 font-medium",
										children: "Role"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-24 py-2 pr-3 text-center font-medium",
										children: "Admin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-32 py-2 pr-3 font-medium",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-40 py-2 pr-3 font-medium",
										children: "Joined"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-40 py-2 pr-3 font-medium",
										children: "Client allocation"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-40 py-2 pr-3 font-medium",
										children: "Last active"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "py-2 text-right font-medium",
										children: "Actions"
									})
								]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredUsers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 8,
								className: "py-10 text-center text-sm text-muted-foreground",
								children: loading ? "Loading team…" : workspaceQueryError && internalUsers.length === 0 ? workspaceQueryError : !loading && internalUsers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex flex-col items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No internal teammates in this workspace yet." }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: onOpenInviteDialog,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "mr-2 size-4" }), "Invite teammate"]
									})]
								}) : hasActiveFilters ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex flex-col items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No teammates match current search or filters." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "sm",
										variant: "outline",
										onClick: onClearFilters,
										children: "Clear filters"
									})]
								}) : "No teammates match the current filters."
							}) }) : filteredUsers.map((record) => {
								const allocation = allocationSummary.byUserId[record.id] ?? {
									managedClientNames: [],
									supportingClientNames: [],
									totalClientNames: []
								};
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
											scope: "row",
											className: "py-3 pr-3 text-left font-normal",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium text-foreground",
													children: record.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground",
													children: record.email || "No email on file"
												}),
												record.agencyId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs text-muted-foreground",
													children: ["Agency: ", record.agencyId]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-3 align-middle",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: record.role,
												onValueChange: createRoleChangeHandler(record.id),
												disabled: savingId === record.id,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROLE_OPTIONS.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: role,
													children: role.charAt(0).toUpperCase() + role.slice(1)
												}, role)) })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-3 text-center align-middle",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
												checked: record.role === "admin",
												onChange: createAdminToggleHandler(record),
												disabled: savingId === record.id,
												"aria-label": `Toggle admin role for ${record.name}`
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-3 align-middle",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: statusToVariant(record.status),
												className: "capitalize",
												children: record.status.replace(/_/g, " ")
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-3 align-middle text-xs text-muted-foreground",
											children: formatDate(record.createdAt)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-3 align-middle",
											children: allocation.totalClientNames.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-sm font-medium text-foreground",
													children: [
														allocation.totalClientNames.length,
														" client",
														allocation.totalClientNames.length === 1 ? "" : "s"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs text-muted-foreground",
													children: [
														"Owner ",
														allocation.managedClientNames.length,
														" · Support ",
														allocation.supportingClientNames.length
													]
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Unassigned"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 pr-3 align-middle text-xs text-muted-foreground",
											children: formatDate(record.lastLoginAt)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3 align-middle text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												variant: record.status === "active" ? "destructive" : "outline",
												size: "sm",
												onClick: createStatusActionHandler(record),
												disabled: savingId === record.id,
												className: "inline-flex items-center gap-2",
												children: [savingId === record.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionIcon, { status: record.status }), statusActionLabel(record.status)]
											})
										})
									]
								}, record.id);
							}) })
						]
					})
				}),
				paginatedStatus === "CanLoadMore" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: onLoadMore,
						disabled: loadingMore,
						className: "inline-flex items-center gap-2",
						children: [loadingMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), loadingMore ? "Loading…" : "Load more"]
					})
				}) : null
			]
		})]
	});
}
function AdminTeamPageContent(props) {
	const { isPreviewMode, loading, summary, internalUsers, filteredUsers, hasActiveFilters, workspaceQueryError, actionError, clearActionError, searchTerm, statusFilter, roleFilter, savingId, allocationSummary, paginatedStatus, loadingMore, inviteOpen, inviteEmail, inviteEmailTrimmed, inviteEmailValid, inviteRole, inviteSending, onRefresh, onInviteOpenChange, onInviteEmailChange, onInviteRoleChange, onCloseInviteDialog, onInviteFormSubmit, onSearchChange, onStatusFilterChange, onRoleFilterChange, onOpenInviteDialog, onClearFilters, onLoadMore, createRoleChangeHandler, createAdminToggleHandler, createStatusActionHandler } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminPageShell, {
		title: "Team management",
		description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Manage internal staff, their roles, and how they are allocated across client workspaces.", isPreviewMode ? " Preview mode keeps staffing changes local to this session." : ""] }),
		isPreviewMode,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: "/admin/clients",
					children: "Client workspaces"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "outline",
				size: "sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
					href: "/admin",
					children: "Admin home"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				onClick: onRefresh,
				disabled: loading,
				className: "inline-flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", loading && "animate-spin") }), " Refresh"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTeamInviteDialog, {
				inviteOpen,
				inviteEmail,
				inviteEmailTrimmed,
				inviteEmailValid,
				inviteRole,
				inviteSending,
				onOpenChange: onInviteOpenChange,
				onEmailChange: onInviteEmailChange,
				onRoleChange: onInviteRoleChange,
				onClose: onCloseInviteDialog,
				onSubmit: onInviteFormSubmit
			})
		] }),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTeamSummaryCards, {
			summary,
			loading
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTeamDirectorySection, {
			loading,
			internalUsers,
			filteredUsers,
			hasActiveFilters,
			workspaceQueryError,
			actionError,
			clearActionError,
			searchTerm,
			statusFilter,
			roleFilter,
			savingId,
			allocationSummary,
			paginatedStatus,
			loadingMore,
			onSearchChange,
			onStatusFilterChange,
			onRoleFilterChange,
			onOpenInviteDialog,
			onClearFilters,
			onLoadMore,
			createRoleChangeHandler,
			createAdminToggleHandler,
			createStatusActionHandler
		})]
	});
}
function useAdminTeamPage() {
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	const [state, dispatch] = (0, import_react.useReducer)(adminTeamPageReducer, void 0, createInitialAdminTeamPageState);
	const { usersOverride, previewUsers, loadingMore, statusFilter, roleFilter, searchTerm, savingId, inviteOpen, inviteEmail, inviteRole, inviteSending } = state;
	const { actionError, clearActionError, reportActionFailure } = useAdminActionError();
	const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : "skip");
	const workspaceId = workspaceContext?.workspaceId ?? null;
	const includeAllWorkspaces = workspaceContext?.role === "admin";
	const { results: usersPage, status, loadMore, isLoading } = usePaginatedQuery(api.adminUsers.listUsers, !isPreviewMode && workspaceId ? {
		workspaceId,
		includeAllWorkspaces
	} : "skip", { initialNumItems: 50 });
	const updateUserRoleStatus = useMutation(api.adminUsers.updateUserRoleStatus);
	const createInvitation = useMutation(api.adminInvitations.createInvitation);
	const clientsData = useQuery(api.clients.list, !isPreviewMode && workspaceId ? {
		workspaceId,
		limit: 200,
		cursor: null,
		includeAllWorkspaces
	} : "skip");
	const handleInviteEmailChange = (event) => {
		dispatch({
			type: "setInviteEmail",
			value: event.target.value
		});
	};
	const handleInviteRoleChange = (value) => {
		dispatch({
			type: "setInviteRole",
			value
		});
	};
	const handleCloseInviteDialog = () => {
		dispatch({
			type: "setInviteOpen",
			value: false
		});
	};
	const handleInviteOpenChange = (open) => {
		dispatch({
			type: "setInviteOpen",
			value: open
		});
		if (!open) {
			dispatch({
				type: "setInviteEmail",
				value: ""
			});
			dispatch({
				type: "setInviteRole",
				value: "team"
			});
		}
	};
	const handleSearchChange = (event) => {
		dispatch({
			type: "setSearchTerm",
			value: event.target.value
		});
	};
	const handleStatusFilterChange = (value) => {
		dispatch({
			type: "setStatusFilter",
			value
		});
	};
	const handleRoleFilterChange = (value) => {
		dispatch({
			type: "setRoleFilter",
			value
		});
	};
	const handleLoadMore = () => {
		if (isPreviewMode) return;
		if (loadingMore) return;
		dispatch({
			type: "setLoadingMore",
			value: true
		});
		Promise.resolve().then(() => loadMore(50)).catch((err) => {
			reportActionFailure({
				error: err,
				context: "AdminTeamPage:loadMore",
				title: "Could not load more"
			});
		}).finally(() => {
			dispatch({
				type: "setLoadingMore",
				value: false
			});
		});
	};
	const users = (() => {
		if (isPreviewMode) return previewUsers;
		if (usersOverride) return usersOverride;
		return (Array.isArray(usersPage) ? usersPage : []).map((row) => {
			const typedRow = row;
			return {
				id: typedRow.legacyId,
				email: typedRow.email ?? "",
				name: typedRow.name ?? "",
				role: isAdminUserRole(typedRow.role) ? typedRow.role : "team",
				status: isAdminUserStatus(typedRow.status) ? typedRow.status : "pending",
				agencyId: typedRow.agencyId ?? null,
				createdAt: typedRow.createdAtMs ? new Date(typedRow.createdAtMs).toISOString() : null,
				updatedAt: typedRow.updatedAtMs ? new Date(typedRow.updatedAtMs).toISOString() : null,
				lastLoginAt: null
			};
		});
	})();
	const loading = isPreviewMode ? false : user != null && workspaceContext === void 0 || isLoading;
	const workspaceQueryError = useConvexQueryError({
		data: workspaceContext,
		skipped: isPreviewMode || !user,
		loading: !isPreviewMode && Boolean(user) && workspaceContext === void 0,
		fallbackMessage: "Unable to load workspace context."
	});
	const clientItems = isPreviewMode ? getPreviewAdminClients().map((client) => ({
		legacyId: client.id,
		name: client.name,
		accountManager: client.accountManager,
		teamMembers: client.teamMembers
	})) : clientsData?.items;
	const internalUsers = users.filter((candidate) => candidate.role !== "client");
	const allocationSummary = (() => {
		const clientRows = Array.isArray(clientItems) ? clientItems : [];
		return buildClientAllocationSummary(internalUsers.map((record) => ({
			id: record.id,
			name: record.name,
			email: record.email,
			role: record.role,
			status: record.status
		})), clientRows.map((client) => ({
			id: client.legacyId,
			name: client.name,
			accountManager: client.accountManager,
			teamMembers: client.teamMembers ?? []
		})));
	})();
	const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all" || roleFilter !== "all";
	const filteredUsers = (() => {
		const search = searchTerm.trim().toLowerCase();
		return internalUsers.filter((candidate) => {
			if (statusFilter !== "all" && candidate.status !== statusFilter) return false;
			if (roleFilter !== "all" && candidate.role !== roleFilter) return false;
			if (search.length > 0) return `${candidate.name} ${candidate.email}`.toLowerCase().includes(search);
			return true;
		});
	})();
	const summary = (() => {
		const active = internalUsers.filter((record) => record.status === "active").length;
		const admins = internalUsers.filter((record) => record.role === "admin").length;
		const allocated = internalUsers.filter((record) => (allocationSummary.byUserId[record.id]?.totalClientNames.length ?? 0) > 0).length;
		return {
			total: internalUsers.length,
			active,
			admins,
			allocated
		};
	})();
	const handleRoleChange = (userId, role) => {
		if (isPreviewMode) {
			dispatch({
				type: "setPreviewUsers",
				value: (current) => current.map((record) => record.id === userId ? {
					...record,
					role,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				} : record)
			});
			notifyInfo({
				title: "Preview mode",
				message: `Member role updated to ${role} in the sample workspace.`
			});
			return;
		}
		dispatch({
			type: "setSavingId",
			value: userId
		});
		clearActionError();
		updateUserRoleStatus({
			legacyId: userId,
			role
		}).then(() => {
			dispatch({
				type: "setUsersOverride",
				value: (prev) => {
					return (prev ?? users).map((record) => record.id === userId ? {
						...record,
						role
					} : record);
				}
			});
			notifySuccess({
				title: "Role updated",
				message: `Member is now a ${role}.`
			});
		}).catch((err) => {
			reportActionFailure({
				error: err,
				context: "AdminTeamPage:handleRoleChange",
				title: "Role update failed"
			});
		}).finally(() => {
			dispatch({
				type: "setSavingId",
				value: null
			});
		});
	};
	const handleAdminToggle = (record, makeAdmin) => {
		if (makeAdmin && record.role === "admin") return;
		if (!makeAdmin && record.role !== "admin") return;
		const fallbackRole = makeAdmin ? "admin" : "team";
		handleRoleChange(record.id, fallbackRole);
	};
	const handleStatusAction = (userRecord) => {
		const nextStatus = deriveNextStatus(userRecord.status);
		if (isPreviewMode) {
			dispatch({
				type: "setPreviewUsers",
				value: (current) => current.map((record) => record.id === userRecord.id ? {
					...record,
					status: nextStatus,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				} : record)
			});
			notifyInfo({
				title: "Preview mode",
				message: `Member is now ${nextStatus.replace(/_/g, " ")} in the sample workspace.`
			});
			return;
		}
		dispatch({
			type: "setSavingId",
			value: userRecord.id
		});
		clearActionError();
		updateUserRoleStatus({
			legacyId: userRecord.id,
			status: nextStatus
		}).then(() => {
			dispatch({
				type: "setUsersOverride",
				value: (prev) => {
					return (prev ?? users).map((record) => record.id === userRecord.id ? {
						...record,
						status: nextStatus
					} : record);
				}
			});
			notifySuccess({
				title: "Status updated",
				message: `Member is now ${nextStatus.replace(/_/g, " ")}.`
			});
		}).catch((err) => {
			reportActionFailure({
				error: err,
				context: "AdminTeamPage:handleStatusAction",
				title: "Status update failed"
			});
		}).finally(() => {
			dispatch({
				type: "setSavingId",
				value: null
			});
		});
	};
	const inviteEmailTrimmed = inviteEmail.trim();
	const inviteEmailValid = looksLikeEmail(inviteEmailTrimmed);
	const handleInviteUser = () => {
		const email = inviteEmail.trim();
		if (!email || !looksLikeEmail(email)) return;
		if (isPreviewMode) {
			dispatch({
				type: "setPreviewUsers",
				value: (current) => [{
					id: `preview-user-${Date.now()}`,
					email,
					name: email.split("@")[0] ?? "Preview User",
					role: inviteRole,
					status: "invited",
					agencyId: "preview-agency",
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
					lastLoginAt: null
				}, ...current]
			});
			notifyInfo({
				title: "Preview mode",
				message: `Invitation created for ${email} in the sample workspace.`
			});
			dispatch({ type: "resetInviteForm" });
			return;
		}
		if (!user?.id) return;
		dispatch({
			type: "setInviteSending",
			value: true
		});
		createInvitation({
			email,
			role: inviteRole,
			invitedBy: user.id,
			invitedByName: user?.name ?? null
		}).then(() => {
			notifySuccess({
				title: "Invitation sent!",
				message: `Invitation created for ${email} as ${inviteRole}. Email delivery depends on server integration settings.`
			});
			dispatch({ type: "resetInviteForm" });
		}).catch((err) => {
			reportActionFailure({
				error: err,
				context: "AdminTeamPage:handleInviteUser",
				title: "Invitation failed"
			});
		}).finally(() => {
			dispatch({
				type: "setInviteSending",
				value: false
			});
		});
	};
	const handleInviteFormSubmit = (event) => {
		event.preventDefault();
		handleInviteUser();
	};
	const handleOpenInviteDialog = () => {
		dispatch({
			type: "setInviteOpen",
			value: true
		});
	};
	const handleClearFilters = () => {
		dispatch({ type: "clearFilters" });
	};
	const handleRefresh = () => {
		if (loading) return;
		clearActionError();
		dispatch({
			type: "refresh",
			previewUsers: isPreviewMode ? getPreviewAdminUsers() : state.previewUsers
		});
	};
	const createRoleChangeHandler = (userId) => (value) => {
		handleRoleChange(userId, value);
	};
	const createAdminToggleHandler = (record) => (event) => {
		handleAdminToggle(record, event.target.checked);
	};
	const createStatusActionHandler = (record) => () => {
		handleStatusAction(record);
	};
	return {
		user,
		isPreviewMode,
		loading,
		summary,
		filteredUsers,
		internalUsers,
		allocationSummary,
		hasActiveFilters,
		workspaceQueryError,
		actionError,
		clearActionError,
		statusFilter,
		roleFilter,
		searchTerm,
		savingId,
		inviteOpen,
		inviteEmail,
		inviteEmailTrimmed,
		inviteEmailValid,
		inviteRole,
		inviteSending,
		loadingMore,
		paginatedStatus: status,
		handleRefresh,
		handleInviteEmailChange,
		handleInviteRoleChange,
		handleCloseInviteDialog,
		handleInviteOpenChange,
		handleSearchChange,
		handleStatusFilterChange,
		handleRoleFilterChange,
		handleLoadMore,
		handleInviteFormSubmit,
		handleOpenInviteDialog,
		handleClearFilters,
		createRoleChangeHandler,
		createAdminToggleHandler,
		createStatusActionHandler
	};
}
function AdminTeamPage() {
	const page = useAdminTeamPage();
	if (!page.user && !page.isPreviewMode) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTeamSignInRequired, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: page.loading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTablePageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTeamPageContent, {
			isPreviewMode: page.isPreviewMode,
			loading: page.loading,
			summary: page.summary,
			internalUsers: page.internalUsers,
			filteredUsers: page.filteredUsers,
			hasActiveFilters: page.hasActiveFilters,
			workspaceQueryError: page.workspaceQueryError,
			actionError: page.actionError,
			clearActionError: page.clearActionError,
			searchTerm: page.searchTerm,
			statusFilter: page.statusFilter,
			roleFilter: page.roleFilter,
			savingId: page.savingId,
			allocationSummary: page.allocationSummary,
			paginatedStatus: page.paginatedStatus,
			loadingMore: page.loadingMore,
			inviteOpen: page.inviteOpen,
			inviteEmail: page.inviteEmail,
			inviteEmailTrimmed: page.inviteEmailTrimmed,
			inviteEmailValid: page.inviteEmailValid,
			inviteRole: page.inviteRole,
			inviteSending: page.inviteSending,
			onRefresh: page.handleRefresh,
			onInviteOpenChange: page.handleInviteOpenChange,
			onInviteEmailChange: page.handleInviteEmailChange,
			onInviteRoleChange: page.handleInviteRoleChange,
			onCloseInviteDialog: page.handleCloseInviteDialog,
			onInviteFormSubmit: page.handleInviteFormSubmit,
			onSearchChange: page.handleSearchChange,
			onStatusFilterChange: page.handleStatusFilterChange,
			onRoleFilterChange: page.handleRoleFilterChange,
			onOpenInviteDialog: page.handleOpenInviteDialog,
			onClearFilters: page.handleClearFilters,
			onLoadMore: page.handleLoadMore,
			createRoleChangeHandler: page.createRoleChangeHandler,
			createAdminToggleHandler: page.createAdminToggleHandler,
			createStatusActionHandler: page.createStatusActionHandler
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTeamPage, {});
//#endregion
export { SplitComponent as component };
