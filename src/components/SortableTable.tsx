"use client";

import { useState, useMemo } from "react";

interface SortableTableProps {
  rows: Array<Record<string, string>>;
  heading?: string;
}

/**
 * Interactive sortable table — click column headers to sort.
 * Detects generic keys (col1, col2…) and promotes the first row to headers.
 */
export function SortableTable({ rows, heading }: SortableTableProps) {
  // Detect generic column keys like col1, col2, column1, etc.
  const isGenericKeys = useMemo(() => {
    if (!rows || rows.length === 0) return false;
    const keys = Object.keys(rows[0]);
    return keys.every((k) => /^col(umn)?\d+$/i.test(k));
  }, [rows]);

  // If keys are generic, use first row values as headers and skip it in data
  const { columns, dataRows } = useMemo(() => {
    if (!rows || rows.length === 0) return { columns: [] as string[], dataRows: [] as typeof rows };
    const keys = Object.keys(rows[0]);
    if (isGenericKeys && rows.length > 1) {
      const headerRow = rows[0];
      return {
        columns: keys.map((k) => headerRow[k] || k),
        dataRows: rows.slice(1).map((row) => {
          const mapped: Record<string, string> = {};
          keys.forEach((k) => { mapped[headerRow[k] || k] = row[k]; });
          return mapped;
        }),
      };
    }
    return { columns: keys, dataRows: rows };
  }, [rows, isGenericKeys]);

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortedRows = useMemo(() => {
    if (!sortCol || !dataRows) return dataRows || [];
    return [...dataRows].sort((a, b) => {
      const aVal = a[sortCol] || "";
      const bVal = b[sortCol] || "";
      // Try numeric sort first
      const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ""));
      const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ""));
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      }
      // String sort
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [dataRows, sortCol, sortDir]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  if (!rows || rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200/70 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-50 to-violet-50">
            {columns.map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className="text-left px-5 py-3.5 font-semibold text-indigo-900 text-xs uppercase tracking-wide border-b border-gray-200/60 cursor-pointer hover:bg-indigo-100/50 transition-colors select-none"
              >
                <span className="inline-flex items-center gap-1.5">
                  {col}
                  {sortCol === col && (
                    <svg className={`w-3.5 h-3.5 transition-transform ${sortDir === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                  {sortCol !== col && (
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, j) => (
            <tr key={j} className="border-b border-gray-100 last:border-0 hover:bg-indigo-50/30 transition-colors">
              {columns.map((col, k) => (
                <td key={k} className="px-5 py-3.5 text-gray-700">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-400">
        Click column headers to sort • {dataRows.length} rows
      </div>
    </div>
  );
}
