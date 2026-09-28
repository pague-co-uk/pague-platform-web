"use client";

import type {
  DashboardTrendPoint,
} from "../types/dashboard";

// ============================================================================
// Message trend chart
// ============================================================================

export function MessageTrendChart({
  data,
}: {
  data: readonly DashboardTrendPoint[];
}) {
  if (data.length === 0) {
    return (
      <EmptyChart
        message="No message activity for this period."
      />
    );
  }

  const max =
    Math.max(
      1,
      ...data.map(
        (point) =>
          point.sent,
      ),
    );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex h-64 items-end gap-1">
        {data.map(
          (point) => {
            const height =
              Math.max(
                2,
                (point.sent /
                  max) *
                100,
              );

            return (
              <div
                key={
                  point.date
                }
                className="group flex h-full min-w-0 flex-1 items-end"
              >
                <div
                  className="w-full rounded-t-sm bg-blue-500 transition hover:bg-blue-600"
                  style={{
                    height: `${height}%`,
                  }}
                  title={`${formatDate(point.date)}: ${formatNumber(point.sent)} sent`}
                />
              </div>
            );
          },
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">
          {formatDate(
            data[0]?.date,
          )}
        </span>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <Legend label="Sent" />

          <Legend label="Delivered" />

          <Legend label="Failed" />
        </div>

        <span className="text-xs text-slate-400">
          {formatDate(
            data[
              data.length - 1
            ]?.date,
          )}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Legend
// ============================================================================

function Legend({
  label,
}: {
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full bg-slate-300" />

      {label}
    </span>
  );
}

// ============================================================================
// Empty
// ============================================================================

function EmptyChart({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
      <p className="text-sm text-slate-400">
        {message}
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

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
    },
  ).format(date);
}