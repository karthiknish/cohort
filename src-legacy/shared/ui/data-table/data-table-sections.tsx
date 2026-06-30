'use client';
import * as React from 'react';
import { type Header, type ColumnDef, type HeaderGroup, type Row, flexRender, } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/shared/ui/table';
import { cn } from '@/lib/utils';
import { getLoadingCellKey, getLoadingRowIds } from './data-table-types';
export function DataTableHeaderCell<TData, TValue>({ header }: {
    header: Header<TData, TValue>;
}) {
    const width = header.getSize();
    const style = ({ width });
    return (<TableHead key={header.id} style={style}>
      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
    </TableHead>);
}
export function DataTableSpacerRow({ colSpan, height }: {
    colSpan: number;
    height: number;
}) {
    const style = ({ height: `${height}px` });
    return (<TableRow>
      <TableCell colSpan={colSpan} style={style}/>
    </TableRow>);
}
export function DataTableBodyRow<TData>({ height, onRowClick, row, rowClassName, }: {
    height?: number;
    onRowClick?: (row: TData) => void;
    row: Row<TData>;
    rowClassName?: string | ((row: TData) => string);
}) {
    const style = (height ? { height: `${height}px` } : undefined);
    const handleClick = () => {
        onRowClick?.(row.original);
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
        if (!onRowClick)
            return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    };
    const resolvedClassName = typeof rowClassName === 'function' ? rowClassName(row.original) : rowClassName;
    return (<TableRow data-state={row.getIsSelected() && 'selected'} onClick={onRowClick ? handleClick : undefined} onKeyDown={onRowClick ? handleKeyDown : undefined} tabIndex={onRowClick ? 0 : undefined} aria-label={onRowClick ? 'View row details' : undefined} className={cn(onRowClick &&
            'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', resolvedClassName)} style={style}>
      {row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}
    </TableRow>);
}
export function DataTableLoadingRows<TData, TValue>({ columns, loadingRows, }: {
    columns: ColumnDef<TData, TValue>[];
    loadingRows: number;
}) {
    const loadingRowIds = getLoadingRowIds(loadingRows);
    return (<>
      {loadingRowIds.map((rowId) => (<TableRow key={rowId}>
          {columns.map((column) => (<TableCell key={`${rowId}-${getLoadingCellKey(column)}`}>
              <div className="h-4 w-full animate-pulse rounded bg-muted"/>
            </TableCell>))}
        </TableRow>))}
    </>);
}
export function DataTableVirtualizedRows<TData>({ columns, rows, virtualItems, paddingTop, paddingBottom, onRowClick, rowClassName, }: {
    columns: ColumnDef<TData, unknown>[];
    rows: Row<TData>[];
    virtualItems: Array<{
        index: number;
        size: number;
    }>;
    paddingTop: number;
    paddingBottom: number;
    onRowClick?: (row: TData) => void;
    rowClassName?: string | ((row: TData) => string);
}) {
    return (<>
      {paddingTop > 0 ? <DataTableSpacerRow colSpan={columns.length} height={paddingTop}/> : null}
      {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) {
                return null;
            }
            return (<DataTableBodyRow key={row.id} onRowClick={onRowClick} row={row} rowClassName={rowClassName} height={virtualRow.size}/>);
        })}
      {paddingBottom > 0 ? (<DataTableSpacerRow colSpan={columns.length} height={paddingBottom}/>) : null}
    </>);
}
export function DataTableScrollContainer<TData>({ shouldVirtualize, containerStyle, virtualParentRef, stickyHeader, headerGroups, body, shouldVirtualizeStyles, }: {
    shouldVirtualize: boolean;
    maxHeight?: number | string;
    shouldVirtualizeStyles: boolean;
    containerStyle?: React.CSSProperties;
    virtualParentRef: React.RefObject<HTMLDivElement | null>;
    stickyHeader: boolean;
    headerGroups: HeaderGroup<TData>[];
    body: React.ReactNode;
}) {
    return (<div ref={shouldVirtualize ? virtualParentRef : undefined} className={cn('relative w-full overflow-hidden rounded-md border', shouldVirtualizeStyles && 'overflow-auto')} style={containerStyle}>
      <Table>
        <TableHeader className={stickyHeader ? 'sticky top-0 z-10 bg-background' : undefined}>
          {headerGroups.map((headerGroup) => (<TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (<DataTableHeaderCell key={header.id} header={header}/>))}
            </TableRow>))}
        </TableHeader>
        <TableBody>{body}</TableBody>
      </Table>
    </div>);
}
export function DataTableBodyContent<TData, TValue>({ columns, rows, loading, loadingRows, shouldVirtualize, virtualItems, paddingTop, paddingBottom, onRowClick, rowClassName, emptyState, }: {
    columns: ColumnDef<TData, TValue>[];
    rows: Row<TData>[];
    loading: boolean;
    loadingRows: number;
    shouldVirtualize: boolean;
    virtualItems: Array<{
        index: number;
        size: number;
    }>;
    paddingTop: number;
    paddingBottom: number;
    onRowClick?: (row: TData) => void;
    rowClassName?: string | ((row: TData) => string);
    emptyState?: React.ReactNode;
}) {
    if (loading) {
        return <DataTableLoadingRows columns={columns} loadingRows={loadingRows}/>;
    }
    if (rows.length === 0) {
        return (<TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          {emptyState ?? 'No results.'}
        </TableCell>
      </TableRow>);
    }
    if (shouldVirtualize) {
        return (<DataTableVirtualizedRows columns={columns} rows={rows} virtualItems={virtualItems} paddingTop={paddingTop} paddingBottom={paddingBottom} onRowClick={onRowClick} rowClassName={rowClassName}/>);
    }
    return (<>
      {rows.map((row) => (<DataTableBodyRow key={row.id} onRowClick={onRowClick} row={row} rowClassName={rowClassName}/>))}
    </>);
}
