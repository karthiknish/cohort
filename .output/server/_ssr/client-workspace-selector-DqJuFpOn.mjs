import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { g as useAuth } from "./auth-context-fSvbzOPB.mjs";
import { n as useClientContext } from "./client-context-BNynWehF.mjs";
import { Ar as Building2, C as Trash, Yt as LoaderCircle, lt as Plus } from "../_libs/lucide-react.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Cuo0TTXb.mjs";
import { i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog-C8tBdgAy.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { i as TruncatedTextPreview } from "./hover-preview-BP_Z2-hG.mjs";
import { t as MentionInput } from "./mention-input-L2yAb4U6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-workspace-selector-DqJuFpOn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WorkspaceRow({ client, disabled, onRemove }) {
	const handleRemove = () => onRemove(client.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between rounded-lg border border-muted/60 bg-muted/30 px-4 py-3 text-sm transition-colors hover:bg-muted/50",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3.5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: client.name
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			size: "icon",
			variant: "ghost",
			className: "size-8 rounded-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive",
			onClick: handleRemove,
			disabled,
			"aria-label": `Remove ${client.name} workspace`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash, {
				className: "size-4",
				"aria-hidden": true
			})
		})]
	});
}
function WorkspaceSelect({ className, clients, hasClients, selectValue, selectedLabel, placeholder, onValueChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative min-w-0 flex-1 sm:max-w-[12.5rem] lg:max-w-[14rem]", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: selectValue,
			onValueChange,
			disabled: !hasClients,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				id: "tour-workspace-selector",
				className: cn("h-11 w-full border-input bg-background/50 backdrop-blur-sm motion-chromatic", "hover:bg-background hover:border-accent/30 hover:shadow-sm", "focus:ring-2 focus:ring-primary/20 focus:border-accent/40", "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background/50", "data-[state=open]:bg-background data-[state=open]:border-accent/40 data-[state=open]:shadow-md", "rounded-xl px-4"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {
						placeholder,
						children: selectedLabel
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
				position: "popper",
				className: "z-[3000] min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)]",
				sideOffset: 4,
				children: clients.map((client) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: client.id,
					hideIndicator: true,
					className: "cursor-pointer rounded-md mx-1 my-0.5 px-3 py-2.5 text-popover-foreground transition-colors hover:bg-muted focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[state=checked]:bg-accent/10 data-[state=checked]:font-medium data-[state=checked]:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TruncatedTextPreview, { text: client.name })]
					})
				}, client.id))
			})]
		})
	});
}
function ManageWorkspacesDialog({ isOpen, onOpenChange, newClientName, accountManagerInput, teamInput, saving, removingId, errorMessage, clients, mentionableUsers, onClientNameChange, onAccountManagerChange, onTeamChange, onRemoveClient, onClose, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: isOpen,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md max-h-[85vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Manage Workspaces" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create and organize client workspaces." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-sm font-medium",
							htmlFor: "client-name",
							children: "Client name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "client-name",
							value: newClientName,
							onChange: onClientNameChange,
							placeholder: "e.g. Horizon Ventures",
							required: true,
							className: "h-11 rounded-lg"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionInput, {
						label: "Account manager",
						value: accountManagerInput,
						onChange: onAccountManagerChange,
						users: mentionableUsers,
						placeholder: "Type a name or use @ to pick a user…",
						disabled: saving,
						singleSelect: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionInput, {
						label: "Team members",
						value: teamInput,
						onChange: onTeamChange,
						users: mentionableUsers,
						placeholder: "Type names separated by commas, or use @ to add users…",
						disabled: saving,
						allowMultiple: true,
						maxMentions: 10
					}),
					clients.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-muted-foreground",
							children: "Existing workspaces"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: clients.map((client) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceRow, {
								client,
								disabled: clients.length === 1 || removingId === client.id || saving,
								onRemove: onRemoveClient
							}, client.id))
						})]
					}),
					errorMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-destructive",
							children: errorMessage
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 pt-4 border-t border-border/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: onClose,
							disabled: saving,
							className: "rounded-lg",
							children: "Close"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							disabled: saving,
							className: "rounded-lg",
							onClick: onSave,
							children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Save client"]
						})]
					})
				]
			})]
		})
	});
}
function ManageWorkspacesButton({ onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		size: "icon",
		variant: "outline",
		onClick,
		className: "size-11 rounded-xl border-input bg-background/50 backdrop-blur-sm hover:bg-background hover:border-accent/30 hover:shadow-sm motion-chromatic shrink-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Manage clients"
		})]
	});
}
function createInitialWorkspaceFormState() {
	return {
		isSheetOpen: false,
		newClientName: "",
		accountManagerInput: "",
		teamInput: "",
		saving: false,
		removingId: null,
		errorMessage: null
	};
}
function clientWorkspaceFormReducer(state, action) {
	switch (action.type) {
		case "setSheetOpen": return action.value ? {
			...state,
			isSheetOpen: true
		} : { ...createInitialWorkspaceFormState() };
		case "resetForm": return {
			...createInitialWorkspaceFormState(),
			isSheetOpen: state.isSheetOpen
		};
		case "setNewClientName": return {
			...state,
			newClientName: action.value
		};
		case "setAccountManagerInput": return {
			...state,
			accountManagerInput: action.value
		};
		case "setTeamInput": return {
			...state,
			teamInput: action.value
		};
		case "setSaving": return {
			...state,
			saving: action.value
		};
		case "setRemovingId": return {
			...state,
			removingId: action.value
		};
		case "setErrorMessage": return {
			...state,
			errorMessage: action.value
		};
		default: return state;
	}
}
function normalizeMentionInputValue(input) {
	return input.replace(/@\[(.*?)\]/g, "$1").trim();
}
function parseSinglePerson(input) {
	return normalizeMentionInputValue(input).split(",").map((value) => value.trim()).find((value) => value.length > 0) ?? "";
}
function parseTeamMembers(input) {
	return normalizeMentionInputValue(input).split(",").flatMap((member) => {
		const entry = member.trim();
		if (!entry) return [];
		const parts = entry.split(":");
		const name = parts[0]?.trim() ?? "";
		if (!name.length) return [];
		const role = parts[1];
		return [{
			name,
			role: role ? role.trim() : "Contributor"
		}];
	});
}
function useClientWorkspaceSelector(_props) {
	const { user } = useAuth();
	const { clients, selectedClientId, selectClient, createClient, removeClient } = useClientContext();
	const isAdmin = user?.role === "admin";
	const hasClients = clients.length > 0;
	const [formState, dispatch] = (0, import_react.useReducer)(clientWorkspaceFormReducer, void 0, createInitialWorkspaceFormState);
	const { isSheetOpen, newClientName, accountManagerInput, teamInput, saving, removingId, errorMessage } = formState;
	const accountManagerMentionsRef = (0, import_react.useRef)([]);
	const teamMentionsRef = (0, import_react.useRef)([]);
	const allUsers = useQuery(api.users.listAllUsers, isAdmin ? { limit: 500 } : "skip");
	const mentionableUsers = (() => {
		if (!allUsers) return [];
		return allUsers.map((userEntry) => ({
			id: userEntry.id,
			name: userEntry.name,
			email: userEntry.email,
			role: userEntry.role
		}));
	})();
	const handleSheetChange = (open) => {
		dispatch({
			type: "setSheetOpen",
			value: open
		});
		if (!open) {
			accountManagerMentionsRef.current = [];
			teamMentionsRef.current = [];
		}
	};
	const handleCreateClient = async () => {
		const name = newClientName.trim();
		const accountManager = accountManagerMentionsRef.current[0]?.name ?? parseSinglePerson(accountManagerInput);
		if (!name || !accountManager) {
			dispatch({
				type: "setErrorMessage",
				value: "Client name and account manager are required"
			});
			return;
		}
		const mentionTeamMembers = teamMentionsRef.current.map((userEntry) => ({
			name: userEntry.name,
			role: userEntry.role ?? "Contributor"
		}));
		const typedTeamMembers = parseTeamMembers(teamInput);
		const teamMembers = Array.from(new Map([...mentionTeamMembers, ...typedTeamMembers].map((member) => [member.name.trim().toLowerCase(), {
			name: member.name.trim(),
			role: member.role?.trim() || "Contributor"
		}])).values());
		dispatch({
			type: "setSaving",
			value: true
		});
		dispatch({
			type: "setErrorMessage",
			value: null
		});
		await createClient({
			name,
			accountManager,
			teamMembers
		}).then(() => {
			handleSheetChange(false);
		}).catch((createError) => {
			dispatch({
				type: "setErrorMessage",
				value: createError instanceof Error && createError.message ? createError.message : "Unable to create client"
			});
		}).finally(() => {
			dispatch({
				type: "setSaving",
				value: false
			});
		});
	};
	const handleRemoveClient = async (clientId) => {
		dispatch({
			type: "setRemovingId",
			value: clientId
		});
		dispatch({
			type: "setErrorMessage",
			value: null
		});
		try {
			await removeClient(clientId);
		} catch (removeError) {
			dispatch({
				type: "setErrorMessage",
				value: removeError instanceof Error && removeError.message ? removeError.message : "Unable to remove client"
			});
		} finally {
			dispatch({
				type: "setRemovingId",
				value: null
			});
		}
	};
	const handleClientNameChange = (event) => {
		dispatch({
			type: "setNewClientName",
			value: event.target.value
		});
	};
	const handleAccountManagerChange = (value, mentions) => {
		dispatch({
			type: "setAccountManagerInput",
			value
		});
		accountManagerMentionsRef.current = mentions.slice(0, 1);
	};
	const handleTeamChange = (value, mentions) => {
		dispatch({
			type: "setTeamInput",
			value
		});
		teamMentionsRef.current = mentions;
	};
	const handleOpenSheet = () => {
		handleSheetChange(true);
	};
	const handleCloseSheet = () => {
		handleSheetChange(false);
	};
	const handleSaveClientClick = () => {
		handleCreateClient();
	};
	const handleValueChange = (value) => {
		selectClient(value);
	};
	const selectedClient = clients.find((c) => c.id === selectedClientId) ?? clients[0];
	const placeholder = hasClients ? "Select workspace" : "No workspaces available";
	return {
		isAdmin,
		hasClients,
		clients,
		isSheetOpen,
		newClientName,
		accountManagerInput,
		teamInput,
		saving,
		removingId,
		errorMessage,
		mentionableUsers,
		placeholder,
		selectValue: hasClients ? selectedClient?.id ?? "" : "",
		selectedLabel: selectedClient?.name ?? placeholder,
		handleSheetChange,
		handleClientNameChange,
		handleAccountManagerChange,
		handleTeamChange,
		handleRemoveClient,
		handleOpenSheet,
		handleCloseSheet,
		handleSaveClientClick,
		handleValueChange
	};
}
function ClientWorkspaceSelector({ className }) {
	const { isAdmin, hasClients, clients, isSheetOpen, newClientName, accountManagerInput, teamInput, saving, removingId, errorMessage, mentionableUsers, placeholder, selectValue, selectedLabel, handleSheetChange, handleClientNameChange, handleAccountManagerChange, handleTeamChange, handleRemoveClient, handleOpenSheet, handleCloseSheet, handleSaveClientClick, handleValueChange } = useClientWorkspaceSelector({ className });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex min-w-0 items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceSelect, {
			clients,
			hasClients,
			selectValue,
			selectedLabel,
			placeholder,
			onValueChange: handleValueChange
		}), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageWorkspacesButton, { onClick: handleOpenSheet }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManageWorkspacesDialog, {
			isOpen: isSheetOpen,
			onOpenChange: handleSheetChange,
			newClientName,
			accountManagerInput,
			teamInput,
			saving,
			removingId,
			errorMessage,
			clients,
			mentionableUsers,
			onClientNameChange: handleClientNameChange,
			onAccountManagerChange: handleAccountManagerChange,
			onTeamChange: handleTeamChange,
			onRemoveClient: handleRemoveClient,
			onClose: handleCloseSheet,
			onSave: handleSaveClientClick
		})] })]
	});
}
//#endregion
export { ClientWorkspaceSelector as t };
