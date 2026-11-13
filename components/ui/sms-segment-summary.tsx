export function SmsSegmentSummary({ totalSegments, breakdown, collapsible = false }: {
  collapsible?: boolean;
  totalSegments: number;
  breakdown: ReadonlyArray<{ segmentCount: number; messageCount: number; totalSegments: number }>;
}) {
  const number = (value: number) => value.toLocaleString("en-GB");
  const content = <>
    <h2 className="text-sm font-semibold text-slate-800">SMS segments <span className="ml-2 tabular-nums">{number(totalSegments)}</span></h2>
    <p className="mt-1 text-xs text-slate-500">Message count × segments per message. Routing retries do not add to this total.</p>
    <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">{breakdown.map(row => <li key={row.segmentCount} className="rounded-lg bg-slate-50 px-3 py-2 tabular-nums">
      {number(row.messageCount)} {row.messageCount === 1 ? "message" : "messages"} × {number(row.segmentCount)} {row.segmentCount === 1 ? "segment" : "segments"} = <strong>{number(row.totalSegments)}</strong>
    </li>)}</ul>
    {breakdown.length === 0 && <p className="mt-2 text-xs text-slate-500">No matching messages.</p>}
  </>;
  if (collapsible) return <details className="rounded-xl border border-slate-200 bg-white px-4 py-3">
    <summary className="cursor-pointer text-sm font-semibold text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-500">SMS segments: {number(totalSegments)} <span className="ml-2 text-xs font-normal text-slate-400">Expand message × segment breakdown</span></summary>
    <div className="mt-3">{content}</div>
  </details>;
  return <section aria-label="SMS segment totals" className="my-4 rounded-xl border border-slate-200 bg-white p-4">{content}</section>;
}
