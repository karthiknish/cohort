import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, l as useMutation, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { _ as getPreviewAdminInvitations, y as getPreviewAdminUsers } from "./preview-data-CXkRNfsX.mjs";
import { c as cn, h as formatRelativeTime$1 } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { a as notifyInfo, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { t as usePaginatedQuery } from "../_libs/convex.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { V as ShieldCheck, cr as CircleAlert, p as UserPlus, rt as RefreshCw, u as Users, w as Trash2, zn as Ellipsis } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { a as DialogFooter, c as DialogTrigger, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { a as TabsTrigger, i as TabsList, n as Tabs } from "./tabs-BP_mm-cH.mjs";
import { t as Checkbox } from "./checkbox-DP7YqpAp.mjs";
import { r as useConvexQueryError, t as mergeQueryErrors } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CJEJ0oqe.mjs";
import { t as AdminPageShell } from "./admin-page-shell-DKKo3NPm.mjs";
import { t as AdminTablePageSkeleton } from "./admin-table-page-skeleton-THYDnWPV.mjs";
import { t as AdminQueryErrorAlert } from "./admin-query-error-alert-Clikw_eH.mjs";
import { i as useAdminActionError, n as ADMIN_USER_STATUSES, r as AdminActionErrorAlert, t as ADMIN_USER_ROLES } from "./use-admin-action-error-uHYce7YY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-BLc8rIWN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLE_ASSIGNABLE = ADMIN_USER_ROLES;
function roleLabel(role) {
	switch (role) {
		case "admin": return "Admin";
		case "team": return "Team Member";
		case "client": return "Client";
	}
}
var STATUS_OPTIONS = ["all", ...ADMIN_USER_STATUSES];
var INVITATION_STATUSES = [
	"pending",
	"accepted",
	"expired",
	"revoked"
];
function normalizeAdminRole(value) {
	if (typeof value === "string" && ADMIN_USER_ROLES.includes(value)) return value;
	return "team";
}
function normalizeAdminStatus(value) {
	if (typeof value === "string" && ADMIN_USER_STATUSES.includes(value)) return value;
	return "pending";
}
function createInitialAdminUsersPageState() {
	return {
		usersOverride: null,
		previewUsers: getPreviewAdminUsers(),
		previewInvitations: getPreviewAdminInvitations(),
		loadingMore: false,
		statusFilter: "all",
		roleFilter: "all",
		searchTerm: "",
		invitationSearchTerm: "",
		invitationStatusFilter: "pending",
		savingId: null,
		invitationActionKey: null,
		inviteOpen: false,
		revokeOpen: false,
		detailsOpen: false,
		selectedUser: null,
		inviteEmail: "",
		inviteRole: "team",
		inviteSending: false
	};
}
function adminUsersPageReducer(state, action) {
	switch (action.type) {
		case "setUsersOverride": return {
			...state,
			usersOverride: typeof action.value === "function" ? action.value(state.usersOverride) : action.value
		};
		case "setPreviewUsers": return {
			...state,
			previewUsers: typeof action.value === "function" ? action.value(state.previewUsers) : action.value
		};
		case "setPreviewInvitations": return {
			...state,
			previewInvitations: typeof action.value === "function" ? action.value(state.previewInvitations) : action.value
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
		case "setInvitationSearchTerm": return {
			...state,
			invitationSearchTerm: action.value
		};
		case "setInvitationStatusFilter": return {
			...state,
			invitationStatusFilter: action.value
		};
		case "setSavingId": return {
			...state,
			savingId: action.value
		};
		case "setInvitationActionKey": return {
			...state,
			invitationActionKey: typeof action.value === "function" ? action.value(state.invitationActionKey) : action.value
		};
		case "setInviteOpen": return {
			...state,
			inviteOpen: action.value
		};
		case "setRevokeOpen": return {
			...state,
			revokeOpen: action.value
		};
		case "setDetailsOpen": return {
			...state,
			detailsOpen: action.value
		};
		case "setSelectedUser": return {
			...state,
			selectedUser: action.value
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
		case "refresh": return {
			...state,
			statusFilter: "all",
			roleFilter: "all",
			searchTerm: "",
			invitationStatusFilter: "pending",
			invitationSearchTerm: "",
			usersOverride: null,
			previewUsers: action.previewUsers,
			previewInvitations: action.previewInvitations
		};
		default: return state;
	}
}
function statusLabel(status) {
	if (status === "all") return "All";
	return status.replace("_", " ");
}
function invitationStatusLabel(status) {
	return status.replace("_", " ");
}
function AdminUsersSignInRequired() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "max-w-md border-muted/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: "Sign in required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Log in to an admin account to approve new users." })] })
		})
	});
}
function UserRow({ record, savingId, onRoleChange, onApprovalToggle, onViewDetails, onRevokeAccess }) {
	const handleRoleChange = (value) => onRoleChange(record, value);
	const handleApprovalToggle = (checked) => onApprovalToggle(record, checked === true);
	const handleViewDetails = () => onViewDetails(record);
	const handleRevokeAccess = () => onRevokeAccess(record);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-b border-muted/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				scope: "row",
				className: "py-3 pr-3 text-left font-normal",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: record.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: record.email
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: record.role,
					onValueChange: handleRoleChange,
					disabled: savingId === record.id,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-32",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROLE_ASSIGNABLE.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: role,
						children: roleLabel(role)
					}, role)) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
					checked: record.status === "active",
					onCheckedChange: handleApprovalToggle,
					disabled: savingId === record.id
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: record.status === "active" ? "default" : "secondary",
					children: record.status
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3 text-sm text-muted-foreground",
				children: record.lastLoginAt ? formatRelativeTime$1(record.lastLoginAt) : "Never"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 text-right",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						"aria-label": `Actions for ${record.name}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
							className: "size-4",
							"aria-hidden": true
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: handleViewDetails,
							children: "View details"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: handleRevokeAccess,
							className: "text-destructive focus:text-destructive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Revoke access"]
						})
					]
				})] })
			})
		]
	});
}
function InvitationRow({ invitation, invitationActionKey, onResend, onRevoke }) {
	const isLoading = invitationActionKey === invitation.id;
	const handleResend = () => onResend(invitation);
	const handleRevoke = () => onRevoke(invitation);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-b border-muted/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
				scope: "row",
				className: "py-3 pr-3 text-left font-normal",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: invitation.name || invitation.email
					}), invitation.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: invitation.email
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					children: invitation.role
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: invitation.effectiveStatus === "accepted" ? "default" : invitation.effectiveStatus === "expired" ? "destructive" : invitation.effectiveStatus === "revoked" ? "secondary" : "outline",
					children: invitation.effectiveStatus
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3 text-sm text-muted-foreground",
				children: formatRelativeTime$1(invitation.createdAtMs)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3 text-sm text-muted-foreground",
				children: formatRelativeTime$1(invitation.expiresAtMs)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3 text-sm text-muted-foreground",
				children: invitation.invitedByName || invitation.invitedBy
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 text-right",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2",
					children: [invitation.effectiveStatus === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: handleResend,
						disabled: isLoading,
						children: "Resend"
					}), (invitation.effectiveStatus === "pending" || invitation.effectiveStatus === "expired") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: handleRevoke,
						disabled: isLoading,
						className: "text-destructive hover:text-destructive",
						children: "Revoke"
					})]
				})
			})
		]
	});
}
function AdminUsersSummaryCards({ summary, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-y-0 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-medium",
						children: "Total users"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: cn("size-4 text-muted-foreground", loading && "animate-spin") })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-2xl font-semibold",
					children: summary.total
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "All accounts in your organisation"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-y-0 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-medium",
						children: "Pending approval"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-warning" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-2xl font-semibold",
					children: summary.pending
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Awaiting activation"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-y-0 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-medium",
						children: "Internal team"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-primary" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-2xl font-semibold",
					children: summary.internal
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Admins and internal team accounts"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-muted/60 bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between gap-y-0 pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-medium",
						children: "Client access"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-muted-foreground" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-2xl font-semibold",
					children: summary.clients
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Accounts currently marked as client users"
				})] })]
			})
		]
	});
}
function AdminUsersDirectorySection({ loading, listQueryError, actionError, clearActionError, searchTerm, statusFilter, roleFilter, filteredUsers, savingId, paginatedStatus, loadingMore, onSearchChange, onStatusFilterChange, onRoleFilterChange, onRoleChange, onApprovalToggle, onViewDetails, onRevokeAccess, onLoadMore }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-muted/60 bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: "Account directory"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Filter by status or role, approve users, and assign access. Internal staffing and client ownership are managed on the Team and Client pages." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search by name or email",
						value: searchTerm,
						onChange: onSearchChange,
						className: "lg:w-64"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: statusFilter,
						onValueChange: onStatusFilterChange,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "lg:w-40",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Filter by status" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: STATUS_OPTIONS.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: status,
							children: statusLabel(status)
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
						}), ADMIN_USER_ROLES.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
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
					error: listQueryError,
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
								children: "Workspace users, roles, and approval status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-72 py-2 pr-3 font-medium",
										children: "User"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-32 py-2 pr-3 font-medium",
										children: "Role"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-32 py-2 pr-3 text-center font-medium",
										children: "Approved"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										scope: "col",
										className: "w-32 py-2 pr-3 font-medium",
										children: "Status"
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
								colSpan: 6,
								className: "py-10 text-center text-sm text-muted-foreground",
								children: loading ? "Loading users…" : listQueryError ? listQueryError : "No users match the current filters."
							}) }) : filteredUsers.map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRow, {
								record,
								savingId,
								onRoleChange,
								onApprovalToggle,
								onViewDetails,
								onRevokeAccess
							}, record.id)) })
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
						children: [loadingMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" }), loadingMore ? "Loading…" : "Load more"]
					})
				}) : null
			]
		})]
	});
}
function AdminUsersInvitationsSection({ invitationSearchTerm, invitationStatusFilter, invitationSummary, invitationsLoading, filteredInvitations, invitationActionKey, onInvitationSearchChange, onInvitationStatusFilterChange, onResend, onRevoke }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-muted/60 bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: "Invitation lifecycle"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Track pending, accepted, expired, and revoked invitations. Resend expired invites or revoke outstanding ones." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: invitationSearchTerm,
				onChange: onInvitationSearchChange,
				placeholder: "Search invitations by name or email",
				className: "lg:w-72"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: invitationStatusFilter,
				onValueChange: onInvitationStatusFilterChange,
				className: "space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
					className: "grid w-full grid-cols-2 md:grid-cols-4",
					children: INVITATION_STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: status,
						className: "capitalize",
						children: [
							invitationStatusLabel(status),
							" (",
							invitationSummary[status],
							")"
						]
					}, status))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-md border border-muted/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "min-w-full table-fixed text-left text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
							className: "sr-only",
							children: "Invitation lifecycle by status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-muted/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "w-64 py-2 pr-3 font-medium",
									children: "Invitee"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "w-28 py-2 pr-3 font-medium",
									children: "Role"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "w-28 py-2 pr-3 font-medium",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "w-36 py-2 pr-3 font-medium",
									children: "Sent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "w-36 py-2 pr-3 font-medium",
									children: "Expires"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "w-44 py-2 pr-3 font-medium",
									children: "Invited by"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "col",
									className: "py-2 text-right font-medium",
									children: "Actions"
								})
							]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: filteredInvitations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 7,
							className: "py-10 text-center text-sm text-muted-foreground",
							children: invitationsLoading ? "Loading invitation lifecycle…" : "No invitations match this lifecycle status and search."
						}) }) : filteredInvitations.map((invitation) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvitationRow, {
							invitation,
							invitationActionKey,
							onResend,
							onRevoke
						}, invitation.id)) })
					]
				})
			})]
		})]
	});
}
function AdminUsersPageActions({ loading, inviteOpen, inviteEmail, inviteRole, inviteSending, onRefresh, onInviteOpenChange, onInviteEmailChange, onInviteRoleChange, onInviteClose, onInviteUser }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			size: "sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: "/admin/team",
				children: "Team management"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			size: "sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: "/admin/clients",
				children: "Client workspaces"
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
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
			open: inviteOpen,
			onOpenChange: onInviteOpenChange,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" }), " Invite user"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Invite new user" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Send an invitation email to add a new member to your organization." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "email",
							children: "Email address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "email",
							placeholder: "colleague@company.com",
							value: inviteEmail,
							onChange: onInviteEmailChange
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "role",
							children: "Role"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: inviteRole,
							onValueChange: onInviteRoleChange,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
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
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onInviteClose,
					disabled: inviteSending,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onInviteUser,
					disabled: !inviteEmail || inviteSending,
					children: inviteSending ? "Sending…" : "Send Invitation"
				})] })
			] })]
		})
	] });
}
function AdminUsersRevokeDialog({ revokeOpen, selectedUser, onOpenChange, onClose, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: revokeOpen,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Revoke access?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
			"Are you sure you want to revoke access for ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedUser?.name }),
			"? They will no longer be able to sign in."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: onClose,
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "destructive",
			onClick: onConfirm,
			children: "Revoke Access"
		})] })] })
	});
}
function AdminUsersDetailDialog({ detailsOpen, selectedUser, onOpenChange, onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: detailsOpen,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: selectedUser?.name ?? "User details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: selectedUser?.email ?? "Account information" })] }),
			selectedUser ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid gap-3 py-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[7rem_1fr] gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Role"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: roleLabel(selectedUser.role) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[7rem_1fr] gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "capitalize",
							children: selectedUser.status.replace("_", " ")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[7rem_1fr] gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Workspace"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: selectedUser.agencyId ?? "—" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[7rem_1fr] gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Created"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: selectedUser.createdAt ? formatRelativeTime$1(selectedUser.createdAt) : "—" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-[7rem_1fr] gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-muted-foreground",
							children: "Last login"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: selectedUser.lastLoginAt ? formatRelativeTime$1(selectedUser.lastLoginAt) : "Never" })]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onClose,
				children: "Close"
			}) })
		] })
	});
}
function AdminUsersPageContent(props) {
	const { isPreviewMode, loading, summary, listQueryError, actionError, clearActionError, searchTerm, statusFilter, roleFilter, filteredUsers, savingId, paginatedStatus, loadingMore, invitationSearchTerm, invitationStatusFilter, invitationSummary, invitationsLoading, filteredInvitations, invitationActionKey, inviteOpen, inviteEmail, inviteRole, inviteSending, revokeOpen, detailsOpen, selectedUser, onRefresh, onInviteOpenChange, onInviteEmailChange, onInviteRoleChange, onInviteClose, onInviteUser, onSearchChange, onStatusFilterChange, onRoleFilterChange, onRoleChange, onApprovalToggle, onViewDetails, onRevokeAccess, onLoadMore, onInvitationSearchChange, onInvitationStatusFilterChange, onResendInvitation, onRevokeInvitation, onDetailsOpenChange, onDetailsClose, onRevokeOpenChange, onRevokeClose, onRevokeConfirm } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminPageShell, {
			title: "Users and approvals",
			description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Approve new accounts and assign access. Use Team management for internal staffing and Client workspaces for client allocation.", isPreviewMode ? " Preview mode keeps user changes local to this session." : ""] }),
			isPreviewMode,
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersPageActions, {
				loading,
				inviteOpen,
				inviteEmail,
				inviteRole,
				inviteSending,
				onRefresh,
				onInviteOpenChange,
				onInviteEmailChange,
				onInviteRoleChange,
				onInviteClose,
				onInviteUser
			}),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersSummaryCards, {
					summary,
					loading
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersDirectorySection, {
					loading,
					listQueryError,
					actionError,
					clearActionError,
					searchTerm,
					statusFilter,
					roleFilter,
					filteredUsers,
					savingId,
					paginatedStatus,
					loadingMore,
					onSearchChange,
					onStatusFilterChange,
					onRoleFilterChange,
					onRoleChange,
					onApprovalToggle,
					onViewDetails,
					onRevokeAccess,
					onLoadMore
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersInvitationsSection, {
					invitationSearchTerm,
					invitationStatusFilter,
					invitationSummary,
					invitationsLoading,
					filteredInvitations,
					invitationActionKey,
					onInvitationSearchChange,
					onInvitationStatusFilterChange,
					onResend: onResendInvitation,
					onRevoke: onRevokeInvitation
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersDetailDialog, {
			detailsOpen,
			selectedUser,
			onOpenChange: onDetailsOpenChange,
			onClose: onDetailsClose
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersRevokeDialog, {
			revokeOpen,
			selectedUser,
			onOpenChange: onRevokeOpenChange,
			onClose: onRevokeClose,
			onConfirm: onRevokeConfirm
		})
	] });
}
function useAdminUsersPage() {
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	const [state, dispatch] = (0, import_react.useReducer)(adminUsersPageReducer, void 0, createInitialAdminUsersPageState);
	const { usersOverride, previewUsers, previewInvitations, loadingMore, statusFilter, roleFilter, searchTerm, invitationSearchTerm, invitationStatusFilter, savingId, invitationActionKey, inviteOpen, revokeOpen, detailsOpen, selectedUser, inviteEmail, inviteRole, inviteSending } = state;
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
	const resendInvitation = useMutation(api.adminInvitations.resendInvitation);
	const revokeInvitation = useMutation(api.adminInvitations.revokeInvitation);
	const invitationResponse = useQuery(api.adminInvitations.listInvitations, isPreviewMode ? "skip" : { limit: 100 });
	const users = (() => {
		if (isPreviewMode) return previewUsers;
		if (usersOverride) return usersOverride;
		return (Array.isArray(usersPage) ? usersPage : []).map((row) => ({
			id: row.legacyId,
			email: row.email ?? "",
			name: row.name ?? "",
			role: normalizeAdminRole(row.role),
			status: normalizeAdminStatus(row.status),
			agencyId: row.agencyId ?? null,
			createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
			updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
			lastLoginAt: null
		}));
	})();
	const loading = isPreviewMode ? false : user != null && workspaceContext === void 0 || isLoading;
	const filteredUsers = (() => {
		const search = searchTerm.trim().toLowerCase();
		return users.filter((record) => {
			if (statusFilter !== "all" && record.status !== statusFilter) return false;
			if (roleFilter !== "all" && record.role !== roleFilter) return false;
			if (search.length > 0) return `${record.name} ${record.email}`.toLowerCase().includes(search);
			return true;
		});
	})();
	const summary = (() => {
		const pending = users.filter((record) => record.status === "pending" || record.status === "invited").length;
		const active = users.filter((record) => record.status === "active").length;
		return {
			total: users.length,
			pending,
			active,
			internal: users.filter((record) => record.role !== "client").length,
			clients: users.filter((record) => record.role === "client").length
		};
	})();
	const invitationsLoading = isPreviewMode ? false : invitationResponse === void 0;
	const listQueryError = mergeQueryErrors(useConvexQueryError({
		data: workspaceContext,
		skipped: isPreviewMode || !user,
		loading: !isPreviewMode && Boolean(user) && workspaceContext === void 0,
		fallbackMessage: "Unable to load workspace context."
	}), useConvexQueryError({
		data: invitationResponse,
		skipped: isPreviewMode,
		loading: invitationsLoading,
		fallbackMessage: "Unable to load invitations."
	}));
	const invitations = (() => {
		if (isPreviewMode) return previewInvitations;
		return (Array.isArray(invitationResponse?.invitations) ? invitationResponse.invitations : []).flatMap((row) => {
			const invitation = row;
			const invitationStatus = invitation.status ?? "pending";
			const expiresAtMs = typeof invitation.expiresAtMs === "number" ? invitation.expiresAtMs : 0;
			const effectiveStatus = invitation.effectiveStatus ?? invitationStatus;
			const mapped = {
				id: invitation.id ?? "",
				email: invitation.email ?? "",
				role: invitation.role ?? "team",
				name: invitation.name ?? null,
				message: invitation.message ?? null,
				status: invitationStatus,
				effectiveStatus,
				invitedBy: invitation.invitedBy ?? "",
				invitedByName: invitation.invitedByName ?? null,
				expiresAtMs,
				createdAtMs: typeof invitation.createdAtMs === "number" ? invitation.createdAtMs : 0,
				acceptedAtMs: typeof invitation.acceptedAtMs === "number" ? invitation.acceptedAtMs : null
			};
			return mapped.id.length > 0 ? [mapped] : [];
		});
	})();
	const invitationSummary = invitations.reduce((acc, invitation) => {
		acc[invitation.effectiveStatus] += 1;
		return acc;
	}, {
		pending: 0,
		accepted: 0,
		expired: 0,
		revoked: 0
	});
	const filteredInvitations = (() => {
		const search = invitationSearchTerm.trim().toLowerCase();
		return invitations.filter((invitation) => {
			if (invitation.effectiveStatus !== invitationStatusFilter) return false;
			if (search.length === 0) return true;
			return `${invitation.email} ${invitation.name ?? ""}`.toLowerCase().includes(search);
		});
	})();
	const handleRoleChange = (record, nextRole) => {
		if (record.role === nextRole) return;
		if (isPreviewMode) {
			dispatch({
				type: "setPreviewUsers",
				value: (current) => current.map((userRecord) => userRecord.id === record.id ? {
					...userRecord,
					role: nextRole,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				} : userRecord)
			});
			notifyInfo({
				title: "Preview mode",
				message: `${record.name} is now ${nextRole} in the sample workspace.`
			});
			return;
		}
		dispatch({
			type: "setSavingId",
			value: record.id
		});
		updateUserRoleStatus({
			legacyId: record.id,
			role: nextRole
		}).then(() => {
			dispatch({
				type: "setUsersOverride",
				value: (prev) => {
					return (prev ?? users).map((userRecord) => userRecord.id === record.id ? {
						...userRecord,
						role: nextRole
					} : userRecord);
				}
			});
			notifySuccess({
				title: "Role updated",
				message: `${record.name} is now ${nextRole}.`
			});
		}).catch((err) => {
			reportActionFailure({
				error: err,
				context: "AdminUsers:handleRoleChange",
				title: "Role update failed"
			});
		}).finally(() => {
			dispatch({
				type: "setSavingId",
				value: null
			});
		});
	};
	const handleApprovalToggle = (record, approved) => {
		if (record.role === "admin" && !approved) {
			notifyFailure({
				title: "Cannot disable admin",
				message: "Admin accounts must remain active."
			});
			return;
		}
		const nextStatus = approved ? "active" : "pending";
		if (record.status === nextStatus) return;
		if (isPreviewMode) {
			dispatch({
				type: "setPreviewUsers",
				value: (current) => current.map((userRecord) => userRecord.id === record.id ? {
					...userRecord,
					status: nextStatus,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				} : userRecord)
			});
			notifyInfo({
				title: "Preview mode",
				message: `${record.name} status set to ${nextStatus} in the sample workspace.`
			});
			dispatch({
				type: "setRevokeOpen",
				value: false
			});
			return;
		}
		dispatch({
			type: "setSavingId",
			value: record.id
		});
		updateUserRoleStatus({
			legacyId: record.id,
			status: nextStatus
		}).then(() => {
			dispatch({
				type: "setUsersOverride",
				value: (prev) => {
					return (prev ?? users).map((userRecord) => userRecord.id === record.id ? {
						...userRecord,
						status: nextStatus
					} : userRecord);
				}
			});
			notifySuccess({
				title: approved ? "Account approved" : "Approval revoked",
				message: `${record.name} status set to ${nextStatus}.`
			});
			dispatch({
				type: "setRevokeOpen",
				value: false
			});
		}).catch((err) => {
			reportActionFailure({
				error: err,
				context: "AdminUsers:handleApprovalToggle",
				title: "Approval update failed"
			});
		}).finally(() => {
			dispatch({
				type: "setSavingId",
				value: null
			});
		});
	};
	const handleInviteUser = () => {
		if (!inviteEmail) return;
		if (isPreviewMode) {
			const nowMs = Date.now();
			dispatch({
				type: "setPreviewInvitations",
				value: (current) => [{
					id: `preview-invite-${nowMs}`,
					email: inviteEmail,
					role: inviteRole,
					name: null,
					message: "Created from the preview admin invite flow.",
					status: "pending",
					effectiveStatus: "pending",
					invitedBy: user?.id ?? "preview-admin-1",
					invitedByName: user?.name ?? "Avery Stone",
					createdAtMs: nowMs,
					expiresAtMs: nowMs + 10080 * 60 * 1e3,
					acceptedAtMs: null
				}, ...current]
			});
			notifyInfo({
				title: "Preview mode",
				message: `Invitation queued for ${inviteEmail} in the sample workspace.`
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
			email: inviteEmail,
			role: inviteRole,
			invitedBy: user.id,
			invitedByName: user?.name ?? null
		}).then(() => {
			notifySuccess({
				title: "Invitation created",
				message: `Invitation created for ${inviteEmail} as ${inviteRole}. Email delivery depends on server integration settings.`
			});
			dispatch({ type: "resetInviteForm" });
		}).catch((err) => {
			reportActionFailure({
				error: err,
				context: "AdminUsers:handleInviteUser",
				title: "Invitation failed"
			});
		}).finally(() => {
			dispatch({
				type: "setInviteSending",
				value: false
			});
		});
	};
	const handleResendInvitation = (invitation) => {
		if (isPreviewMode) {
			const nowMs = Date.now();
			dispatch({
				type: "setPreviewInvitations",
				value: (current) => current.map((record) => record.id === invitation.id ? {
					...record,
					status: "pending",
					effectiveStatus: "pending",
					createdAtMs: nowMs,
					expiresAtMs: nowMs + 10080 * 60 * 1e3
				} : record)
			});
			notifyInfo({
				title: "Preview mode",
				message: `Sample invitation resent to ${invitation.email}.`
			});
			return;
		}
		const actionKey = `resend:${invitation.id}`;
		dispatch({
			type: "setInvitationActionKey",
			value: actionKey
		});
		resendInvitation({ id: invitation.id }).then(() => {
			notifySuccess({
				title: "Invitation resent",
				message: `A fresh invitation was created for ${invitation.email}. Email delivery depends on server integration settings.`
			});
		}).catch((err) => {
			reportActionFailure({
				error: err,
				context: "AdminUsers:handleResendInvitation",
				title: "Resend failed"
			});
		}).finally(() => {
			dispatch({
				type: "setInvitationActionKey",
				value: (current) => current === actionKey ? null : current
			});
		});
	};
	const handleRevokeInvitation = (invitation) => {
		if (isPreviewMode) {
			dispatch({
				type: "setPreviewInvitations",
				value: (current) => current.map((record) => record.id === invitation.id ? {
					...record,
					status: "revoked",
					effectiveStatus: "revoked"
				} : record)
			});
			notifyInfo({
				title: "Preview mode",
				message: `${invitation.email} was revoked in the sample workspace.`
			});
			return;
		}
		const actionKey = `revoke:${invitation.id}`;
		dispatch({
			type: "setInvitationActionKey",
			value: actionKey
		});
		revokeInvitation({ id: invitation.id }).then(() => {
			notifySuccess({
				title: "Invitation revoked",
				message: `${invitation.email} can no longer use this invitation token.`
			});
		}).catch((err) => {
			reportActionFailure({
				error: err,
				context: "AdminUsers:handleRevokeInvitation",
				title: "Revoke failed"
			});
		}).finally(() => {
			dispatch({
				type: "setInvitationActionKey",
				value: (current) => current === actionKey ? null : current
			});
		});
	};
	const handleRefresh = () => {
		if (loading) return;
		clearActionError();
		dispatch({
			type: "refresh",
			previewUsers: isPreviewMode ? getPreviewAdminUsers() : state.previewUsers,
			previewInvitations: isPreviewMode ? getPreviewAdminInvitations() : state.previewInvitations
		});
	};
	const handleInviteEmailChange = (e) => {
		dispatch({
			type: "setInviteEmail",
			value: e.target.value
		});
	};
	const handleInviteRoleChange = (v) => {
		dispatch({
			type: "setInviteRole",
			value: v
		});
	};
	const handleInviteClose = () => {
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
	const handleInvitationSearchChange = (event) => {
		dispatch({
			type: "setInvitationSearchTerm",
			value: event.target.value
		});
	};
	const handleInvitationStatusFilterChange = (value) => {
		dispatch({
			type: "setInvitationStatusFilter",
			value
		});
	};
	const handleRevokeClose = () => {
		dispatch({
			type: "setRevokeOpen",
			value: false
		});
	};
	const handleDetailsClose = () => {
		dispatch({
			type: "setDetailsOpen",
			value: false
		});
	};
	const handleDetailsOpenChange = (open) => {
		dispatch({
			type: "setDetailsOpen",
			value: open
		});
		if (!open) dispatch({
			type: "setSelectedUser",
			value: null
		});
	};
	const handleRevokeOpenChange = (open) => {
		dispatch({
			type: "setRevokeOpen",
			value: open
		});
		if (!open) dispatch({
			type: "setSelectedUser",
			value: null
		});
	};
	const handleViewDetails = (userRecord) => {
		dispatch({
			type: "setSelectedUser",
			value: userRecord
		});
		dispatch({
			type: "setDetailsOpen",
			value: true
		});
	};
	const handleRevokeAccess = (userRecord) => {
		dispatch({
			type: "setSelectedUser",
			value: userRecord
		});
		dispatch({
			type: "setRevokeOpen",
			value: true
		});
	};
	const handleRevokeConfirm = () => {
		if (selectedUser) handleApprovalToggle(selectedUser, false);
		dispatch({
			type: "setRevokeOpen",
			value: false
		});
		dispatch({
			type: "setSelectedUser",
			value: null
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
				context: "AdminUsers:loadMore",
				title: "Could not load more"
			});
		}).finally(() => {
			dispatch({
				type: "setLoadingMore",
				value: false
			});
		});
	};
	return {
		user,
		isPreviewMode,
		loading,
		summary,
		filteredUsers,
		filteredInvitations,
		invitationSummary,
		invitationsLoading,
		listQueryError,
		actionError,
		clearActionError,
		statusFilter,
		roleFilter,
		searchTerm,
		invitationSearchTerm,
		invitationStatusFilter,
		savingId,
		invitationActionKey,
		inviteOpen,
		revokeOpen,
		detailsOpen,
		selectedUser,
		inviteEmail,
		inviteRole,
		inviteSending,
		loadingMore,
		paginatedStatus: status,
		handleRefresh,
		handleRoleChange,
		handleApprovalToggle,
		handleInviteUser,
		handleResendInvitation,
		handleRevokeInvitation,
		handleInviteEmailChange,
		handleInviteRoleChange,
		handleInviteClose,
		handleInviteOpenChange,
		handleSearchChange,
		handleStatusFilterChange,
		handleRoleFilterChange,
		handleInvitationSearchChange,
		handleInvitationStatusFilterChange,
		handleRevokeClose,
		handleDetailsClose,
		handleDetailsOpenChange,
		handleRevokeOpenChange,
		handleViewDetails,
		handleRevokeAccess,
		handleRevokeConfirm,
		handleLoadMore
	};
}
function AdminUsersPage() {
	const page = useAdminUsersPage();
	if (!page.user && !page.isPreviewMode) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersSignInRequired, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: page.loading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTablePageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersPageContent, {
			isPreviewMode: page.isPreviewMode,
			loading: page.loading,
			summary: page.summary,
			listQueryError: page.listQueryError,
			actionError: page.actionError,
			clearActionError: page.clearActionError,
			searchTerm: page.searchTerm,
			statusFilter: page.statusFilter,
			roleFilter: page.roleFilter,
			filteredUsers: page.filteredUsers,
			savingId: page.savingId,
			paginatedStatus: page.paginatedStatus,
			loadingMore: page.loadingMore,
			invitationSearchTerm: page.invitationSearchTerm,
			invitationStatusFilter: page.invitationStatusFilter,
			invitationSummary: page.invitationSummary,
			invitationsLoading: page.invitationsLoading,
			filteredInvitations: page.filteredInvitations,
			invitationActionKey: page.invitationActionKey,
			inviteOpen: page.inviteOpen,
			inviteEmail: page.inviteEmail,
			inviteRole: page.inviteRole,
			inviteSending: page.inviteSending,
			revokeOpen: page.revokeOpen,
			detailsOpen: page.detailsOpen,
			selectedUser: page.selectedUser,
			onRefresh: page.handleRefresh,
			onInviteOpenChange: page.handleInviteOpenChange,
			onInviteEmailChange: page.handleInviteEmailChange,
			onInviteRoleChange: page.handleInviteRoleChange,
			onInviteClose: page.handleInviteClose,
			onInviteUser: page.handleInviteUser,
			onSearchChange: page.handleSearchChange,
			onStatusFilterChange: page.handleStatusFilterChange,
			onRoleFilterChange: page.handleRoleFilterChange,
			onRoleChange: page.handleRoleChange,
			onApprovalToggle: page.handleApprovalToggle,
			onViewDetails: page.handleViewDetails,
			onRevokeAccess: page.handleRevokeAccess,
			onLoadMore: page.handleLoadMore,
			onInvitationSearchChange: page.handleInvitationSearchChange,
			onInvitationStatusFilterChange: page.handleInvitationStatusFilterChange,
			onResendInvitation: page.handleResendInvitation,
			onRevokeInvitation: page.handleRevokeInvitation,
			onDetailsOpenChange: page.handleDetailsOpenChange,
			onDetailsClose: page.handleDetailsClose,
			onRevokeOpenChange: page.handleRevokeOpenChange,
			onRevokeClose: page.handleRevokeClose,
			onRevokeConfirm: page.handleRevokeConfirm
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminUsersPage, {});
//#endregion
export { SplitComponent as component };
