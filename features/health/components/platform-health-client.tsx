"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  findPlatformHealth,
} from "../api/health-api";

import type {
  HealthCheck,
  HealthResponse,
} from "../api/health-api";

// ============================================================================
// Types
// ============================================================================

interface PlatformHealthClientProps {
  readonly initialHealth: HealthResponse;
}

// ============================================================================
// Application metadata
// ============================================================================

const APPLICATIONS = [
  {
    key: "api",
    name: "API",
    description:
      "Control-plane API",
  },

  {
    key: "http-client",
    name: "HTTP Client",
    description:
      "HTTP messaging worker",
  },

  {
    key: "outbox-publisher",
    name: "Outbox Publisher",
    description:
      "Publishes pending outbox events",
  },

  {
    key: "pague-platform-web",
    name: "Platform Web",
    description:
      "Pague administration portal",
  },

  {
    key: "routing-service",
    name: "Routing Service",
    description:
      "Message routing and rules",
  },

  {
    key: "smpp-client",
    name: "SMPP Client",
    description:
      "Outbound SMPP connectivity",
  },

  {
    key: "smpp-server",
    name: "SMPP Server",
    description:
      "Client-facing SMPP server",
  },

  {
    key: "webhook-consumer",
    name: "Webhook Consumer",
    description:
      "Delivers client delivery receipts to webhook endpoints",
  },
] as const;

// ============================================================================
// Component
// ============================================================================

export default function PlatformHealthClient({
  initialHealth,
}: PlatformHealthClientProps) {
  const [
    health,
    setHealth,
  ] = useState<HealthResponse>(
    initialHealth,
  );

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(
    initialHealth.timestamp,
  );

  // ========================================================================
  // Refresh
  // ========================================================================

  const refresh =
    useCallback(
      async () => {
        setRefreshing(true);

        try {
          const nextHealth =
            await findPlatformHealth();

          setHealth(nextHealth);

          setLastUpdated(
            nextHealth.timestamp,
          );
        } catch {
          // Keep the last known health
          // state visible when polling fails.
        } finally {
          setRefreshing(false);
        }
      },
      [],
    );

  // ========================================================================
  // Polling
  // ========================================================================

  useEffect(() => {
    const interval =
      window.setInterval(
        refresh,
        30_000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, [
    refresh,
  ]);

  // ========================================================================
  // Derived state
  // ========================================================================

  const applicationChecks =
    health.checks
      .applications
      ?.details ?? {};

  const infrastructureChecks =
    useMemo(
      () => [
        {
          key: "database",
          name: "Database",
          description:
            "MySQL database connectivity",
          check:
            health.checks.database,
        },

        {
          key: "rabbitmq",
          name: "RabbitMQ",
          description:
            "Message broker connectivity",
          check:
            health.checks.rabbitmq,
        },
      ],
      [
        health.checks.database,
        health.checks.rabbitmq,
      ],
    );

  const healthyApplications =
    APPLICATIONS.filter(
      (application) =>
        applicationChecks[
          application.key
        ]?.status === "up",
    ).length;

  const totalApplications =
    APPLICATIONS.length;

  const overallHealthy =
    health.status ===
    "healthy";

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Platform Health"
        description="Monitor the availability of Pague platform services and infrastructure."
      >
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </PageHeader>

      {/* ====================================================================
          Overall status
      ===================================================================== */}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <HealthStatusIcon
              status={
                overallHealthy
                  ? "up"
                  : "down"
              }
            />

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Platform is{" "}
                {overallHealthy
                  ? "healthy"
                  : "degraded"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {healthyApplications} of{" "}
                {totalApplications}{" "}
                applications are
                responding normally.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <HealthBadge
              status={
                overallHealthy
                  ? "up"
                  : "down"
              }
            />

            <span className="text-xs text-slate-400">
              Updated{" "}
              {formatRelativeTime(
                lastUpdated,
              )}
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          Infrastructure
      ===================================================================== */}

      <section className="mt-6">
        <SectionHeading
          title="Infrastructure"
          description="Core dependencies required by the platform."
        />

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {infrastructureChecks.map(
            (item) => (
              <HealthCard
                key={item.key}
                name={item.name}
                description={
                  item.description
                }
                check={item.check}
              />
            ),
          )}
        </div>
      </section>

      {/* ====================================================================
          Applications
      ===================================================================== */}

      <section className="mt-8">
        <SectionHeading
          title="Applications"
          description="Availability of the independently running Pague services."
        />

        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="divide-y divide-slate-100">
            {APPLICATIONS.map(
              (application) => {
                const check =
                  applicationChecks[
                  application.key
                  ];

                return (
                  <ApplicationHealthRow
                    key={
                      application.key
                    }
                    name={
                      application.name
                    }
                    description={
                      application.description
                    }
                    check={check}
                  />
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          Service information
      ===================================================================== */}

      <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
          <span>
            Service:{" "}
            <strong className="font-medium text-slate-700">
              {health.service}
            </strong>
          </span>

          <span>
            Version:{" "}
            <strong className="font-medium text-slate-700">
              {health.version}
            </strong>
          </span>

          <span>
            Environment:{" "}
            <strong className="font-medium text-slate-700">
              {health.environment}
            </strong>
          </span>

          <span>
            Uptime:{" "}
            <strong className="font-medium text-slate-700">
              {formatUptime(
                health.uptime,
              )}
            </strong>
          </span>
        </div>
      </section>
    </PageContainer>
  );
}

// ============================================================================
// Health card
// ============================================================================

function HealthCard({
  name,
  description,
  check,
}: {
  readonly name: string;
  readonly description: string;
  readonly check:
  | HealthCheck
  | undefined;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-medium text-slate-900">
            {name}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <HealthBadge
          status={
            check?.status ??
            "down"
          }
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-400">
          Latency
        </span>

        <span className="font-mono text-slate-600">
          {check
            ? `${check.latency} ms`
            : "—"}
        </span>
      </div>

      {check?.error && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {check.error}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Application row
// ============================================================================

function ApplicationHealthRow({
  name,
  description,
  check,
}: {
  readonly name: string;
  readonly description: string;
  readonly check:
  | HealthCheck
  | undefined;
}) {
  const isUp =
    check?.status ===
    "up";

  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <HealthStatusIcon
          status={
            check?.status ??
            "down"
          }
          small
        />

        <div className="min-w-0">
          <div className="font-medium text-slate-900">
            {name}
          </div>

          <div className="mt-0.5 text-xs text-slate-500">
            {description}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 sm:justify-end">
        <div className="text-right">
          <div className="text-xs text-slate-400">
            Latency
          </div>

          <div className="mt-0.5 font-mono text-xs text-slate-600">
            {check
              ? `${check.latency} ms`
              : "—"}
          </div>
        </div>

        <HealthBadge
          status={
            isUp
              ? "up"
              : "down"
          }
        />
      </div>
    </div>
  );
}

// ============================================================================
// Status badge
// ============================================================================

function HealthBadge({
  status,
}: {
  readonly status:
  | "up"
  | "down";
}) {
  if (status === "up") {
    return (
      <StatusBadge
        tone="success"
        dot
      >
        Healthy
      </StatusBadge>
    );
  }

  return (
    <StatusBadge
      tone="danger"
      dot
    >
      Down
    </StatusBadge>
  );
}

// ============================================================================
// Status icon
// ============================================================================

function HealthStatusIcon({
  status,
  small = false,
}: {
  readonly status:
  | "up"
  | "down";

  readonly small?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full ${small
        ? "h-8 w-8"
        : "h-11 w-11"
        } ${status === "up"
          ? "bg-emerald-50"
          : "bg-red-50"
        }`}
    >
      <span
        className={`rounded-full ${small
          ? "h-2.5 w-2.5"
          : "h-3 w-3"
          } ${status === "up"
            ? "bg-emerald-500"
            : "bg-red-500"
          }`}
      />
    </span>
  );
}

// ============================================================================
// Section heading
// ============================================================================

function SectionHeading({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ============================================================================
// Formatting
// ============================================================================

function formatUptime(
  seconds: number,
): string {
  const days =
    Math.floor(
      seconds / 86400,
    );

  const hours =
    Math.floor(
      (seconds % 86400) /
      3600,
    );

  const minutes =
    Math.floor(
      (seconds % 3600) /
      60,
    );

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatRelativeTime(
  value: string,
): string {
  const timestamp =
    new Date(value).getTime();

  const difference =
    Date.now() -
    timestamp;

  if (
    difference < 5_000
  ) {
    return "just now";
  }

  if (
    difference < 60_000
  ) {
    return `${Math.floor(
      difference / 1000,
    )}s ago`;
  }

  if (
    difference <
    3_600_000
  ) {
    return `${Math.floor(
      difference / 60_000,
    )}m ago`;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}