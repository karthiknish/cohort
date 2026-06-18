'use client';
'use no memo';
import * as React from 'react';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params';
import { type ColumnFiltersState, type SortingState, type PaginationState, type VisibilityState, type RowSelectionState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable as createReactTable, } from '@tanstack/react-table';
import { useVirtualizer as createVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { DataTablePagination } from './data-table-pagination';
import { DataTableBodyContent, DataTableHeaderCell, DataTableScrollContainer, } from './data-table-sections';
import { DEFAULT_TABLE_MAX_HEIGHT, EMPTY_COLUMN_FILTERS, EMPTY_COLUMN_VISIBILITY, EMPTY_SORTING, buildPaginationSearchParams, createInitialDataTableState, dataTableReducer, parsePaginationFromSearchParams, type DataTableProps, } from './data-table-types';
export type { DataTableProps } from './data-table-types';
export function DataTable<TData, TValue>({ columns, data, searchKey, searchValue, onSearchChange, pageSize = 10, showPagination = true, showRowSelection = false, onRowClick, rowClassName, emptyState, loading = false, loadingRows = 5, manualPagination = false, pageCount, onPaginationChange, manualSorting = false, onSortingChange, manualFiltering = false, onColumnFiltersChange, initialSorting = EMPTY_SORTING, initialColumnFilters = EMPTY_COLUMN_FILTERS, initialColumnVisibility = EMPTY_COLUMN_VISIBILITY, stickyHeader = false, maxHeight, className, getRowId, enableVirtualization = false, rowHeight = 48, overscan = 6, syncPaginationToUrl = false, urlPageParam = 'p', urlPageSizeParam = 'perPage', urlPageSizeOptions = [10, 20, 30, 40, 50], }: DataTableProps<TData, TValue>) {
    'use no memo';
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useUrlSearchParams();
    const usesUrlPagination = syncPaginationToUrl && showPagination && !manualPagination;
    const isValidUrlPageSize = (pageSizeOption: number) => urlPageSizeOptions.includes(pageSizeOption);
    const urlPagination = parsePaginationFromSearchParams((key) => searchParams.get(key), pageSize, urlPageParam, urlPageSizeParam, isValidUrlPageSize);
    const [tableState, dispatch] = React.useReducer(dataTableReducer, {
        pageSize,
        initialSorting,
        initialColumnFilters,
        initialColumnVisibility,
    }, createInitialDataTableState);
    const { sorting, columnFilters, columnVisibility, rowSelection, localPagination } = tableState;
    const setSorting = (value: SortingState) => {
        dispatch({ type: 'setSorting', value });
    };
    const setColumnFilters = (value: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => {
        dispatch({ type: 'setColumnFilters', value });
    };
    const setColumnVisibility = (value: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
        dispatch({ type: 'setColumnVisibility', value });
    };
    const setRowSelection = (value: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
        dispatch({ type: 'setRowSelection', value });
    };
    const setLocalPagination = (value: PaginationState | ((prev: PaginationState) => PaginationState)) => {
        dispatch({ type: 'setLocalPagination', value });
    };
    const pagination = usesUrlPagination ? urlPagination : localPagination;
    const internalSearchValueRef = React.useRef('');
    const effectiveSearchValue = searchValue ?? internalSearchValueRef.current;
    const columnFiltersWithSearch = (() => {
        if (!searchKey)
            return columnFilters;
        const otherFilters = columnFilters.filter((filter) => filter.id !== searchKey);
        if (effectiveSearchValue) {
            return [...otherFilters, { id: searchKey, value: effectiveSearchValue }];
        }
        return otherFilters;
    })();
    // react-doctor-disable-next-line react-hooks-js/incompatible-library
    const table = createReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
        getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
        getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
        onSortingChange: (updater) => {
            const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(newSorting);
            onSortingChange?.(newSorting);
        },
        onColumnFiltersChange: (updater) => {
            const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater;
            setColumnFilters(newFilters);
            onColumnFiltersChange?.(newFilters);
            if (searchKey) {
                const searchFilter = newFilters.find((filter) => filter.id === searchKey);
                const nextSearch = typeof searchFilter?.value === 'string' ? searchFilter.value : '';
                if (searchValue === undefined) {
                    internalSearchValueRef.current = nextSearch;
                }
                onSearchChange?.(nextSearch);
            }
        },
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: (updater) => {
            if (usesUrlPagination) {
                const newPagination = typeof updater === 'function' ? updater(urlPagination) : updater;
                const params = buildPaginationSearchParams(new URLSearchParams(searchParams.toString()), newPagination, pageSize, urlPageParam, urlPageSizeParam, isValidUrlPageSize);
                const queryString = params.toString();
                replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
                onPaginationChange?.(newPagination);
                return;
            }
            setLocalPagination((old) => {
                const newPagination = typeof updater === 'function' ? updater(old) : updater;
                onPaginationChange?.(newPagination);
                return newPagination;
            });
        },
        state: {
            sorting,
            columnFilters: columnFiltersWithSearch,
            columnVisibility,
            rowSelection,
            pagination,
        },
        manualPagination,
        manualSorting,
        manualFiltering,
        pageCount: manualPagination ? pageCount : undefined,
        getRowId,
        enableRowSelection: showRowSelection,
    });
    const rows = table.getRowModel().rows;
    const shouldVirtualize = enableVirtualization && !manualPagination;
    const virtualParentRef = React.useRef<HTMLDivElement | null>(null);
    const virtualizer = createVirtualizer({
        count: shouldVirtualize ? rows.length : 0,
        getScrollElement: () => virtualParentRef.current,
        estimateSize: () => rowHeight,
        overscan,
    });
    const containerStyle = (() => {
        if (maxHeight) {
            return { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight };
        }
        if (shouldVirtualize) {
            return { maxHeight: DEFAULT_TABLE_MAX_HEIGHT };
        }
        return undefined;
    })();
    React.useEffect(() => {
        if (!shouldVirtualize)
            return;
        virtualizer.measure();
    }, [shouldVirtualize, virtualizer]);
    const headerGroups = table.getHeaderGroups();
    const body = (() => {
        const virtualItems = shouldVirtualize ? virtualizer.getVirtualItems() : [];
        const firstVirtualItem = virtualItems.at(0);
        const lastVirtualItem = virtualItems.at(-1);
        const paddingTop = shouldVirtualize && firstVirtualItem ? firstVirtualItem.start : 0;
        const paddingBottom = shouldVirtualize && lastVirtualItem ? virtualizer.getTotalSize() - lastVirtualItem.end : 0;
        return (<DataTableBodyContent columns={columns} rows={rows} loading={loading} loadingRows={loadingRows} shouldVirtualize={shouldVirtualize} virtualItems={virtualItems} paddingTop={paddingTop} paddingBottom={paddingBottom} onRowClick={onRowClick} rowClassName={rowClassName} emptyState={emptyState}/>);
    })();
    return (<div className={cn('space-y-4', className)}>
      <DataTableScrollContainer shouldVirtualize={shouldVirtualize} maxHeight={maxHeight} shouldVirtualizeStyles={shouldVirtualize} containerStyle={containerStyle} virtualParentRef={virtualParentRef} stickyHeader={stickyHeader} headerGroups={headerGroups} body={body}/>
      {showPagination ? (<DataTablePagination table={table} showRowSelection={showRowSelection}/>) : null}
    </div>);
}
