'use client'
'use no memo'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  type Header,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable as createReactTable,
} from '@tanstack/react-table'
import { useVirtualizer as createVirtualizer } from '@tanstack/react-virtual'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { cn } from '@/lib/utils'

import { DataTablePagination } from './data-table-pagination'

const DEFAULT_TABLE_MAX_HEIGHT = '520px'
const EMPTY_SORTING: SortingState = []
const EMPTY_COLUMN_FILTERS: ColumnFiltersState = []
const EMPTY_COLUMN_VISIBILITY: VisibilityState = {}

function getLoadingRowIds(loadingRows: number) {
  return Array.from({ length: loadingRows }, (_, slotIndex) => `loading-row-${slotIndex + 1}`)
}

function getLoadingCellKey<TData, TValue>(column: ColumnDef<TData, TValue>) {
  if ('id' in column && typeof column.id === 'string') {
    return column.id
  }

  if ('accessorKey' in column && typeof column.accessorKey === 'string') {
    return column.accessorKey
  }

  if ('header' in column && typeof column.header === 'string') {
    return column.header
  }

  return 'column'
}

function DataTableHeaderCell<TData, TValue>({ header }: { header: Header<TData, TValue> }) {
  const width = header.getSize()
  const style = React.useMemo(() => ({ width }), [width])

  return (
    <TableHead key={header.id} style={style}>
      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>
  )
}

function DataTableSpacerRow({ colSpan, height }: { colSpan: number; height: number }) {
  const style = React.useMemo(() => ({ height: `${height}px` }), [height])

  return (
    <TableRow>
      <TableCell colSpan={colSpan} style={style} />
    </TableRow>
  )
}

function DataTableBodyRow<TData>({
  height,
  onRowClick,
  row,
  rowClassName,
}: {
  height?: number
  onRowClick?: (row: TData) => void
  row: Row<TData>
  rowClassName?: string | ((row: TData) => string)
}) {
  const style = React.useMemo(
    () => (height ? { height: `${height}px` } : undefined),
    [height]
  )

  const handleClick = React.useCallback(() => {
    onRowClick?.(row.original)
  }, [onRowClick, row.original])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (!onRowClick) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleClick()
      }
    },
    [handleClick, onRowClick]
  )

  const resolvedClassName =
    typeof rowClassName === 'function' ? rowClassName(row.original) : rowClassName

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      onClick={onRowClick ? handleClick : undefined}
      onKeyDown={onRowClick ? handleKeyDown : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      aria-label={onRowClick ? 'View row details' : undefined}
      className={cn(
        onRowClick &&
          'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        resolvedClassName
      )}
      style={style}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  )
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  pageSize?: number
  showPagination?: boolean
  showRowSelection?: boolean
  onRowClick?: (row: TData) => void
  rowClassName?: string | ((row: TData) => string)
  emptyState?: React.ReactNode
  loading?: boolean
  loadingRows?: number
  manualPagination?: boolean
  pageCount?: number
  onPaginationChange?: (pagination: PaginationState) => void
  manualSorting?: boolean
  onSortingChange?: (sorting: SortingState) => void
  manualFiltering?: boolean
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  initialSorting?: SortingState
  initialColumnFilters?: ColumnFiltersState
  initialColumnVisibility?: VisibilityState
  stickyHeader?: boolean
  maxHeight?: string | number
  className?: string
  getRowId?: (row: TData) => string
  enableVirtualization?: boolean
  rowHeight?: number
  overscan?: number
  /** When set with client-side pagination, `page` and `page size` are reflected in the URL. */
  syncPaginationToUrl?: boolean
  /** 1-based page number query param (default: `p`). Omitted when page 1. */
  urlPageParam?: string
  /** Page size query param (default: `perPage`). Omitted when it matches the `pageSize` prop. */
  urlPageSizeParam?: string
  /** When parsing `perPage` from the URL, only these values are accepted. */
  urlPageSizeOptions?: number[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchValue,
  onSearchChange,
  pageSize = 10,
  showPagination = true,
  showRowSelection = false,
  onRowClick,
  rowClassName,
  emptyState,
  loading = false,
  loadingRows = 5,
  manualPagination = false,
  pageCount,
  onPaginationChange,
  manualSorting = false,
  onSortingChange,
  manualFiltering = false,
  onColumnFiltersChange,
  initialSorting = EMPTY_SORTING,
  initialColumnFilters = EMPTY_COLUMN_FILTERS,
  initialColumnVisibility = EMPTY_COLUMN_VISIBILITY,
  stickyHeader = false,
  maxHeight,
  className,
  getRowId,
  enableVirtualization = false,
  rowHeight = 48,
  overscan = 6,
  syncPaginationToUrl = false,
  urlPageParam = 'p',
  urlPageSizeParam = 'perPage',
  urlPageSizeOptions = [10, 20, 30, 40, 50],
}: DataTableProps<TData, TValue>) {
  'use no memo'

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const isValidUrlPageSize = React.useCallback(
    (n: number) => urlPageSizeOptions.includes(n),
    [urlPageSizeOptions]
  )

  const replacePaginationInUrl = React.useCallback(
    (next: PaginationState) => {
      if (!syncPaginationToUrl || !showPagination || manualPagination) {
        return
      }

      const params = new URLSearchParams(searchParams.toString())
      const oneBased = next.pageIndex + 1
      if (oneBased > 1) {
        params.set(urlPageParam, String(oneBased))
      } else {
        params.delete(urlPageParam)
      }

      if (next.pageSize !== pageSize && isValidUrlPageSize(next.pageSize)) {
        params.set(urlPageSizeParam, String(next.pageSize))
      } else {
        params.delete(urlPageSizeParam)
      }

      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    },
    [
      isValidUrlPageSize,
      manualPagination,
      pageSize,
      pathname,
      router,
      searchParams,
      showPagination,
      syncPaginationToUrl,
      urlPageParam,
      urlPageSizeParam,
    ]
  )

  React.useEffect(() => {
    if (!syncPaginationToUrl || !showPagination || manualPagination) {
      return
    }

    const pageRaw = searchParams.get(urlPageParam)
    const sizeRaw = searchParams.get(urlPageSizeParam)

    let nextIndex = 0
    if (pageRaw) {
      const parsed = Number.parseInt(pageRaw, 10)
      if (Number.isFinite(parsed) && parsed >= 1) {
        nextIndex = parsed - 1
      }
    }

    let nextSize = pageSize
    if (sizeRaw) {
      const parsed = Number.parseInt(sizeRaw, 10)
      if (Number.isFinite(parsed) && isValidUrlPageSize(parsed)) {
        nextSize = parsed
      }
    }

    if (nextIndex === pagination.pageIndex && nextSize === pagination.pageSize) {
      return
    }

    setPagination({ pageIndex: nextIndex, pageSize: nextSize })
  }, [
    isValidUrlPageSize,
    manualPagination,
    pageSize,
    pagination.pageIndex,
    pagination.pageSize,
    searchParams,
    showPagination,
    syncPaginationToUrl,
    urlPageParam,
    urlPageSizeParam,
  ])

  // Controlled/uncontrolled search value
  const [internalSearchValue, setInternalSearchValue] = React.useState('')
  const effectiveSearchValue = searchValue ?? internalSearchValue

  // Sync search value into column filters
  React.useEffect(() => {
    if (!searchKey) return

    setColumnFilters((prev) => {
      const otherFilters = prev.filter((filter) => filter.id !== searchKey)
      if (effectiveSearchValue) {
        return [...otherFilters, { id: searchKey, value: effectiveSearchValue }]
      }
      return otherFilters
    })
  }, [searchKey, effectiveSearchValue])

  // react-doctor-disable-next-line react-hooks-js/incompatible-library
  const table = createReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      onSortingChange?.(newSorting)
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(newFilters)
      onColumnFiltersChange?.(newFilters)

      if (searchKey) {
        const searchFilter = newFilters.find((filter) => filter.id === searchKey)
        const nextSearch = typeof searchFilter?.value === 'string' ? searchFilter.value : ''

        // Sync internal state only when uncontrolled
        if (searchValue === undefined) {
          setInternalSearchValue(nextSearch)
        }

        onSearchChange?.(nextSearch)
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      setPagination((old) => {
        const newPagination = typeof updater === 'function' ? updater(old) : updater
        onPaginationChange?.(newPagination)
        if (syncPaginationToUrl && showPagination && !manualPagination) {
          replacePaginationInUrl(newPagination)
        }
        return newPagination
      })
    },
    state: {
      sorting,
      columnFilters,
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
  })

  const rows = table.getRowModel().rows
  const loadingRowIds = React.useMemo(() => getLoadingRowIds(loadingRows), [loadingRows])

  const shouldVirtualize = enableVirtualization && !manualPagination
  const virtualParentRef = React.useRef<HTMLDivElement | null>(null)
  const virtualizer = createVirtualizer({
    count: shouldVirtualize ? rows.length : 0,
    getScrollElement: () => virtualParentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  })
  const virtualItems = shouldVirtualize ? virtualizer.getVirtualItems() : []
  const firstVirtualItem = virtualItems.at(0)
  const lastVirtualItem = virtualItems.at(-1)
  const paddingTop = shouldVirtualize && firstVirtualItem ? firstVirtualItem.start : 0
  const paddingBottom = shouldVirtualize && lastVirtualItem
    ? virtualizer.getTotalSize() - lastVirtualItem.end
    : 0
  const containerStyle = React.useMemo(() => {
    if (maxHeight) {
      return { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }
    }

    if (shouldVirtualize) {
      return { maxHeight: DEFAULT_TABLE_MAX_HEIGHT }
    }

    return undefined
  }, [maxHeight, shouldVirtualize])

  React.useEffect(() => {
    if (!shouldVirtualize) return
    virtualizer.measure()
  }, [shouldVirtualize, virtualizer])

  return (
    <div className={cn('space-y-4', className)}>
      <div
        ref={shouldVirtualize ? virtualParentRef : undefined}
        className={cn(
          'rounded-md border',
          (maxHeight || shouldVirtualize) && 'overflow-auto'
        )}
        style={containerStyle}
      >
        <Table wrapperClassName={shouldVirtualize ? 'overflow-visible' : undefined}>
          <TableHeader className={stickyHeader ? 'sticky top-0 bg-background z-10' : undefined}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <DataTableHeaderCell key={header.id} header={header} />
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              loadingRowIds.map((rowId) => (
                <TableRow key={rowId}>
                  {columns.map((column) => (
                    <TableCell key={`${rowId}-${getLoadingCellKey(column)}`}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              shouldVirtualize ? (
                <>
                  {paddingTop > 0 && (
                    <DataTableSpacerRow colSpan={columns.length} height={paddingTop} />
                  )}
                  {virtualItems.map((virtualRow) => {
                    const row = rows[virtualRow.index]
                    if (!row) {
                      return null
                    }

                    return (
                      <DataTableBodyRow
                        key={row.id}
                        onRowClick={onRowClick}
                        row={row}
                        rowClassName={rowClassName}
                        height={virtualRow.size}
                      />
                    )
                  })}
                  {paddingBottom > 0 && (
                    <DataTableSpacerRow colSpan={columns.length} height={paddingBottom} />
                  )}
                </>
              ) : (
                rows.map((row) => (
                  <DataTableBodyRow
                    key={row.id}
                    onRowClick={onRowClick}
                    row={row}
                    rowClassName={rowClassName}
                  />
                ))
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyState ?? 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <DataTablePagination table={table} showRowSelection={showRowSelection} />
      )}
    </div>
  )
}
