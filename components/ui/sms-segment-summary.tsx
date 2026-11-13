export function SmsSegmentSummary({ totalSegments, breakdown, collapsible = false }: {
  collapsible?: boolean;
  totalSegments?: number | null;
  breakdown?: ReadonlyArray<{ segmentCount: number; messageCount: number; totalSegments?: number }> | null;
}) {
  // Additive API fields may be absent during rolling deployments. Missing is not zero.
  const validCount = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
  const rows = Array.isArray(breakdown) && breakdown.every(row => row && validCount(row.segmentCount) && row.segmentCount > 0 && validCount(row.messageCount) && Number.isSafeInteger(row.segmentCount * row.messageCount))
    ? breakdown.map(row => ({ ...row, totalSegments: row.segmentCount * row.messageCount })) : undefined;
  const derivedTotal = rows?.reduce((sum, row) => sum + row.totalSegments, 0);
  const total = validCount(totalSegments) ? totalSegments : validCount(derivedTotal) ? derivedTotal : undefined;
  if (total === undefined) return <section aria-label="SMS segment totals" className="rounded-xl border border-slate-200 bg-white px-4 py-3">
    <p className="text-sm font-semibold text-slate-800">SMS segments unavailable</p>
    <p className="mt-1 text-xs text-slate-500">Segment totals were not supplied. Other dashboard metrics remain available.</p>
  </section>;
  const number = (value: number) => value.toLocaleString("en-GB");
  const content = <>
    <h2 className="text-sm font-semibold text-slate-800">SMS segments <span className="ml-2 tabular-nums">{number(total)}</span></h2>
    <p className="mt-1 text-xs text-slate-500">Message count × segments per message. Routing retries do not add to this total.</p>
    <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">{rows?.map(row => <li key={row.segmentCount} className="rounded-lg bg-slate-50 px-3 py-2 tabular-nums">
      {number(row.messageCount)} {row.messageCount === 1 ? "message" : "messages"} × {number(row.segmentCount)} {row.segmentCount === 1 ? "segment" : "segments"} = <strong>{number(row.totalSegments)}</strong>
    </li>)}</ul>
    {rows?.length === 0 && total === 0 && <p className="mt-2 text-xs text-slate-500">No matching messages.</p>}
    {!rows && <p className="mt-2 text-xs text-slate-500">Segment breakdown unavailable.</p>}
  </>;
  if (collapsible) return <details className="rounded-xl border border-slate-200 bg-white px-4 py-3">
    <summary className="cursor-pointer text-sm font-semibold text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-500">SMS segments: {number(total)} <span className="ml-2 text-xs font-normal text-slate-400">Expand message × segment breakdown</span></summary>
    <div className="mt-3">{content}</div>
  </details>;
  return <section aria-label="SMS segment totals" className="my-4 rounded-xl border border-slate-200 bg-white p-4">{content}</section>;
}
