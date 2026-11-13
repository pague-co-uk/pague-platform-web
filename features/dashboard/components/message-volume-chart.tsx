export interface MessageVolumeItem { key: string; name: string; messages: number; }

/** Shared linear-scale bars: every row is one sender/client, never a route attempt. */
export function MessageVolumeChart({ label, items }: { label: string; items: readonly MessageVolumeItem[] }) {
  const rows = [...items].filter(item => item.messages > 0).sort((a, b) => b.messages - a.messages || a.name.localeCompare(b.name));
  if (!rows.length) return <p className="p-5 text-sm text-slate-500">No messaging activity for the selected period.</p>;
  const maximum = Math.max(...rows.map(row => row.messages));
  const format = (value: number) => value.toLocaleString("en-GB");
  return <div className="p-5" aria-label={label}>
    <div className="h-56 overflow-y-auto pr-2">
      <ol className="space-y-4">{rows.map(row => <li key={row.key}>
        <div className="mb-1.5 flex items-start justify-between gap-3 text-xs">
          <span className="min-w-0 break-words font-medium text-slate-700">{row.name}</span>
          <span className="shrink-0 tabular-nums text-slate-600">{format(row.messages)} {row.messages === 1 ? "message" : "messages"}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-50" aria-hidden="true">
          <div className="h-3 rounded-full opacity-60" style={{ width: `${row.messages / maximum * 100}%`, backgroundColor: "var(--chart-primary, #db2777)" }} />
        </div>
      </li>)}</ol>
    </div>
    <div aria-hidden="true" className="mt-4 flex justify-between border-t border-slate-100 pt-2 text-[11px] tabular-nums text-slate-400"><span>0</span><span>{format(maximum / 2)}</span><span>{format(maximum)} messages</span></div>
  </div>;
}
