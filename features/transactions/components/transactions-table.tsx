"use client";

import Link from "next/link";

import {
  DataTable,
} from "@/components/ui/data-table";

import {
  SortButton,
} from "@/components/ui/sort-button";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  Pagination,
} from "@/components/ui/pagination";

import type {
  Transaction,
  TransactionListMeta,
} from "../types/transaction";

interface TransactionsTableProps {
  readonly transactions: Transaction[];
  readonly meta: TransactionListMeta;
}

function getStatusTone(
  status: Transaction["status"],
) {
  switch (status) {
    case "SUCCESS":
      return "success";

    case "FAILED":
    case "REVERSED":
    case "CANCELLED":
      return "danger";

    case "PROCESSING":
      return "warning";

    case "PENDING":
    default:
      return "neutral";
  }
}

function formatAmount(
  transaction: Transaction,
): string {
  try {
    return new Intl.NumberFormat(
      "en-GB",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      },
    ).format(
      Number(transaction.amount),
    );
  } catch {
    return transaction.amount;
  }
}

const columns = [
  {
    key: "publicId",
    header: (
      <SortButton
        field="publicId"
        label="Transaction"
      />
    ),
    render: (
      transaction: Transaction,
    ) => (
      <Link
        href={`/transactions/${encodeURIComponent(
          transaction.id,
        )}`}
        className="font-medium text-slate-950 hover:text-slate-700"
      >
        {transaction.publicId}
      </Link>
    ),
  },

  {
    key: "client",
    header: "Client",
    render: (
      transaction: Transaction,
    ) => (
      <div>
        <div className="font-medium text-slate-900">
          {transaction.clientName}
        </div>

        <div className="text-xs text-slate-500">
          {transaction.serviceCode}
        </div>
      </div>
    ),
  },

  {
    key: "reference",
    header: "Reference",
    render: (
      transaction: Transaction,
    ) => (
      <div className="max-w-48 truncate text-sm text-slate-700">
        {transaction.reference}
      </div>
    ),
  },

  {
    key: "amount",
    header: (
      <SortButton
        field="amount"
        label="Amount"
      />
    ),
    render: (
      transaction: Transaction,
    ) => (
      <div className="whitespace-nowrap text-right font-medium text-slate-900">
        {transaction.currencyCode}{" "}
        {formatAmount(transaction)}
      </div>
    ),
  },

  {
    key: "provider",
    header: "Provider",
    render: (
      transaction: Transaction,
    ) => (
      <div>
        <div className="text-sm text-slate-900">
          {transaction.providerName ??
            "—"}
        </div>

        {transaction.providerServiceExternalCode && (
          <div className="text-xs text-slate-500">
            {
              transaction.providerServiceExternalCode
            }
          </div>
        )}
      </div>
    ),
  },

  {
    key: "status",
    header: (
      <SortButton
        field="status"
        label="Status"
      />
    ),
    render: (
      transaction: Transaction,
    ) => (
      <StatusBadge
        tone={getStatusTone(
          transaction.status,
        )}
        dot
      >
        {transaction.status}
      </StatusBadge>
    ),
  },

  {
    key: "createdAt",
    header: (
      <SortButton
        field="createdAt"
        label="Created"
        defaultDirection="desc"
      />
    ),
    render: (
      transaction: Transaction,
    ) =>
      new Intl.DateTimeFormat(
        "en-GB",
        {
          dateStyle: "medium",
          timeStyle: "short",
        },
      ).format(
        new Date(transaction.createdAt),
      ),
  },
];

export function TransactionsTable({
  transactions,
  meta,
}: TransactionsTableProps) {
  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={transactions}
        getRowKey={(transaction) =>
          transaction.id
        }
        onRowClick={(transaction) => {
          window.location.href =
            `/transactions/${encodeURIComponent(
              transaction.id,
            )}`;
        }}
      />

      <Pagination meta={meta} />
    </div>
  );
}