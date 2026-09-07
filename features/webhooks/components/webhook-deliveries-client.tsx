"use client";

import { ContextAwareBackLinks } from "@/components/ui/context-aware-back-links";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  findWebhookDeliveries,
  type Webhook,
  type WebhookDelivery,
} from "../api/webhooks-api";

import type { DataTableColumn } from "@/components/ui/data-table";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";

interface WebhookDeliveriesClientProps {
  clientId: string;
  webhook: Webhook;
  showPlatformBackLink: boolean;
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function getResponseTone(
  responseCode: number | null,
):
  | "success"
  | "warning"
  | "danger"
  | "neutral" {
  if (responseCode === null) {
    return "neutral";
  }

  if (
    responseCode >= 200 &&
    responseCode < 300
  ) {
    return "success";
  }

  if (
    responseCode >= 400 &&
    responseCode < 500
  ) {
    return "warning";
  }

  if (responseCode >= 500) {
    return "danger";
  }

  return "neutral";
}

function getResponseLabel(
  responseCode: number | null,
): string {
  if (responseCode === null) {
    return "No response";
  }

  return String(responseCode);
}

export function WebhookDeliveriesClient({
  clientId,
  webhook,
  showPlatformBackLink,
}: WebhookDeliveriesClientProps) {
  const searchParams =
    useSearchParams();

  const page = useMemo(() => {
    const value = Number(
      searchParams.get("page") ?? "1",
    );

    if (
      !Number.isInteger(value) ||
      value < 1
    ) {
      return 1;
    }

    return value;
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const value = Number(
      searchParams.get("pageSize") ?? "20",
    );

    if (
      !Number.isInteger(value) ||
      value < 1 ||
      value > 100
    ) {
      return 20;
    }

    return value;
  }, [searchParams]);

  const [
    deliveries,
    setDeliveries,
  ] = useState<WebhookDelivery[]>(
    [],
  );

  const [
    pagination,
    setPagination,
  ] = useState<
    | {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }
    | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const loadDeliveries =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          const result =
            await findWebhookDeliveries({
              clientId,
              webhookId:
                webhook.id,
              page,
              pageSize,
            });

          setDeliveries(
            result.data,
          );

          setPagination(
            result.pagination,
          );
        } catch (error) {
          console.error(
            "[WebhookDeliveries] Failed to load deliveries.",
            error,
          );

          setError(
            error instanceof Error
              ? error.message
              : "Unable to load webhook deliveries.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        clientId,
        page,
        pageSize,
        webhook.id,
      ],
    );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDeliveries();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadDeliveries]);

  const columns =
    useMemo<
      DataTableColumn<WebhookDelivery>[]
    >(
      () => [
        {
          key: "messageId",
          header: "Message ID",
          render: (
            delivery,
          ) => (
            <span
              className="font-mono text-xs text-slate-700"
              title={
                delivery.messageId
              }
            >
              {
                delivery.messageId
              }
            </span>
          ),
        },

        {
          key: "attemptNumber",
          header: "Attempt",
          render: (
            delivery,
          ) => (
            <span className="text-sm text-slate-700">
              #
              {
                delivery.attemptNumber
              }
            </span>
          ),
        },

        {
          key: "responseCode",
          header: "Response",
          render: (
            delivery,
          ) => (
            <StatusBadge
              tone={getResponseTone(
                delivery.responseCode,
              )}
              dot
            >
              {getResponseLabel(
                delivery.responseCode,
              )}
            </StatusBadge>
          ),
        },

        {
          key: "responseBody",
          header: "Response Body",
          render: (
            delivery,
          ) => {
            if (
              !delivery.responseBody
            ) {
              return (
                <span className="text-sm text-slate-400">
                  —
                </span>
              );
            }

            return (
              <span
                className="block max-w-sm truncate font-mono text-xs text-slate-600"
                title={
                  delivery.responseBody
                }
              >
                {
                  delivery.responseBody
                }
              </span>
            );
          },
        },

        {
          key: "attemptedAt",
          header: "Attempted",
          render: (
            delivery,
          ) => (
            <span className="whitespace-nowrap text-sm text-slate-600">
              {formatDate(
                delivery.attemptedAt,
              )}
            </span>
          ),
        },
      ],
      [],
    );

  const paginationMeta =
    useMemo(() => {
      if (!pagination) {
        return {
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        };
      }

      return {
        page:
          pagination.page,

        pageSize:
          pagination.pageSize,

        total:
          pagination.totalItems,

        totalPages:
          pagination.totalPages,
      };
    }, [
      page,
      pageSize,
      pagination,
    ]);

  return (
    <div className="px-6 pb-6 pt-6">
      {/* ================================================================== */}
      {/* Back Navigation                                                    */}
      {/* ================================================================== */}

      <div className="mb-6">
        <ContextAwareBackLinks showPlatformLink={showPlatformBackLink} platformHref="/webhooks" platformLabel="Back to Webhooks" clientHref={`/clients/${encodeURIComponent(clientId)}/webhooks`} clientLabel="Back to Client Webhooks" />
      </div>

      {/* ================================================================== */}
      {/* Header                                                              */}
      {/* ================================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Webhook Deliveries
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View delivery attempts
          for{" "}
          <span className="font-medium text-slate-700">
            {webhook.name}
          </span>
          .
        </p>
      </div>

      {/* ================================================================== */}
      {/* Webhook Summary                                                     */}
      {/* ================================================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Webhook
            </div>

            <div className="mt-1 font-medium text-slate-900">
              {webhook.name}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Endpoint
            </div>

            <div
              className="mt-1 truncate text-sm text-slate-700"
              title={webhook.url}
            >
              {webhook.url}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </div>

            <div className="mt-1">
              <StatusBadge
                tone={
                  webhook.enabled
                    ? "success"
                    : "neutral"
                }
                dot
              >
                {webhook.enabled
                  ? "Enabled"
                  : "Disabled"}
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Content                                                             */}
      {/* ================================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white">
        {error ? (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading &&
          !error &&
          deliveries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-sm font-medium text-slate-900">
              No deliveries yet
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Webhook delivery
              attempts will appear
              here once
              notifications are sent.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <DataTable
                columns={columns}
                rows={deliveries}
                getRowKey={(
                  delivery,
                ) =>
                  delivery.id
                }
              />
            </div>

            {!loading &&
              pagination &&
              pagination.totalPages >
              1 ? (
              <div className="border-t border-slate-200 px-5 py-4">
                <Pagination
                  meta={
                    paginationMeta
                  }
                />
              </div>
            ) : null}
          </>
        )}

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({
              length: 5,
            }).map(
              (
                _,
                index,
              ) => (
                <div
                  key={index}
                  className="h-10 animate-pulse rounded-lg bg-slate-100"
                />
              ),
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
