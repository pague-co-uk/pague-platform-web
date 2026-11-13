const labels: Record<string, string> = {
  SUCCESS: "Successful", DELIVERED: "Delivered (successful)", FAILED: "Failed",
  ROUTING_FAILED: "Routing failures", SUBMITTED: "Submitted", QUEUED: "Queued", ROUTED: "Routed",
  EXPIRED: "Expired", PENDING: "Pending", PROCESSING: "Processing", REVERSED: "Reversed", CANCELLED: "Cancelled",
};
const colors: Record<string, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-700", DELIVERED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700", ROUTING_FAILED: "bg-rose-50 text-rose-700",
  SUBMITTED: "bg-amber-50 text-amber-700", PROCESSING: "bg-amber-50 text-amber-700",
};
export function FilteredResultSummary({ total, counts, kind }: { total: number; counts?: Record<string, number>; kind: string }) {
  return <section aria-label="Filtered result totals" className="my-4 rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-sm font-semibold text-slate-800">{total.toLocaleString("en-GB")} {kind} match your filters</p>
    <p className="mt-1 text-xs text-slate-500">Totals include all matching results across every page.</p>
    {counts && <dl className="mt-3 flex flex-wrap gap-2">{Object.entries(labels).filter(([status]) => counts[status] !== undefined).map(([status, label]) => <div key={status} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${colors[status] ?? "bg-slate-50 text-slate-600"}`}>
      <dt>{label}</dt><dd className="font-semibold tabular-nums">{counts[status].toLocaleString("en-GB")}</dd>
    </div>)}</dl>}
  </section>;
}
