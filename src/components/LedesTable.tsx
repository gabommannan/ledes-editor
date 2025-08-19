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

/**
 * LedesTable component with keyboard navigation support:
 * - Tab: Move to next cell (Shift+Tab: previous cell)
 * - Enter: Move to cell below
 * - Arrow keys: Navigate between cells (when cursor is at text boundaries)
 * - Escape: Exit editing mode
 */

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

  // Helper function to navigate to next/previous cell
  const navigateToCell = useCallback(
    (direction: "next" | "previous" | "down" | "up") => {
      if (!editingCell) return;

      const currentRowIndex = editingCell.row;
      const currentColumnIndex = headers.indexOf(editingCell.column);
      const totalRows = data.length;
      const totalColumns = headers.length;

      let newRowIndex = currentRowIndex;
      let newColumnIndex = currentColumnIndex;

      switch (direction) {
        case "next":
          newColumnIndex++;
          if (newColumnIndex >= totalColumns) {
            newColumnIndex = 0;
            newRowIndex++;
            if (newRowIndex >= totalRows) {
              newRowIndex = 0; // Wrap to first row
            }
          }
          break;
        case "previous":
          newColumnIndex--;
          if (newColumnIndex < 0) {
            newColumnIndex = totalColumns - 1;
            newRowIndex--;
            if (newRowIndex < 0) {
              newRowIndex = totalRows - 1; // Wrap to last row
            }
          }
          break;
        case "down":
          newRowIndex++;
          if (newRowIndex >= totalRows) {
            newRowIndex = 0; // Wrap to first row
          }
          break;
        case "up":
          newRowIndex--;
          if (newRowIndex < 0) {
            newRowIndex = totalRows - 1; // Wrap to last row
          }
          break;
      }

      const newColumn = headers[newColumnIndex];
      setEditingCell({ row: newRowIndex, column: newColumn });
    },
    [editingCell, headers, data.length]
  );

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
                    switch (e.key) {
                      case "Enter":
                        e.preventDefault();
                        navigateToCell("down");
                        break;
                      case "Tab":
                        e.preventDefault();
                        if (e.shiftKey) {
                          navigateToCell("previous");
                        } else {
                          navigateToCell("next");
                        }
                        break;
                      case "ArrowDown":
                        e.preventDefault();
                        navigateToCell("down");
                        break;
                      case "ArrowUp":
                        e.preventDefault();
                        navigateToCell("up");
                        break;
                      case "ArrowRight":
                        // Only navigate if cursor is at end of input
                        if (
                          e.currentTarget.selectionStart ===
                          e.currentTarget.value.length
                        ) {
                          e.preventDefault();
                          navigateToCell("next");
                        }
                        break;
                      case "ArrowLeft":
                        // Only navigate if cursor is at beginning of input
                        if (e.currentTarget.selectionStart === 0) {
                          e.preventDefault();
                          navigateToCell("previous");
                        }
                        break;
                      case "Escape":
                        setEditingCell(null);
                        break;
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
  }, [headers, getCellValidation, onCellUpdate, editingCell, navigateToCell]);

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
