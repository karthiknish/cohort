'use client';
import { useCallback } from 'react';
import { DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import type { Table } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, } from '@/shared/ui/dropdown-menu';
interface DataTableViewOptionsProps<TData> {
    table: Table<TData>;
}
type ColumnVisibilityOptionColumn<TData> = ReturnType<Table<TData>['getAllColumns']>[number];
function ColumnVisibilityOption<TData>({ column }: {
    column: ColumnVisibilityOptionColumn<TData>;
}) {
    const handleCheckedChange = (value: boolean | 'indeterminate') => {
        column.toggleVisibility(!!value);
    };
    return (<DropdownMenuCheckboxItem className="capitalize" checked={column.getIsVisible()} onCheckedChange={handleCheckedChange}>
      {column.id}
    </DropdownMenuCheckboxItem>);
}
export function DataTableViewOptions<TData>({ table, }: DataTableViewOptionsProps<TData>) {
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
          <Settings2 className="mr-2 size-4"/>
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
            .getAllColumns()
            .flatMap((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide()
            ? [<ColumnVisibilityOption key={column.id} column={column}/>]
            : [])}
      </DropdownMenuContent>
    </DropdownMenu>);
}
