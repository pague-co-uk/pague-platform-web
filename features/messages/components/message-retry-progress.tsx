"use client";

import { useLocalDateFormatter } from "@/lib/date/use-local-date-formatter";
import type { Message } from "../api/messages-api";
import { formatDate as formatDateBase } from "@/lib/date/format-date";

export function MessageRetryProgress({ message }: { message: Message }) {
  const formatDate = useLocalDateFormatter(formatDateBase);

  const progress = message.retryProgress;
  if (!progress?.attemptCount) return null;
  const pending = message.currentStatus === "ROUTED" && progress.latestAttemptStatus === "PENDING";
  return <div className="mt-1 text-xs text-slate-500">
    {pending ? (progress.routeSubmissionCount > 1 ? "Retry scheduled" : "Submission scheduled") : `${progress.attemptCount} submission${progress.attemptCount === 1 ? "" : "s"}`}
    {pending && progress.scheduledAt && <span className="block">{formatDate(progress.scheduledAt)}</span>}
  </div>;
}
