import type {
  ReactNode,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface DataTableColumn<T> {
  key: string;

  header: ReactNode;

  render: (
    row: T,
  ) => ReactNode;

  className?: string;
}

export interface DataTableProps<T> {
  columns:
  readonly DataTableColumn<T>[];

  rows:
  readonly T[];

  getRowKey: (
    row: T,
  ) => string;

  /**
   * Optional row click handler.
   *
   * When provided, the entire row becomes clickable.
   */
  onRowClick?: (
    row: T,
  ) => void;

  /**
   * Optional row class name.
   */
  getRowClassName?: (
    row: T,
  ) => string;

  className?: string;
}

// ============================================================================
// Data table
// ============================================================================

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  getRowClassName,
  className = "",
}: DataTableProps<T>) {
  const rowsAreClickable =
    typeof onRowClick ===
    "function";

  return (
    <div
      className={[
        "w-full overflow-hidden rounded-xl border border-slate-200 bg-white",
        className,
      ].join(" ")}
    >
      {/* ==================================================================
          Desktop / tablet table
      ================================================================== */}

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              {columns.map(
                (column) => (
                  <th
                    key={
                      column.key
                    }
                    scope="col"
                    className={[
                      "px-4 py-3 text-left",
                      "text-[10px] font-semibold uppercase tracking-[0.1em]",
                      "text-slate-400",
                      column.className ??
                      "",
                    ].join(" ")}
                  >
                    {column.header}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map(
              (row) => (
                <tr
                  key={
                    getRowKey(
                      row,
                    )
                  }
                  onClick={
                    rowsAreClickable
                      ? () =>
                        onRowClick!(
                          row,
                        )
                      : undefined
                  }
                  className={[
                    "transition-colors",
                    rowsAreClickable
                      ? "cursor-pointer hover:bg-slate-50/70"
                      : "hover:bg-slate-50/60",
                    getRowClassName?.(
                      row,
                    ) ?? "",
                  ].join(" ")}
                >
                  {columns.map(
                    (column) => (
                      <td
                        key={
                          column.key
                        }
                        className={[
                          "px-4 py-3.5",
                          "text-sm text-slate-700",
                          column.className ??
                          "",
                        ].join(" ")}
                      >
                        {column.render(
                          row,
                        )}
                      </td>
                    ),
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}