"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
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

  const inputClass = "mt-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30";
  return (
    <form onSubmit={apply} className="my-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium text-slate-600">
          Created from
          <input type="date" value={from} onChange={event => setFrom(event.target.value)} className={`${inputClass} block`} />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Created to (inclusive)
          <input type="date" value={to} onChange={event => setTo(event.target.value)} className={`${inputClass} block`} />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Items per page
          <input type="number" required min={1} max={100} step={1} value={size} onChange={event => setSize(event.target.value)} className={`${inputClass} block w-28`} />
        </label>
        <button type="submit" className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700">Apply</button>
      </div>
      <p className="mt-2 text-xs text-slate-500">Dates use Africa/Nairobi time (UTC+03:00).</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
