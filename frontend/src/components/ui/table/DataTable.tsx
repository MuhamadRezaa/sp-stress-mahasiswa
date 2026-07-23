import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./index";

export interface Column<T> {
  header: string;
  accessor: keyof T | string; // Supporting nested object access via dot notation, e.g. 'digital.day_type'
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  defaultRowsPerPage?: number;
  // A function to check if a row matches the search query.
  // If not provided, it will convert row values to lowercase strings and check if they include the query.
  globalFilterFn?: (row: T, query: string) => boolean;
}

export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Search...",
  defaultRowsPerPage = 10,
  globalFilterFn,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  
  // Sorting State
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Handle Header Sorting Click
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Helper to extract nested properties via dot notation
  const getFieldValue = (obj: any, path: string): any => {
    if (!path) return "";
    return path.split(".").reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : "";
    }, obj);
  };

  // 1. Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const query = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (globalFilterFn) {
        return globalFilterFn(row, query);
      }

      // Default filter strategy: search all columns
      return columns.some((col) => {
        let value = "";
        const rawVal = getFieldValue(row, col.accessor as string);
        value = rawVal ? String(rawVal) : "";
        return value.toLowerCase().includes(query);
      });
    });
  }, [data, searchTerm, columns, globalFilterFn]);

  // 2. Sort Data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      let aVal = getFieldValue(a, sortField);
      let bVal = getFieldValue(b, sortField);

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return sortOrder === "asc" ? 1 : -1;
      if (bVal === null || bVal === undefined) return sortOrder === "asc" ? -1 : 1;

      // Handle numbers
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Convert to strings for comparison
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortField, sortOrder]);

  // 3. Paginate Data
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full">
      {/* Controls: Show Entries & Search */}
      <div className="flex flex-col px-6 py-5 gap-4 border-b border-gray-100 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 text-nowrap">Show</span>
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="pl-3 pr-8 py-1.5 text-sm bg-transparent border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
        </div>

        <div className="relative max-w-xs w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Table Container */}
      {sortedData.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">Data tidak ditemukan</p>
        </div>
      ) : (
        <>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 dark:border-white/[0.05] divide-x divide-gray-100 dark:divide-white/[0.05]">
                  {columns.map((col, idx) => {
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left";

                    return (
                      <TableCell
                        key={idx}
                        isHeader
                        className={`px-6 py-4 text-gray-800 dark:text-white ${alignClass} ${
                          col.sortable ? "cursor-pointer select-none" : ""
                        }`}
                        onClick={() => col.sortable && handleSort(col.accessor as string)}
                      >
                        <div className={`flex items-center w-full ${
                          col.sortable
                            ? "justify-between"
                            : col.align === "center"
                            ? "justify-center"
                            : col.align === "right"
                            ? "justify-end"
                            : "justify-start"
                        }`}>
                          {col.header}
                          {col.sortable && (
                            <span className="flex flex-col gap-0.5">
                              <svg
                                className={
                                  sortField === col.accessor && sortOrder === "asc"
                                    ? "fill-brand-500"
                                    : "fill-gray-300 dark:fill-gray-700"
                                }
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4.40962 0.585167C4.21057 0.300808 3.78943 0.300807 3.59038 0.585166L1.05071 4.21327C0.81874 4.54466 1.05582 5 1.46033 5H6.53967C6.94418 5 7.18126 4.54466 6.94929 4.21327L4.40962 0.585167Z"
                                />
                              </svg>

                              <svg
                                className={
                                  sortField === col.accessor && sortOrder === "desc"
                                    ? "fill-brand-500"
                                    : "fill-gray-300 dark:fill-gray-700"
                                }
                                width="8"
                                height="5"
                                viewBox="0 0 8 5"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4.40962 4.41483C4.21057 4.69919 3.78943 4.69919 3.59038 4.41483L1.05071 0.786732C0.81874 0.455343 1.05582 0 1.46033 0H6.53967C6.94418 0 7.18126 0.455342 6.94929 0.786731L4.40962 4.41483Z"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {currentRows.map((row, rowIdx) => (
                  <TableRow
                    key={rowIdx}
                    className="border-b border-gray-100 dark:border-white/[0.05] divide-x divide-gray-100 dark:divide-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                  >
                    {columns.map((col, colIdx) => {
                      const alignClass =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left";

                      return (
                        <TableCell key={colIdx} className={`px-6 py-4 ${alignClass}`}>
                          {col.render
                            ? col.render(row)
                            : String(getFieldValue(row, col.accessor as string) || "-")}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 border-t border-gray-100 dark:border-white/[0.05] sm:flex-row">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium text-gray-800 dark:text-white">{indexOfFirstRow + 1}</span> to <span className="font-medium text-gray-800 dark:text-white">{Math.min(indexOfLastRow, sortedData.length)}</span> of <span className="font-medium text-gray-800 dark:text-white">{sortedData.length}</span> entries
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 text-gray-500 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors rounded-lg border ${
                    currentPage === page
                      ? "bg-brand-500 text-white border-brand-500 shadow-theme-xs"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center justify-center w-10 h-10 text-gray-500 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
