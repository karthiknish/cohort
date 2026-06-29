import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { Ln as EyeOff, Wr as ArrowDown, dr as ChevronsLeft, lr as ChevronsUpDown, mr as ChevronLeft, pr as ChevronRight, ur as ChevronsRight, zr as ArrowUp } from "../_libs/lucide-react.mjs";
import { a as getPaginationRowModel, i as getFilteredRowModel, n as useReactTable, o as getSortedRowModel, r as getCoreRowModel, t as flexRender } from "../_libs/@tanstack/react-table+[...].mjs";
import { t as useVirtualizer } from "../_libs/@tanstack/react-virtual+[...].mjs";
import { t as cn } from "./utils.mjs";
import { O as tableRowHoverClass, y as interactiveTransitionClass } from "./motion.mjs";
import { t as Button } from "./button.mjs";
import { i as useRouter, r as usePathname } from "./navigation.mjs";
import { n as useUrlSearchParamsContext } from "./use-url-search-params.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select.mjs";
import { c as DropdownMenuSeparator, i as DropdownMenuItem, l as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu.mjs";
//#region src/shared/ui/data-table/data-table-pagination.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function DataTablePagination({ table, showRowSelection = false, pageSizeOptions = [
	10,
	20,
	30,
	40,
	50
] }) {
	const handlePageSizeChange = (value) => {
		table.setPageSize(Number(value));
	};
	const handleFirstPage = () => {
		table.setPageIndex(0);
	};
	const handlePreviousPage = () => {
		table.previousPage();
	};
	const handleNextPage = () => {
		table.nextPage();
	};
	const handleLastPage = () => {
		table.setPageIndex(table.getPageCount() - 1);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between px-2",
		children: [showRowSelection ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 text-sm text-muted-foreground",
			children: [
				table.getFilteredSelectedRowModel().rows.length,
				" of",
				" ",
				table.getFilteredRowModel().rows.length,
				" row(s) selected."
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 text-sm text-muted-foreground",
			children: [table.getFilteredRowModel().rows.length, " row(s) total."]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-x-6 lg:gap-x-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-x-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Rows per page"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: `${table.getState().pagination.pageSize}`,
						onValueChange: handlePageSizeChange,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8 w-[70px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: table.getState().pagination.pageSize })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
							side: "top",
							children: pageSizeOptions.map((pageSize) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: `${pageSize}`,
								children: pageSize
							}, pageSize))
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-[100px] items-center justify-center text-sm font-medium",
					children: [
						"Page ",
						table.getState().pagination.pageIndex + 1,
						" of",
						" ",
						table.getPageCount()
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-x-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "hidden size-8 p-0 lg:flex",
							onClick: handleFirstPage,
							disabled: !table.getCanPreviousPage(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Go to first page"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsLeft, { className: "size-4" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "size-8 p-0",
							onClick: handlePreviousPage,
							disabled: !table.getCanPreviousPage(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Go to previous page"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "size-8 p-0",
							onClick: handleNextPage,
							disabled: !table.getCanNextPage(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Go to next page"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "hidden size-8 p-0 lg:flex",
							onClick: handleLastPage,
							disabled: !table.getCanNextPage(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Go to last page"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsRight, { className: "size-4" })]
						})
					]
				})
			]
		})]
	});
}
//#endregion
//#region src/shared/ui/table.tsx
var Table = ({ className, wrapperClassName, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("relative w-full overflow-auto", wrapperClassName),
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
});
Table.displayName = "Table";
var TableHeader = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
});
TableHeader.displayName = "TableHeader";
var TableBody = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
});
TableBody.displayName = "TableBody";
var TableFooter = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
});
TableFooter.displayName = "TableFooter";
var TableRow = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
	ref,
	className: cn("border-b hover:bg-muted/50 data-[state=selected]:bg-muted", tableRowHoverClass, className),
	...props
});
TableRow.displayName = "TableRow";
var TableHead = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
	ref,
	className: cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className),
	...props
});
TableHead.displayName = "TableHead";
var TableCell = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
	ref,
	className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className),
	...props
});
TableCell.displayName = "TableCell";
var TableCaption = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
});
TableCaption.displayName = "TableCaption";
//#endregion
//#region src/shared/ui/data-table/data-table-types.ts
var DEFAULT_TABLE_MAX_HEIGHT = "520px";
var EMPTY_SORTING = [];
var EMPTY_COLUMN_FILTERS = [];
var EMPTY_COLUMN_VISIBILITY = {};
function createInitialDataTableState(init) {
	return {
		sorting: init.initialSorting,
		columnFilters: init.initialColumnFilters,
		columnVisibility: init.initialColumnVisibility,
		rowSelection: {},
		localPagination: {
			pageIndex: 0,
			pageSize: init.pageSize
		}
	};
}
function dataTableReducer(state, action) {
	switch (action.type) {
		case "setSorting": return {
			...state,
			sorting: action.value
		};
		case "setColumnFilters": return {
			...state,
			columnFilters: typeof action.value === "function" ? action.value(state.columnFilters) : action.value
		};
		case "setColumnVisibility": return {
			...state,
			columnVisibility: typeof action.value === "function" ? action.value(state.columnVisibility) : action.value
		};
		case "setRowSelection": return {
			...state,
			rowSelection: typeof action.value === "function" ? action.value(state.rowSelection) : action.value
		};
		case "setLocalPagination": return {
			...state,
			localPagination: typeof action.value === "function" ? action.value(state.localPagination) : action.value
		};
		default: return state;
	}
}
function getLoadingRowIds(loadingRows) {
	return Array.from({ length: loadingRows }, (_, slotIndex) => `loading-row-${slotIndex + 1}`);
}
function getLoadingCellKey(column) {
	if ("id" in column && typeof column.id === "string") return column.id;
	if ("accessorKey" in column && typeof column.accessorKey === "string") return column.accessorKey;
	if ("header" in column && typeof column.header === "string") return column.header;
	return "column";
}
function parsePaginationFromSearchParams(get, defaultPageSize, urlPageParam, urlPageSizeParam, isValidUrlPageSize) {
	const pageRaw = get(urlPageParam);
	const sizeRaw = get(urlPageSizeParam);
	let pageIndex = 0;
	if (pageRaw) {
		const parsed = Number.parseInt(pageRaw, 10);
		if (Number.isFinite(parsed) && parsed >= 1) pageIndex = parsed - 1;
	}
	let nextPageSize = defaultPageSize;
	if (sizeRaw) {
		const parsed = Number.parseInt(sizeRaw, 10);
		if (Number.isFinite(parsed) && isValidUrlPageSize(parsed)) nextPageSize = parsed;
	}
	return {
		pageIndex,
		pageSize: nextPageSize
	};
}
function buildPaginationSearchParams(searchParams, pagination, defaultPageSize, urlPageParam, urlPageSizeParam, isValidUrlPageSize) {
	const params = new URLSearchParams(searchParams.toString());
	const oneBased = pagination.pageIndex + 1;
	if (oneBased > 1) params.set(urlPageParam, String(oneBased));
	else params.delete(urlPageParam);
	if (pagination.pageSize !== defaultPageSize && isValidUrlPageSize(pagination.pageSize)) params.set(urlPageSizeParam, String(pagination.pageSize));
	else params.delete(urlPageSizeParam);
	return params;
}
//#endregion
//#region src/shared/ui/data-table/data-table-sections.tsx
function DataTableHeaderCell({ header }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
		style: { width: header.getSize() },
		children: header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
	}, header.id);
}
function DataTableSpacerRow({ colSpan, height }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
		colSpan,
		style: { height: `${height}px` }
	}) });
}
function DataTableBodyRow({ height, onRowClick, row, rowClassName }) {
	const style = height ? { height: `${height}px` } : void 0;
	const handleClick = () => {
		onRowClick?.(row.original);
	};
	const handleKeyDown = (event) => {
		if (!onRowClick) return;
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleClick();
		}
	};
	const resolvedClassName = typeof rowClassName === "function" ? rowClassName(row.original) : rowClassName;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, {
		"data-state": row.getIsSelected() && "selected",
		onClick: onRowClick ? handleClick : void 0,
		onKeyDown: onRowClick ? handleKeyDown : void 0,
		tabIndex: onRowClick ? 0 : void 0,
		"aria-label": onRowClick ? "View row details" : void 0,
		className: cn(onRowClick && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", resolvedClassName),
		style,
		children: row.getVisibleCells().map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))
	});
}
function DataTableLoadingRows({ columns, loadingRows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: getLoadingRowIds(loadingRows).map((rowId) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-full animate-pulse rounded bg-muted" }) }, `${rowId}-${getLoadingCellKey(column)}`)) }, rowId)) });
}
function DataTableVirtualizedRows({ columns, rows, virtualItems, paddingTop, paddingBottom, onRowClick, rowClassName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		paddingTop > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableSpacerRow, {
			colSpan: columns.length,
			height: paddingTop
		}) : null,
		virtualItems.map((virtualRow) => {
			const row = rows[virtualRow.index];
			if (!row) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableBodyRow, {
				onRowClick,
				row,
				rowClassName,
				height: virtualRow.size
			}, row.id);
		}),
		paddingBottom > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableSpacerRow, {
			colSpan: columns.length,
			height: paddingBottom
		}) : null
	] });
}
function DataTableScrollContainer({ shouldVirtualize, containerStyle, virtualParentRef, stickyHeader, headerGroups, body, shouldVirtualizeStyles }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: shouldVirtualize ? virtualParentRef : void 0,
		className: cn("relative w-full overflow-hidden rounded-md border", shouldVirtualizeStyles && "overflow-auto"),
		style: containerStyle,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, {
			className: stickyHeader ? "sticky top-0 z-10 bg-background" : void 0,
			children: headerGroups.map((headerGroup) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: headerGroup.headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableHeaderCell, { header }, header.id)) }, headerGroup.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: body })] })
	});
}
function DataTableBodyContent({ columns, rows, loading, loadingRows, shouldVirtualize, virtualItems, paddingTop, paddingBottom, onRowClick, rowClassName, emptyState }) {
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableLoadingRows, {
		columns,
		loadingRows
	});
	if (rows.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
		colSpan: columns.length,
		className: "h-24 text-center",
		children: emptyState ?? "No results."
	}) });
	if (shouldVirtualize) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableVirtualizedRows, {
		columns,
		rows,
		virtualItems,
		paddingTop,
		paddingBottom,
		onRowClick,
		rowClassName
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableBodyRow, {
		onRowClick,
		row,
		rowClassName
	}, row.id)) });
}
//#endregion
//#region src/shared/ui/data-table/data-table.tsx
function DataTable({ columns, data, searchKey, searchValue, onSearchChange, pageSize = 10, showPagination = true, showRowSelection = false, onRowClick, rowClassName, emptyState, loading = false, loadingRows = 5, manualPagination = false, pageCount, onPaginationChange, manualSorting = false, onSortingChange, manualFiltering = false, onColumnFiltersChange, initialSorting = EMPTY_SORTING, initialColumnFilters = EMPTY_COLUMN_FILTERS, initialColumnVisibility = EMPTY_COLUMN_VISIBILITY, stickyHeader = false, maxHeight, className, getRowId, enableVirtualization = false, rowHeight = 48, overscan = 6, syncPaginationToUrl = false, urlPageParam = "p", urlPageSizeParam = "perPage", urlPageSizeOptions = [
	10,
	20,
	30,
	40,
	50
] }) {
	"use no memo";
	const { replace } = useRouter();
	const pathname = usePathname();
	const searchParams = useUrlSearchParamsContext();
	const usesUrlPagination = syncPaginationToUrl && showPagination && !manualPagination;
	const isValidUrlPageSize = (pageSizeOption) => urlPageSizeOptions.includes(pageSizeOption);
	const urlPagination = parsePaginationFromSearchParams((key) => searchParams.get(key), pageSize, urlPageParam, urlPageSizeParam, isValidUrlPageSize);
	const [tableState, dispatch] = import_react.useReducer(dataTableReducer, {
		pageSize,
		initialSorting,
		initialColumnFilters,
		initialColumnVisibility
	}, createInitialDataTableState);
	const { sorting, columnFilters, columnVisibility, rowSelection, localPagination } = tableState;
	const setSorting = (value) => {
		dispatch({
			type: "setSorting",
			value
		});
	};
	const setColumnFilters = (value) => {
		dispatch({
			type: "setColumnFilters",
			value
		});
	};
	const setColumnVisibility = (value) => {
		dispatch({
			type: "setColumnVisibility",
			value
		});
	};
	const setRowSelection = (value) => {
		dispatch({
			type: "setRowSelection",
			value
		});
	};
	const setLocalPagination = (value) => {
		dispatch({
			type: "setLocalPagination",
			value
		});
	};
	const pagination = usesUrlPagination ? urlPagination : localPagination;
	const internalSearchValueRef = import_react.useRef("");
	const effectiveSearchValue = searchValue ?? internalSearchValueRef.current;
	const columnFiltersWithSearch = (() => {
		if (!searchKey) return columnFilters;
		const otherFilters = columnFilters.filter((filter) => filter.id !== searchKey);
		if (effectiveSearchValue) return [...otherFilters, {
			id: searchKey,
			value: effectiveSearchValue
		}];
		return otherFilters;
	})();
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: manualPagination ? void 0 : getPaginationRowModel(),
		getSortedRowModel: manualSorting ? void 0 : getSortedRowModel(),
		getFilteredRowModel: manualFiltering ? void 0 : getFilteredRowModel(),
		onSortingChange: (updater) => {
			const newSorting = typeof updater === "function" ? updater(sorting) : updater;
			setSorting(newSorting);
			onSortingChange?.(newSorting);
		},
		onColumnFiltersChange: (updater) => {
			const newFilters = typeof updater === "function" ? updater(columnFilters) : updater;
			setColumnFilters(newFilters);
			onColumnFiltersChange?.(newFilters);
			if (searchKey) {
				const searchFilter = newFilters.find((filter) => filter.id === searchKey);
				const nextSearch = typeof searchFilter?.value === "string" ? searchFilter.value : "";
				if (searchValue === void 0) internalSearchValueRef.current = nextSearch;
				onSearchChange?.(nextSearch);
			}
		},
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: (updater) => {
			if (usesUrlPagination) {
				const newPagination = typeof updater === "function" ? updater(urlPagination) : updater;
				const queryString = buildPaginationSearchParams(new URLSearchParams(searchParams.toString()), newPagination, pageSize, urlPageParam, urlPageSizeParam, isValidUrlPageSize).toString();
				replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
				onPaginationChange?.(newPagination);
				return;
			}
			setLocalPagination((old) => {
				const newPagination = typeof updater === "function" ? updater(old) : updater;
				onPaginationChange?.(newPagination);
				return newPagination;
			});
		},
		state: {
			sorting,
			columnFilters: columnFiltersWithSearch,
			columnVisibility,
			rowSelection,
			pagination
		},
		manualPagination,
		manualSorting,
		manualFiltering,
		pageCount: manualPagination ? pageCount : void 0,
		getRowId,
		enableRowSelection: showRowSelection
	});
	const rows = table.getRowModel().rows;
	const shouldVirtualize = enableVirtualization && !manualPagination;
	const virtualParentRef = import_react.useRef(null);
	const virtualizer = useVirtualizer({
		count: shouldVirtualize ? rows.length : 0,
		getScrollElement: () => virtualParentRef.current,
		estimateSize: () => rowHeight,
		overscan
	});
	const containerStyle = (() => {
		if (maxHeight) return { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight };
		if (shouldVirtualize) return { maxHeight: DEFAULT_TABLE_MAX_HEIGHT };
	})();
	import_react.useEffect(() => {
		if (!shouldVirtualize) return;
		virtualizer.measure();
	}, [shouldVirtualize, virtualizer]);
	const headerGroups = table.getHeaderGroups();
	const body = (() => {
		const virtualItems = shouldVirtualize ? virtualizer.getVirtualItems() : [];
		const firstVirtualItem = virtualItems.at(0);
		const lastVirtualItem = virtualItems.at(-1);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableBodyContent, {
			columns,
			rows,
			loading,
			loadingRows,
			shouldVirtualize,
			virtualItems,
			paddingTop: shouldVirtualize && firstVirtualItem ? firstVirtualItem.start : 0,
			paddingBottom: shouldVirtualize && lastVirtualItem ? virtualizer.getTotalSize() - lastVirtualItem.end : 0,
			onRowClick,
			rowClassName,
			emptyState
		});
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-4", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTableScrollContainer, {
			shouldVirtualize,
			maxHeight,
			shouldVirtualizeStyles: shouldVirtualize,
			containerStyle,
			virtualParentRef,
			stickyHeader,
			headerGroups,
			body
		}), showPagination ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTablePagination, {
			table,
			showRowSelection
		}) : null]
	});
}
//#endregion
//#region src/shared/ui/data-table/virtualized-data-table.tsx
var DEFAULT_VIRTUALIZATION_THRESHOLD = 50;
function VirtualizedDataTable({ virtualizationThreshold = DEFAULT_VIRTUALIZATION_THRESHOLD, data, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
		...props,
		data,
		enableVirtualization: data.length > virtualizationThreshold,
		showPagination: false
	});
}
//#endregion
//#region src/shared/ui/data-table/data-table-column-header.tsx
function DataTableColumnHeader({ column, title, className }) {
	const handleSortAscending = () => {
		column.toggleSorting(false);
	};
	const handleSortDescending = () => {
		column.toggleSorting(true);
	};
	const handleHideColumn = () => {
		column.toggleVisibility(false);
	};
	if (!column.getCanSort()) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(className),
		children: title
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex items-center space-x-2", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				className: "-ml-3 h-8 data-[state=open]:bg-accent",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title }), column.getIsSorted() === "desc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "ml-2 size-4" }) : column.getIsSorted() === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "ml-2 size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "ml-2 size-4" })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "start",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: handleSortAscending,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "mr-2 size-3.5 text-muted-foreground/70" }), "Asc"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: handleSortDescending,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "mr-2 size-3.5 text-muted-foreground/70" }), "Desc"]
				}),
				column.getCanHide() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					onClick: handleHideColumn,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "mr-2 size-3.5 text-muted-foreground/70" }), "Hide"]
				})] })
			]
		})] })
	});
}
//#endregion
//#region src/shared/ui/checkbox.tsx
var Checkbox = ({ className, checked, onCheckedChange, onChange, ref, ...props }) => {
	const onCheckboxChange = (e) => {
		onChange?.(e);
		onCheckedChange?.(e.target.checked);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		type: "checkbox",
		checked,
		onChange: onCheckboxChange,
		className: cn("size-4 rounded border border-input bg-background text-primary shadow-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", interactiveTransitionClass, className),
		...props
	});
};
Checkbox.displayName = "Checkbox";
//#endregion
export { Table as a, TableCell as c, TableRow as d, DataTable as i, TableHead as l, DataTableColumnHeader as n, TableBody as o, VirtualizedDataTable as r, TableCaption as s, Checkbox as t, TableHeader as u };
