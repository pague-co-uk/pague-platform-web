"use client";

import type {
  DashboardActivityItem,
} from "../types/dashboard";

// ============================================================================
// Recent activity
// ============================================================================

export function RecentActivity({
  data,
}: {
  data: readonly DashboardActivityItem[];
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            No recent activity
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Platform activity will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100">
        {data.map(
          (activity) => (
            <div
              key={
                activity.id
              }
              className="flex items-center gap-4 px-5 py-4"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700">
                  {formatAction(
                    activity.action,
                  )}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {
                    activity.entityType
                  }

                  {" · "}

                  {
                    activity.entityId
                  }

                  {activity.userName
                    ? ` · ${activity.userName}`
                    : ""}
                </p>
              </div>

              <time
                dateTime={
                  activity.createdAt
                }
                className="shrink-0 text-xs text-slate-400"
              >
                {formatDateTime(
                  activity.createdAt,
                )}
              </time>
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

function formatAction(
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

function formatDateTime(
  value: string,
): string {
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
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}