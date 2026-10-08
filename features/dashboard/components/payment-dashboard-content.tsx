"use client";

import {
  useState,
  type ReactNode,
} from "react";

import type {
  PaymentCurrencyVolume,
  PaymentDashboardData,
  PaymentDashboardTransaction,
  PaymentProviderPerformance,
  PaymentStatusBreakdown,
  PaymentTransactionTrendPoint,
  PaymentTransactionTypeBreakdown,
} from "../types/payment-dashboard";

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
    tile:
      "bg-violet-100 text-violet-600",
    stroke: "#8b5cf6",
  },

  green: {
    tile:
      "bg-emerald-100 text-emerald-600",
    stroke: "#22c55e",
  },

  blue: {
    tile:
      "bg-blue-100 text-blue-600",
    stroke: "#3b82f6",
  },

  orange: {
    tile:
      "bg-orange-100 text-orange-500",
    stroke: "#f97316",
  },

  red: {
    tile:
      "bg-red-100 text-red-500",
    stroke: "#ef4444",
  },
};

const STATUS_COLORS: Record<
  string,
  string
> = {
  PENDING: "#f59e0b",
  PROCESSING: "#3b82f6",
  SUCCESS: "#22c55e",
  FAILED: "#ef4444",
  REVERSED: "#8b5cf6",
  CANCELLED: "#94a3b8",
};

const CARD =
  "rounded-2xl border border-slate-200/70 bg-white shadow-sm";

// ============================================================================
// Dashboard content
// ============================================================================

export function PaymentDashboardContent({
  dashboard,
}: {
  dashboard: PaymentDashboardData;
}) {
  const isPlatform =
    dashboard.viewer.scope ===
    "PLATFORM";

  const trend =
    dashboard.transactionTrend;

  const periodLabel =
    dashboard.period.days === 7
      ? "Last 7 days"
      : dashboard.period.days === 90
        ? "Last 90 days"
        : "Last 30 days";

  return (
    <div className="space-y-5 pb-8">
      {/* ======================================================================
          Header
      ====================================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Icon
              type="payments"
              className="h-5 w-5"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Payment Insights
            </h1>

            <p className="text-sm text-slate-500">
              Monitor transaction activity,
              payment performance and
              processing outcomes.
              <span className="ml-1 text-slate-400">
                {isPlatform
                  ? "Platform"
                  : "Client"}
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

      {/* ======================================================================
          KPI cards
      ====================================================================== */}

      <section
        aria-label="Payment dashboard metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <KpiCard
          label="Total transactions"
          value={formatCompactNumber(
            dashboard.summary.total,
          )}
          description="Transactions processed"
          icon="payments"
          tone="violet"
          spark={trend.map(
            (item) => item.total,
          )}
        />

        <KpiCard
          label="Successful"
          value={formatCompactNumber(
            dashboard.summary.successful,
          )}
          description="Successfully completed"
          icon="success"
          tone="green"
          spark={trend.map(
            (item) =>
              item.successful,
          )}
        />

        <KpiCard
          label="Failed"
          value={formatCompactNumber(
            dashboard.summary.failed,
          )}
          description="Failed transactions"
          icon="failed"
          tone="red"
          spark={trend.map(
            (item) => item.failed,
          )}
        />

        <KpiCard
          label="Success rate"
          value={`${dashboard.summary.successRate.toFixed(1)}%`}
          description="Successful transaction rate"
          icon="rate"
          tone="blue"
          spark={trend.map((item) =>
            item.total > 0
              ? (item.successful /
                item.total) *
              100
              : 0,
          )}
        />

        <KpiCard
          label="Processing"
          value={formatCompactNumber(
            dashboard.summary.processing,
          )}
          description="Currently processing"
          icon="processing"
          tone="orange"
          spark={trend.map(
            (item) => item.total,
          )}
        />
      </section>

      {/* ======================================================================
          Activity + status
      ====================================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)]">
        <section className={CARD}>
          <SectionHeader
            icon="rate"
            title="Transaction activity"
            description="Transaction volume and outcomes over the selected period."
          />

          <div className="px-5 pb-5">
            <TransactionTrendChart
              data={trend}
            />
          </div>
        </section>

        <section className={CARD}>
          <SectionHeader
            icon="chart"
            title="Transaction status"
            description="Distribution of transaction outcomes."
          />

          <div className="flex flex-col items-center gap-5 p-5 sm:flex-row xl:flex-col 2xl:flex-row">
            <StatusDonut
              data={
                dashboard.statusBreakdown
              }
              total={
                dashboard.summary.total
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
      </div>

      {/* ======================================================================
          Currency volume + provider performance
      ====================================================================== */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
        <section className={CARD}>
          <SectionHeader
            icon="currency"
            title="Transaction volume by currency"
            description="Transaction count and value grouped by currency."
          />

          <div className="overflow-x-auto">
            {dashboard.currencyVolume
              .length === 0 ? (
              <EmptyState
                title="No currency activity"
                description="There is no transaction activity by currency for this period."
              />
            ) : (
              <CurrencyVolumeTable
                rows={
                  dashboard.currencyVolume
                }
              />
            )}
          </div>
        </section>

        <section className={CARD}>
          <SectionHeader
            icon="providers"
            title="Provider performance"
            description="Transaction outcomes by payment provider."
          />

          <div className="overflow-x-auto">
            {dashboard.providerPerformance
              .length === 0 ? (
              <EmptyState
                title="No provider activity"
                description="There is no provider transaction activity for this period."
              />
            ) : (
              <ProviderPerformanceTable
                rows={
                  dashboard.providerPerformance
                }
              />
            )}
          </div>
        </section>
      </div>

      {/* ======================================================================
          Transaction types
      ====================================================================== */}

      <section className={CARD}>
        <SectionHeader
          icon="types"
          title="Transaction types"
          description="Transaction activity and success rates by transaction type."
        />

        <div className="overflow-x-auto">
          {dashboard.transactionTypes
            .length === 0 ? (
            <EmptyState
              title="No transaction types"
              description="There is no transaction type activity for this period."
            />
          ) : (
            <TransactionTypesTable
              rows={
                dashboard.transactionTypes
              }
            />
          )}
        </div>
      </section>

      {/* ======================================================================
          Recent transactions
      ====================================================================== */}

      <section className={CARD}>
        <SectionHeader
          icon="list"
          title="Recent transactions"
          description="Latest payment transactions across the selected scope."
        />

        <div className="overflow-x-auto">
          {dashboard.recentTransactions
            .length === 0 ? (
            <EmptyState
              title="No recent transactions"
              description="There are no transactions to display for the selected scope."
            />
          ) : (
            <RecentTransactionsTable
              rows={
                dashboard.recentTransactions
              }
            />
          )}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Section header
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
}: {
  label: string;
  value: string;
  description: string;
  icon: IconType;
  tone: Tone;
  spark?: number[];
}) {
  return (
    <div
      className={[
        CARD,
        "p-5",
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

      <div className="mt-2">
        <p className="text-xs text-slate-400">
          {description}
        </p>
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
  const width = 200;
  const height = 40;

  const min = Math.min(
    ...values,
  );

  const max = Math.max(
    ...values,
  );

  const range =
    max - min || 1;

  const points = values.map(
    (value, index) => [
      (index /
        Math.max(
          values.length - 1,
          1,
        )) *
      width,

      height -
      4 -
      ((value - min) /
        range) *
      (height - 8),
    ],
  );

  const line = points
    .map(
      ([x, y], index) =>
        `${index ? "L" : "M"} ${x} ${y}`,
    )
    .join(" ");

  const gradientId = `payment-spark-${color.replace(
    "#",
    "",
  )}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="mt-3 h-10 w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
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
        d={`${line} L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#${gradientId})`}
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
// Chart constants
// ============================================================================

const CHART = {
  width: 900,
  height: 300,
  top: 16,
  right: 16,
  bottom: 34,
  left: 48,
};

// ============================================================================
// Chart scale
// ============================================================================

function chartScale(
  max: number,
  count: number,
) {
  const chartWidth =
    CHART.width -
    CHART.left -
    CHART.right;

  const chartHeight =
    CHART.height -
    CHART.top -
    CHART.bottom;

  return {
    x: (index: number) =>
      CHART.left +
      (count === 1
        ? chartWidth / 2
        : (index /
          (count - 1)) *
        chartWidth),

    y: (value: number) =>
      CHART.top +
      chartHeight -
      (value / max) *
      chartHeight,

    base:
      CHART.top + chartHeight,
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
      x: scale.x(
        Math.max(
          0,
          Math.min(
            dataLength - 1,
            index,
          ),
        ),
      ),
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
  data: readonly PaymentTransactionTrendPoint[];
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
        aria-label="Transaction activity chart"
      >
        {[0, 1, 2, 3, 4].map(
          (index) => {
            const value =
              (max / 4) * index;

            const y =
              scale.y(value);

            return (
              <g key={index}>
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

        {data.map(
          (item, index) =>
            labels.has(index) ? (
              <text
                key={item.date}
                x={scale.x(index)}
                y={
                  CHART.height -
                  10
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
        <TransactionChartTooltip
          data={data}
          index={hover.index}
          x={hover.x}
        />
      )}
    </div>
  );
}

// ============================================================================
// Transaction trend chart
// ============================================================================

function TransactionTrendChart({
  data,
}: {
  data: readonly PaymentTransactionTrendPoint[];
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        title="No transaction activity"
        description="There is no transaction activity for this period."
      />
    );
  }

  const max = Math.max(
    1,
    ...data.map((item) =>
      Math.max(
        item.total,
        item.successful,
        item.failed,
      ),
    ),
  );

  const scale =
    chartScale(
      max,
      data.length,
    );

  const {
    hover,
    handleMove,
    handleLeave,
  } = useChartHover(
    data.length,
    scale,
  );

  const path = (
    values: number[],
  ) =>
    values
      .map(
        (value, index) =>
          `${index ? "L" : "M"
          } ${scale.x(index)} ${scale.y(
            value,
          )}`,
      )
      .join(" ");

  const totalPath = path(
    data.map(
      (item) => item.total,
    ),
  );

  const successfulPath =
    path(
      data.map(
        (item) =>
          item.successful,
      ),
    );

  const failedPath = path(
    data.map(
      (item) => item.failed,
    ),
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <ChartLegend
          label="Transactions"
          color="#94a3b8"
        />

        <ChartLegend
          label="Successful"
          color="#22c55e"
        />

        <ChartLegend
          label="Failed"
          color="#ef4444"
        />
      </div>

      <ChartFrame
        max={max}
        data={data}
        scale={scale}
        hover={hover}
        onHover={handleMove}
        onLeave={handleLeave}
      >
        <defs>
          <linearGradient
            id="payment-trend-fill"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#22c55e"
              stopOpacity="0.22"
            />

            <stop
              offset="100%"
              stopColor="#22c55e"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        <path
          d={`${successfulPath} L ${scale.x(
            data.length - 1,
          )} ${scale.base} L ${scale.x(
            0,
          )} ${scale.base} Z`}
          fill="url(#payment-trend-fill)"
        />

        <path
          d={totalPath}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        <path
          d={successfulPath}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d={failedPath}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {hover && (
          <>
            <HoverPoint
              x={scale.x(
                hover.index,
              )}
              y={scale.y(
                data[hover.index]
                  ?.successful ??
                0,
              )}
              color="#22c55e"
            />

            <HoverPoint
              x={scale.x(
                hover.index,
              )}
              y={scale.y(
                data[hover.index]
                  ?.failed ?? 0,
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
// Transaction chart tooltip
// ============================================================================

function TransactionChartTooltip({
  data,
  index,
  x,
}: {
  data: readonly PaymentTransactionTrendPoint[];
  index: number;
  x: number;
}) {
  const item =
    data[index];

  if (!item) {
    return null;
  }

  const leftPercent =
    (x / CHART.width) *
    100;

  const transform =
    leftPercent > 70
      ? "translateX(-100%)"
      : leftPercent < 20
        ? "translateX(0)"
        : "translateX(-50%)";

  return (
    <div
      className="pointer-events-none absolute top-2 z-10 min-w-[175px] rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
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
          label="Transactions"
          value={item.total}
          color="#94a3b8"
        />

        <TooltipValue
          label="Successful"
          value={item.successful}
          color="#22c55e"
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
            backgroundColor:
              color,
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
// Chart legend
// ============================================================================

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
          backgroundColor:
            color,
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
  data: readonly PaymentStatusBreakdown[];
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
                  ] ??
                  "#94a3b8"
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
          Transactions
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Status legend
// ============================================================================

function StatusLegendRow({
  item,
}: {
  item: PaymentStatusBreakdown;
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
              ] ??
              "#94a3b8",
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
// Currency volume table
// ============================================================================

function CurrencyVolumeTable({
  rows,
}: {
  rows: readonly PaymentCurrencyVolume[];
}) {
  return (
    <table className="w-full min-w-[520px] text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-left">
          <Th className="px-5 text-left">
            Currency
          </Th>

          <Th>
            Transactions
          </Th>

          <Th className="px-5">
            Volume
          </Th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr
            key={row.currencyId}
            className="border-b border-slate-50 last:border-0"
          >
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-700">
                  {row.currencyCode.slice(
                    0,
                    3,
                  )}
                </div>

                <div>
                  <p className="font-medium text-slate-900">
                    {row.currencyCode}
                  </p>

                  <p className="text-xs text-slate-400">
                    {row.currencyName}
                  </p>
                </div>
              </div>
            </td>

            <Td>
              {formatNumber(
                row.transactionCount,
              )}
            </Td>

            <td className="px-5 py-3.5 text-right text-sm font-medium tabular-nums text-slate-800">
              {formatCurrencyAmount(
                row.totalAmount,
                row.currencyCode,
                row.currencySymbol,
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================================
// Provider performance table
// ============================================================================

function ProviderPerformanceTable({
  rows,
}: {
  rows: readonly PaymentProviderPerformance[];
}) {
  return (
    <table className="w-full min-w-[560px] text-sm">
      <thead>
        <tr className="border-b border-slate-100">
          <Th className="px-5 text-left">
            Provider
          </Th>

          <Th>
            Transactions
          </Th>

          <Th>
            Failed
          </Th>

          <Th className="px-5">
            Success rate
          </Th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr
            key={
              row.providerId ??
              "unassigned"
            }
            className="border-b border-slate-50 last:border-0"
          >
            <td className="px-5 py-3.5">
              <p className="font-medium text-slate-900">
                {row.providerName ??
                  "Unassigned"}
              </p>

              <p className="text-xs text-slate-400">
                {row.providerCode ??
                  "No provider"}
              </p>
            </td>

            <Td>
              {formatNumber(
                row.transactionCount,
              )}
            </Td>

            <Td>
              {formatNumber(
                row.failed,
              )}
            </Td>

            <td className="px-5 py-3.5 text-right">
              <span
                className={rateBadge(
                  row.successRate,
                )}
              >
                {formatPercent(
                  row.successRate,
                )}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================================
// Transaction types table
// ============================================================================

function TransactionTypesTable({
  rows,
}: {
  rows: readonly PaymentTransactionTypeBreakdown[];
}) {
  return (
    <table className="w-full min-w-[650px] text-sm">
      <thead>
        <tr className="border-b border-slate-100">
          <Th className="px-5 text-left">
            Transaction type
          </Th>

          <Th>
            Transactions
          </Th>

          <Th>
            Successful
          </Th>

          <Th>
            Failed
          </Th>

          <Th className="px-5">
            Success rate
          </Th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr
            key={row.transactionTypeId}
            className="border-b border-slate-50 last:border-0"
          >
            <td className="px-5 py-3.5">
              <p className="font-medium text-slate-900">
                {row.transactionTypeName}
              </p>

              <p className="font-mono text-xs text-slate-400">
                {row.transactionTypeCode}
              </p>
            </td>

            <Td>
              {formatNumber(
                row.transactionCount,
              )}
            </Td>

            <Td>
              {formatNumber(
                row.successful,
              )}
            </Td>

            <Td>
              {formatNumber(
                row.failed,
              )}
            </Td>

            <td className="px-5 py-3.5 text-right">
              <span
                className={rateBadge(
                  row.successRate,
                )}
              >
                {formatPercent(
                  row.successRate,
                )}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================================
// Recent transactions table
// ============================================================================

function RecentTransactionsTable({
  rows,
}: {
  rows: readonly PaymentDashboardTransaction[];
}) {
  return (
    <table className="w-full min-w-[1000px] text-sm">
      <thead>
        <tr className="border-b border-slate-100">
          <Th className="px-5 text-left">
            Transaction
          </Th>

          <Th className="text-left">
            Service
          </Th>

          <Th className="text-left">
            Provider
          </Th>

          <Th>
            Amount
          </Th>

          <Th>
            Status
          </Th>

          <Th className="px-5">
            Created
          </Th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className="border-b border-slate-50 last:border-0"
          >
            <td className="px-5 py-3.5">
              <p className="font-medium text-slate-900">
                {row.reference}
              </p>

              <p className="font-mono text-[11px] text-slate-400">
                {row.publicId}
              </p>

              {row.clientName && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {row.clientName}
                </p>
              )}
            </td>

            <td className="px-3 py-3.5">
              <p className="font-medium text-slate-700">
                {row.serviceName}
              </p>

              <p className="font-mono text-[11px] text-slate-400">
                {row.serviceCode}
              </p>
            </td>

            <td className="px-3 py-3.5">
              <p className="text-slate-700">
                {row.providerName ??
                  "Unassigned"}
              </p>

              <p className="font-mono text-[11px] text-slate-400">
                {row.providerCode ??
                  "—"}
              </p>
            </td>

            <td className="px-3 py-3.5 text-right">
              <p className="font-medium tabular-nums text-slate-800">
                {formatCurrencyAmount(
                  row.amount,
                  row.currencyCode,
                  row.currencySymbol,
                )}
              </p>
            </td>

            <td className="px-3 py-3.5 text-right">
              <StatusBadge
                status={row.status}
              />
            </td>

            <td className="px-5 py-3.5 text-right text-xs text-slate-400">
              {formatRelativeDate(
                row.createdAt,
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================================
// Table primitives
// ============================================================================

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
// Status badge
// ============================================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    SUCCESS:
      "bg-emerald-50 text-emerald-700",
    FAILED:
      "bg-red-50 text-red-700",
    PROCESSING:
      "bg-blue-50 text-blue-700",
    PENDING:
      "bg-amber-50 text-amber-700",
    REVERSED:
      "bg-violet-50 text-violet-700",
    CANCELLED:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[status] ??
        "bg-slate-100 text-slate-600"
        }`}
    >
      {formatStatus(status)}
    </span>
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
  | "payments"
  | "success"
  | "failed"
  | "processing"
  | "rate"
  | "chart"
  | "currency"
  | "providers"
  | "types"
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
        "payments" && (
          <>
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
            />
            <path d="M3 10h18" />
            <path d="M7 15h3" />
          </>
        )}

      {type === "success" && (
        <path d="m5 12 4 4L19 6" />
      )}

      {type === "failed" && (
        <>
          <path d="M12 4v10M12 18h.01" />
          <path d="M10.3 4.9 3.8 16.2a2 2 0 0 0 1.7 3h13a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0Z" />
        </>
      )}

      {type ===
        "processing" && (
          <>
            <circle
              cx="12"
              cy="12"
              r="8"
            />
            <path d="M12 8v4l2.5 2.5" />
          </>
        )}

      {type === "rate" && (
        <path d="M5 19V9M12 19V5M19 19v-7" />
      )}

      {type === "chart" && (
        <>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-4 3 2 5-7" />
        </>
      )}

      {type === "currency" && (
        <>
          <circle
            cx="12"
            cy="12"
            r="8"
          />
          <path d="M15 8.5c-.7-.5-1.6-.8-2.7-.8-1.5 0-2.5.7-2.5 1.8 0 2.8 5.5 1.2 5.5 4.1 0 1.2-1.1 2-2.8 2-1.2 0-2.3-.4-3.1-1" />
          <path d="M12 6v12" />
        </>
      )}

      {type === "providers" && (
        <>
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2"
          />
          <path d="M8 9h8M8 13h5M8 17h8" />
        </>
      )}

      {type === "types" && (
        <>
          <rect
            x="4"
            y="4"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="14"
            y="4"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="4"
            y="14"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="14"
            y="14"
            width="6"
            height="6"
            rx="1"
          />
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
// Formatting
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

function formatStatus(
  status: string,
): string {
  return (
    status.charAt(0) +
    status
      .slice(1)
      .toLowerCase()
  );
}

function formatCurrencyAmount(
  value: string,
  currencyCode: string,
  currencySymbol: string | null,
): string {
  const numeric =
    Number(value);

  if (
    Number.isNaN(numeric)
  ) {
    return currencySymbol
      ? `${currencySymbol} ${value}`
      : `${currencyCode} ${value}`;
  }

  const formatted =
    new Intl.NumberFormat(
      "en-GB",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
    ).format(numeric);

  return currencySymbol
    ? `${currencySymbol} ${formatted}`
    : `${currencyCode} ${formatted}`;
}

function formatDateRange(
  start: string,
  end: string,
): string {
  const startDate =
    new Date(start);

  const endDate =
    new Date(end);

  if (
    Number.isNaN(
      startDate.getTime(),
    ) ||
    Number.isNaN(
      endDate.getTime(),
    )
  ) {
    return "Selected period";
  }

  const formatter =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );

  return `${formatter.format(
    startDate,
  )} – ${formatter.format(
    endDate,
  )}`;
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

  const minutes = Math.floor(
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

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatShortDate(
    value,
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

function selectDateLabels(
  data: readonly PaymentTransactionTrendPoint[],
): Set<number> {
  const labels =
    new Set<number>();

  if (data.length <= 7) {
    data.forEach(
      (_, index) =>
        labels.add(index),
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
    let index = 0;
    index < data.length;
    index += step
  ) {
    labels.add(index);
  }

  return labels;
}