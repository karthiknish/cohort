import * as React from 'react'

import { cn } from '@/lib/utils'

type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  wrapperClassName?: string
  ref?: React.Ref<HTMLTableElement>
}

type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>
}

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.Ref<HTMLTableRowElement>
}

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.Ref<HTMLTableCellElement>
}

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.Ref<HTMLTableCellElement>
}

type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: React.Ref<HTMLTableCaptionElement>
}

const Table = ({ className, wrapperClassName, ref, ...props }: TableProps) => (
  <div className={cn('relative w-full overflow-auto', wrapperClassName)}>
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
)
Table.displayName = 'Table'

const TableHeader = ({ className, ref, ...props }: TableSectionProps) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
)
TableHeader.displayName = 'TableHeader'

const TableBody = ({ className, ref, ...props }: TableSectionProps) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
)
TableBody.displayName = 'TableBody'

const TableFooter = ({ className, ref, ...props }: TableSectionProps) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
)
TableFooter.displayName = 'TableFooter'

const TableRow = ({ className, ref, ...props }: TableRowProps) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
)
TableRow.displayName = 'TableRow'

const TableHead = ({ className, ref, ...props }: TableHeadProps) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
)
TableHead.displayName = 'TableHead'

const TableCell = ({ className, ref, ...props }: TableCellProps) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
)
TableCell.displayName = 'TableCell'

const TableCaption = ({ className, ref, ...props }: TableCaptionProps) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
)
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
