'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, type DataTableProps } from './data-table'

const DEFAULT_VIRTUALIZATION_THRESHOLD = 50

export interface VirtualizedDataTableProps<TData, TValue>
  extends Omit<DataTableProps<TData, TValue>, 'enableVirtualization' | 'showPagination'> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  virtualizationThreshold?: number
}

export function VirtualizedDataTable<TData, TValue>({
  virtualizationThreshold = DEFAULT_VIRTUALIZATION_THRESHOLD,
  data,
  ...props
}: VirtualizedDataTableProps<TData, TValue>) {
  return (
    <DataTable
      {...props}
      data={data}
      enableVirtualization={data.length > virtualizationThreshold}
      showPagination={false}
    />
  )
}