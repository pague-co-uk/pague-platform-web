"use client";

import type {
  DashboardData,
} from "../types/dashboard";

// ============================================================================
// Float overview
// ============================================================================

export function FloatOverview({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const {
    float,
  } = dashboard;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Available float
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              float.balance,
              float.currency,
            )}
          </p>
        </div>

        <span className="text-xs text-slate-400">
          {float.currency}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FloatStat
          label="Top ups"
          value={
            float.topUps
          }
        />

        <FloatStat
          label="Debits"
          value={
            float.debits
          }
        />

        <FloatStat
          label="Refunds"
          value={
            float.refunds
          }
        />

        <FloatStat
          label="Adjustments"
          value={
            float.adjustments
          }
        />
      </div>
    </div>
  );
}

// ============================================================================
// Float stat
// ============================================================================

function FloatStat({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[11px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {formatNumber(
          value,
        )}
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

function formatCurrency(
  value: number,
  currency: string,
): string {
  return new Intl.NumberFormat(
    "en-GB",
    {
      style: "currency",
      currency,
    },
  ).format(value);
}