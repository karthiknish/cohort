import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { o as notifySuccess } from "./notifications-DQZKskhM.mjs";
import { r as useRouter$1 } from "./navigation-C1M-rNAu.mjs";
import { g as useAuth, m as getFriendlyAuthErrorMessage } from "./auth-context-fSvbzOPB.mjs";
import { B as Shield, In as Eye, Jt as Lock, Ln as EyeOff, Ur as ArrowLeft, Yt as LoaderCircle, cr as CircleAlert, gr as Check, i as X, or as CircleCheck } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-DuOB9ezo.mjs";
import { t as Label } from "./label-B_FvRq1I.mjs";
import { n as FadeInItem, r as FadeInStagger, t as FadeIn } from "./animate-in-JYv0iBIt.mjs";
import { n as AlertDescription, r as AlertTitle, t as Alert } from "./alert-DYeH1Q3p.mjs";
import { t as PageSkeletonBoundary } from "./page-skeleton-boundary-ZBP950Us.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as SiteLogo } from "./site-logo-B5LJooib.mjs";
import { n as Route, t as AuthPageSkeleton } from "./reset-Dx6vkhkr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-DZ0faIhI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var authLockIconSm = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
	className: "size-4",
	"aria-hidden": true
});
var authLockIconLg = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, {
	className: "size-6",
	"aria-hidden": true
});
function AuthBackLink({ href = "/auth", label = "Back to sign in", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
		href,
		className: cn("inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
			className: "size-4 shrink-0",
			"aria-hidden": true
		}), label]
	});
}
function AuthPanel({ title, description, icon, children, footer, backHref = "/auth", backLabel = "Back to sign in", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeIn, {
		as: "section",
		className: cn("mx-auto w-full max-w-md lg:max-w-120", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl shadow-primary/5 ring-1 ring-border/40 backdrop-blur-sm motion-reduce:shadow-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-border/50 px-6 py-5 sm:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthBackLink, {
						href: backHref,
						label: backLabel,
						className: "mb-5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5",
						children: [icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15",
							children: icon
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
								children: title
							}), description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-pretty text-sm leading-relaxed text-muted-foreground",
								children: description
							}) : null]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-6 p-6 sm:px-8 sm:py-7",
					children
				}),
				footer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-border/50 bg-muted/20 px-6 py-4 text-center text-xs text-muted-foreground sm:px-8",
					children: footer
				}) : null
			]
		})
	});
}
/** Centers auth content (card or panel) on a plain full-height canvas. */
function AuthShell({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex min-h-dvh items-center justify-center bg-background px-5 py-10 sm:px-8", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-md flex-col items-center gap-8 lg:max-w-120",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteLogo, {
				size: "wordmarkLg",
				href: "/",
				className: "mx-auto"
			}), children]
		})
	});
}
function AuthField({ id, label, labelAction, icon, error, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-2", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: id,
					className: "text-sm font-medium text-foreground",
					children: label
				}), labelAction]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground",
					"aria-hidden": true,
					children: icon
				}) : null, children]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-1.5 text-xs text-destructive",
				role: "alert",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
					className: "size-3.5 shrink-0",
					"aria-hidden": true
				}), error]
			}) : null
		]
	});
}
var authInputClassName = "h-11 rounded-xl border-border/70 bg-background/80 pl-10 pr-3 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary/40 focus-visible:ring-primary/20";
function calculatePasswordStrength(password) {
	const checks = {
		length: password.length >= 8,
		uppercase: /[A-Z]/.test(password),
		lowercase: /[a-z]/.test(password),
		number: /\d/.test(password),
		special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
	};
	const passedChecks = Object.values(checks).filter(Boolean).length;
	let score;
	let label;
	let color;
	if (password.length === 0) {
		score = 0;
		label = "";
		color = "bg-muted";
	} else if (passedChecks <= 1) {
		score = 1;
		label = "Weak";
		color = "bg-destructive";
	} else if (passedChecks === 2) {
		score = 2;
		label = "Fair";
		color = "bg-warning";
	} else if (passedChecks === 3) {
		score = 3;
		label = "Good";
		color = "bg-warning";
	} else if (passedChecks === 4) {
		score = 3;
		label = "Strong";
		color = "bg-success";
	} else {
		score = 4;
		label = "Very Strong";
		color = "bg-success";
	}
	return {
		score,
		label,
		color,
		checks
	};
}
var initialVerificationState = {
	status: "loading",
	email: null,
	verificationError: null
};
var resetPrimaryButtonClassName = "h-11 w-full rounded-full text-sm font-semibold shadow-sm";
var initialResetPasswordFormState = {
	newPassword: "",
	confirmPassword: "",
	showPassword: false,
	showConfirmPassword: false,
	formError: null,
	submitting: false
};
function resetPasswordFormReducer(state, action) {
	switch (action.type) {
		case "setNewPassword": return {
			...state,
			newPassword: action.value
		};
		case "setConfirmPassword": return {
			...state,
			confirmPassword: action.value
		};
		case "toggleShowPassword": return {
			...state,
			showPassword: !state.showPassword
		};
		case "toggleShowConfirmPassword": return {
			...state,
			showConfirmPassword: !state.showConfirmPassword
		};
		case "setFormError": return {
			...state,
			formError: action.value
		};
		case "setSubmitting": return {
			...state,
			submitting: action.value
		};
		case "startSubmit": return {
			...state,
			submitting: true,
			formError: null
		};
		default: return state;
	}
}
function verificationReducer(state, action) {
	switch (action.type) {
		case "missing-token": return {
			status: "error",
			email: null,
			verificationError: "Missing reset token. Please request a new password reset email."
		};
		case "verified": return {
			status: "ready",
			email: action.email,
			verificationError: null
		};
		case "failed": return {
			status: "error",
			email: null,
			verificationError: action.error
		};
		case "success": return {
			...state,
			status: "success"
		};
		default: return state;
	}
}
function PasswordRequirement({ met, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 text-xs",
		children: [met ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn(met ? "text-success" : "text-muted-foreground"),
			children: label
		})]
	});
}
function ResetPasswordLoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-4 py-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
			className: "size-8 animate-spin text-primary",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Verifying your reset link…"
		})]
	});
}
function ResetPasswordErrorState({ verificationError }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
			variant: "destructive",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Reset link problem" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, {
				className: "space-y-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: verificationError ?? "This reset link is invalid or has expired." })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			className: resetPrimaryButtonClassName,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link$1, {
				href: "/auth/forgot",
				children: "Request a new reset link"
			})
		})]
	});
}
function ResetPasswordSuccessState({ onReturnToSignIn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeIn, {
		as: "div",
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-success/20 bg-success/10 p-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-success/15 text-success",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
						className: "size-6",
						"aria-hidden": true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-1 font-semibold text-foreground",
					children: "Password reset successful"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Your password has been updated. Sign in with your new credentials."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: resetPrimaryButtonClassName,
			onClick: onReturnToSignIn,
			children: "Continue to sign in"
		})]
	});
}
function ResetPasswordReadyForm({ email, newPassword, confirmPassword, showPassword, showConfirmPassword, submitting, formError, passwordStrength, passwordsMatch, onSubmit, onNewPasswordChange, onConfirmPasswordChange, onToggleShowPassword, onToggleShowConfirmPassword }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		className: "space-y-5",
		onSubmit,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeInStagger, {
			as: "div",
			className: "space-y-5",
			children: [
				email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, {
					as: "div",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg border border-border/60 bg-muted/30 px-4 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: ["Resetting password for ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: email
							})]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeInItem, {
					as: "div",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthField, {
						id: "new-password",
						label: "New password",
						icon: authLockIconSm,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "new-password",
							type: showPassword ? "text" : "password",
							autoComplete: "new-password",
							required: true,
							minLength: 6,
							value: newPassword,
							onChange: onNewPasswordChange,
							placeholder: "Enter a new password",
							className: cn(authInputClassName, "pr-11"),
							disabled: submitting
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon-sm",
							className: "absolute inset-y-0 right-1.5 h-full w-9 text-muted-foreground hover:text-foreground",
							onClick: onToggleShowPassword,
							"aria-label": showPassword ? "Hide password" : "Show password",
							disabled: submitting,
							children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, {
								className: "size-4",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
								className: "size-4",
								"aria-hidden": true
							})
						})]
					}), newPassword.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-2 rounded-2xl border border-border/50 bg-muted/25 p-3.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Password strength:"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("font-medium", passwordStrength.score <= 1 && "text-destructive", passwordStrength.score === 2 && "text-warning", passwordStrength.score === 3 && "text-success", passwordStrength.score >= 4 && "text-success"),
									children: passwordStrength.label
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1",
								children: [
									1,
									2,
									3,
									4
								].map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-1 flex-1 rounded-full transition-colors", level <= passwordStrength.score ? passwordStrength.color : "bg-muted") }, level))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-x-4 gap-y-1 pt-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordRequirement, {
										met: passwordStrength.checks.length,
										label: "At least 8 characters"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordRequirement, {
										met: passwordStrength.checks.uppercase,
										label: "Uppercase letter"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordRequirement, {
										met: passwordStrength.checks.lowercase,
										label: "Lowercase letter"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordRequirement, {
										met: passwordStrength.checks.number,
										label: "Number"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordRequirement, {
										met: passwordStrength.checks.special,
										label: "Special character"
									})
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FadeInItem, {
					as: "div",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthField, {
						id: "confirm-password",
						label: "Confirm new password",
						icon: authLockIconSm,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "confirm-password",
							type: showConfirmPassword ? "text" : "password",
							autoComplete: "new-password",
							required: true,
							minLength: 6,
							value: confirmPassword,
							onChange: onConfirmPasswordChange,
							placeholder: "Re-enter your new password",
							className: cn(authInputClassName, "pr-11", confirmPassword.length > 0 && !passwordsMatch && "border-destructive focus-visible:ring-destructive/30", confirmPassword.length > 0 && passwordsMatch && "border-success focus-visible:ring-success/30"),
							disabled: submitting
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							size: "icon-sm",
							className: "absolute inset-y-0 right-1.5 h-full w-9 text-muted-foreground hover:text-foreground",
							onClick: onToggleShowConfirmPassword,
							"aria-label": showConfirmPassword ? "Hide password" : "Show password",
							disabled: submitting,
							children: showConfirmPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, {
								className: "size-4",
								"aria-hidden": true
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
								className: "size-4",
								"aria-hidden": true
							})
						})]
					}), confirmPassword.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-2 flex items-center gap-1.5 text-xs", passwordsMatch ? "text-success" : "text-destructive"),
						children: passwordsMatch ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-3.5 shrink-0",
							"aria-hidden": true
						}), "Passwords match"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-3.5 shrink-0",
							"aria-hidden": true
						}), "Passwords do not match"] })
					})]
				}),
				formError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, {
					as: "div",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Update failed" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: formError })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FadeInItem, {
					as: "div",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: resetPrimaryButtonClassName,
						disabled: submitting,
						children: submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Updating password…"] }) : "Reset password"
					})
				})
			]
		})
	});
}
function useResetPassword({ oobCode }) {
	const { push } = useRouter$1();
	const { verifyPasswordResetCode, confirmPasswordReset } = useAuth();
	const [verificationState, dispatchVerification] = (0, import_react.useReducer)(verificationReducer, initialVerificationState);
	const [formState, dispatchForm] = (0, import_react.useReducer)(resetPasswordFormReducer, initialResetPasswordFormState);
	const { newPassword, confirmPassword, showPassword, showConfirmPassword, formError, submitting } = formState;
	const passwordStrength = calculatePasswordStrength(newPassword);
	const passwordsMatch = newPassword === confirmPassword;
	(0, import_react.useEffect)(() => {
		if (!oobCode) {
			dispatchVerification({ type: "missing-token" });
			return;
		}
		let active = true;
		verifyPasswordResetCode(oobCode).then((verifiedEmail) => {
			if (!active) return;
			dispatchVerification({
				type: "verified",
				email: verifiedEmail
			});
		}).catch((error) => {
			if (!active) return;
			dispatchVerification({
				type: "failed",
				error: getFriendlyAuthErrorMessage(error)
			});
		});
		return () => {
			active = false;
		};
	}, [oobCode, verifyPasswordResetCode]);
	const handleReturnToSignIn = () => {
		push("/auth");
	};
	const handleNewPasswordChange = (event) => {
		dispatchForm({
			type: "setNewPassword",
			value: event.target.value
		});
	};
	const handleConfirmPasswordChange = (event) => {
		dispatchForm({
			type: "setConfirmPassword",
			value: event.target.value
		});
	};
	const handleToggleShowPassword = () => {
		dispatchForm({ type: "toggleShowPassword" });
	};
	const handleToggleShowConfirmPassword = () => {
		dispatchForm({ type: "toggleShowConfirmPassword" });
	};
	const handleSubmit = (event) => {
		event.preventDefault();
		if (!oobCode || submitting) return;
		if (passwordStrength.score < 2) {
			dispatchForm({
				type: "setFormError",
				value: "Please create a stronger password with at least 8 characters."
			});
			return;
		}
		if (newPassword !== confirmPassword) {
			dispatchForm({
				type: "setFormError",
				value: "Passwords do not match."
			});
			return;
		}
		dispatchForm({ type: "startSubmit" });
		confirmPasswordReset(oobCode, newPassword).then(() => {
			dispatchVerification({ type: "success" });
			notifySuccess({
				title: "Password updated",
				message: "You can now sign in with your new password."
			});
		}).catch((error) => {
			dispatchForm({
				type: "setFormError",
				value: getFriendlyAuthErrorMessage(error)
			});
		}).finally(() => {
			dispatchForm({
				type: "setSubmitting",
				value: false
			});
		});
	};
	return {
		verificationState,
		newPassword,
		confirmPassword,
		showPassword,
		showConfirmPassword,
		formError,
		submitting,
		passwordStrength,
		passwordsMatch,
		handleReturnToSignIn,
		handleNewPasswordChange,
		handleConfirmPasswordChange,
		handleToggleShowPassword,
		handleToggleShowConfirmPassword,
		handleSubmit
	};
}
function ResetPasswordContent({ oobCode }) {
	const { verificationState, newPassword, confirmPassword, showPassword, showConfirmPassword, formError, submitting, passwordStrength, passwordsMatch, handleReturnToSignIn, handleNewPasswordChange, handleConfirmPasswordChange, handleToggleShowPassword, handleToggleShowConfirmPassword, handleSubmit } = useResetPassword({ oobCode });
	const { status, email, verificationError } = verificationState;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSkeletonBoundary, {
		loading: status === "loading",
		loadingContent: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthPageSkeleton, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthPanel, {
			title: "Set new password",
			description: "Choose a strong password you have not used on this account before.",
			icon: authLockIconLg,
			children: [
				status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetPasswordLoadingState, {}),
				status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetPasswordErrorState, { verificationError }),
				status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetPasswordReadyForm, {
					email,
					newPassword,
					confirmPassword,
					showPassword,
					showConfirmPassword,
					submitting,
					formError,
					passwordStrength,
					passwordsMatch,
					onSubmit: handleSubmit,
					onNewPasswordChange: handleNewPasswordChange,
					onConfirmPasswordChange: handleConfirmPasswordChange,
					onToggleShowPassword: handleToggleShowPassword,
					onToggleShowConfirmPassword: handleToggleShowConfirmPassword
				}),
				status === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetPasswordSuccessState, { onReturnToSignIn: handleReturnToSignIn })
			]
		}) })
	});
}
function ResetPasswordPageClient({ oobCode = null }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetPasswordContent, { oobCode });
}
function ResetPasswordRoute() {
	const { oobCode } = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResetPasswordPageClient, { oobCode: oobCode ?? null });
}
//#endregion
export { ResetPasswordRoute as component };
