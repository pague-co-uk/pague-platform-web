"use client";

import { useState } from "react";
import type {
  DashboardMonthlyOutcomes,
  DashboardNetworkSeries,
} from "../types/dashboard";

const CARD = "rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm";
const format = new Intl.NumberFormat("en-GB");
function networkColor(key: string, name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("airtel")) return "#dc2626";
  if (lower.includes("safaricom") || lower.includes("safcom")) return "#16a34a";
  if (lower.includes("faiba")) return "#a3a817";
  if (lower.includes("telkom")) return "#0891b2";
  if (key === "unassigned") return "#64748b";
  const palette = ["#7c3aed", "#db2777", "#d97706", "#2563eb", "#0d9488"];
  return palette[
    [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length
  ];
}

export function NetworkActivityChart({
  series,
}: {
  series: readonly DashboardNetworkSeries[];
}) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const visible = series.filter((network) => !hidden.has(network.key));
  const points = series[0]?.points ?? [];
  const max =
    Math.max(
      1,
      Math.ceil(
        Math.max(
          0,
          ...visible.flatMap((network) =>
            network.points.map((point) => point.count),
          ),
        ) / 4,
      ),
    ) * 4;
  const width = 800,
    height = 300,
    left = 62,
    right = 22,
    top = 18,
    bottom = 90;
  const plotWidth = width - left - right,
    plotHeight = height - top - bottom;
  const x = (index: number) =>
    left +
    (points.length === 1
      ? plotWidth / 2
      : (index * plotWidth) / Math.max(1, points.length - 1));
  const y = (count: number) => top + plotHeight - (count / max) * plotHeight;
  return (
    <section className={CARD} aria-labelledby="network-activity-title">
      <h2
        id="network-activity-title"
        className="text-sm font-semibold text-slate-900"
      >
        Network activity
      </h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Daily message volume by latest routed network for the selected period.
        Each message is counted once; messages without a route are unassigned.
      </p>
      {!series.length ? (
        <p className="py-16 text-center text-sm text-slate-500">
          No network activity in this period.
        </p>
      ) : (
        <>
          <div
            className="my-3 flex max-h-16 flex-wrap justify-center gap-2 overflow-y-auto"
            aria-label="Network series"
          >
            {series.map((network) => (
              <button
                key={network.key}
                type="button"
                aria-pressed={!hidden.has(network.key)}
                onClick={() =>
                  setHidden((current) => {
                    const next = new Set(current);
                    if (next.has(network.key)) next.delete(network.key);
                    else next.add(network.key);
                    return next;
                  })
                }
                className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-500 ${hidden.has(network.key) ? "opacity-40" : ""}`}
              >
                <span
                  className="h-2.5 w-5 rounded-sm"
                  style={{
                    backgroundColor: networkColor(network.key, network.name),
                  }}
                />
                {network.name}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="h-52 w-full min-w-[420px]"
              role="img"
              aria-label="Daily message volume by network. Exact counts are available in the data table below."
            >
              {Array.from({ length: 5 }, (_, index) => {
                const count = (max * index) / 4;
                return (
                  <g key={index}>
                    <line
                      x1={left}
                      x2={width - right}
                      y1={y(count)}
                      y2={y(count)}
                      stroke="var(--color-slate-200)"
                    />
                    <text
                      x={left - 10}
                      y={y(count) + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="var(--color-slate-500)"
                    >
                      {format.format(Math.ceil(count))}
                    </text>
                  </g>
                );
              })}
              {points.map((point, index) =>
                index % Math.max(1, Math.ceil(points.length / 8)) === 0 ||
                index === points.length - 1 ? (
                  <text
                    key={point.date}
                    x={x(index)}
                    y={top + plotHeight + 16}
                    transform={`rotate(-45 ${x(index)} ${top + plotHeight + 16})`}
                    textAnchor="end"
                    fontSize="11"
                    fill="var(--color-slate-500)"
                  >
                    {point.date}
                  </text>
                ) : null,
              )}
              {visible.map((network) => (
                <g key={network.key}>
                  <polyline
                    fill="none"
                    stroke={networkColor(network.key, network.name)}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    points={network.points
                      .map((point, index) => `${x(index)},${y(point.count)}`)
                      .join(" ")}
                  />
                  {network.points.map((point, index) => (
                    <circle
                      key={point.date}
                      cx={x(index)}
                      cy={y(point.count)}
                      r={points.length > 40 ? 2 : 3.5}
                      fill={networkColor(network.key, network.name)}
                    >
                      <title>{`${network.name} · ${point.date}: ${format.format(point.count)} messages`}</title>
                    </circle>
                  ))}
                </g>
              ))}
            </svg>
          </div>
          {!visible.length && (
            <p className="text-xs text-slate-500">
              Select a network above to show its activity.
            </p>
          )}
          <details className="mt-3 text-xs text-slate-600">
            <summary className="w-fit cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-500">
              View network data
            </summary>
            <div className="mt-3 max-h-72 overflow-auto">
              <table className="w-full text-left">
                <caption className="sr-only">
                  Daily message counts by network
                </caption>
                <thead>
                  <tr>
                    <th className="p-2">Date</th>
                    {series.map((network) => (
                      <th key={network.key} className="p-2 text-right">
                        {network.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {points.map((point, index) => (
                    <tr key={point.date} className="border-t border-slate-100">
                      <th className="p-2 font-normal">{point.date}</th>
                      {series.map((network) => (
                        <td
                          key={network.key}
                          className="p-2 text-right tabular-nums"
                        >
                          {format.format(network.points[index]?.count ?? 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}

export function MonthlyOutcomesChart({
  outcomes,
  onYearChange,
}: {
  outcomes: DashboardMonthlyOutcomes;
  onYearChange: (year: number) => void;
}) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentYear = new Date().getUTCFullYear();
  const years = [
    ...new Set([
      outcomes.year,
      ...Array.from({ length: 10 }, (_, index) => currentYear - index),
    ]),
  ].sort((a, b) => b - a);
  const max =
    Math.max(
      1,
      Math.ceil(
        Math.max(
          0,
          ...outcomes.months.flatMap((month) => [
            month.delivered,
            month.failed,
          ]),
        ) / 4,
      ),
    ) * 4;
  const left = 62,
    top = 20,
    plotHeight = 220,
    slot = 60;
  const y = (count: number) => top + plotHeight - (count / max) * plotHeight;
  return (
    <section className={CARD} aria-labelledby="monthly-outcomes-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="monthly-outcomes-title"
            className="text-sm font-semibold text-slate-900"
          >
            Messages by month
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Calendar year {outcomes.year}, grouped by message creation month.
            Successful means delivered; delivery failures exclude routing
            failures. Pending and expired messages are not included.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-xs text-slate-600">
          Year
          <select
            value={outcomes.year}
            onChange={(event) => onYearChange(Number(event.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="my-4 flex justify-center gap-5 text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-blue-600" />
          Successful
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-red-500" />
          Delivery failed
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 800 290"
          className="h-52 w-full min-w-[420px]"
          role="img"
          aria-label={`Successful and failed message counts by month for ${outcomes.year}. Exact counts are available in the data table below.`}
        >
          {Array.from({ length: 5 }, (_, index) => {
            const count = (max * index) / 4;
            return (
              <g key={index}>
                <line
                  x1={left}
                  x2={790}
                  y1={y(count)}
                  y2={y(count)}
                  stroke="var(--color-slate-200)"
                />
                <text
                  x={left - 10}
                  y={y(count) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--color-slate-500)"
                >
                  {format.format(Math.ceil(count))}
                </text>
              </g>
            );
          })}
          {outcomes.months.map((month, index) => (
            <g key={month.month}>
              <rect
                x={left + index * slot + 9}
                y={y(month.delivered)}
                width={17}
                height={(month.delivered / max) * plotHeight}
                rx="2"
                fill="var(--color-blue-600)"
              >
                <title>{`${months[index]} ${outcomes.year}: ${format.format(month.delivered)} successful messages`}</title>
              </rect>
              <rect
                x={left + index * slot + 29}
                y={y(month.failed)}
                width={17}
                height={(month.failed / max) * plotHeight}
                rx="2"
                fill="#ef4444"
              >
                <title>{`${months[index]} ${outcomes.year}: ${format.format(month.failed)} delivery failures`}</title>
              </rect>
              <text
                x={left + index * slot + 27}
                y={268}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-slate-500)"
              >
                {months[index]}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {!outcomes.months.some((month) => month.delivered || month.failed) && (
        <p className="text-center text-xs text-slate-500">
          No delivered messages or delivery failures recorded for this year.
        </p>
      )}
      <details className="mt-3 text-xs text-slate-600">
        <summary className="w-fit cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-blue-500">
          View monthly data
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">
              Monthly completed message outcomes for {outcomes.year}
            </caption>
            <thead>
              <tr>
                <th className="p-2">Month</th>
                <th className="p-2 text-right">Successful</th>
                <th className="p-2 text-right">Delivery failed</th>
              </tr>
            </thead>
            <tbody>
              {outcomes.months.map((month) => (
                <tr key={month.month} className="border-t border-slate-100">
                  <th className="p-2 font-normal">{months[month.month - 1]}</th>
                  <td className="p-2 text-right tabular-nums">
                    {format.format(month.delivered)}
                  </td>
                  <td className="p-2 text-right tabular-nums">
                    {format.format(month.failed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
