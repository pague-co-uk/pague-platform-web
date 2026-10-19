"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { retryMessage } from "../api/messages-api";

export function RetryMessageButton({ clientId, messageId }: { clientId: string; messageId: string }) {
  const router = useRouter();
  const busy = useRef(false);
  const [state, setState] = useState<"idle" | "pending" | "queued">("idle");
  const [error, setError] = useState("");

  async function retry() {
    if (busy.current) return;
    busy.current = true;
    setState("pending");
    setError("");
    try {
      await retryMessage(clientId, messageId);
      setState("queued");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to retry this message.");
      setState("idle");
      busy.current = false;
      router.refresh();
    }
  }

  return <div onClick={event => event.stopPropagation()}>
    <button type="button" onClick={retry} disabled={state !== "idle"} aria-busy={state === "pending"}
      className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60">
      {state === "pending" ? "Queuing retry…" : state === "queued" ? "Retry queued" : "Retry message"}
    </button>
    {state === "queued" && <p role="status" className="mt-1 text-xs text-slate-500">Queued for routing.</p>}
    {error && <p role="alert" className="mt-1 max-w-xs text-xs text-red-600">{error}</p>}
  </div>;
}
