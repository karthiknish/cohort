import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, c as useConvex, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { D as getPreviewClients, y as getPreviewAdminUsers } from "./preview-data-CXkRNfsX.mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { t as Badge } from "./badge-SPDtcMeQ.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { t as asErrorMessage } from "./convex-errors-sHK0JmZ7.mjs";
import { a as notifyInfo, c as reportConvexFailure, i as notifyFailure, o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { t as usePaginatedQuery } from "../_libs/convex.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { y as clientsApi } from "./convex-api-msEHRhRb.mjs";
import { Yt as LoaderCircle, gr as Check, gt as Pencil, i as X, lr as ChevronsUpDown, lt as Plus, u as Users, w as Trash2 } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { r as useConvexQueryError } from "./use-convex-query-error-P2IX7lhG.mjs";
import { n as usePreview } from "./preview-context-DiCPwKfi.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { n as PopoverContent, r as PopoverTrigger, t as Popover } from "./popover-BwHc7N7y.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { n as useMutation, o as useQueryClient, t as useInfiniteQuery } from "../_libs/tanstack__react-query.mjs";
import { t as AdminPageShell } from "./admin-page-shell-DKKo3NPm.mjs";
import { t as AdminTablePageSkeleton } from "./admin-table-page-skeleton-THYDnWPV.mjs";
import { t as AdminQueryErrorAlert } from "./admin-query-error-alert-Clikw_eH.mjs";
import { a as CommandInput, i as CommandGroup, o as CommandItem, r as CommandEmpty, s as CommandList, t as Command$1 } from "./command-Cz1YTxoT.mjs";
import { a as getAssignableWorkspaceUsers, i as filterAllocationClients, n as countUnmatchedClientAllocations, o as normalizeAllocationUsers, r as dedupeClientTeamMembers, t as buildClientAllocationSummary } from "./client-allocation-BUDT7CTa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/clients-D7dQZaP_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_EXCLUDE_NAMES = [];
function normalizeName(value) {
	return value.trim().toLowerCase();
}
function UserSearchPicker({ id, value, onChange, options, placeholder, searchPlaceholder, emptyText, disabled = false, excludeNames = EMPTY_EXCLUDE_NAMES }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const generatedId = (0, import_react.useId)();
	const triggerId = id ?? `user-search-picker-${generatedId}`;
	const listboxId = `${triggerId}-listbox`;
	const selectedValue = normalizeName(value);
	const excluded = new Set(excludeNames.map(normalizeName));
	const availableOptions = options.filter((option) => !excluded.has(normalizeName(option.name)) || normalizeName(option.name) === selectedValue);
	const selectedLabel = availableOptions.find((option) => normalizeName(option.name) === selectedValue)?.name ?? value;
	const handleSelectOption = (optionName) => {
		onChange(optionName);
		setOpen(false);
	};
	const selectHandlers = Object.fromEntries(availableOptions.map((option) => [option.id, () => handleSelectOption(option.name)]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				id: triggerId,
				type: "button",
				variant: "outline",
				role: "combobox",
				"aria-expanded": open,
				"aria-controls": listboxId,
				disabled,
				className: cn("w-full justify-between font-normal", !selectedLabel && "text-muted-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: selectedLabel || placeholder
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "ml-2 size-4 shrink-0 opacity-50" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			className: "w-[var(--radix-popover-trigger-width)] p-0",
			align: "start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, { placeholder: searchPlaceholder }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, {
				id: listboxId,
				role: "listbox",
				"aria-labelledby": triggerId,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: emptyText }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, { children: availableOptions.map((option) => {
					const isSelected = normalizeName(option.name) === selectedValue;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
						value: `${option.name} ${option.email ?? ""}`,
						onSelect: selectHandlers[option.id],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("mr-2 size-4", isSelected ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 flex-col",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: option.name
							}), option.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: option.email
							}) : null]
						})]
					}, option.id);
				}) })]
			})] })
		})]
	});
}
function AdminClientsTeamMemberFieldRow({ member, index, assignableUsers, clientSaving, teamMembersLength, onUpdateName, onUpdateRole, onRemove, excludeNames }) {
	const handleNameChange = (value) => onUpdateName(member.key, value);
	const handleNameInputChange = (event) => onUpdateName(member.key, event.target.value);
	const handleRoleChange = (event) => onUpdateRole(member.key, event.target.value);
	const handleRemove = () => onRemove(member.key);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 rounded-md border p-4 sm:flex-row sm:items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `team-member-name-${member.key}`,
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Name"
				}), assignableUsers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSearchPicker, {
					id: `team-member-name-${member.key}`,
					value: member.name,
					onChange: handleNameChange,
					options: assignableUsers,
					placeholder: index === 0 ? "Select teammate" : "Choose teammate",
					searchPlaceholder: "Search teammates",
					emptyText: "No matching teammate found.",
					disabled: clientSaving,
					excludeNames
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `team-member-name-${member.key}`,
					placeholder: index === 0 ? "Alex Chen" : "Teammate name",
					value: member.name,
					onChange: handleNameInputChange,
					disabled: clientSaving
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: `team-member-role-${member.key}`,
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Role"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `team-member-role-${member.key}`,
					placeholder: index === 0 ? "Paid Media Lead" : "Role (optional)",
					value: member.role,
					onChange: handleRoleChange,
					disabled: clientSaving
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-end pt-2 sm:pt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "ghost",
					size: "icon",
					className: "text-destructive hover:text-destructive",
					onClick: handleRemove,
					disabled: teamMembersLength <= 1 || clientSaving,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sr-only",
						children: "Remove team member"
					})]
				})
			})
		]
	});
}
function AdminClientsClientRow({ client, unmatchedCount, addingMember, clientPendingMembersId, deletingClientId, removingTeamMemberKey, onAddTeamMember, onDeleteClient, onRemoveTeamMember, onEditTeamMemberRole, updatingMemberRoleKey }) {
	const handleAddTeamMember = () => onAddTeamMember(client);
	const handleDeleteClient = () => onDeleteClient(client);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold text-foreground",
					children: client.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: ["Managed by ", client.accountManager]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							children: ["Team ", client.teamMembers.length]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: unmatchedCount ? "secondary" : "outline",
							children: unmatchedCount ? `${unmatchedCount} unmatched` : "Mapped"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: handleAddTeamMember,
							disabled: addingMember && clientPendingMembersId === client.id,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), " Add teammate"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "destructive",
							size: "sm",
							onClick: handleDeleteClient,
							disabled: Boolean(deletingClientId) && deletingClientId !== client.id,
							children: deletingClientId === client.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Deleting…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), " Delete"] })
						})
					]
				})]
			}),
			unmatchedCount ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-warning",
				children: "This client still has legacy allocation names that do not match current workspace users."
			}) : null,
			client.teamMembers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: client.teamMembers.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsTeamMemberBadge, {
					client,
					member,
					removingTeamMemberKey,
					updatingMemberRoleKey,
					onRemove: onRemoveTeamMember,
					onEditRole: onEditTeamMemberRole
				}, `${client.id}-${member.name}-${member.role}`))
			})
		]
	});
}
function AdminClientsTeamMemberBadge({ client, member, removingTeamMemberKey, updatingMemberRoleKey, onRemove, onEditRole }) {
	const handleRemove = () => onRemove(client, member.name);
	const handleEditRole = () => onEditRole(client, member);
	const memberKey = `${client.id}:${member.name.toLowerCase()}`;
	const isRemoving = removingTeamMemberKey === memberKey;
	const isUpdatingRole = updatingMemberRoleKey === memberKey;
	const isAccountManager = member.name.toLowerCase() === client.accountManager.toLowerCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-foreground",
				children: member.name
			}),
			member.role && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-2 text-muted-foreground",
				children: member.role
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "ml-2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
				onClick: handleEditRole,
				disabled: isRemoving || isUpdatingRole,
				"aria-label": `Edit ${member.name}'s role on ${client.name}`,
				title: `Edit ${member.name}'s role`,
				children: isUpdatingRole ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50",
				onClick: handleRemove,
				disabled: isRemoving || isUpdatingRole || isAccountManager,
				"aria-label": `Remove ${member.name} from ${client.name}`,
				title: isAccountManager ? "Account manager cannot be removed from the team" : `Remove ${member.name}`,
				children: isRemoving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
			})
		]
	});
}
function AdminClientsStatsGrid({ clientsLoading, clientsCount, nextCursor, existingTeamMembers, assignableUsersCount, unmatchedCount }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-sm font-medium text-muted-foreground",
					children: "Active clients"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: `size-4 text-muted-foreground ${clientsLoading ? "animate-spin" : ""}` })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl font-semibold",
				children: clientsCount
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: nextCursor ? "More workspaces available — use Load more." : "All matching pages loaded."
			})] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "space-y-1 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-sm font-medium text-muted-foreground",
					children: "Workspace coverage"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Team members attached" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl font-bold",
				children: existingTeamMembers
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Across all clients"
			})] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "space-y-1 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-sm font-medium text-muted-foreground",
					children: "Assignable teammates"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Internal users available" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl font-bold",
				children: assignableUsersCount
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Admins and team members available for client allocation"
			})] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "space-y-1 pb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-sm font-medium text-muted-foreground",
					children: "Allocation cleanup"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Legacy names to review" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xl font-bold",
				children: unmatchedCount
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Client assignments that no longer map to current users"
			})] })] })
		]
	});
}
function AdminClientsNewClientForm({ assignableUsers, clientName, clientAccountManager, teamMemberFields, clientSaving, onFormSubmit, onClientNameChange, onAccountManagerChange, onAccountManagerInputChange, onAddTeamMemberField, onUpdateTeamMemberName, onUpdateTeamMemberRole, onRemoveTeamMemberField, onResetClientForm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "space-y-4",
		onSubmit: onFormSubmit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "admin-client-name",
						children: "Client name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "admin-client-name",
						placeholder: "e.g. Horizon Ventures",
						value: clientName,
						onChange: onClientNameChange,
						required: true,
						disabled: clientSaving
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "admin-client-owner",
						children: "Account manager"
					}), assignableUsers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSearchPicker, {
						id: "admin-client-owner",
						value: clientAccountManager,
						onChange: onAccountManagerChange,
						options: assignableUsers,
						placeholder: "Select a workspace owner",
						searchPlaceholder: "Search internal teammates",
						emptyText: "No matching teammate found.",
						disabled: clientSaving
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "admin-client-owner",
						placeholder: "Primary owner",
						value: clientAccountManager,
						onChange: onAccountManagerInputChange,
						required: true,
						disabled: clientSaving
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "text-sm font-medium",
							children: "Team members"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							onClick: onAddTeamMemberField,
							disabled: clientSaving,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 size-4" }), " Add teammate"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: teamMemberFields.map((member, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsTeamMemberFieldRow, {
							member,
							index,
							assignableUsers,
							clientSaving,
							teamMembersLength: teamMemberFields.length,
							onUpdateName: onUpdateTeamMemberName,
							onUpdateRole: onUpdateTeamMemberRole,
							onRemove: onRemoveTeamMemberField,
							excludeNames: teamMemberFields.flatMap((candidate) => candidate.key !== member.key ? [candidate.name] : [])
						}, member.key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: assignableUsers.length > 0 ? "Choose from active internal teammates so client ownership stays mapped to real workspace users. Account managers are automatically added to the client team." : "No internal teammates are available yet, so legacy free-text allocation is still enabled."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					type: "button",
					onClick: onResetClientForm,
					disabled: clientSaving,
					children: "Reset form"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "submit",
					disabled: clientSaving,
					children: [clientSaving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Create client"]
				})]
			})
		]
	});
}
function AdminClientsWorkspaceList({ clientsLoading, clientsCount, clientsError, workspaceQueryError, clientSearch, filteredClients, unmatchedByClientId, nextCursor, loadingMore, addingMember, clientPendingMembersId, deletingClientId, removingTeamMemberKey, onClientSearchChange, onRequestAddTeamMember, onRequestDeleteClient, onRemoveTeamMember, onEditTeamMemberRole, updatingMemberRoleKey, onLoadMore }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm font-semibold text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Existing client workspaces" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "secondary",
							children: clientsCount
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: clientSearch,
					onChange: onClientSearchChange,
					placeholder: "Search clients or teammates",
					className: "w-full sm:w-72"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminQueryErrorAlert, {
				error: workspaceQueryError ?? clientsError,
				title: "Unable to load clients"
			}),
			clientsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Loading clients…"]
			}) : clientsCount === 0 && !clientsError && !workspaceQueryError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No clients yet. Add a workspace to get started."
			}) : filteredClients.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No client workspaces match your search."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [filteredClients.map((client) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsClientRow, {
					client,
					unmatchedCount: unmatchedByClientId[client.id] ?? 0,
					addingMember,
					clientPendingMembersId,
					deletingClientId,
					removingTeamMemberKey,
					onAddTeamMember: onRequestAddTeamMember,
					onDeleteClient: onRequestDeleteClient,
					onRemoveTeamMember,
					onEditTeamMemberRole,
					updatingMemberRoleKey
				}, client.id)), nextCursor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: onLoadMore,
						disabled: loadingMore,
						className: "w-full sm:w-auto",
						children: loadingMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), " Loading…"] }) : "Load more clients"
					})
				})]
			})
		]
	});
}
function AdminClientsDeleteDialog({ open, clientName, deletingClientId, onOpenChange, onCancel, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Delete client workspace" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
			"This action permanently removes ",
			clientName ?? "this client",
			" and its workspace configuration. You can recreate it later, but the team list will need to be re-entered."
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			onClick: onCancel,
			disabled: Boolean(deletingClientId),
			children: "Cancel"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			type: "button",
			variant: "destructive",
			onClick: onConfirm,
			disabled: Boolean(deletingClientId),
			children: [deletingClientId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), deletingClientId ? "Deleting…" : "Delete client"]
		})] })] })
	});
}
function AdminClientsAddTeamMemberDialog({ open, clientName, assignableUsers, memberName, memberRole, addingMember, existingMemberNames, onOpenChange, onMemberNameChange, onMemberNameInputChange, onMemberRoleChange, onCancel, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add teammate" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				"Add a collaborator to ",
				clientName ?? "this client",
				"."
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "team-member-name-input",
						children: "Name"
					}), assignableUsers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSearchPicker, {
						id: "team-member-name-input",
						value: memberName,
						onChange: onMemberNameChange,
						options: assignableUsers,
						placeholder: "Select teammate",
						searchPlaceholder: "Search teammates",
						emptyText: "No matching teammate found.",
						disabled: addingMember,
						excludeNames: existingMemberNames
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "team-member-name-input",
						placeholder: "e.g. Priya Patel",
						value: memberName,
						onChange: onMemberNameInputChange,
						disabled: addingMember
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "team-member-role-input",
						children: "Role (optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "team-member-role-input",
						placeholder: "e.g. Paid Media Lead",
						value: memberRole,
						onChange: onMemberRoleChange,
						disabled: addingMember
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onCancel,
				disabled: addingMember,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				onClick: onConfirm,
				disabled: addingMember,
				children: [addingMember && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Add teammate"]
			})] })
		] })
	});
}
function AdminClientsEditTeamMemberRoleDialog({ open, clientName, memberName, memberRole, updatingRole, onOpenChange, onMemberRoleChange, onCancel, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit teammate role" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
				"Set ",
				memberName ?? "this teammate",
				"'s role on ",
				clientName ?? "this client",
				". Roles can differ per client."
			] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-team-member-name",
						children: "Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "edit-team-member-name",
						value: memberName ?? "",
						disabled: true
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-team-member-role-input",
						children: "Role"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "edit-team-member-role-input",
						placeholder: "e.g. Paid Media Lead",
						value: memberRole,
						onChange: onMemberRoleChange,
						disabled: updatingRole
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onCancel,
				disabled: updatingRole,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				onClick: onConfirm,
				disabled: updatingRole,
				children: [updatingRole && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Save role"]
			})] })
		] })
	});
}
function AdminClientsPageDialogs({ isDeleteDialogOpen, clientPendingDeleteName, deletingClientId, onDeleteDialogChange, onCancelDelete, onConfirmDelete, isTeamDialogOpen, clientPendingMembersName, assignableUsers, memberName, memberRole, addingMember, existingMemberNames, onTeamDialogChange, onMemberNameChange, onMemberNameInputChange, onMemberRoleChange, onCancelTeamDialog, onConfirmAddTeamMember, isEditRoleDialogOpen, clientPendingEditMemberName, clientPendingEditClientName, editingMemberRole, updatingMemberRoleKey, onEditRoleDialogChange, onEditingMemberRoleChange, onCancelEditRoleDialog, onConfirmEditTeamMemberRole }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsDeleteDialog, {
			open: isDeleteDialogOpen,
			clientName: clientPendingDeleteName,
			deletingClientId,
			onOpenChange: onDeleteDialogChange,
			onCancel: onCancelDelete,
			onConfirm: onConfirmDelete
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsAddTeamMemberDialog, {
			open: isTeamDialogOpen,
			clientName: clientPendingMembersName,
			assignableUsers,
			memberName,
			memberRole,
			addingMember,
			existingMemberNames,
			onOpenChange: onTeamDialogChange,
			onMemberNameChange,
			onMemberNameInputChange,
			onMemberRoleChange,
			onCancel: onCancelTeamDialog,
			onConfirm: onConfirmAddTeamMember
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsEditTeamMemberRoleDialog, {
			open: isEditRoleDialogOpen,
			clientName: clientPendingEditClientName,
			memberName: clientPendingEditMemberName,
			memberRole: editingMemberRole,
			updatingRole: Boolean(updatingMemberRoleKey),
			onOpenChange: onEditRoleDialogChange,
			onMemberRoleChange: onEditingMemberRoleChange,
			onCancel: onCancelEditRoleDialog,
			onConfirm: onConfirmEditTeamMemberRole
		})
	] });
}
function AdminClientsPageHeaderActions({ clientsLoading, onRefresh }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "outline",
			size: "sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: "/admin/team",
				children: "Team"
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
			variant: "outline",
			size: "sm",
			onClick: onRefresh,
			disabled: clientsLoading,
			className: "inline-flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: `size-4 ${clientsLoading ? "animate-spin" : ""}` }), " Refresh"]
		})
	] });
}
function AdminClientsWorkspaceManagementCard({ assignableUsers, clientName, clientAccountManager, teamMemberFields, clientSaving, clientsLoading, clientsCount, clientsError, workspaceQueryError, clientSearch, filteredClients, unmatchedByClientId, nextCursor, loadingMore, addingMember, clientPendingMembersId, deletingClientId, removingTeamMemberKey, updatingMemberRoleKey, onFormSubmit, onClientNameChange, onAccountManagerChange, onAccountManagerInputChange, onAddTeamMemberField, onUpdateTeamMemberName, onUpdateTeamMemberRole, onRemoveTeamMemberField, onResetClientForm, onClientSearchChange, onRequestAddTeamMember, onRequestDeleteClient, onRemoveTeamMember, onEditTeamMemberRole, onLoadMore }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
		className: "text-lg",
		children: "New client"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Kick off a workspace with the key account team." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsNewClientForm, {
			assignableUsers,
			clientName,
			clientAccountManager,
			teamMemberFields,
			clientSaving,
			onFormSubmit,
			onClientNameChange,
			onAccountManagerChange,
			onAccountManagerInputChange,
			onAddTeamMemberField,
			onUpdateTeamMemberName,
			onUpdateTeamMemberRole,
			onRemoveTeamMemberField,
			onResetClientForm
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsWorkspaceList, {
			clientsLoading,
			clientsCount,
			clientsError,
			workspaceQueryError,
			clientSearch,
			filteredClients,
			unmatchedByClientId,
			nextCursor,
			loadingMore,
			addingMember,
			clientPendingMembersId,
			deletingClientId,
			removingTeamMemberKey,
			onClientSearchChange,
			onRequestAddTeamMember,
			onRequestDeleteClient,
			onRemoveTeamMember,
			onEditTeamMemberRole,
			updatingMemberRoleKey,
			onLoadMore
		})]
	})] });
}
function AdminClientsSignInRequired() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "max-w-md border-muted/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-lg",
				children: "Sign in required"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Log in to an admin account to manage client workspaces." })] })
		})
	});
}
function AdminClientsPageContent(props) {
	const { isPreviewMode, clientsLoading, clients, nextCursor, existingTeamMembers, assignableUsers, allocationSummary, filteredClients, unmatchedByClientId, clientSearch, workspaceQueryError, clientsError, clientName, clientAccountManager, teamMemberFields, clientSaving, clientPendingDelete, isDeleteDialogOpen, deletingClientId, clientPendingMembers, isTeamDialogOpen, addingMember, removingTeamMemberKey, memberName, memberRole, updatingMemberRoleKey, editingMemberRole, isEditRoleDialogOpen, clientPendingEditMember, loadingMore, onRefresh, onFormSubmit, onClientNameChange, onAccountManagerChange, onAccountManagerInputChange, onClientSearchChange, onAddTeamMemberField, onUpdateTeamMemberName, onUpdateTeamMemberRole, onRemoveTeamMemberField, onResetClientForm, onRequestAddTeamMember, onRequestDeleteClient, onRemoveTeamMember, onEditTeamMemberRole, onLoadMore, onDeleteDialogChange, onCancelDelete, onConfirmDelete, onTeamDialogChange, onMemberNameChange, onMemberNameInputChange, onMemberRoleChange, onCancelTeamDialog, onConfirmAddTeamMember, onEditRoleDialogChange, onEditingMemberRoleChange, onCancelEditRoleDialog, onConfirmEditTeamMemberRole } = props;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminPageShell, {
		title: "Client workspaces",
		description: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Allocate real internal teammates to each client workspace and keep ownership clean.", isPreviewMode ? " Preview mode keeps client changes local to this session." : ""] }),
		isPreviewMode,
		actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsPageHeaderActions, {
			clientsLoading,
			onRefresh
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsStatsGrid, {
			clientsLoading,
			clientsCount: clients.length,
			nextCursor,
			existingTeamMembers,
			assignableUsersCount: assignableUsers.length,
			unmatchedCount: allocationSummary.unmatched.length
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsWorkspaceManagementCard, {
			assignableUsers,
			clientName,
			clientAccountManager,
			teamMemberFields,
			clientSaving,
			clientsLoading,
			clientsCount: clients.length,
			clientsError,
			workspaceQueryError,
			clientSearch,
			filteredClients,
			unmatchedByClientId,
			nextCursor,
			loadingMore,
			addingMember,
			clientPendingMembersId: clientPendingMembers?.id,
			deletingClientId,
			removingTeamMemberKey,
			updatingMemberRoleKey,
			onFormSubmit,
			onClientNameChange,
			onAccountManagerChange,
			onAccountManagerInputChange,
			onAddTeamMemberField,
			onUpdateTeamMemberName,
			onUpdateTeamMemberRole,
			onRemoveTeamMemberField,
			onResetClientForm,
			onClientSearchChange,
			onRequestAddTeamMember,
			onRequestDeleteClient,
			onRemoveTeamMember,
			onEditTeamMemberRole,
			onLoadMore
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsPageDialogs, {
		isDeleteDialogOpen,
		clientPendingDeleteName: clientPendingDelete?.name,
		deletingClientId,
		onDeleteDialogChange,
		onCancelDelete,
		onConfirmDelete,
		isTeamDialogOpen,
		clientPendingMembersName: clientPendingMembers?.name,
		assignableUsers,
		memberName,
		memberRole,
		addingMember,
		existingMemberNames: (clientPendingMembers?.teamMembers ?? []).map((member) => member.name),
		onTeamDialogChange,
		onMemberNameChange,
		onMemberNameInputChange,
		onMemberRoleChange,
		onCancelTeamDialog,
		onConfirmAddTeamMember,
		isEditRoleDialogOpen,
		clientPendingEditMemberName: clientPendingEditMember?.memberName,
		clientPendingEditClientName: clientPendingEditMember?.client.name,
		editingMemberRole,
		updatingMemberRoleKey,
		onEditRoleDialogChange,
		onEditingMemberRoleChange,
		onCancelEditRoleDialog,
		onConfirmEditTeamMemberRole
	})] });
}
function resolveClientWorkspaceId(client, fallbackWorkspaceId) {
	return client.workspaceId ?? fallbackWorkspaceId;
}
function createEmptyMemberField() {
	return {
		key: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
		name: "",
		role: ""
	};
}
function useAdminClients() {
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	const convex = useConvex();
	const queryClient = useQueryClient();
	const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : "skip");
	const workspaceId = workspaceContext?.workspaceId ?? null;
	const includeAllWorkspaces = workspaceContext?.role === "admin";
	const workspaceLoading = !isPreviewMode && user != null && workspaceContext === void 0;
	const [previewClients, setPreviewClients] = (0, import_react.useState)(() => getPreviewClients());
	const clientsInfiniteQuery = useInfiniteQuery({
		queryKey: [
			"adminClients",
			workspaceId,
			includeAllWorkspaces
		],
		enabled: !isPreviewMode && Boolean(workspaceId),
		initialPageParam: null,
		queryFn: async ({ pageParam }) => {
			if (!workspaceId) return {
				items: [],
				nextCursor: null
			};
			return await convex.query(clientsApi.list, {
				workspaceId,
				limit: 100,
				cursor: pageParam,
				includeAllWorkspaces
			});
		},
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? null
	});
	const createClientMutation = useMutation({
		mutationFn: async (args) => await convex.mutation(clientsApi.create, args),
		onSuccess: () => {
			clientsInfiniteQuery.refetch();
			queryClient.invalidateQueries({ queryKey: ["adminClients"] });
		}
	});
	const softDeleteClientMutation = useMutation({
		mutationFn: async (args) => await convex.mutation(clientsApi.softDelete, args),
		onSuccess: () => {
			clientsInfiniteQuery.refetch();
			queryClient.invalidateQueries({ queryKey: ["adminClients"] });
		}
	});
	const addTeamMemberMutation = useMutation({
		mutationFn: async (args) => await convex.mutation(clientsApi.addTeamMember, args),
		onSuccess: () => {
			clientsInfiniteQuery.refetch();
			queryClient.invalidateQueries({ queryKey: ["adminClients"] });
		}
	});
	const removeTeamMemberMutation = useMutation({
		mutationFn: async (args) => await convex.mutation(clientsApi.removeTeamMember, args),
		onSuccess: () => {
			clientsInfiniteQuery.refetch();
			queryClient.invalidateQueries({ queryKey: ["adminClients"] });
		}
	});
	const updateTeamMemberRoleMutation = useMutation({
		mutationFn: async (args) => await convex.mutation(clientsApi.updateTeamMemberRole, args),
		onSuccess: () => {
			clientsInfiniteQuery.refetch();
			queryClient.invalidateQueries({ queryKey: ["adminClients"] });
		}
	});
	const syncAdminTeamMembersMutation = useMutation({
		mutationFn: async (args) => await convex.mutation(clientsApi.syncAdminTeamMembers, args),
		onSuccess: () => {
			clientsInfiniteQuery.refetch();
			queryClient.invalidateQueries({ queryKey: ["adminClients"] });
		}
	});
	const hasSyncedAdminTeamMembersRef = (0, import_react.useRef)(false);
	const [clientPendingDelete, setClientPendingDelete] = (0, import_react.useState)(null);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = (0, import_react.useState)(false);
	const [deletingClientId, setDeletingClientId] = (0, import_react.useState)(null);
	const [clientPendingMembers, setClientPendingMembers] = (0, import_react.useState)(null);
	const [isTeamDialogOpen, setIsTeamDialogOpen] = (0, import_react.useState)(false);
	const [addingMember, setAddingMember] = (0, import_react.useState)(false);
	const [removingTeamMemberKey, setRemovingTeamMemberKey] = (0, import_react.useState)(null);
	const [memberName, setMemberName] = (0, import_react.useState)("");
	const [memberRole, setMemberRole] = (0, import_react.useState)("");
	const [clientPendingEditMember, setClientPendingEditMember] = (0, import_react.useState)(null);
	const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = (0, import_react.useState)(false);
	const [editingMemberRole, setEditingMemberRole] = (0, import_react.useState)("");
	const [updatingMemberRoleKey, setUpdatingMemberRoleKey] = (0, import_react.useState)(null);
	const [clientSaving, setClientSaving] = (0, import_react.useState)(false);
	const [clientName, setClientName] = (0, import_react.useState)("");
	const [clientAccountManager, setClientAccountManager] = (0, import_react.useState)("");
	const [teamMemberFields, setTeamMemberFields] = (0, import_react.useState)([createEmptyMemberField()]);
	const liveClients = (() => {
		const list = (clientsInfiniteQuery.data?.pages ?? []).flatMap((page) => Array.isArray(page.items) ? page.items : []).map((row) => ({
			id: row.legacyId ?? "",
			workspaceId: typeof row.workspaceId === "string" ? row.workspaceId : null,
			name: row.name ?? "",
			accountManager: row.accountManager ?? "",
			teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
			createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
			updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null
		}));
		list.sort((a, b) => a.name.localeCompare(b.name));
		return list;
	})();
	const clients = isPreviewMode ? previewClients : liveClients;
	const setClients = (updater) => {
		if (!isPreviewMode) return;
		setPreviewClients((current) => typeof updater === "function" ? updater(current) : updater);
	};
	const clientsLoading = isPreviewMode ? false : workspaceLoading || clientsInfiniteQuery.isLoading;
	const clientsError = isPreviewMode ? null : clientsInfiniteQuery.error ? asErrorMessage(clientsInfiniteQuery.error) : null;
	const loadingMore = !isPreviewMode && clientsInfiniteQuery.isFetchingNextPage;
	const nextCursor = !isPreviewMode && clientsInfiniteQuery.hasNextPage ? "more" : null;
	(0, import_react.useEffect)(() => {
		hasSyncedAdminTeamMembersRef.current = false;
	}, [workspaceId, includeAllWorkspaces]);
	(0, import_react.useEffect)(() => {
		if (isPreviewMode || !workspaceId || clientsLoading || hasSyncedAdminTeamMembersRef.current) return;
		const workspaceIds = includeAllWorkspaces ? [...new Set(clients.map((client) => client.workspaceId).filter((value) => typeof value === "string" && value.length > 0))] : [workspaceId];
		if (workspaceIds.length === 0) return;
		hasSyncedAdminTeamMembersRef.current = true;
		(async () => {
			try {
				await Promise.all(workspaceIds.map((targetWorkspaceId) => syncAdminTeamMembersMutation.mutateAsync({ workspaceId: targetWorkspaceId })));
			} catch (err) {
				hasSyncedAdminTeamMembersRef.current = false;
				reportConvexFailure({
					error: err,
					context: "useAdminClients:syncAdminTeamMembers",
					title: "Could not sync admin teammates"
				});
			}
		})();
	}, [
		clients,
		clientsLoading,
		includeAllWorkspaces,
		isPreviewMode,
		syncAdminTeamMembersMutation,
		workspaceId
	]);
	const existingTeamMembers = clients.reduce((total, client) => total + client.teamMembers.length, 0);
	const loadClients = async () => {
		if (isPreviewMode) {
			setPreviewClients(getPreviewClients());
			notifyInfo({
				title: "Preview data refreshed",
				message: "Showing sample client workspaces."
			});
			return;
		}
		clientsInfiniteQuery.refetch();
	};
	const handleLoadMore = async () => {
		if (isPreviewMode) return;
		if (!clientsInfiniteQuery.hasNextPage || clientsInfiniteQuery.isFetchingNextPage) return;
		try {
			await clientsInfiniteQuery.fetchNextPage();
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAdminClients:handleLoadMore",
				title: "Could not load more"
			});
		}
	};
	const handleDeleteDialogChange = (open) => {
		setIsDeleteDialogOpen(open);
		if (!open) setClientPendingDelete(null);
	};
	const requestDeleteClient = (client) => {
		setClientPendingDelete(client);
		setIsDeleteDialogOpen(true);
	};
	const handleDeleteClient = async () => {
		if (!clientPendingDelete) return;
		if (isPreviewMode) {
			setDeletingClientId(clientPendingDelete.id);
			setPreviewClients((current) => current.filter((client) => client.id !== clientPendingDelete.id));
			notifyInfo({
				title: "Preview mode",
				message: `${clientPendingDelete.name} was removed locally for this session.`
			});
			setClientPendingDelete(null);
			setIsDeleteDialogOpen(false);
			setDeletingClientId(null);
			return;
		}
		if (!workspaceId) return;
		const targetWorkspaceId = resolveClientWorkspaceId(clientPendingDelete, workspaceId);
		if (!targetWorkspaceId) return;
		try {
			setDeletingClientId(clientPendingDelete.id);
			await softDeleteClientMutation.mutateAsync({
				workspaceId: targetWorkspaceId,
				legacyId: clientPendingDelete.id,
				deletedAtMs: Date.now()
			});
			notifySuccess({
				title: "Client deleted",
				message: `${clientPendingDelete.name} has been removed.`
			});
			setClientPendingDelete(null);
			setIsDeleteDialogOpen(false);
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAdminClients:handleDeleteClient",
				title: "Client delete failed"
			});
		} finally {
			setDeletingClientId(null);
		}
	};
	const handleTeamDialogChange = (open) => {
		setIsTeamDialogOpen(open);
		if (!open) {
			setClientPendingMembers(null);
			setMemberName("");
			setMemberRole("");
			setAddingMember(false);
		}
	};
	const requestAddTeamMember = (client) => {
		setClientPendingMembers(client);
		setMemberName("");
		setMemberRole("");
		setIsTeamDialogOpen(true);
	};
	const handleAddTeamMember = async () => {
		if (!clientPendingMembers) return;
		const name = memberName.trim();
		if (!name) {
			notifyFailure({
				title: "Name required",
				message: "Enter a teammate name before adding."
			});
			return;
		}
		if (clientPendingMembers.teamMembers.some((member) => member.name.trim().toLowerCase() === name.toLowerCase())) {
			notifyFailure({
				title: "Already assigned",
				message: `${name} is already on ${clientPendingMembers.name}.`
			});
			return;
		}
		const role = memberRole.trim();
		if (isPreviewMode) {
			setAddingMember(true);
			setPreviewClients((current) => current.map((client) => {
				if (client.id !== clientPendingMembers.id) return client;
				return {
					...client,
					teamMembers: [...client.teamMembers, {
						name,
						role: role || "Contributor"
					}],
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				};
			}));
			notifyInfo({
				title: "Preview mode",
				message: `${name} joined ${clientPendingMembers.name} in the sample workspace.`
			});
			setMemberName("");
			setMemberRole("");
			setIsTeamDialogOpen(false);
			setClientPendingMembers(null);
			setAddingMember(false);
			return;
		}
		if (!workspaceId) return;
		const targetWorkspaceId = resolveClientWorkspaceId(clientPendingMembers, workspaceId);
		if (!targetWorkspaceId) return;
		try {
			setAddingMember(true);
			await addTeamMemberMutation.mutateAsync({
				workspaceId: targetWorkspaceId,
				legacyId: clientPendingMembers.id,
				name,
				role: role || void 0
			});
			notifySuccess({
				title: "Teammate added",
				message: `${name} joined ${clientPendingMembers.name}.`
			});
			setMemberName("");
			setMemberRole("");
			setIsTeamDialogOpen(false);
			setClientPendingMembers(null);
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAdminClients:handleAddTeamMember",
				title: "Add teammate failed"
			});
		} finally {
			setAddingMember(false);
		}
	};
	const handleRemoveTeamMember = async (client, memberName) => {
		const normalizedName = memberName.trim();
		if (!normalizedName) return;
		if (normalizedName.toLowerCase() === client.accountManager.toLowerCase()) {
			notifyFailure({
				title: "Cannot remove account manager",
				message: "Change the account manager before removing this teammate."
			});
			return;
		}
		if (isPreviewMode) {
			setRemovingTeamMemberKey(`${client.id}:${normalizedName.toLowerCase()}`);
			setPreviewClients((current) => current.map((candidate) => {
				if (candidate.id !== client.id) return candidate;
				return {
					...candidate,
					teamMembers: candidate.teamMembers.filter((member) => member.name.trim().toLowerCase() !== normalizedName.toLowerCase()),
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				};
			}));
			notifyInfo({
				title: "Preview mode",
				message: `${normalizedName} was removed from ${client.name} locally.`
			});
			setRemovingTeamMemberKey(null);
			return;
		}
		if (!workspaceId) return;
		const targetWorkspaceId = resolveClientWorkspaceId(client, workspaceId);
		if (!targetWorkspaceId) return;
		const removeKey = `${client.id}:${normalizedName.toLowerCase()}`;
		try {
			setRemovingTeamMemberKey(removeKey);
			await removeTeamMemberMutation.mutateAsync({
				workspaceId: targetWorkspaceId,
				legacyId: client.id,
				name: normalizedName
			});
			notifySuccess({
				title: "Teammate removed",
				message: `${normalizedName} was removed from ${client.name}.`
			});
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAdminClients:handleRemoveTeamMember",
				title: "Remove teammate failed"
			});
		} finally {
			setRemovingTeamMemberKey(null);
		}
	};
	const requestEditTeamMemberRole = (client, member) => {
		setClientPendingEditMember({
			client,
			memberName: member.name,
			memberRole: member.role
		});
		setEditingMemberRole(member.role);
		setIsEditRoleDialogOpen(true);
	};
	const handleEditRoleDialogChange = (open) => {
		setIsEditRoleDialogOpen(open);
		if (!open) {
			setClientPendingEditMember(null);
			setEditingMemberRole("");
		}
	};
	const handleUpdateTeamMemberRole = async () => {
		if (!clientPendingEditMember) return;
		const { client, memberName: currentMemberName } = clientPendingEditMember;
		const normalizedName = currentMemberName.trim();
		if (!normalizedName) return;
		const role = editingMemberRole.trim() || "Contributor";
		if (isPreviewMode) {
			setUpdatingMemberRoleKey(`${client.id}:${normalizedName.toLowerCase()}`);
			setPreviewClients((current) => current.map((candidate) => {
				if (candidate.id !== client.id) return candidate;
				return {
					...candidate,
					teamMembers: candidate.teamMembers.map((member) => member.name.trim().toLowerCase() === normalizedName.toLowerCase() ? {
						...member,
						role
					} : member),
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				};
			}));
			notifyInfo({
				title: "Preview mode",
				message: `${normalizedName}'s role on ${client.name} was updated locally.`
			});
			setIsEditRoleDialogOpen(false);
			setClientPendingEditMember(null);
			setEditingMemberRole("");
			setUpdatingMemberRoleKey(null);
			return;
		}
		if (!workspaceId) return;
		const targetWorkspaceId = resolveClientWorkspaceId(client, workspaceId);
		if (!targetWorkspaceId) return;
		const updateKey = `${client.id}:${normalizedName.toLowerCase()}`;
		try {
			setUpdatingMemberRoleKey(updateKey);
			await updateTeamMemberRoleMutation.mutateAsync({
				workspaceId: targetWorkspaceId,
				legacyId: client.id,
				name: normalizedName,
				role
			});
			notifySuccess({
				title: "Role updated",
				message: `${normalizedName} is now ${role} on ${client.name}.`
			});
			setIsEditRoleDialogOpen(false);
			setClientPendingEditMember(null);
			setEditingMemberRole("");
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAdminClients:handleUpdateTeamMemberRole",
				title: "Update role failed"
			});
		} finally {
			setUpdatingMemberRoleKey(null);
		}
	};
	const resetClientForm = () => {
		setClientName("");
		setClientAccountManager("");
		setTeamMemberFields([createEmptyMemberField()]);
	};
	const addTeamMemberField = () => {
		setTeamMemberFields((prev) => [...prev, createEmptyMemberField()]);
	};
	const updateTeamMemberField = (key, field, value) => {
		setTeamMemberFields((prev) => prev.map((item) => item.key === key ? {
			...item,
			[field]: value
		} : item));
	};
	const removeTeamMemberField = (key) => {
		setTeamMemberFields((prev) => prev.length <= 1 ? prev : prev.filter((item) => item.key !== key));
	};
	const handleCreateClient = async () => {
		const name = clientName.trim();
		const accountManager = clientAccountManager.trim();
		if (!name || !accountManager) {
			notifyFailure({
				title: "Missing details",
				message: "Client name and account manager are required."
			});
			return;
		}
		const teamMembers = dedupeClientTeamMembers(accountManager, teamMemberFields.flatMap((member) => {
			const normalized = {
				name: member.name.trim(),
				role: member.role.trim()
			};
			return normalized.name.length > 0 ? [{
				...normalized,
				role: normalized.role || "Contributor"
			}] : [];
		}));
		setClientSaving(true);
		if (isPreviewMode) {
			setPreviewClients((current) => {
				const normalizedPreviewTeamMembers = teamMembers.map((member) => ({
					...member,
					role: member.role || "Contributor"
				}));
				const nextClient = {
					id: `preview-client-${Date.now()}`,
					name,
					accountManager,
					teamMembers: normalizedPreviewTeamMembers,
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				};
				return [...current, nextClient].sort((left, right) => left.name.localeCompare(right.name));
			});
			notifyInfo({
				title: "Preview mode",
				message: `${name} was created in the sample workspace.`
			});
			resetClientForm();
			setClientSaving(false);
			return;
		}
		if (!workspaceId) return;
		try {
			await createClientMutation.mutateAsync({
				workspaceId,
				name,
				accountManager,
				teamMembers,
				createdBy: user?.id ?? null
			});
			notifySuccess({
				title: "Client created",
				message: `${name} is ready to use.`
			});
			resetClientForm();
		} catch (err) {
			reportConvexFailure({
				error: err,
				context: "useAdminClients:handleCreateClient",
				title: "Client create failed"
			});
		} finally {
			setClientSaving(false);
		}
	};
	return {
		clients,
		setClients,
		clientsLoading,
		clientsError,
		nextCursor,
		loadingMore,
		existingTeamMembers,
		loadClients,
		handleLoadMore,
		clientName,
		setClientName,
		clientAccountManager,
		setClientAccountManager,
		teamMemberFields,
		clientSaving,
		resetClientForm,
		addTeamMemberField,
		updateTeamMemberField,
		removeTeamMemberField,
		handleCreateClient,
		clientPendingDelete,
		isDeleteDialogOpen,
		deletingClientId,
		requestDeleteClient,
		handleDeleteDialogChange,
		handleDeleteClient,
		clientPendingMembers,
		isTeamDialogOpen,
		addingMember,
		removingTeamMemberKey,
		memberName,
		memberRole,
		setMemberName,
		setMemberRole,
		requestAddTeamMember,
		handleTeamDialogChange,
		handleAddTeamMember,
		handleRemoveTeamMember,
		clientPendingEditMember,
		isEditRoleDialogOpen,
		editingMemberRole,
		updatingMemberRoleKey,
		setEditingMemberRole,
		requestEditTeamMemberRole,
		handleEditRoleDialogChange,
		handleUpdateTeamMemberRole
	};
}
function useAdminClientsPage() {
	const { user } = useAuth();
	const { isPreviewMode } = usePreview();
	const workspaceContext = useQuery(api.users.getMyWorkspaceContext, !isPreviewMode && user ? {} : "skip");
	const workspaceId = workspaceContext?.workspaceId ?? null;
	const includeAllWorkspaces = workspaceContext?.role === "admin";
	const workspaceQueryError = useConvexQueryError({
		data: workspaceContext,
		skipped: isPreviewMode || !user,
		loading: !isPreviewMode && Boolean(user) && workspaceContext === void 0,
		fallbackMessage: "Unable to load workspace context."
	});
	const adminClients = useAdminClients();
	const { results: adminUserRows } = usePaginatedQuery(api.adminUsers.listUsers, !isPreviewMode && workspaceId ? {
		workspaceId,
		includeAllWorkspaces
	} : "skip", { initialNumItems: 200 });
	const [clientSearch, setClientSearch] = (0, import_react.useState)("");
	const assignableUsers = (() => {
		if (isPreviewMode) return getAssignableWorkspaceUsers(getPreviewAdminUsers().map((row) => ({
			id: row.id,
			name: row.name,
			email: row.email,
			role: row.role,
			status: row.status
		})));
		return getAssignableWorkspaceUsers(normalizeAllocationUsers(adminUserRows ?? []));
	})();
	const allocationSummary = buildClientAllocationSummary(assignableUsers, adminClients.clients);
	const filteredClients = filterAllocationClients(adminClients.clients, clientSearch);
	const unmatchedByClientId = countUnmatchedClientAllocations(allocationSummary.unmatched);
	const handleRefresh = () => void adminClients.loadClients();
	const handleFormSubmit = (event) => {
		event.preventDefault();
		adminClients.handleCreateClient();
	};
	const handleClientNameChange = (event) => adminClients.setClientName(event.target.value);
	const handleAccountManagerChange = (event) => adminClients.setClientAccountManager(event.target.value);
	const handleClientSearchChange = (event) => setClientSearch(event.target.value);
	const handleUpdateTeamMemberName = (key, value) => adminClients.updateTeamMemberField(key, "name", value);
	const handleUpdateTeamMemberRole = (key, value) => adminClients.updateTeamMemberField(key, "role", value);
	const handleCancelDelete = () => adminClients.handleDeleteDialogChange(false);
	const handleConfirmDelete = () => void adminClients.handleDeleteClient();
	const handleMemberNameChange = (event) => adminClients.setMemberName(event.target.value);
	const handleMemberRoleChange = (event) => adminClients.setMemberRole(event.target.value);
	const handleCancelTeamDialog = () => adminClients.handleTeamDialogChange(false);
	const handleConfirmAddTeamMember = () => void adminClients.handleAddTeamMember();
	const handleRemoveTeamMemberStable = (client, memberName) => void adminClients.handleRemoveTeamMember(client, memberName);
	const handleEditTeamMemberRoleStable = (client, member) => adminClients.requestEditTeamMemberRole(client, member);
	const handleEditingMemberRoleChange = (event) => adminClients.setEditingMemberRole(event.target.value);
	const handleCancelEditRoleDialog = () => adminClients.handleEditRoleDialogChange(false);
	const handleConfirmEditTeamMemberRole = () => void adminClients.handleUpdateTeamMemberRole();
	return {
		user,
		isPreviewMode,
		workspaceQueryError,
		assignableUsers,
		allocationSummary,
		filteredClients,
		unmatchedByClientId,
		clientSearch,
		...adminClients,
		handleRefresh,
		handleFormSubmit,
		handleClientNameChange,
		handleAccountManagerChange,
		handleClientSearchChange,
		handleUpdateTeamMemberName,
		handleUpdateTeamMemberRole,
		handleCancelDelete,
		handleConfirmDelete,
		handleMemberNameChange,
		handleMemberRoleChange,
		handleCancelTeamDialog,
		handleConfirmAddTeamMember,
		handleRemoveTeamMemberStable,
		handleEditTeamMemberRoleStable,
		handleEditingMemberRoleChange,
		handleCancelEditRoleDialog,
		handleConfirmEditTeamMemberRole
	};
}
function AdminClientsPage() {
	const page = useAdminClientsPage();
	if (!page.user && !page.isPreviewMode) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsSignInRequired, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: page.clientsLoading,
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTablePageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsPageContent, {
			isPreviewMode: page.isPreviewMode,
			clientsLoading: page.clientsLoading,
			clients: page.clients,
			nextCursor: page.nextCursor,
			existingTeamMembers: page.existingTeamMembers,
			assignableUsers: page.assignableUsers,
			allocationSummary: page.allocationSummary,
			filteredClients: page.filteredClients,
			unmatchedByClientId: page.unmatchedByClientId,
			clientSearch: page.clientSearch,
			workspaceQueryError: page.workspaceQueryError,
			clientsError: page.clientsError,
			clientName: page.clientName,
			clientAccountManager: page.clientAccountManager,
			teamMemberFields: page.teamMemberFields,
			clientSaving: page.clientSaving,
			clientPendingDelete: page.clientPendingDelete,
			isDeleteDialogOpen: page.isDeleteDialogOpen,
			deletingClientId: page.deletingClientId,
			clientPendingMembers: page.clientPendingMembers,
			isTeamDialogOpen: page.isTeamDialogOpen,
			addingMember: page.addingMember,
			removingTeamMemberKey: page.removingTeamMemberKey,
			updatingMemberRoleKey: page.updatingMemberRoleKey,
			editingMemberRole: page.editingMemberRole,
			isEditRoleDialogOpen: page.isEditRoleDialogOpen,
			clientPendingEditMember: page.clientPendingEditMember,
			memberName: page.memberName,
			memberRole: page.memberRole,
			loadingMore: page.loadingMore,
			onRefresh: page.handleRefresh,
			onFormSubmit: page.handleFormSubmit,
			onClientNameChange: page.handleClientNameChange,
			onAccountManagerChange: page.setClientAccountManager,
			onAccountManagerInputChange: page.handleAccountManagerChange,
			onClientSearchChange: page.handleClientSearchChange,
			onAddTeamMemberField: page.addTeamMemberField,
			onUpdateTeamMemberName: page.handleUpdateTeamMemberName,
			onUpdateTeamMemberRole: page.handleUpdateTeamMemberRole,
			onRemoveTeamMemberField: page.removeTeamMemberField,
			onResetClientForm: page.resetClientForm,
			onRequestAddTeamMember: page.requestAddTeamMember,
			onRequestDeleteClient: page.requestDeleteClient,
			onRemoveTeamMember: page.handleRemoveTeamMemberStable,
			onEditTeamMemberRole: page.handleEditTeamMemberRoleStable,
			onLoadMore: page.handleLoadMore,
			onDeleteDialogChange: page.handleDeleteDialogChange,
			onCancelDelete: page.handleCancelDelete,
			onConfirmDelete: page.handleConfirmDelete,
			onTeamDialogChange: page.handleTeamDialogChange,
			onMemberNameChange: page.setMemberName,
			onMemberNameInputChange: page.handleMemberNameChange,
			onMemberRoleChange: page.handleMemberRoleChange,
			onCancelTeamDialog: page.handleCancelTeamDialog,
			onConfirmAddTeamMember: page.handleConfirmAddTeamMember,
			onEditRoleDialogChange: page.handleEditRoleDialogChange,
			onEditingMemberRoleChange: page.handleEditingMemberRoleChange,
			onCancelEditRoleDialog: page.handleCancelEditRoleDialog,
			onConfirmEditTeamMemberRole: page.handleConfirmEditTeamMemberRole
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminClientsPage, {});
//#endregion
export { SplitComponent as component };
