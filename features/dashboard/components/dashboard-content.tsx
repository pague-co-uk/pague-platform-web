"use client";

import type {
  DashboardData,
} from "../types/dashboard";
import { ClientPerformance } from "./client-performance";
import { FloatOverview } from "./float-overview";
import { MessageTrendChart } from "./message-trend-chart";
import { OperationalOverview } from "./operational-overview";
import { RecentActivity } from "./recent-activity";
import { RoutePerformance } from "./route-performance";
import { StatusBreakdown } from "./status-breakdown";

// ============================================================================
// Dashboard content
// ============================================================================

export function DashboardContent({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  return (
    <div className="space-y-6">
      {/* ====================================================================
          Messaging overview
      ==================================================================== */}

      <section
        aria-labelledby="messaging-overview"
      >
        <SectionHeading
          id="messaging-overview"
          title="Messaging overview"
          description="Messaging activity for the selected period."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Messages"
            value={formatNumber(
              dashboard.messages.total,
            )}
            description="Total messages"
          />

          <MetricCard
            label="Delivered"
            value={formatNumber(
              dashboard.messages.delivered,
            )}
            description="Successfully delivered"
          />

          <MetricCard
            label="Failed"
            value={formatNumber(
              dashboard.messages.failed,
            )}
            description="Failed messages"
          />

          <MetricCard
            label="Delivery rate"
            value={`${dashboard.messages.deliveryRate.toFixed(1)}%`}
            description="Successful delivery rate"
          />
        </div>
      </section>

      {/* ====================================================================
          Message activity
      ==================================================================== */}

      <section
        aria-labelledby="message-activity"
      >
        <SectionHeading
          id="message-activity"
          title="Message activity"
          description="Message volume and delivery activity over time."
        />

        <MessageTrendChart
          data={
            dashboard.messageTrend
          }
        />
      </section>

      {/* ====================================================================
          Status + Float
      ==================================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section
          aria-labelledby="message-status"
        >
          <SectionHeading
            id="message-status"
            title="Message status"
            description="Distribution of message statuses."
          />

          <StatusBreakdown
            data={
              dashboard.statusBreakdown
            }
          />
        </section>

        <section
          aria-labelledby="float-overview"
        >
          <SectionHeading
            id="float-overview"
            title="Float overview"
            description="Current balance and ledger activity."
          />

          <FloatOverview
            dashboard={
              dashboard
            }
          />
        </section>
      </div>

      {/* ====================================================================
          Operational status
      ==================================================================== */}

      <section
        aria-labelledby="operational-status"
      >
        <SectionHeading
          id="operational-status"
          title="Operational status"
          description="Current platform resource status."
        />

        <OperationalOverview
          dashboard={
            dashboard
          }
        />
      </section>

      {/* ====================================================================
          Route performance
      ==================================================================== */}

      {dashboard.routePerformance.length >
        0 && (
          <section
            aria-labelledby="route-performance"
          >
            <SectionHeading
              id="route-performance"
              title="Route performance"
              description="Message submission performance by route."
            />

            <RoutePerformance
              data={
                dashboard.routePerformance
              }
            />
          </section>
        )}

      {/* ====================================================================
          Client activity
      ==================================================================== */}

      {dashboard.clients.length >
        0 && (
          <section
            aria-labelledby="client-activity"
          >
            <SectionHeading
              id="client-activity"
              title="Client activity"
              description="Messaging activity across your clients."
            />

            <ClientPerformance
              data={
                dashboard.clients
              }
            />
          </section>
        )}

      {/* ====================================================================
          Recent activity
      ==================================================================== */}

      <section
        aria-labelledby="recent-activity"
      >
        <SectionHeading
          id="recent-activity"
          title="Recent activity"
          description="Recent platform activity."
        />

        <RecentActivity
          data={
            dashboard.recentActivity
          }
        />
      </section>
    </div>
  );
}

// ============================================================================
// Section heading
// ============================================================================

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;

  title: string;

  description: string;
}) {
  return (
    <div className="mb-3">
      <h2
        id={id}
        className="text-sm font-semibold text-slate-900"
      >
        {title}
      </h2>

      <p className="mt-0.5 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ============================================================================
// Metric card
// ============================================================================

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;

  value: string | number;

  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
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