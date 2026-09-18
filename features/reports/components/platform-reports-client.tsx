"use client";

import { useCallback, useState } from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

import type {
  ClientSummary,
} from "@/features/clients/api/clients-api";

import { FloatLedgerReport } from "./float-ledger-report";
import { MessageReport } from "./message-report";
import { RoutePerformanceReport } from "./route-performance-report";

// ============================================================================
// Types
// ============================================================================

interface PlatformReportsClientProps {
  readonly clients: readonly ClientSummary[];
}

// ============================================================================
// Component
// ============================================================================

export default function PlatformReportsClient({
  clients,
}: PlatformReportsClientProps) {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const initialClientId =
    searchParams.get(
      "clientId",
    ) ?? "";

  const [clientId, setClientId] =
    useState(initialClientId);

  // ==========================================================================
  // Client selection
  // ==========================================================================

  const handleClientChange =
    useCallback(
      (
        value: string,
      ) => {
        setClientId(value);

        const params =
          new URLSearchParams(
            searchParams.toString(),
          );

        if (value) {
          params.set(
            "clientId",
            value,
          );
        } else {
          params.delete(
            "clientId",
          );
        }

        router.replace(
          `/reports${params.toString()
            ? `?${params.toString()}`
            : ""
          }`,
        );
      },
      [
        router,
        searchParams,
      ],
    );

  // ==========================================================================
  // Selected client
  // ==========================================================================

  const selectedClient =
    clients.find(
      (client) =>
        client.id ===
        clientId,
    );

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        description="View and export messaging, routing, and float activity reports."
      />

      {/* ====================================================================
          Client context
      ===================================================================== */}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              Client
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {selectedClient
                ? selectedClient.displayName ||
                selectedClient.companyName
                : "Select a client"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Select a client to view and export their reports.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <label
              htmlFor="reports-client"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Client
            </label>

            <select
              id="reports-client"
              value={clientId}
              onChange={(event) =>
                handleClientChange(
                  event.target.value,
                )
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                text-sm
                text-slate-900
                outline-none
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            >
              <option value="">
                Select a client
              </option>

              {clients.map(
                (client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.displayName ||
                      client.companyName}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ====================================================================
          Reports
      ===================================================================== */}

      {clientId ? (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Messages
            </h2>

            <MessageReport
              clientId={clientId}
            />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Route Performance
            </h2>

            <RoutePerformanceReport
              clientId={clientId}
            />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Float Ledger
            </h2>

            <FloatLedgerReport
              clientId={clientId}
            />
          </section>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-sm font-semibold text-slate-900">
            Select a client
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a client above to view their messaging, routing, and float
            reports.
          </p>
        </div>
      )}
    </PageContainer>
  );
}