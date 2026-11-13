export function SmsSegmentSummary({ totalSegments, breakdown }: {
  totalSegments: number;
  breakdown: ReadonlyArray<{ segmentCount: number; messageCount: number; totalSegments: number }>;
}) {
  const number = (value: number) => value.toLocaleString("en-GB");
  return <section aria-label="SMS segment totals" className="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <h2 className="text-sm font-semibold text-slate-800">SMS segments <span className="ml-2 tabular-nums">{number(totalSegments)}</span></h2>
    <p className="mt-1 text-xs text-slate-500">Message count × segments per message. Routing retries do not add to this total.</p>
    <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">{breakdown.map(row => <li key={row.segmentCount} className="rounded-lg bg-slate-50 px-3 py-2 tabular-nums">
      {number(row.messageCount)} {row.messageCount === 1 ? "message" : "messages"} × {number(row.segmentCount)} {row.segmentCount === 1 ? "segment" : "segments"} = <strong>{number(row.totalSegments)}</strong>
    </li>)}</ul>
    {breakdown.length === 0 && <p className="mt-2 text-xs text-slate-500">No matching messages.</p>}
  </section>;
}
