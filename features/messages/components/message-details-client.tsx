"use client";

import Link from "next/link";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import {
  ContextAwareBackLinks,
} from "@/components/ui/context-aware-back-links";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import type {
  Client,
} from "@/features/clients/api/clients-api";

import type {
  Message,
  MessageStatus,
  MessageStatusEvent,
} from "@/features/messages/api/messages-api";

import {
  formatDate,
} from "@/lib/date/format-date";

// ============================================================================
// Types
// ============================================================================

interface MessageDetailsClientProps {
  readonly client: Client;

  readonly message: Message;

  readonly statusEvents: MessageStatusEvent[];

  readonly showPlatformBackLink: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function MessageDetailsClient({
  client,
  message,
  statusEvents,
  showPlatformBackLink,
}: MessageDetailsClientProps) {
  const clientName =
    client.displayName ||
    client.companyName;

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      {/* ====================================================================
          Header
      ===================================================================== */}

      <PageHeader
        title="Message details"
        description={`View message ${message.publicId}.`}
      >
        <ContextAwareBackLinks
          showPlatformLink={showPlatformBackLink}
          platformHref="/messages"
          platformLabel="Back to Messages"
          clientHref={`/clients/${encodeURIComponent(client.id)}/messages`}
          clientLabel="Back to Client Messages"
        />
      </PageHeader>

      {/* ====================================================================
          Breadcrumb / Context
      ===================================================================== */}

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Client
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Link
              href={`/clients/${encodeURIComponent(
                client.id,
              )}`}
              className="truncate text-sm font-semibold text-slate-900 transition hover:text-blue-600"
            >
              {clientName}
            </Link>

            <span className="font-mono text-xs text-slate-400">
              {client.publicId}
            </span>
          </div>
        </div>

      </div>

      {/* ====================================================================
          Message summary
      ===================================================================== */}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ==================================================================
            Main message
        =================================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Message
                </p>

                <p className="mt-1 font-mono text-sm font-semibold text-slate-900">
                  {message.publicId}
                </p>
              </div>

              <MessageStatusBadge
                status={
                  message.currentStatus
                }
              />
            </div>
          </div>

          <div className="px-5 py-5">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Message body
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                {message.body}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================
            Message information
        =================================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Message information
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            <DetailRow
              label="Destination"
              value={
                <span className="font-mono">
                  {message.destination}
                </span>
              }
            />

            <DetailRow
              label="Sender ID"
              value={
                message.senderId ? (
                  <span className="font-mono text-xs">
                    {message.senderId.sender}
                  </span>
                ) : (
                  "—"
                )
              }
            />

            <DetailRow
              label="Encoding"
              value={
                formatEncoding(
                  message.encoding,
                )
              }
            />

            <DetailRow
              label="Segments"
              value={
                message.segmentCount
              }
            />

            <DetailRow
              label="Submitted"
              value={
                formatDate(
                  message.submittedAt,
                )
              }
            />

            <DetailRow
              label="Created"
              value={
                formatDate(
                  message.createdAt,
                )
              }
            />

            <DetailRow
              label="Updated"
              value={
                formatDate(
                  message.updatedAt,
                )
              }
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          Status timeline
      ===================================================================== */}

      <div className="mt-4 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Message timeline
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Status events recorded during message processing.
              </p>
            </div>

            <span className="text-xs text-slate-400">
              {statusEvents.length}{" "}
              {statusEvents.length ===
                1
                ? "event"
                : "events"}
            </span>
          </div>
        </div>

        {statusEvents.length ===
          0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-slate-500">
              No status events have been recorded yet.
            </p>
          </div>
        ) : (
          <div className="px-5 py-5">
            <div className="relative">
              {statusEvents.map(
                (
                  event,
                  index,
                ) => {
                  const isLast =
                    index ===
                    statusEvents.length -
                    1;

                  return (
                    <div
                      key={
                        event.id
                      }
                      className="relative flex gap-4"
                    >
                      {!isLast && (
                        <div className="absolute left-[7px] top-5 h-full w-px bg-slate-200" />
                      )}

                      <div className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white bg-slate-300 ring-1 ring-slate-200" />

                      <div
                        className={`min-w-0 flex-1 ${isLast
                          ? "pb-0"
                          : "pb-7"
                          }`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <MessageStatusBadge
                              status={
                                event.status
                              }
                            />

                            <span className="text-xs font-medium text-slate-500">
                              {event.source}
                            </span>
                          </div>

                          <span className="whitespace-nowrap text-xs text-slate-400">
                            {formatDate(
                              event.createdAt,
                            )}
                          </span>
                        </div>

                        {event.description && (
                          <p className="mt-2 text-sm leading-5 text-slate-600">
                            {
                              event.description
                            }
                          </p>
                        )}

                        {event.attemptId && (
                          <p className="mt-2 font-mono text-[11px] text-slate-400">
                            Attempt:{" "}
                            {
                              event.attemptId
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          Technical identifiers
      ===================================================================== */}

      <div className="mt-4 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Technical identifiers
          </h2>
        </div>

        <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <DetailRow
            label="Public Message ID"
            value={
              <span className="break-all font-mono text-xs">
                {message.publicId}
              </span>
            }
          />

          <DetailRow
            label="Client ID"
            value={
              <span className="break-all font-mono text-xs">
                {message.client.displayName}
              </span>
            }
          />
        </div>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Detail row
// ============================================================================

function DetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5">
      <span className="shrink-0 text-xs text-slate-500">
        {label}
      </span>

      <span className="min-w-0 text-right text-sm font-medium text-slate-700">
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// Status badge
// ============================================================================

function MessageStatusBadge({
  status,
}: {
  readonly status: MessageStatus;
}) {
  const configuration:
    Record<
      MessageStatus,
      {
        label: string;
        tone:
        | "success"
        | "warning"
        | "danger"
        | "info"
        | "neutral";
      }
    > = {
    QUEUED: {
      label: "Queued",
      tone: "info",
    },

    ROUTED: {
      label: "Routed",
      tone: "info",
    },

    SUBMITTED: {
      label: "Submitted",
      tone: "warning",
    },

    DELIVERED: {
      label: "Delivered",
      tone: "success",
    },

    FAILED: {
      label: "Failed",
      tone: "danger",
    },

    EXPIRED: {
      label: "Expired",
      tone: "danger",
    },
  };

  const item =
    configuration[status];

  return (
    <StatusBadge
      tone={item.tone}
      dot
    >
      {item.label}
    </StatusBadge>
  );
}

// ============================================================================
// Encoding
// ============================================================================

function formatEncoding(
  encoding: Message["encoding"],
): string {
  switch (encoding) {
    case "GSM7":
      return "GSM-7";

    case "UCS2":
      return "UCS-2";

    case "BINARY":
      return "Binary";

    default:
      return encoding;
  }
}
