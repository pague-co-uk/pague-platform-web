"use client";

import Link from "next/link";
import { useState } from "react";

import {
  PageContainer,
} from "@/components/layout/page-container";


import {
  StatusBadge,
} from "@/components/ui/status-badge";

import type {
  AuditLog,
} from "@/features/audit-logs/api/audit-logs-api";

import { PageHeader } from "@/components/layout/page-header";
import { formatDate } from "@/lib/date/format-date";

interface AuditLogDetailsClientProps {
  readonly auditLog: AuditLog;
}

type StatusTone =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "neutral";

type JsonRecord = Record<string, unknown>;

// ============================================================================
// Formatting
// ============================================================================

function parseJsonValue(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatJson(value: unknown): string {
  const parsed = parseJsonValue(value);

  if (parsed === null || parsed === undefined) {
    return "";
  }

  if (typeof parsed === "string") {
    return parsed;
  }

  try {
    return JSON.stringify(parsed, null, 2);
  } catch {
    return String(parsed);
  }
}

// ============================================================================
// Audit action → badge tone + accent color for the "Event" rail
// ============================================================================

function toneForAction(action: string): StatusTone {
  const normalized = action.toLowerCase();

  if (/(create|invite|added|grant|granted)/.test(normalized)) {
    return "success";
  }

  if (/(delete|remove|revoke|denied)/.test(normalized)) {
    return "danger";
  }

  if (/(update|edit|change|reset)/.test(normalized)) {
    return "warning";
  }

  if (/(login|view|read|access)/.test(normalized)) {
    return "info";
  }

  return "neutral";
}

const ACCENT_BY_TONE: Record<StatusTone, string> = {
  success: "bg-emerald-500",
  danger: "bg-red-500",
  warning: "bg-amber-500",
  info: "bg-blue-500",
  neutral: "bg-slate-400",
};

// ============================================================================
// Change detection
// ============================================================================

function isRecord(value: unknown): value is JsonRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function changedKeys(
  oldValue: unknown,
  newValue: unknown,
): Set<string> {
  const oldParsed = parseJsonValue(oldValue);
  const newParsed = parseJsonValue(newValue);

  if (!isRecord(oldParsed) || !isRecord(newParsed)) {
    return new Set();
  }

  const keys = new Set([
    ...Object.keys(oldParsed),
    ...Object.keys(newParsed),
  ]);

  const changed = new Set<string>();

  for (const key of keys) {
    if (
      JSON.stringify(oldParsed[key]) !==
      JSON.stringify(newParsed[key])
    ) {
      changed.add(key);
    }
  }

  return changed;
}

// ============================================================================
// Copy button
// ============================================================================

function CopyButton({
  value,
}: {
  readonly value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard access may be unavailable.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      title={copied ? "Copied" : "Copy"}
    >
      {copied ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path
            d="M20 6 9 17l-5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect
            x="9"
            y="9"
            width="12"
            height="12"
            rx="2"
          />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
    </button>
  );
}

// ============================================================================
// Field
// ============================================================================

function Field({
  label,
  value,
  mono = false,
  copyable = false,
}: {
  readonly label: string;
  readonly value: string | null | undefined;
  readonly mono?: boolean;
  readonly copyable?: boolean;
}) {
  const hasValue = Boolean(value);

  return (
    <div className="min-w-0 space-y-1.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>

      <dd className="flex min-w-0 items-start gap-1.5">
        {mono ? (
          <span
            className={[
              "min-w-0 truncate rounded-md px-2 py-1 font-mono text-xs",
              hasValue
                ? "bg-slate-100 text-slate-700"
                : "text-slate-400",
            ].join(" ")}
          >
            {value || "Not recorded"}
          </span>
        ) : (
          <span
            className={[
              "min-w-0 break-words text-sm font-medium",
              hasValue
                ? "text-slate-900"
                : "text-slate-400",
            ].join(" ")}
          >
            {value || "Not recorded"}
          </span>
        )}

        {copyable && hasValue ? (
          <CopyButton value={value!} />
        ) : null}
      </dd>
    </div>
  );
}

// ============================================================================
// Section
// ============================================================================

function SectionCard({
  title,
  description,
  accent,
  children,
}: {
  readonly title: string;
  readonly description: string;
  readonly accent?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
        {accent ? (
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${accent}`}
          />
        ) : null}

        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

// ============================================================================
// JSON panel
// ============================================================================

function JsonPanel({
  title,
  value,
  changed,
  variant,
  emptyLabel,
}: {
  readonly title: string;
  readonly value: unknown;
  readonly changed: Set<string>;
  readonly variant: "old" | "new";
  readonly emptyLabel: string;
}) {
  const formatted = formatJson(value);

  const changedLineClass =
    variant === "old"
      ? "bg-red-50 text-red-900"
      : "bg-emerald-50 text-emerald-900";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-slate-700">
          {title}
        </h3>

        {changed.size > 0 ? (
          <span
            className={[
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              variant === "old"
                ? "bg-red-100 text-red-700"
                : "bg-emerald-100 text-emerald-700",
            ].join(" ")}
          >
            {changed.size} changed
          </span>
        ) : null}
      </div>

      {formatted ? (
        <pre className="max-h-[420px] overflow-auto bg-white p-0 font-mono text-xs leading-6">
          {formatted.split("\n").map((line, index) => {
            const key =
              line.match(/^\s*"([^"]+)":/)?.[1];

            const isChanged = key
              ? changed.has(key)
              : false;

            return (
              <div
                key={index}
                className={[
                  "px-4 py-px",
                  isChanged
                    ? changedLineClass
                    : "text-slate-700",
                ].join(" ")}
              >
                {line}
              </div>
            );
          })}
        </pre>
      ) : (
        <div className="bg-white p-4">
          <p className="text-sm text-slate-400">
            {emptyLabel}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function AuditLogDetailsClient({
  auditLog,
}: AuditLogDetailsClientProps) {
  const changed = changedKeys(
    auditLog.oldValues,
    auditLog.newValues,
  );

  const tone = toneForAction(auditLog.action);

  const changeDescription =
    changed.size > 0
      ? `${changed.size} field${changed.size === 1 ? "" : "s"} differ between the previous and resulting state.`
      : "Previous and resulting values recorded for this event.";

  return (
    <PageContainer>
      <PageHeader
        title="Audit log details"
        description={`${auditLog.entityType} · ${formatDate(auditLog.createdAt)}`}
      >
        <Link
          href="/audit"
          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Back to audit logs
        </Link>
      </PageHeader>

      <div className="space-y-6">
        {/* Event */}
        <SectionCard
          title="Event"
          description="Core information about this audit event."
          accent={ACCENT_BY_TONE[tone]}
        >
          <dl className="grid gap-x-8 gap-y-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Action
              </dt>

              <dd>
                <StatusBadge tone={tone}>
                  {auditLog.action}
                </StatusBadge>
              </dd>
            </div>

            <Field
              label="Created"
              value={formatDate(auditLog.createdAt)}
            />

            <Field
              label="Entity type"
              value={auditLog.entityType}
            />

            <Field
              label="Audit ID"
              value={auditLog.id}
              mono
              copyable
            />

            <Field
              label="Entity ID"
              value={auditLog.entityId}
              mono
              copyable
            />

            <Field
              label="Client ID"
              value={auditLog.clientId}
              mono
              copyable
            />

            <Field
              label="User ID"
              value={auditLog.userId}
              mono
              copyable
            />
          </dl>
        </SectionCard>

        {/* Changes */}
        <SectionCard
          title="Changes"
          description={changeDescription}
        >
          <div className="grid gap-5 p-6 lg:grid-cols-2">
            <JsonPanel
              title="Previous values"
              value={auditLog.oldValues}
              changed={changed}
              variant="old"
              emptyLabel="No previous values recorded."
            />

            <JsonPanel
              title="New values"
              value={auditLog.newValues}
              changed={changed}
              variant="new"
              emptyLabel="No new values recorded."
            />
          </div>
        </SectionCard>

        {/* Request context */}
        <SectionCard
          title="Request context"
          description="Request-origin information captured with the audit event."
        >
          <dl className="grid gap-x-8 gap-y-6 px-6 py-6 sm:grid-cols-2">
            <Field
              label="IP address"
              value={auditLog.ipAddress}
              mono
              copyable
            />

            <Field
              label="User agent"
              value={auditLog.userAgent}
            />
          </dl>
        </SectionCard>
      </div>
    </PageContainer>
  );
}