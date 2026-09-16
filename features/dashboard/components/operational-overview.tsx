"use client";

import type {
  DashboardData,
} from "../types/dashboard";

// ============================================================================
// Operational overview
// ============================================================================

export function OperationalOverview({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const {
    operational,
  } = dashboard;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <OperationalCard
        label="Clients"
        active={
          operational.clients.active
        }
        secondary={`${operational.clients.suspended} suspended`}
      />

      <OperationalCard
        label="SMPP accounts"
        active={
          operational.smppAccounts.active
        }
        secondary={`${operational.smppAccounts.suspended} suspended`}
      />

      <OperationalCard
        label="Sender IDs"
        active={
          operational.senderIds.approved
        }
        secondary={`${operational.senderIds.pending} pending`}
      />

      <OperationalCard
        label="Webhooks"
        active={
          operational.webhooks.active
        }
        secondary={`${operational.webhooks.disabled} disabled`}
      />
    </div>
  );
}

// ============================================================================
// Operational card
// ============================================================================

function OperationalCard({
  label,
  active,
  secondary,
}: {
  label: string;

  active: number;

  secondary: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">
          {label}
        </p>

        <span className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>

      <p className="mt-3 text-2xl font-semibold text-slate-950">
        {formatNumber(
          active,
        )}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {secondary}
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