"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { messageListQuery } from "../utils/message-pagination";

export function MessageListControls({ pageSize }: { pageSize: number }) {
  const params = useSearchParams();
  // Remount draft inputs after navigation, including browser Back/Forward.
  return <Controls key={params.toString()} query={params.toString()} pageSize={pageSize} />;
}

function Controls({ query, pageSize }: { query: string; pageSize: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = new URLSearchParams(query);
  const [from, setFrom] = useState(params.get("createdFrom") ?? "");
  const [to, setTo] = useState(params.get("createdTo") ?? "");
  const [size, setSize] = useState(String(pageSize));
  const [error, setError] = useState("");

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      router.push(`${pathname}?${messageListQuery(query, from, to, size)}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Invalid filters.");
    }
  }

  const inputClass = "block h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";
  const dateInputClass = `${inputClass} pl-10 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`;
  return (
    <form onSubmit={apply} className="my-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9rem_auto]">
        <label className="block space-y-2 text-xs font-semibold text-slate-600">
          <span>Created from</span>
          <span className="relative block">
            <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input type="date" value={from} onChange={event => setFrom(event.target.value)} className={dateInputClass} />
          </span>
        </label>
        <label className="block space-y-2 text-xs font-semibold text-slate-600">
          <span>Created to <span className="font-normal text-slate-400">(inclusive)</span></span>
          <span className="relative block">
            <CalendarDays aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input type="date" value={to} onChange={event => setTo(event.target.value)} className={dateInputClass} />
          </span>
        </label>
        <label className="block space-y-2 text-xs font-semibold text-slate-600">
          <span>Items per page</span>
          <input type="number" required min={1} max={100} step={1} value={size} onChange={event => setSize(event.target.value)} className={inputClass} />
        </label>
        <button type="submit" className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20">Apply filters</button>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Clock3 aria-hidden="true" className="size-3.5 shrink-0" />Times use your device’s local timezone.</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
