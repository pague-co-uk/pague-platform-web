"use client";

import type {
  DashboardRoutePerformance,
} from "../types/dashboard";

// ============================================================================
// Route performance
// ============================================================================

export function RoutePerformance({
  data,
}: {
  data: readonly DashboardRoutePerformance[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100">
        {data.map(
          (route) => (
            <div
              key={`${route.routeId}:${route.connectorId}`}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">
                  Route{" "}
                  {route.routeId}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  Connector{" "}
                  {
                    route.connectorId
                  }
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-6 text-right">
                <RouteMetric
                  value={formatNumber(
                    route.attempts,
                  )}
                  label="attempts"
                />

                <RouteMetric
                  value={formatNumber(
                    route.submitted,
                  )}
                  label="submitted"
                />

                <RouteMetric
                  value={`${route.submissionRate.toFixed(1)}%`}
                  label="rate"
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
// Metric
// ============================================================================

function RouteMetric({
  value,
  label,
}: {
  value: string;

  label: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700">
        {value}
      </p>

      <p className="text-[11px] text-slate-400">
        {label}
      </p>
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