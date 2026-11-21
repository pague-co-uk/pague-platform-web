import type { DashboardMessageSummary } from "../types/dashboard";

export function MessageStatusMix({ messages }: { messages: DashboardMessageSummary }) {
  const states = [
    { label: "Delivered", count: messages.delivered, color: "#6ee7b7" },
    { label: "Submitted", count: messages.submitted, color: "#fcd34d" },
    { label: "Queued", count: messages.queued, color: "#cbd5e1" },
    { label: "Routed", count: messages.routed, color: "#a5b4fc" },
    { label: "Delivery failed", count: messages.failed, color: "#fca5a5" },
    { label: "Routing failed", count: messages.routingFailures, color: "#f9a8d4" },
    { label: "Expired", count: messages.expired, color: "#fdba74" },
  ].filter(state => state.count > 0);
  const total = states.reduce((sum, state) => sum + state.count, 0);
  if (!total) return <p className="px-5 pb-5 text-sm text-slate-500">No messages for the selected period.</p>;
  let cumulative = 0;
  const segments = states.map(state => {
    const start = cumulative / total * 100;
    cumulative += state.count;
    return `${state.color} ${start}% ${cumulative / total * 100}%`;
  });
  return <div className="px-5 pb-5">
    <div className="mx-auto mb-5 size-48 rounded-full" style={{ background: `conic-gradient(${segments.join(", ")})` }} aria-hidden="true" />
    <ul className="max-h-56 space-y-3 overflow-y-auto text-xs">{states.map(state => <li key={state.label} className="flex items-center gap-2" title={`${state.count.toLocaleString("en-GB")} messages`}>
      <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: state.color }} aria-hidden="true" />
      <span className="text-slate-600">{state.label}</span><span className="ml-auto font-medium tabular-nums text-slate-800">{(state.count / total * 100).toFixed(1)}%</span>
    </li>)}</ul>
  </div>;
}
