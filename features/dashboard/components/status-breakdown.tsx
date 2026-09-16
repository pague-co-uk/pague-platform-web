"use client";

import type {
  DashboardStatusBreakdown,
} from "../types/dashboard";

// ============================================================================
// Status breakdown
// ============================================================================

export function StatusBreakdown({
  data,
}: {
  data: readonly DashboardStatusBreakdown[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-400">
          No message status data available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="space-y-4">
        {data.map(
          (item) => (
            <div
              key={
                item.status
              }
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {formatStatus(
                    item.status,
                  )}
                </span>

                <span className="text-xs text-slate-400">
                  {formatNumber(
                    item.count,
                  )}
                  {" · "}
                  {item.percentage.toFixed(
                    1,
                  )}
                  %
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        item.percentage,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Formatting
// ============================================================================

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-GB",
  ).format(value);
}

function formatStatus(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}