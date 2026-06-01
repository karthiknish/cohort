import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState, VisibilityState, } from '@tanstack/react-table';
export const DEFAULT_TABLE_MAX_HEIGHT = '520px';
export const EMPTY_SORTING: SortingState = [];
export const EMPTY_COLUMN_FILTERS: ColumnFiltersState = [];
export const EMPTY_COLUMN_VISIBILITY: VisibilityState = {};
export type DataTableState = {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    columnVisibility: VisibilityState;
    rowSelection: Record<string, boolean>;
    localPagination: PaginationState;
};
export type DataTableInitArg = {
    pageSize: number;
    initialSorting: SortingState;
    initialColumnFilters: ColumnFiltersState;
    initialColumnVisibility: VisibilityState;
};
export type DataTableAction = {
    type: 'setSorting';
    value: SortingState;
} | {
    type: 'setColumnFilters';
    value: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState);
} | {
    type: 'setColumnVisibility';
    value: VisibilityState | ((prev: VisibilityState) => VisibilityState);
} | {
    type: 'setRowSelection';
    value: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>);
} | {
    type: 'setLocalPagination';
    value: PaginationState | ((prev: PaginationState) => PaginationState);
};
export function createInitialDataTableState(init: DataTableInitArg): DataTableState {
    return {
        sorting: init.initialSorting,
        columnFilters: init.initialColumnFilters,
        columnVisibility: init.initialColumnVisibility,
        rowSelection: {},
        localPagination: {
            pageIndex: 0,
            pageSize: init.pageSize,
        },
    };
}
export function dataTableReducer(state: DataTableState, action: DataTableAction): DataTableState {
    switch (action.type) {
        case 'setSorting':
            return { ...state, sorting: action.value };
        case 'setColumnFilters':
            return {
                ...state,
                columnFilters: typeof action.value === 'function' ? action.value(state.columnFilters) : action.value,
            };
        case 'setColumnVisibility':
            return {
                ...state,
                columnVisibility: typeof action.value === 'function' ? action.value(state.columnVisibility) : action.value,
            };
        case 'setRowSelection':
            return {
                ...state,
                rowSelection: typeof action.value === 'function' ? action.value(state.rowSelection) : action.value,
            };
        case 'setLocalPagination':
            return {
                ...state,
                localPagination: typeof action.value === 'function' ? action.value(state.localPagination) : action.value,
            };
        default:
            return state;
    }
}
export function getLoadingRowIds(loadingRows: number) {
    return Array.from({ length: loadingRows }, (_, slotIndex) => `loading-row-${slotIndex + 1}`);
}
export function getLoadingCellKey<TData, TValue>(column: ColumnDef<TData, TValue>) {
    if ('id' in column && typeof column.id === 'string') {
        return column.id;
    }
    if ('accessorKey' in column && typeof column.accessorKey === 'string') {
        return column.accessorKey;
    }
    if ('header' in column && typeof column.header === 'string') {
        return column.header;
    }
    return 'column';
}
export function parsePaginationFromSearchParams(get: (key: string) => string | null, defaultPageSize: number, urlPageParam: string, urlPageSizeParam: string, isValidUrlPageSize: (pageSize: number) => boolean): PaginationState {
    const pageRaw = get(urlPageParam);
    const sizeRaw = get(urlPageSizeParam);
    let pageIndex = 0;
    if (pageRaw) {
        const parsed = Number.parseInt(pageRaw, 10);
        if (Number.isFinite(parsed) && parsed >= 1) {
            pageIndex = parsed - 1;
        }
    }
    let nextPageSize = defaultPageSize;
    if (sizeRaw) {
        const parsed = Number.parseInt(sizeRaw, 10);
        if (Number.isFinite(parsed) && isValidUrlPageSize(parsed)) {
            nextPageSize = parsed;
        }
    }
    return { pageIndex, pageSize: nextPageSize };
}
export function buildPaginationSearchParams(searchParams: URLSearchParams, pagination: PaginationState, defaultPageSize: number, urlPageParam: string, urlPageSizeParam: string, isValidUrlPageSize: (pageSize: number) => boolean) {
    const params = new URLSearchParams(searchParams.toString());
    const oneBased = pagination.pageIndex + 1;
    if (oneBased > 1) {
        params.set(urlPageParam, String(oneBased));
    }
    else {
        params.delete(urlPageParam);
    }
    if (pagination.pageSize !== defaultPageSize && isValidUrlPageSize(pagination.pageSize)) {
        params.set(urlPageSizeParam, String(pagination.pageSize));
    }
    else {
        params.delete(urlPageSizeParam);
    }
    return params;
}
export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    pageSize?: number;
    showPagination?: boolean;
    showRowSelection?: boolean;
    onRowClick?: (row: TData) => void;
    rowClassName?: string | ((row: TData) => string);
    emptyState?: React.ReactNode;
    loading?: boolean;
    loadingRows?: number;
    manualPagination?: boolean;
    pageCount?: number;
    onPaginationChange?: (pagination: PaginationState) => void;
    manualSorting?: boolean;
    onSortingChange?: (sorting: SortingState) => void;
    manualFiltering?: boolean;
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
    initialSorting?: SortingState;
    initialColumnFilters?: ColumnFiltersState;
    initialColumnVisibility?: VisibilityState;
    stickyHeader?: boolean;
    maxHeight?: string | number;
    className?: string;
    getRowId?: (row: TData) => string;
    enableVirtualization?: boolean;
    rowHeight?: number;
    overscan?: number;
    syncPaginationToUrl?: boolean;
    urlPageParam?: string;
    urlPageSizeParam?: string;
    urlPageSizeOptions?: number[];
}
