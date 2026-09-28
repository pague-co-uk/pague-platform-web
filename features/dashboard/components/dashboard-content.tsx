"use client";

import Link from "next/link";
import {
  useState,
  type ReactNode,
} from "react";

import type {
  DashboardActivityItem,
  DashboardData,
  DashboardHourlyVolume,
  DashboardMessageStatus,
  DashboardStatusBreakdown,
  DashboardStatusCodeBreakdown,
  DashboardTrendPoint,
} from "../types/dashboard";

// ============================================================================
// Theme
// ============================================================================

type Tone =
  | "violet"
  | "green"
  | "blue"
  | "orange"
  | "red";

const TONES: Record<
  Tone,
  {
    tile: string;
    stroke: string;
  }
> = {
  violet: {
    tile: "bg-violet-100 text-violet-600",
    stroke: "#8b5cf6",
  },
  green: {
    tile: "bg-emerald-100 text-emerald-600",
    stroke: "#22c55e",
  },
  blue: {
    tile: "bg-blue-100 text-blue-600",
    stroke: "#3b82f6",
  },
  orange: {
    tile: "bg-orange-100 text-orange-500",
    stroke: "#f97316",
  },
  red: {
    tile: "bg-red-100 text-red-500",
    stroke: "#ef4444",
  },
};

const STATUS_COLORS: Record<
  DashboardMessageStatus,
  string
> = {
  QUEUED: "#94a3b8",
  ROUTED: "#64748b",
  SUBMITTED: "#3b82f6",
  DELIVERED: "#2563eb",
  FAILED: "#ef4444",
  EXPIRED: "#f59e0b",
};

const CARD =
  "rounded-2xl border border-slate-200/70 bg-white shadow-sm";

// ============================================================================
// Dashboard content
// ============================================================================

export function DashboardContent({
  dashboard,
}: {
  dashboard: DashboardData;
}) {
  const isPlatform =
    dashboard.viewer.scope ===
    "PLATFORM";

  const clientId =
    dashboard.viewer.clientId;

  const trend =
    dashboard.messageTrend;

  const periodLabel =
    dashboard.period.days === 7
      ? "Last 7 days"
      : dashboard.period.days === 90
        ? "Last 90 days"
        : "Last 30 days";

  const messagesHref =
    getMessagesHref(dashboard);

  const floatHref =
    getFloatHref(dashboard);

  return (
    <div className="space-y-5 pb-8">
      {/* ====================================================================
          Header
      ==================================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Icon
              type="messages"
              className="h-5 w-5"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Messaging Insights
            </h1>

            <p className="text-sm text-slate-500">
              Monitor and analyse SMS traffic,
              delivery performance and system
              health.
              <span className="ml-1 text-slate-400">
                {isPlatform
                  ? "Platform"
                  : (dashboard.viewer
                    .clientName ??
                    "Client")}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <Icon
            type="calendar"
            className="h-4 w-4 text-slate-500"
          />

          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-800">
              {periodLabel}
            </p>

            <p className="text-[11px] text-slate-400">
              {formatDateRange(
                dashboard.period.start,
                dashboard.period.end,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          KPI cards
      ==================================================================== */}

      <section
        aria-label="Dashboard metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        {messagesHref ? (
          <Link
            href={messagesHref}
            className="block h-full rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            <KpiCard
              label="Total messages"
              value={formatCompactNumber(
                dashboard.kpis.totalMessages,
              )}
              description="Messages processed"
              icon="messages"
              tone="violet"
              spark={trend.map(
                (t) => t.sent,
              )}
              clickable
            />
          </Link>
        ) : (
          <KpiCard
            label="Total messages"
            value={formatCompactNumber(
              dashboard.kpis.totalMessages,
            )}
            description="Messages processed"
            icon="messages"
            tone="violet"
            spark={trend.map(
              (t) => t.sent,
            )}
          />
        )}

        <KpiCard
          label="Delivery success rate"
          value={`${dashboard.kpis.deliveryRate.toFixed(1)}%`}
          description="Successful delivery rate"
          icon="delivered"
          tone="green"
          spark={trend.map((t) =>
            t.sent > 0
              ? (t.delivered / t.sent) *
              100
              : 0,
          )}
        />

        <KpiCard
          label="Delivered"
          value={formatCompactNumber(
            dashboard.kpis.delivered,
          )}
          description="Successfully delivered"
          icon="send"
          tone="blue"
          spark={trend.map(
            (t) => t.delivered,
          )}
        />

        {isPlatform || !floatHref ? (
          <KpiCard
            label={
              dashboard.kpis.fifthMetric
                .label
            }
            value={
              dashboard.kpis.fifthMetric
                .formattedValue
            }
            description={
              isPlatform
                ? "Currently active"
                : "Current available balance"
            }
            icon={
              isPlatform
                ? "clients"
                : "float"
            }
            tone="orange"
          />
        ) : (
          <Link
            href={floatHref}
            className="block h-full rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <KpiCard
              label={
                dashboard.kpis.fifthMetric.label
              }
              value={
                dashboard.kpis.fifthMetric
                  .formattedValue
              }
              description={
                isPlatform
                  ? "Currently active"
                  : "Current available balance"
              }
              icon={
                isPlatform
                  ? "clients"
                  : "float"
              }
              tone="orange"
              clickable
            />
          </Link>
        )}

        <KpiCard
          label="Failed messages"
          value={formatCompactNumber(
            dashboard.kpis.failed,
          )}
          description="Delivery failures"
          icon="failed"
          tone="red"
          spark={trend.map(
            (t) => t.failed,
          )}
        />
      </section>

      {/* ====================================================================
          Delivery status + breakdown / status codes
      ==================================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)]">
        <div className="space-y-5">
          <section className={CARD}>
            <SectionHeader
              icon="rate"
              title="Message delivery status"
              description="Message volume and delivery outcomes over the selected period."
            />

            <div className="px-5 pb-5">
              <TrendChart
                data={trend}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
            <section className={CARD}>
              <SectionHeader
                icon="rate"
                title="Messages by date"
              />

              <div className="px-5 pb-5">
                <StackedAreaChart
                  data={trend}
                />
              </div>
            </section>

            <section className={CARD}>
              <SectionHeader
                icon="clock"
                title="Messages by hour"
              />

              <div className="overflow-x-auto px-5 pb-5">
                <HourlyHeatmap
                  data={
                    dashboard.hourlyVolume
                  }
                />
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-5">
          <section className={CARD}>
            <SectionHeader
              icon="clients"
              title="Delivery status breakdown"
            />

            <div className="flex flex-col items-center gap-5 p-5 sm:flex-row xl:flex-col 2xl:flex-row">
              <StatusDonut
                data={
                  dashboard.statusBreakdown
                }
                total={
                  dashboard.messages.total
                }
              />

              <div className="w-full flex-1 space-y-3">
                {dashboard.statusBreakdown.map(
                  (item) => (
                    <StatusLegendRow
                      key={item.status}
                      item={item}
                    />
                  ),
                )}
              </div>
            </div>
          </section>

          <section className={CARD}>
            <SectionHeader
              icon="failed"
              title="Messages by status code"
            />

            <div className="p-5">
              {dashboard.statusCodeBreakdown
                .length === 0 ? (
                <EmptyState
                  title="No error codes"
                  description="No provider error codes were recorded for this period."
                />
              ) : (
                <div className="space-y-4">
                  {dashboard.statusCodeBreakdown
                    .slice(0, 8)
                    .map((item) => (
                      <StatusCodeRow
                        key={item.code}
                        item={item}
                      />
                    ))}
                </div>
              )}
            </div>
          </section>

          <section className={CARD}>
            <SectionHeader
              icon="send"
              title="Top routes by volume"
            />

            <div className="overflow-x-auto">
              {dashboard.routePerformance
                .length === 0 ? (
                <EmptyState
                  title="No route activity"
                  description="There is no route activity for the selected period."
                />
              ) : (
                <RoutesTable
                  routes={
                    dashboard.routePerformance
                  }
                />
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ====================================================================
          Operational overview
      ==================================================================== */}

      <section className={CARD}>
        <SectionHeader
          icon="clients"
          title="Operational overview"
          description={
            isPlatform
              ? "Current platform resource status."
              : "Current resources associated with your account."
          }
        />

        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          <OperationalCard
            title="Clients"
            active={
              dashboard.operational
                .clients.active
            }
            secondary={[
              {
                label: "Suspended",
                value:
                  dashboard.operational
                    .clients
                    .suspended,
              },
              {
                label: "Disabled",
                value:
                  dashboard.operational
                    .clients
                    .disabled,
              },
            ]}
          />

          <OperationalCard
            title="SMPP accounts"
            active={
              dashboard.operational
                .smppAccounts.active
            }
            secondary={[
              {
                label: "Suspended",
                value:
                  dashboard.operational
                    .smppAccounts
                    .suspended,
              },
              {
                label: "Disabled",
                value:
                  dashboard.operational
                    .smppAccounts
                    .disabled,
              },
            ]}
          />

          <OperationalCard
            title="Sender IDs"
            active={
              dashboard.operational
                .senderIds.approved
            }
            secondary={[
              {
                label: "Pending",
                value:
                  dashboard.operational
                    .senderIds.pending,
              },
              {
                label: "Rejected",
                value:
                  dashboard.operational
                    .senderIds.rejected,
              },
              {
                label: "Disabled",
                value:
                  dashboard.operational
                    .senderIds.disabled,
              },
            ]}
          />

          <OperationalCard
            title="Webhooks"
            active={
              dashboard.operational
                .webhooks.active
            }
            secondary={[
              {
                label: "Disabled",
                value:
                  dashboard.operational
                    .webhooks.disabled,
              },
            ]}
          />
        </div>
      </section>

      {/* ====================================================================
          Platform client activity
      ==================================================================== */}

      {isPlatform && (
        <section className={CARD}>
          <SectionHeader
            icon="clients"
            title="Client activity"
            description="Messaging activity across platform clients."
          />

          <div className="overflow-x-auto">
            {dashboard.clients.length ===
              0 ? (
              <EmptyState
                title="No client activity"
                description="There is no client messaging activity for the selected period."
              />
            ) : (
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <Th className="px-5 text-left">
                      Client
                    </Th>

                    <Th>
                      Messages
                    </Th>

                    <Th>
                      Delivered
                    </Th>

                    <Th>
                      Failed
                    </Th>

                    <Th className="px-5">
                      Delivery rate
                    </Th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.clients.map(
                    (client) => (
                      <tr
                        key={
                          client.clientId
                        }
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-xs font-semibold text-violet-700">
                              {getInitials(
                                client.name,
                              )}
                            </div>

                            <div>
                              <p className="font-medium text-slate-900">
                                {client.name}
                              </p>

                              <p className="text-xs text-slate-400">
                                {client.publicId}
                              </p>
                            </div>
                          </div>
                        </td>

                        <Td>
                          {formatNumber(
                            client.messages,
                          )}
                        </Td>

                        <Td>
                          {formatNumber(
                            client.delivered,
                          )}
                        </Td>

                        <Td>
                          {formatNumber(
                            client.failed,
                          )}
                        </Td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={rateBadge(
                                client.deliveryRate,
                              )}
                            >
                              {formatPercent(
                                client.deliveryRate,
                              )}
                            </span>

                            <span
                              className={[
                                "hidden rounded-md px-2 py-0.5 text-[11px] font-medium sm:inline-flex",
                                client.status ===
                                  "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : client.status ===
                                    "SUSPENDED"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-slate-100 text-slate-500",
                              ].join(" ")}
                            >
                              {formatActivityAction(
                                client.status,
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* ====================================================================
          Client float
      ==================================================================== */}

      {!isPlatform && (
        <FloatOverview
          float={dashboard.float}
          trend={dashboard.floatTrend}
          href={floatHref}
        />
      )}

      {/* ====================================================================
          Recent activity
      ==================================================================== */}

      <section className={CARD}>
        <SectionHeader
          icon="list"
          title="Recent activity"
          description="Latest platform activity and administrative events."
        />

        <div className="divide-y divide-slate-100">
          {dashboard.recentActivity
            .length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="There are no recent activity records to display."
            />
          ) : (
            dashboard.recentActivity.map(
              (activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                />
              ),
            )
          )}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Building blocks
// ============================================================================

function SectionHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon: IconType;
}) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4">
      <span className="text-indigo-600">
        <Icon
          type={icon}
          className="h-[18px] w-[18px]"
        />
      </span>

      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-3 text-right text-xs font-medium text-slate-500 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <td className="px-3 py-3.5 text-right text-sm tabular-nums text-slate-700">
      {children}
    </td>
  );
}

// ============================================================================
// KPI card
// ============================================================================

function KpiCard({
  label,
  value,
  description,
  icon,
  tone,
  spark,
  clickable = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: IconType;
  tone: Tone;
  spark?: number[];
  clickable?: boolean;
}) {
  return (
    <div
      className={[
        CARD,
        "p-5",
        clickable
          ? "h-full cursor-pointer transition hover:border-slate-300"
          : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone].tile}`}
        >
          <Icon
            type={icon}
            className="h-5 w-5"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs text-slate-500">
            {label}
          </p>

          <p className="text-2xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          {description}
        </p>

        {clickable && (
          <span className="text-[11px] font-medium text-slate-400">
            View →
          </span>
        )}
      </div>

      {spark &&
        spark.length > 1 && (
          <Sparkline
            values={spark}
            color={
              TONES[tone].stroke
            }
          />
        )}
    </div>
  );
}

// ============================================================================
// Sparkline
// ============================================================================

function Sparkline({
  values,
  color,
}: {
  values: number[];
  color: string;
}) {
  const w = 200;
  const h = 40;

  const min = Math.min(
    ...values,
  );

  const max = Math.max(
    ...values,
  );

  const range = max - min || 1;

  const pts = values.map(
    (v, i) => [
      (i /
        (values.length - 1)) *
      w,
      h -
      4 -
      ((v - min) / range) *
      (h - 8),
    ],
  );

  const line = pts
    .map(
      ([x, y], i) =>
        `${i ? "L" : "M"} ${x} ${y}`,
    )
    .join(" ");

  const id = `spark-${color.replace(
    "#",
    "",
  )}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="mt-3 h-10 w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={id}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity="0.25"
          />

          <stop
            offset="100%"
            stopColor={color}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <path
        d={`${line} L ${w} ${h} L 0 ${h} Z`}
        fill={`url(#${id})`}
      />

      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ============================================================================
// Charts
// ============================================================================

const CHART = {
  width: 900,
  height: 300,
  top: 16,
  right: 16,
  bottom: 34,
  left: 48,
};

function chartScale(
  max: number,
  count: number,
) {
  const cw =
    CHART.width -
    CHART.left -
    CHART.right;

  const ch =
    CHART.height -
    CHART.top -
    CHART.bottom;

  return {
    x: (i: number) =>
      CHART.left +
      (count === 1
        ? cw / 2
        : (i / (count - 1)) *
        cw),

    y: (v: number) =>
      CHART.top +
      ch -
      (v / max) * ch,

    base: CHART.top + ch,
  };
}

// ============================================================================
// Chart hover
// ============================================================================

interface ChartHover {
  readonly index: number;
  readonly x: number;
}

function useChartHover(
  dataLength: number,
  scale: ReturnType<
    typeof chartScale
  >,
) {
  const [hover, setHover] =
    useState<ChartHover | null>(
      null,
    );

  function handleMove(
    event: React.MouseEvent<SVGRectElement>,
  ) {
    if (dataLength === 0) {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    const relativeX =
      event.clientX -
      rect.left;

    const ratio =
      relativeX / rect.width;

    const svgX =
      ratio * CHART.width;

    const plotWidth =
      CHART.width -
      CHART.left -
      CHART.right;

    const clampedX =
      Math.max(
        CHART.left,
        Math.min(
          CHART.width -
          CHART.right,
          svgX,
        ),
      );

    const position =
      (clampedX -
        CHART.left) /
      plotWidth;

    const index = Math.round(
      position *
      Math.max(
        0,
        dataLength - 1,
      ),
    );

    setHover({
      index: Math.max(
        0,
        Math.min(
          dataLength - 1,
          index,
        ),
      ),
      x: scale.x(index),
    });
  }

  function handleLeave() {
    setHover(null);
  }

  return {
    hover,
    handleMove,
    handleLeave,
  };
}

// ============================================================================
// Chart frame
// ============================================================================

function ChartFrame({
  max,
  data,
  children,
  scale,
  hover,
  onHover,
  onLeave,
}: {
  max: number;
  data: readonly DashboardTrendPoint[];
  scale: ReturnType<
    typeof chartScale
  >;
  hover: ChartHover | null;
  onHover: (
    event: React.MouseEvent<SVGRectElement>,
  ) => void;
  onLeave: () => void;
  children: ReactNode;
}) {
  const labels =
    selectDateLabels(data);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Message activity chart"
      >
        {[0, 1, 2, 3, 4].map(
          (i) => {
            const value =
              (max / 4) * i;

            const y =
              scale.y(value);

            return (
              <g key={i}>
                <line
                  x1={CHART.left}
                  x2={
                    CHART.width -
                    CHART.right
                  }
                  y1={y}
                  y2={y}
                  stroke="#e8ecf4"
                  strokeDasharray="3 4"
                />

                <text
                  x={
                    CHART.left - 10
                  }
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94a3b8"
                >
                  {formatCompactNumber(
                    value,
                  )}
                </text>
              </g>
            );
          },
        )}

        {children}

        {hover && (
          <>
            <line
              x1={hover.x}
              x2={hover.x}
              y1={CHART.top}
              y2={
                CHART.height -
                CHART.bottom
              }
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="4 4"
              pointerEvents="none"
            />

            <circle
              cx={hover.x}
              cy={
                CHART.height -
                CHART.bottom
              }
              r="3"
              fill="#475569"
              pointerEvents="none"
            />
          </>
        )}

        {data.map((item, i) =>
          labels.has(i) ? (
            <text
              key={item.date}
              x={scale.x(i)}
              y={
                CHART.height - 10
              }
              textAnchor="middle"
              fontSize="11"
              fill="#94a3b8"
            >
              {formatShortDate(
                item.date,
              )}
            </text>
          ) : null,
        )}

        <rect
          x={CHART.left}
          y={CHART.top}
          width={
            CHART.width -
            CHART.left -
            CHART.right
          }
          height={
            CHART.height -
            CHART.top -
            CHART.bottom
          }
          fill="transparent"
          onMouseMove={onHover}
          onMouseLeave={onLeave}
        />
      </svg>

      {hover && (
        <ChartTooltip
          data={data}
          index={hover.index}
          x={hover.x}
        />
      )}
    </div>
  );
}

// ============================================================================
// Chart tooltip
// ============================================================================

function ChartTooltip({
  data,
  index,
  x,
}: {
  data: readonly DashboardTrendPoint[];
  index: number;
  x: number;
}) {
  const item =
    data[index];

  if (!item) {
    return null;
  }

  const leftPercent =
    (x / CHART.width) * 100;

  const transform =
    leftPercent > 70
      ? "translateX(-100%)"
      : leftPercent < 20
        ? "translateX(0)"
        : "translateX(-50%)";

  return (
    <div
      className="pointer-events-none absolute top-2 z-10 min-w-[170px] rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
      style={{
        left: `${leftPercent}%`,
        transform,
      }}
    >
      <p className="mb-2 text-xs font-semibold text-slate-800">
        {formatShortDate(
          item.date,
        )}
      </p>

      <div className="space-y-1.5">
        <TooltipValue
          label="Messages"
          value={item.sent}
          color="#94a3b8"
        />

        <TooltipValue
          label="Delivered"
          value={item.delivered}
          color="#2563eb"
        />

        <TooltipValue
          label="Expired"
          value={item.expired}
          color="#f97316"
        />

        <TooltipValue
          label="Failed"
          value={item.failed}
          color="#ef4444"
        />
      </div>
    </div>
  );
}

function TooltipValue({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 text-xs">
      <span className="flex items-center gap-2 text-slate-500">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: color,
          }}
        />

        {label}
      </span>

      <span className="font-medium tabular-nums text-slate-800">
        {formatNumber(value)}
      </span>
    </div>
  );
}

// ============================================================================
// Trend chart
// ============================================================================

function TrendChart({
  data,
}: {
  data: readonly DashboardTrendPoint[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No message activity"
        description="There is no message activity for this period."
      />
    );
  }

  const max = Math.max(
    1,
    ...data.map((d) =>
      Math.max(
        d.sent,
        d.delivered,
        d.failed,
        d.expired,
      ),
    ),
  );

  const s = chartScale(
    max,
    data.length,
  );

  const {
    hover,
    handleMove,
    handleLeave,
  } = useChartHover(
    data.length,
    s,
  );

  const path = (
    vals: number[],
  ) =>
    vals
      .map(
        (v, i) =>
          `${i ? "L" : "M"} ${s.x(i)} ${s.y(v)}`,
      )
      .join(" ");

  const sent = path(
    data.map((d) => d.sent),
  );

  const series = [
    {
      label: "Delivered",
      color: "#2563eb",
      d: path(
        data.map(
          (d) => d.delivered,
        ),
      ),
    },
    {
      label: "Expired",
      color: "#f97316",
      d: path(
        data.map(
          (d) => d.expired,
        ),
      ),
    },
    {
      label: "Failed",
      color: "#ef4444",
      d: path(
        data.map(
          (d) => d.failed,
        ),
      ),
    },
  ];

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <ChartLegend
          label="Messages"
          color="#94a3b8"
        />

        {series.map((x) => (
          <ChartLegend
            key={x.label}
            label={x.label}
            color={x.color}
          />
        ))}
      </div>

      <ChartFrame
        max={max}
        data={data}
        scale={s}
        hover={hover}
        onHover={handleMove}
        onLeave={handleLeave}
      >
        <defs>
          <linearGradient
            id="trend-fill"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#3b82f6"
              stopOpacity="0.28"
            />

            <stop
              offset="100%"
              stopColor="#3b82f6"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        <path
          d={`${series[0].d} L ${s.x(
            data.length - 1,
          )} ${s.base} L ${s.x(
            0,
          )} ${s.base} Z`}
          fill="url(#trend-fill)"
        />

        <path
          d={sent}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {series.map((x) => (
          <path
            key={x.label}
            d={x.d}
            fill="none"
            stroke={x.color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ))}

        {hover && (
          <>
            <HoverPoint
              x={s.x(hover.index)}
              y={s.y(
                data[hover.index]
                  .delivered,
              )}
              color="#2563eb"
            />

            <HoverPoint
              x={s.x(hover.index)}
              y={s.y(
                data[hover.index]
                  .expired,
              )}
              color="#f97316"
            />

            <HoverPoint
              x={s.x(hover.index)}
              y={s.y(
                data[hover.index]
                  .failed,
              )}
              color="#ef4444"
            />
          </>
        )}
      </ChartFrame>
    </div>
  );
}

// ============================================================================
// Hover point
// ============================================================================

function HoverPoint({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) {
  return (
    <circle
      cx={x}
      cy={y}
      r="4"
      fill="white"
      stroke={color}
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
      pointerEvents="none"
    />
  );
}

// ============================================================================
// Stacked area chart
// ============================================================================

function StackedAreaChart({
  data,
}: {
  data: readonly DashboardTrendPoint[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No message activity"
        description="Nothing to show for this period."
      />
    );
  }

  const layers = [
    {
      label: "Delivered",
      color: "#6366f1",
      get: (
        d: DashboardTrendPoint,
      ) => d.delivered,
    },
    {
      label: "Expired",
      color: "#fb923c",
      get: (
        d: DashboardTrendPoint,
      ) => d.expired,
    },
    {
      label: "Failed",
      color: "#f87171",
      get: (
        d: DashboardTrendPoint,
      ) => d.failed,
    },
  ];

  const totals = data.map(
    (d) =>
      layers.reduce(
        (sum, l) =>
          sum + l.get(d),
        0,
      ),
  );

  const max = Math.max(
    1,
    ...totals,
  );

  const s = chartScale(
    max,
    data.length,
  );

  const {
    hover,
    handleMove,
    handleLeave,
  } = useChartHover(
    data.length,
    s,
  );

  const cumulative =
    layers.map((_, li) =>
      data.map((d) =>
        layers
          .slice(0, li + 1)
          .reduce(
            (sum, l) =>
              sum + l.get(d),
            0,
          ),
      ),
    );

  return (
    <div>
      <ChartFrame
        max={max}
        data={data}
        scale={s}
        hover={hover}
        onHover={handleMove}
        onLeave={handleLeave}
      >
        {[...layers]
          .reverse()
          .map((layer, ri) => {
            const li =
              layers.length -
              1 -
              ri;

            const top =
              cumulative[li];

            const bottom =
              li === 0
                ? data.map(
                  () => 0,
                )
                : cumulative[
                li - 1
                ];

            const upper = top
              .map(
                (v, i) =>
                  `${i
                    ? "L"
                    : "M"
                  } ${s.x(i)} ${s.y(v)}`,
              )
              .join(" ");

            const lower =
              bottom
                .map(
                  (_, i) => {
                    const reverseIndex =
                      data.length -
                      1 -
                      i;

                    return `L ${s.x(
                      reverseIndex,
                    )} ${s.y(
                      bottom[
                      reverseIndex
                      ],
                    )}`;
                  },
                )
                .join(" ");

            return (
              <path
                key={layer.label}
                d={`${upper} ${lower} Z`}
                fill={
                  layer.color
                }
                fillOpacity="0.55"
              />
            );
          })}

        {hover &&
          layers.map(
            (layer) => (
              <HoverPoint
                key={
                  layer.label
                }
                x={s.x(
                  hover.index,
                )}
                y={s.y(
                  layer.get(
                    data[
                    hover.index
                    ],
                  ),
                )}
                color={
                  layer.color
                }
              />
            ),
          )}
      </ChartFrame>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        {layers.map((l) => (
          <ChartLegend
            key={l.label}
            label={l.label}
            color={l.color}
          />
        ))}
      </div>
    </div>
  );
}

function ChartLegend({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-slate-600">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />

      {label}
    </span>
  );
}

// ============================================================================
// Status donut
// ============================================================================

function StatusDonut({
  data,
  total,
}: {
  data: readonly DashboardStatusBreakdown[];
  total: number;
}) {
  const radius = 48;

  const circumference =
    2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#eef2f7"
          strokeWidth="13"
        />

        {data
          .filter(
            (item) =>
              item.percentage > 0,
          )
          .map((item) => {
            const length =
              (item.percentage /
                100) *
              circumference;

            const offset =
              -accumulated;

            accumulated +=
              length;

            return (
              <circle
                key={item.status}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={
                  STATUS_COLORS[
                  item.status
                  ]
                }
                strokeWidth="13"
                strokeDasharray={`${length} ${circumference -
                  length
                  }`}
                strokeDashoffset={
                  offset
                }
              />
            );
          })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold tracking-tight text-slate-950">
          {formatNumber(total)}
        </span>

        <span className="text-[11px] text-slate-400">
          Total messages
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Status legend row
// ============================================================================

function StatusLegendRow({
  item,
}: {
  item: DashboardStatusBreakdown;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor:
              STATUS_COLORS[
              item.status
              ],
          }}
        />

        <span className="truncate text-sm text-slate-700">
          {formatStatus(
            item.status,
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium tabular-nums text-slate-800">
          {formatNumber(
            item.count,
          )}
        </span>

        <span className="w-12 text-right text-xs tabular-nums text-slate-400">
          {formatPercent(
            item.percentage,
          )}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Hourly heatmap
// ============================================================================

function HourlyHeatmap({
  data,
}: {
  data: readonly DashboardHourlyVolume[];
}) {
  const days = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const hours = [
    0, 4, 8, 12, 16, 20,
  ];

  const max = Math.max(
    1,
    ...data.map(
      (d) => d.count,
    ),
  );

  const values = new Map(
    data.map((d) => [
      `${d.day}:${d.hour}`,
      d.count,
    ]),
  );

  return (
    <div className="min-w-[360px]">
      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns:
            "40px repeat(7, minmax(0, 1fr))",
        }}
      >
        <div />

        {days.map((d) => (
          <div
            key={d}
            className="pb-1 text-center text-[11px] text-slate-400"
          >
            {d}
          </div>
        ))}

        {Array.from(
          {
            length: 24,
          },
          (_, hour) => (
            <div
              key={hour}
              className="contents"
            >
              <div className="flex items-center text-[11px] text-slate-400">
                {hours.includes(
                  hour,
                )
                  ? `${String(
                    hour,
                  ).padStart(
                    2,
                    "0",
                  )}:00`
                  : ""}
              </div>

              {days.map(
                (
                  label,
                  i,
                ) => {
                  const count =
                    values.get(
                      `${i + 1}:${hour}`,
                    ) ?? 0;

                  const intensity =
                    count / max;

                  return (
                    <div
                      key={`${i}:${hour}`}
                      title={`${label}, ${hour}:00 — ${formatNumber(
                        count,
                      )} messages`}
                      className="h-2.5 rounded-[2px]"
                      style={{
                        backgroundColor: `rgba(79, 70, 229, ${count ===
                          0
                          ? 0.07
                          : 0.14 +
                          intensity *
                          0.86
                          })`,
                      }}
                    />
                  );
                },
              )}
            </div>
          ),
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
        <span>
          Low volume
        </span>

        <span
          className="h-2 flex-1 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(79,70,229,0.12), rgba(79,70,229,1))",
          }}
        />

        <span>
          High volume
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Tables & rows
// ============================================================================

function StatusCodeRow({
  item,
}: {
  item: DashboardStatusCodeBreakdown;
}) {
  return (
    <div className="min-w-0">
      <div
        className="
          grid
          min-w-0
          grid-cols-[minmax(72px,92px)_minmax(0,1fr)_auto]
          items-center
          gap-x-3
          gap-y-2
          sm:grid-cols-[minmax(72px,92px)_minmax(120px,1fr)_minmax(90px,1fr)_auto]
        "
      >
        {/* Code */}
        <span
          className="
            min-w-0
            truncate
            font-mono
            text-xs
            text-slate-500
          "
          title={item.code}
        >
          {item.code}
        </span>

        {/* Description */}
        <span
          className="
            min-w-0
            truncate
            text-sm
            text-slate-700
          "
          title={item.label}
        >
          {item.label}
        </span>

        {/* Progress */}
        <div
          className="
            col-span-2
            h-2
            min-w-0
            overflow-hidden
            rounded-full
            bg-slate-100
            sm:col-span-1
          "
        >
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{
              width: `${clampPercent(
                item.percentage,
              )}%`,
            }}
          />
        </div>

        {/* Value */}
        <div className="flex min-w-[78px] items-center justify-end gap-2 tabular-nums">
          <span className="text-sm text-slate-800">
            {formatNumber(
              item.count,
            )}
          </span>

          <span className="w-11 text-right text-xs text-slate-400">
            {formatPercent(
              item.percentage,
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function RoutesTable({
  routes,
}: {
  routes: DashboardData["routePerformance"];
}) {
  const maxAttempts = Math.max(
    1,
    ...routes.map(
      (r) => r.attempts,
    ),
  );

  return (
    <table className="w-full min-w-[420px] text-sm">
      <thead>
        <tr className="border-b border-slate-100">
          <Th className="px-5 text-left">
            Route
          </Th>

          <th className="px-3 py-3" />

          <Th>
            Messages
          </Th>

          <Th className="px-5">
            Success rate
          </Th>
        </tr>
      </thead>

      <tbody>
        {routes.map((route) => (
          <tr
            key={`${route.publicId}:${route.connectorName}`}
            className="border-b border-slate-50 last:border-0"
          >
            <td className="px-5 py-3">
              <p className="font-medium text-slate-900">
                {route.publicId}
              </p>

              <p className="text-xs text-slate-400">
                {route.connectorName}
              </p>
            </td>

            <td className="w-24 px-3 py-3">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width: `${(route.attempts /
                      maxAttempts) *
                      100
                      }%`,
                  }}
                />
              </div>
            </td>

            <Td>
              {formatNumber(
                route.attempts,
              )}
            </Td>

            <td className="px-5 py-3 text-right text-sm font-medium tabular-nums text-emerald-600">
              {formatPercent(
                route.deliveryRate,
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================================
// Operational card
// ============================================================================

function OperationalCard({
  title,
  active,
  secondary,
}: {
  title: string;
  active: number;
  secondary: readonly {
    label: string;
    value: number;
  }[];
}) {
  return (
    <div className="p-5">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">
            {formatNumber(active)}
          </p>

          <p className="mt-0.5 text-xs text-emerald-600">
            Active
          </p>
        </div>

        <div className="space-y-1 text-right">
          {secondary.map(
            (item) => (
              <p
                key={item.label}
                className="text-xs text-slate-400"
              >
                {item.label}{" "}
                <span className="font-medium tabular-nums text-slate-600">
                  {formatNumber(
                    item.value,
                  )}
                </span>
              </p>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Activity row
// ============================================================================

function ActivityRow({
  activity,
}: {
  activity: DashboardActivityItem;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">
              {formatActivityAction(
                activity.action,
              )}
            </span>

            {activity.entityType && (
              <span className="text-slate-500">
                {" "}
                {formatEntityType(
                  activity.entityType,
                )}
              </span>
            )}
          </p>

          <time className="shrink-0 text-xs text-slate-400">
            {formatRelativeDate(
              activity.createdAt,
            )}
          </time>
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
          {activity.userName && (
            <span>
              by{" "}
              {
                activity.userName
              }
            </span>
          )}

          {activity.clientName && (
            <>
              <span>•</span>

              <span>
                {activity.clientName}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Empty state
// ============================================================================

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-sm font-medium text-slate-600">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

type IconType =
  | "messages"
  | "delivered"
  | "failed"
  | "rate"
  | "clients"
  | "float"
  | "send"
  | "clock"
  | "calendar"
  | "list";

function Icon({
  type,
  className,
}: {
  type: IconType;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type ===
        "messages" && (
          <>
            <path d="M4 5.5h16v11H8l-4 3v-14Z" />
            <path d="M8 9h8M8 12h5" />
          </>
        )}

      {type === "delivered" && (
        <path d="m5 12 4 4L19 6" />
      )}

      {type === "failed" && (
        <>
          <path d="M12 4v10M12 18h.01" />
          <path d="M10.3 4.9 3.8 16.2a2 2 0 0 0 1.7 3h13a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0Z" />
        </>
      )}

      {type === "rate" && (
        <path d="M5 19V9M12 19V5M19 19v-7" />
      )}

      {type === "clients" && (
        <>
          <circle
            cx="9"
            cy="8"
            r="3"
          />

          <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 11a3 3 0 1 0 0-6M16 14a5 5 0 0 1 4.5 5" />
        </>
      )}

      {type === "float" && (
        <>
          <rect
            x="3"
            y="6"
            width="18"
            height="13"
            rx="2"
          />

          <path d="M3 10h18M16 15h2" />
        </>
      )}

      {type === "send" && (
        <path d="M21 4 3 11l7 3 3 7 8-17ZM10 14l11-10" />
      )}

      {type === "clock" && (
        <>
          <circle
            cx="12"
            cy="12"
            r="8"
          />

          <path d="M12 8v4l2.5 2.5" />
        </>
      )}

      {type === "calendar" && (
        <>
          <rect
            x="4"
            y="5"
            width="16"
            height="15"
            rx="2"
          />

          <path d="M4 10h16M8 3v4M16 3v4" />
        </>
      )}

      {type === "list" && (
        <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
      )}
    </svg>
  );
}

// ============================================================================
// Formatting helpers
// ============================================================================

const numberFormat =
  new Intl.NumberFormat(
    "en-GB",
  );

const compactFormat =
  new Intl.NumberFormat(
    "en-GB",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    },
  );

function formatNumber(
  value: number,
): string {
  return numberFormat.format(
    value,
  );
}

function formatCompactNumber(
  value: number,
): string {
  return compactFormat
    .format(value)
    .replace("bn", "B");
}

function formatPercent(
  value: number,
): string {
  return `${value.toFixed(1)}%`;
}

function clampPercent(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(100, value),
  );
}

function rateBadge(
  rate: number,
): string {
  const tone =
    rate >= 95
      ? "bg-emerald-50 text-emerald-700"
      : rate >= 80
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-700";

  return `inline-flex rounded-full px-2 py-1 text-xs font-medium ${tone}`;
}

function formatMoney(
  value: number,
  currency: string,
): string {
  const plain =
    new Intl.NumberFormat(
      "en-GB",
      {
        maximumFractionDigits: 2,
      },
    );

  if (!currency) {
    return plain.format(value);
  }

  try {
    return new Intl.NumberFormat(
      "en-GB",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      },
    ).format(value);
  } catch {
    return `${currency} ${plain.format(
      value,
    )}`;
  }
}

function formatDateRange(
  start: string,
  end: string,
): string {
  const s = new Date(start);
  const e = new Date(end);

  if (
    Number.isNaN(
      s.getTime(),
    ) ||
    Number.isNaN(
      e.getTime(),
    )
  ) {
    return "Selected period";
  }

  const f =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );

  return `${f.format(
    s,
  )} – ${f.format(e)}`;
}

function getMessagesHref(
  dashboard: DashboardData,
): string {
  if (
    dashboard.viewer.scope ===
    "PLATFORM"
  ) {
    return "/messages";
  }

  if (!dashboard.viewer.clientId) {
    return "/messages";
  }

  return `/clients/${dashboard.viewer.clientId}/messages`;
}

function getFloatHref(
  dashboard: DashboardData,
): string {
  if (
    dashboard.viewer.scope ===
    "PLATFORM"
  ) {
    return "/float";
  }

  if (!dashboard.viewer.clientId) {
    return "/float";
  }

  return `/clients/${dashboard.viewer.clientId}/float`;
}

function formatShortDate(
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
      day: "numeric",
      month: "short",
    },
  ).format(date);
}

function formatRelativeDate(
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

  const minutes =
    Math.floor(
      (Date.now() -
        date.getTime()) /
      60000,
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24,
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatShortDate(
    value,
  );
}

function formatStatus(
  status: DashboardMessageStatus,
): string {
  return (
    status.charAt(0) +
    status
      .slice(1)
      .toLowerCase()
  );
}

function formatEntityType(
  value: string,
): string {
  return value
    .replace(
      /[_-]+/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (c) =>
        c.toUpperCase(),
    );
}

function formatActivityAction(
  value: string,
): string {
  return value
    .replace(
      /[_-]+/g,
      " ",
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (c) =>
        c.toUpperCase(),
    );
}

function getInitials(
  value: string,
): string {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (
    words.length === 0
  ) {
    return "?";
  }

  if (
    words.length === 1
  ) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]
    }`.toUpperCase();
}

function selectDateLabels(
  data: readonly DashboardTrendPoint[],
): Set<number> {
  const labels =
    new Set<number>();

  if (data.length <= 7) {
    data.forEach(
      (_, i) =>
        labels.add(i),
    );

    return labels;
  }

  const step = Math.max(
    1,
    Math.ceil(
      data.length / 8,
    ),
  );

  for (
    let i = 0;
    i < data.length;
    i += step
  ) {
    labels.add(i);
  }

  return labels;
}



type FloatTrendPoint = {
  date: string;
  topUps: number;
  debits: number;
  refunds: number;
  adjustments: number;
  net: number;
};

// ============================================================================
// Float overview
// ============================================================================

function FloatOverview({
  float,
  trend,
  href,
}: {
  float: DashboardData["float"];
  trend: readonly FloatTrendPoint[];
  href: string;
}) {
  const periodNet = trend.reduce((sum, item) => sum + item.net, 0);

  return (
    <section className={CARD}>
      <SectionHeader
        icon="float"
        title="Float overview"
        description="Current balance and float activity for the selected period."
      />

      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Balance */}
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">
                Available balance
              </p>

              <p className="mt-2 truncate text-3xl font-semibold tracking-tight text-slate-950">
                {formatMoney(float.balance, float.currency)}
              </p>

              {trend.length > 0 && (
                <p
                  className={[
                    "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                    periodNet >= 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600",
                  ].join(" ")}
                >
                  {periodNet >= 0 ? "▲" : "▼"}{" "}
                  {formatSigned(periodNet, float.currency)}
                  <span className="font-normal text-slate-400">this period</span>
                </p>
              )}
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
              <Icon type="float" className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <FloatMetric label="Top ups" value={float.topUps} currency={float.currency} dot="bg-emerald-500" />
            <FloatMetric label="Debits" value={float.debits} currency={float.currency} dot="bg-red-500" />
            <FloatMetric label="Refunds" value={float.refunds} currency={float.currency} dot="bg-blue-500" />
            <FloatMetric label="Adjustments" value={float.adjustments} currency={float.currency} dot="bg-amber-500" />
          </div>
        </div>

        {/* Activity */}
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Float activity</p>
              <p className="text-xs text-slate-400">Net change per day</p>
            </div>

            <Link
              href={href}
              className="rounded-md text-xs font-medium text-indigo-600 transition hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              View float →
            </Link>
          </div>

          <FloatTrend data={trend} currency={float.currency} />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Float metric
// ============================================================================

function FloatMetric({
  label,
  value,
  currency,
  dot,
}: {
  label: string;
  value: number;
  currency: string;
  dot: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200/70 bg-white p-3 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </p>

      <p className="mt-1.5 truncate text-sm font-semibold tabular-nums text-slate-900">
        {formatMoney(value, currency)}
      </p>
    </div>
  );
}

// ============================================================================
// Float trend (diverging bars: credits right, debits left)
// ============================================================================

function FloatTrend({
  data,
  currency,
}: {
  data: readonly FloatTrendPoint[];
  currency: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
        <p className="text-sm font-medium text-slate-600">No float activity</p>
        <p className="mt-1 text-xs text-slate-400">
          Top ups and debits will appear here.
        </p>
      </div>
    );
  }

  const rows = data.slice(-8);
  const max = Math.max(1, ...rows.map((item) => Math.abs(item.net)));

  return (
    <div className="space-y-2.5">
      {rows.map((item) => {
        const positive = item.net >= 0;
        const width = Math.max(2, (Math.abs(item.net) / max) * 50);

        return (
          <div
            key={item.date}
            className="grid grid-cols-[52px_minmax(0,1fr)_104px] items-center gap-3"
            title={`${formatShortDate(item.date)}: top ups ${formatMoney(item.topUps, currency)}, debits ${formatMoney(item.debits, currency)}`}
          >
            <span className="text-xs text-slate-400">
              {formatShortDate(item.date)}
            </span>

            <div className="relative h-2 rounded-full bg-slate-100">
              <span className="absolute inset-y-[-3px] left-1/2 w-px bg-slate-300" />

              <div
                className={[
                  "absolute inset-y-0 rounded-full",
                  positive ? "left-1/2 bg-emerald-500" : "right-1/2 bg-red-400",
                ].join(" ")}
                style={{ width: `${width}%` }}
              />
            </div>

            <span
              className={[
                "text-right text-xs font-medium tabular-nums",
                positive ? "text-emerald-600" : "text-red-500",
              ].join(" ")}
            >
              {formatSigned(item.net, currency)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Helper: signed money ("+1,200.00" / "-350.00"), keeps the currency
// ============================================================================

function formatSigned(value: number, currency: string): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatMoney(Math.abs(value), currency)}`;
}
