'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { DataTablePagination } from './data-table-pagination'

interface DataTableProps<TData, TValue> {
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
  initialSorting = [],
  initialColumnFilters = [],
  initialColumnVisibility = {},
  stickyHeader = false,
  maxHeight,
  className,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

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

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
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
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newPagination)
      onPaginationChange?.(newPagination)
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

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'rounded-md border',
          maxHeight && 'overflow-auto'
        )}
        style={maxHeight ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } : undefined}
      >
        <Table>
          <TableHeader className={stickyHeader ? 'sticky top-0 bg-background z-10' : undefined}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: loadingRows }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={`loading-cell-${colIndex}`}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    onRowClick && 'cursor-pointer',
                    typeof rowClassName === 'function'
                      ? rowClassName(row.original)
                      : rowClassName
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
