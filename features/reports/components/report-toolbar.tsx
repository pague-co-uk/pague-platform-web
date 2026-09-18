"use client";

import {
  type ReactNode,
} from "react";

import {
  Download,
  RotateCcw,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface ReportToolbarProps {
  readonly from: string;

  readonly to: string;

  readonly onFromChange: (
    value: string,
  ) => void;

  readonly onToChange: (
    value: string,
  ) => void;

  readonly onReset: () => void;

  readonly onExport: () => void;

  readonly exporting?: boolean;

  readonly children?: ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export function ReportToolbar({
  from,
  to,
  onFromChange,
  onToChange,
  onReset,
  onExport,
  exporting = false,
  children,
}: ReportToolbarProps) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        dark:border-slate-800
        dark:bg-slate-950
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-end
          lg:justify-between
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
          "
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="report-from"
              className="
                text-sm
                font-medium
                text-slate-700
                dark:text-slate-300
              "
            >
              From
            </label>

            <input
              id="report-from"
              type="date"
              value={from}
              onChange={(event) =>
                onFromChange(
                  event.target.value,
                )
              }
              className="
                h-10
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                text-sm
                text-slate-900
                outline-none
                transition
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-100
                dark:focus:border-slate-500
                dark:focus:ring-slate-800
              "
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="report-to"
              className="
                text-sm
                font-medium
                text-slate-700
                dark:text-slate-300
              "
            >
              To
            </label>

            <input
              id="report-to"
              type="date"
              value={to}
              onChange={(event) =>
                onToChange(
                  event.target.value,
                )
              }
              className="
                h-10
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                text-sm
                text-slate-900
                outline-none
                transition
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-100
                dark:focus:border-slate-500
                dark:focus:ring-slate-800
              "
            />
          </div>

          {children}
        </div>

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <button
            type="button"
            onClick={onReset}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-slate-300
              bg-white
              px-3
              text-sm
              font-medium
              text-slate-700
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-300
              dark:hover:bg-slate-800
            "
          >
            <RotateCcw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Reset
          </button>

          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-slate-900
              px-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
              dark:bg-slate-100
              dark:text-slate-900
              dark:hover:bg-white
            "
          >
            <Download
              className="h-4 w-4"
              aria-hidden="true"
            />

            {exporting
              ? "Exporting..."
              : "Export XLSX"}
          </button>
        </div>
      </div>
    </div>
  );
}