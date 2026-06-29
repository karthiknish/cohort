import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Jn as Code, X as Save, cr as CircleAlert, lt as Plus, sr as CircleCheckBig, w as Trash2 } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils.mjs";
import { t as Badge } from "./badge.mjs";
import { t as Button } from "./button.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card.mjs";
import { t as Skeleton } from "./skeleton.mjs";
import { c as reportConvexFailure } from "./notifications.mjs";
import { a as DialogFooter, c as DialogTrigger, i as DialogDescription, o as DialogHeader, r as DialogContent, s as DialogTitle, t as Dialog } from "./dialog.mjs";
import { t as Input } from "./input.mjs";
import { t as Label } from "./label.mjs";
import { i as TooltipTrigger, n as TooltipContent, r as TooltipProvider, t as Tooltip } from "./tooltip.mjs";
//#region src/features/dashboard/ads/components/formula-builder-card-sections.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function FormulaBuilderHeader({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
		className: "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2 text-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Code, { className: "size-5" }), "Formula Builder"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Create custom metrics by combining your ad performance data" })]
		}), children]
	});
}
function FormulaBuilderDialog({ availableMetrics, dialogOpen, exampleFormulas, formulaExpression, formulaName, onDialogOpenChange, onExpressionChange, onFormulaNameChange, onInsertMetric, onOutputMetricChange, onSave, onUseExample, outputMetric, previewResult, saving, validation }) {
	const handleCloseDialog = () => onDialogOpenChange(false);
	const metricInsertHandlers = Object.fromEntries(availableMetrics.map((metric) => [metric.name, () => onInsertMetric(metric.name)]));
	const exampleHandlers = Object.fromEntries(exampleFormulas.map((example) => [example.output, () => onUseExample(example)]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open: dialogOpen,
		onOpenChange: onDialogOpenChange,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New Formula"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Custom Formula" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Define a formula using available metrics. Use +, -, *, / operators." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "formula-name",
								children: "Formula Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "formula-name",
								placeholder: "e.g., Cost per Acquisition",
								value: formulaName,
								onChange: onFormulaNameChange,
								disabled: saving
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Available Metrics" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: availableMetrics.map((metric) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: metricInsertHandlers[metric.name],
									disabled: saving,
									children: metric.label
								}, metric.name))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "formula-expression",
									children: "Formula Expression"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "formula-expression",
										placeholder: "e.g., spend / conversions",
										value: formulaExpression,
										onChange: onExpressionChange,
										disabled: saving,
										className: cn(validation && !validation.valid && "border-destructive")
									}), validation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute right-3 top-1/2 -translate-y-1/2",
										children: validation.valid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "size-4 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-destructive" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: validation.error }) })] }) })
									}) : null]
								}),
								validation?.valid && previewResult !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: ["Preview: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: previewResult.toFixed(2)
									})]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "output-metric",
								children: "Output Metric ID"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "output-metric",
								placeholder: "e.g., cpa",
								value: outputMetric,
								onChange: onOutputMetricChange,
								disabled: saving
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Quick Examples" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: exampleFormulas.map((example) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "sm",
									onClick: exampleHandlers[example.output],
									disabled: saving,
									children: example.name
								}, example.output))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: handleCloseDialog,
					disabled: saving,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onSave,
					disabled: saving || !validation?.valid || !formulaName.trim() || !outputMetric.trim(),
					className: "gap-2",
					children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4 animate-pulse" }), "Saving…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "Save Formula"] })
				})] })
			]
		})]
	});
}
function FormulaBuilderLoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: [
			"a",
			"b",
			"c"
		].map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" }, slot))
	}) });
}
function FormulaBuilderEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Code, { className: "size-8 opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No custom formulas yet. Create one to track custom KPIs." })]
	}) });
}
function FormulaBuilderList({ items, onDelete }) {
	const deleteHandlers = Object.fromEntries(items.map(({ formula }) => [formula.formulaId, () => onDelete(formula.formulaId)]));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: items.map(({ formula, result }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between rounded-lg border border-muted/60 bg-background p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: formula.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						className: "text-xs",
						children: formula.outputMetric
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "text-xs text-muted-foreground",
					children: formula.formula
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [result !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-lg font-semibold",
					children: result.toFixed(2)
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					className: "size-8 text-muted-foreground hover:text-destructive",
					onClick: deleteHandlers[formula.formulaId],
					"aria-label": `Delete formula ${formula.name}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				})]
			})]
		}, formula.formulaId))
	}) });
}
//#endregion
//#region src/features/dashboard/ads/components/formula-builder-card.tsx
var formula_builder_card_exports = /* @__PURE__ */ __exportAll({ FormulaBuilderCard: () => FormulaBuilderCard });
var AVAILABLE_METRICS = [
	{
		name: "spend",
		label: "Spend",
		type: "currency"
	},
	{
		name: "impressions",
		label: "Impressions",
		type: "number"
	},
	{
		name: "clicks",
		label: "Clicks",
		type: "number"
	},
	{
		name: "conversions",
		label: "Conversions",
		type: "number"
	},
	{
		name: "revenue",
		label: "Revenue",
		type: "currency"
	}
];
var EXAMPLE_FORMULAS = [
	{
		name: "Cost per Click",
		formula: "spend / clicks",
		output: "cpc"
	},
	{
		name: "Click-Through Rate",
		formula: "clicks / impressions",
		output: "ctr"
	},
	{
		name: "Conversion Rate",
		formula: "conversions / clicks",
		output: "cvr"
	},
	{
		name: "Return on Ad Spend",
		formula: "revenue / spend",
		output: "roas"
	}
];
function createInitialFormulaBuilderState() {
	return {
		dialogOpen: false,
		formulaName: "",
		formulaExpression: "",
		outputMetric: "",
		savingFormula: false
	};
}
function formulaBuilderReducer(state, action) {
	switch (action.type) {
		case "setDialogOpen": return {
			...state,
			dialogOpen: action.value
		};
		case "setFormulaName": return {
			...state,
			formulaName: action.value
		};
		case "setFormulaExpression": return {
			...state,
			formulaExpression: typeof action.value === "function" ? action.value(state.formulaExpression) : action.value
		};
		case "setOutputMetric": return {
			...state,
			outputMetric: action.value
		};
		case "setSavingFormula": return {
			...state,
			savingFormula: action.value
		};
		case "resetForm": return {
			...state,
			formulaName: "",
			formulaExpression: "",
			outputMetric: "",
			dialogOpen: false
		};
		case "applyExample": return {
			...state,
			formulaName: action.name,
			formulaExpression: action.formula,
			outputMetric: action.output
		};
		default: return state;
	}
}
function FormulaBuilderCard({ formulaEditor, metricTotals, loading }) {
	const { formulas, loading: formulasLoading, loadFormulas, createFormula, deleteFormula, validateFormula, executeFormula } = formulaEditor;
	const [state, dispatch] = (0, import_react.useReducer)(formulaBuilderReducer, void 0, createInitialFormulaBuilderState);
	const { dialogOpen, formulaName, formulaExpression, outputMetric, savingFormula } = state;
	(0, import_react.useEffect)(() => {
		loadFormulas();
	}, [loadFormulas]);
	const validation = (() => {
		if (!formulaExpression.trim()) return null;
		return validateFormula(formulaExpression);
	})();
	const previewResult = (() => {
		if (!validation?.valid || !metricTotals) return null;
		return executeFormula(formulaExpression, {
			spend: metricTotals.spend,
			impressions: metricTotals.impressions,
			clicks: metricTotals.clicks,
			conversions: metricTotals.conversions,
			revenue: metricTotals.revenue
		});
	})();
	const handleSave = async () => {
		if (savingFormula || !validation?.valid || !formulaName.trim() || !outputMetric.trim()) return;
		dispatch({
			type: "setSavingFormula",
			value: true
		});
		try {
			if (!await createFormula({
				name: formulaName.trim(),
				formula: formulaExpression.trim(),
				inputs: validation.inputs ?? [],
				outputMetric: outputMetric.trim()
			})) {
				dispatch({
					type: "setSavingFormula",
					value: false
				});
				return;
			}
			dispatch({ type: "resetForm" });
		} catch (error) {
			reportConvexFailure({
				error,
				context: "FormulaBuilderCard:handleSave",
				title: "Could not save formula",
				fallbackMessage: "Formula was not saved."
			});
		}
		dispatch({
			type: "setSavingFormula",
			value: false
		});
	};
	const handleInsertMetric = (metricName) => {
		dispatch({
			type: "setFormulaExpression",
			value: (prev) => prev ? `${prev} ${metricName}` : metricName
		});
	};
	const handleUseExample = (example) => {
		dispatch({
			type: "applyExample",
			name: example.name,
			formula: example.formula,
			output: example.output
		});
	};
	const handleExpressionChange = (event) => dispatch({
		type: "setFormulaExpression",
		value: event.target.value
	});
	const handleFormulaNameChange = (event) => dispatch({
		type: "setFormulaName",
		value: event.target.value
	});
	const handleOutputMetricChange = (event) => dispatch({
		type: "setOutputMetric",
		value: event.target.value
	});
	const handleDialogOpenChange = (open) => {
		dispatch({
			type: "setDialogOpen",
			value: open
		});
	};
	const handleDeleteFormula = (formulaId) => {
		deleteFormula(formulaId);
	};
	const formulaItems = formulas.map((formula) => {
		let result = null;
		if (metricTotals) {
			const inputs = {
				spend: metricTotals.spend,
				impressions: metricTotals.impressions,
				clicks: metricTotals.clicks,
				conversions: metricTotals.conversions,
				revenue: metricTotals.revenue
			};
			result = executeFormula(formula.formula, inputs);
		}
		return {
			formula,
			result
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormulaBuilderHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormulaBuilderDialog, {
			availableMetrics: AVAILABLE_METRICS,
			dialogOpen,
			exampleFormulas: EXAMPLE_FORMULAS,
			formulaExpression,
			formulaName,
			onDialogOpenChange: handleDialogOpenChange,
			onExpressionChange: handleExpressionChange,
			onInsertMetric: handleInsertMetric,
			onFormulaNameChange: handleFormulaNameChange,
			onOutputMetricChange: handleOutputMetricChange,
			onSave: handleSave,
			onUseExample: handleUseExample,
			outputMetric,
			previewResult,
			saving: savingFormula,
			validation
		}) }), loading || formulasLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormulaBuilderLoadingState, {}) : formulas.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormulaBuilderEmptyState, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormulaBuilderList, {
			items: formulaItems,
			onDelete: handleDeleteFormula
		})]
	});
}
//#endregion
export { formula_builder_card_exports as n, FormulaBuilderCard as t };
