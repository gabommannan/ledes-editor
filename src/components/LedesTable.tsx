import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { LedesRow, ValidationError } from "../lib/types";
import { cn } from "../lib/utils";

interface LedesTableProps {
  data: LedesRow[];
  headers: string[];
  onCellUpdate: (rowIndex: number, columnId: string, value: string) => void;
  getCellValidation: (
    rowIndex: number,
    columnId: string
  ) => ValidationError | undefined;
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<LedesRow>();

export default function LedesTable({
  data,
  headers,
  onCellUpdate,
  getCellValidation,
  isLoading = false,
}: LedesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [editingCell, setEditingCell] = useState<{
    row: number;
    column: string;
  } | null>(null);

  const columns = useMemo(() => {
    return headers.map((header) =>
      columnHelper.accessor(header, {
        id: header,
        header: () => (
          <div
            className="px-2 py-1 text-xs font-medium text-gray-900 truncate"
            title={header}
          >
            {header}
          </div>
        ),
        cell: ({ row, column, getValue }) => {
          const rowIndex = row.index;
          const columnId = column.id;
          const value = getValue() as string;
          const validation = getCellValidation(rowIndex, columnId);
          const isEditing =
            editingCell?.row === rowIndex && editingCell?.column === columnId;

          return (
            <div
              className={cn(
                "relative min-h-[32px] px-2 py-1 border-r border-gray-200",
                validation && "bg-red-50 border-red-200",
                isEditing && "ring-2 ring-blue-500 ring-inset"
              )}
              onClick={() =>
                setEditingCell({ row: rowIndex, column: columnId })
              }
            >
              {isEditing ? (
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    onCellUpdate(rowIndex, columnId, e.target.value)
                  }
                  onBlur={() => setEditingCell(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") {
                      setEditingCell(null);
                    }
                  }}
                  className="w-full h-full border-none outline-none bg-transparent text-sm"
                  autoFocus
                />
              ) : (
                <div
                  className="text-sm truncate cursor-pointer hover:bg-gray-50 min-h-[20px]"
                  title={validation ? validation.error : value}
                >
                  {value || <span className="text-gray-400">-</span>}
                </div>
              )}
              {validation && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full transform translate-x-1 -translate-y-1" />
              )}
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        size: 150,
        minSize: 100,
        maxSize: 300,
      })
    );
  }, [headers, getCellValidation, onCellUpdate, editingCell]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    enableRowSelection: false,
  });

  const handleGlobalFilter = useCallback(
    (value: string) => {
      table.setGlobalFilter(value);
    },
    [table]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search all columns..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleGlobalFilter(e.target.value)}
          />
          <span className="text-sm text-gray-600">
            {table.getFilteredRowModel().rows.length} of {data.length} rows
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[10, 20, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <th className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() }}
                    >
                      <div className="flex items-center space-x-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        <span className="text-gray-400">
                          {{
                            asc: "↑",
                            desc: "↓",
                          }[header.column.getIsSorted() as string] ?? "↕"}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="w-12 px-2 py-2 text-sm text-gray-500 text-center">
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      index +
                      1}
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-r border-gray-200 last:border-r-0"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {"<"}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {">"}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {">>"}
          </button>
        </div>

        <span className="text-sm text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} ({table.getFilteredRowModel().rows.length}{" "}
          total rows)
        </span>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Go to page:</span>
          <input
            type="number"
            min="1"
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
