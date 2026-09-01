import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardAlert, DashboardData } from "@/lib/dashboard/get-dashboard-data";

// ============================================================================
// Dashboard
// ============================================================================

export default async function DashboardPage() {
  /*
   * This is deliberately a Server Component.
   *
   * Authentication, authorization, tenant scope, and dashboard data
   * retrieval will happen on the server.
   *
   * The client-facing components will receive only the resulting
   * DashboardData.
   *
   * TODO:
   * Replace this placeholder with the Control Plane API request.
   */

  const dashboard: DashboardData = {
    messaging: {
      sent: 0,

      delivered: 0,

      failed: 0,

      deliveryRate: 0,
    },

    float: {
      balance: "0.00",

      currency: "GBP",
    },

    activity: [],

    alerts: [],

    operational: {
      messaging: "operational",

      routing: "operational",

      webhooks: "operational",
    },
  };

  return (
    <PageContainer>
      {/* ==================================================================
          Page header
      ================================================================== */}

      <PageHeader
        title="Dashboard"
        description="Overview of your messaging and payment platform."
      />

      {/* ==================================================================
          Messaging overview
      ================================================================== */}

      <section
        aria-labelledby="dashboard-overview"
      >
        <h2
          id="dashboard-overview"
          className="sr-only"
        >
          Platform overview
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Messages sent"
            value={dashboard.messaging.sent}
            description="Messages submitted"
          />

          <MetricCard
            label="Messages delivered"
            value={dashboard.messaging.delivered}
            description="Successfully delivered"
          />

          <MetricCard
            label="Messages failed"
            value={dashboard.messaging.failed}
            description="Failed submissions"
          />

          <MetricCard
            label="Delivery rate"
            value={`${dashboard.messaging.deliveryRate.toFixed(1)}%`}
            description="Successful delivery rate"
          />
        </div>
      </section>

      {/* ==================================================================
          Float
      ================================================================== */}

      <section
        aria-labelledby="dashboard-financial"
        className="mt-6"
      >
        <h2
          id="dashboard-financial"
          className="mb-3 text-sm font-semibold text-slate-900"
        >
          Financial overview
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard
            label="Available float"
            value={formatCurrency(
              dashboard.float.balance,
              dashboard.float.currency,
            )}
            description="Current available balance"
          />
        </div>
      </section>

      {/* ==================================================================
          Operational status
      ================================================================== */}

      <section
        aria-labelledby="dashboard-operational"
        className="mt-6"
      >
        <div className="mb-3">
          <h2
            id="dashboard-operational"
            className="text-sm font-semibold text-slate-900"
          >
            Operational status
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Current status of platform services.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <OperationalCard
            label="Messaging"
            status={
              dashboard.operational.messaging
            }
          />

          <OperationalCard
            label="Routing"
            status={
              dashboard.operational.routing
            }
          />

          <OperationalCard
            label="Webhooks"
            status={
              dashboard.operational.webhooks
            }
          />
        </div>
      </section>

      {/* ==================================================================
          Operational alerts
      ================================================================== */}

      {dashboard.alerts.length > 0 && (
        <section
          aria-labelledby="dashboard-alerts"
          className="mt-6"
        >
          <div className="mb-3">
            <h2
              id="dashboard-alerts"
              className="text-sm font-semibold text-slate-900"
            >
              Attention required
            </h2>
          </div>

          <div className="space-y-2">
            {dashboard.alerts.map(
              (alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                />
              ),
            )}
          </div>
        </section>
      )}

      {/* ==================================================================
          Message activity
      ================================================================== */}

      <section
        aria-labelledby="dashboard-activity"
        className="mt-6"
      >
        <div className="mb-3">
          <h2
            id="dashboard-activity"
            className="text-sm font-semibold text-slate-900"
          >
            Message activity
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Recent messaging activity across the platform.
          </p>
        </div>

        {dashboard.activity.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                No activity yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Messaging activity will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white">
            {/* Activity chart will be implemented here. */}
          </div>
        )}
      </section>
    </PageContainer>
  );
}

// ============================================================================
// Metric card
// ============================================================================

interface MetricCardProps {
  label: string;

  value: string | number;

  description: string;
}

function MetricCard({
  label,
  value,
  description,
}: MetricCardProps) {
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
// Operational card
// ============================================================================

interface OperationalCardProps {
  label: string;

  status:
  | "operational"
  | "degraded"
  | "outage";
}

function OperationalCard({
  label,
  status,
}: OperationalCardProps) {
  const statusLabel =
    status === "operational"
      ? "Operational"
      : status === "degraded"
        ? "Degraded"
        : "Outage";

  const statusClass =
    status === "operational"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "degraded"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-red-50 text-red-700 ring-red-200";

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <span
        className={[
          "inline-flex items-center rounded-full px-2.5 py-1",
          "text-[10px] font-semibold uppercase tracking-[0.08em]",
          "ring-1 ring-inset",
          statusClass,
        ].join(" ")}
      >
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
        {statusLabel}
      </span>
    </div>
  );
}

// ============================================================================
// Alert card
// ============================================================================

interface AlertCardProps {
  alert: DashboardAlert;
}

function AlertCard({
  alert,
}: AlertCardProps) {
  const severityClass =
    alert.severity === "critical"
      ? "border-red-200 bg-red-50 text-red-900"
      : alert.severity === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-blue-200 bg-blue-50 text-blue-900";

  return (
    <div
      className={[
        "rounded-xl border px-4 py-3",
        severityClass,
      ].join(" ")}
    >
      <p className="text-sm font-medium">
        {alert.title}
      </p>

      <p className="mt-0.5 text-sm opacity-80">
        {alert.description}
      </p>
    </div>
  );
}

// ============================================================================
// Currency formatting
// ============================================================================

function formatCurrency(
  value: string,
  currency: string,
): string {
  const amount =
    Number.parseFloat(value);

  if (!Number.isFinite(amount)) {
    return value;
  }

  return new Intl.NumberFormat(
    "en-GB",
    {
      style: "currency",
      currency,
    },
  ).format(amount);
}