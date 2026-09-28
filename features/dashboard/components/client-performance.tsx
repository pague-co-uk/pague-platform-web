"use client";

import type {
  DashboardClientSummary,
} from "../types/dashboard";

// ============================================================================
// Client performance
// ============================================================================

export function ClientPerformance({
  data,
}: {
  data: readonly DashboardClientSummary[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100">
        {data.map(
          (client) => (
            <div
              key={
                client.clientId
              }
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">
                  {
                    client.name
                  }
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {
                    client.publicId
                  }
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-6 text-right">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatNumber(
                      client.messages,
                    )}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    messages
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {
                      client.deliveryRate.toFixed(
                        1,
                      )
                    }
                    %
                  </p>

                  <p className="text-[11px] text-slate-400">
                    delivery
                  </p>
                </div>
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