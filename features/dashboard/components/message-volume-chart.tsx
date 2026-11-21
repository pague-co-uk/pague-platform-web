export interface MessageVolumeItem { key: string; name: string; messages: number; }

/** Shared linear-scale bars: every bar is one sender/client, never a route attempt. */
export function MessageVolumeChart({ label, items }: { label: string; items: readonly MessageVolumeItem[] }) {
  const rows = [...items].filter(item => item.messages > 0).sort((a, b) => b.messages - a.messages || a.name.localeCompare(b.name));
  if (!rows.length) return <p className="p-5 text-sm text-slate-500">No messaging activity for the selected period.</p>;
  const maximum = Math.max(...rows.map(row => row.messages));
  const format = (value: number) => value.toLocaleString("en-GB");
  return <div className="p-5" aria-label={label}>
    <div className="overflow-x-auto">
      <ol className="flex min-w-full items-start gap-4">{rows.map(row => <li key={row.key} className="w-24 shrink-0 text-center text-xs">
        <div className="flex h-56 flex-col justify-end border-b border-slate-100">
          <span className="mb-1 tabular-nums text-slate-600">{format(row.messages)} {row.messages === 1 ? "segment" : "segments"}</span>
          <div className="mx-auto w-10 rounded-t-md opacity-60" aria-hidden="true" style={{ height: `${row.messages / maximum * 180}px`, backgroundColor: "var(--chart-primary, #db2777)" }} />
        </div>
        <span className="mt-2 block break-words font-medium text-slate-700">{row.name}</span>
      </li>)}</ol>
    </div>
  </div>;
}
