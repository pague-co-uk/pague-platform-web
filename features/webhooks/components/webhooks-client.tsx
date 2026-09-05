"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import {
  FilterBar,
  FilterSelect,
} from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";

import type {
  Webhook,
  WebhookPagination,
} from "../api/webhooks-api";

interface ClientOption {
  id: string;
  publicId: string;
  companyName: string;
  displayName: string;
}

interface WebhooksClientProps {
  client?: ClientOption;
  clients?: ClientOption[];
  webhooks: Webhook[];
  pagination: WebhookPagination | null;
  canCreateWebhooks: boolean;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function WebhooksClient({
  client,
  clients = [],
  webhooks = [],
  pagination,
  canCreateWebhooks,
}: WebhooksClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const clientId = client?.id ?? searchParams.get("clientId") ?? "";

  const selectedClient = useMemo(
    () => client ?? clients.find((entry) => entry.id === clientId),
    [client, clients, clientId],
  );

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.id,
        label: client.displayName
          ? `${client.displayName} (${client.publicId})`
          : `${client.companyName} (${client.publicId})`,
      })),
    [clients],
  );

  const columns: DataTableColumn<Webhook>[] = [
    {
      key: "name",
      header: "Name",
      render: (webhook) => (
        <div className="min-w-0">
          <div className="truncate font-medium text-slate-900">
            {webhook.name}
          </div>

          <div className="truncate text-xs text-slate-500">
            {webhook.publicId}
          </div>
        </div>
      ),
    },
    {
      key: "url",
      header: "Endpoint",
      render: (webhook) => (
        <span className="block max-w-md truncate text-sm text-slate-600">
          {webhook.url}
        </span>
      ),
    },
    {
      key: "enabled",
      header: "Status",
      render: (webhook) =>
        webhook.enabled ? (
          <StatusBadge tone="success" dot>
            Enabled
          </StatusBadge>
        ) : (
          <StatusBadge tone="neutral" dot>
            Disabled
          </StatusBadge>
        ),
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (webhook) => (
        <span className="text-sm text-slate-600">
          {formatDate(webhook.updatedAt)}
        </span>
      ),
    },
  ];

  function handleClientChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("clientId", value);
    } else {
      params.delete("clientId");
    }

    params.delete("page");

    router.push(`/clients/${encodeURIComponent(value)}/webhooks?${params.toString()}`);
  }

  if (!client && !clients.length && !clientId) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">
          No clients available
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          A client must exist before a webhook endpoint can be configured.
        </p>
      </div>
    );
  }

  const paginationMeta = pagination
    ? {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.totalItems,
      totalPages: pagination.totalPages,
    }
    : {
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
    };

  return (
    <div className="space-y-6 px-6 pt-6 pb-6">
      {!client ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <label
                htmlFor="webhook-client"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Client
              </label>

              <select
                id="webhook-client"
                value={clientId}
                onChange={(event) =>
                  handleClientChange(event.target.value)
                }
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a client</option>

                {clientOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {clientId && canCreateWebhooks ? (
              <Link
                href={`/clients/${encodeURIComponent(clientId)}/webhooks/create`}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Create Webhook
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Client
              </p>

              <div className="mt-1 flex items-center gap-2">
                <Link
                  href={`/clients/${encodeURIComponent(client.id)}`}
                  className="text-sm font-semibold text-slate-900 transition hover:text-blue-600"
                >
                  {client.displayName || client.companyName}
                </Link>

                <span className="font-mono text-xs text-slate-400">
                  {client.publicId}
                </span>
              </div>
            </div>

            {canCreateWebhooks ? (
              <Link
                href={`/clients/${encodeURIComponent(client.id)}/webhooks/create`}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Create Webhook
              </Link>
            ) : null}
          </div>
        </div>
      )}

      {!clientId ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-sm font-semibold text-slate-900">
            Select a client
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a client above to view and manage its webhook endpoint.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {selectedClient?.displayName ||
                  selectedClient?.companyName ||
                  "Webhook endpoint"}
              </h2>

              {selectedClient ? (
                <p className="text-sm text-slate-500">
                  {selectedClient.publicId}
                </p>
              ) : null}
            </div>
          </div>

          <FilterBar resetParams={["page"]}>
            <FilterSelect
              name="enabled"
              placeholder="All statuses"
              options={[
                {
                  value: "true",
                  label: "Enabled",
                },
                {
                  value: "false",
                  label: "Disabled",
                },
              ]}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            rows={webhooks}
            getRowKey={(webhook) => webhook.id}
            onRowClick={(webhook) =>
              router.push(
                `/clients/${encodeURIComponent(
                  clientId,
                )}/webhooks/${encodeURIComponent(webhook.id)}`,
              )
            }
          />

          {pagination && pagination.totalPages > 1 ? (
            <Pagination meta={paginationMeta} />
          ) : null}
        </>
      )}
    </div>
  );
}