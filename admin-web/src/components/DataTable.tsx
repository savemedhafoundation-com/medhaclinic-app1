import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';

import { EmptyState } from './EmptyState';

export function DataTable<T>({
  data,
  columns,
  loading,
  emptyTitle,
}: {
  data: T[];
  columns: ColumnDef<T, any>[];
  loading?: boolean;
  emptyTitle?: string;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500"
                    key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>
                    {columns.map((__, cellIndex) => (
                      <td className="px-4 py-4" key={cellIndex}>
                        <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                      </td>
                    ))}
                  </tr>
                ))
              : table.getRowModel().rows.map(row => (
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900" key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-200" key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && data.length === 0 ? (
        <div className="p-4">
          <EmptyState title={emptyTitle} />
        </div>
      ) : null}
    </div>
  );
}
