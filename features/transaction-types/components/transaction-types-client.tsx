"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FilterBar, FilterSearch, FilterSelect } from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { SortButton } from "@/components/ui/sort-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";

import {
  disableTransactionType,
  enableTransactionType,
} from "@/features/transaction-types/api/transaction-types-api";

import type {
  TransactionType,
  TransactionTypeListMeta,
} from "@/features/transaction-types/types/transaction-type.types";

interface TransactionTypesClientProps {
  initialItems: TransactionType[];
  initialMeta: TransactionTypeListMeta;
  permissions: {
    canCreate: boolean;
    canUpdate: boolean;
    canEnable: boolean;
    canDisable: boolean;
  };
}

type PendingAction =
  | {
    type: "enable" | "disable";
    transactionType: TransactionType;
  }
  | null;

const ACTIVE_OPTIONS = [
  {
    value: "true",
    label: "Active",
  },
  {
    value: "false",
    label: "Disabled",
  },
];

export default function TransactionTypesClient({
  initialItems,
  initialMeta,
  permissions,
}: TransactionTypesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  const {
    success,
    error: showError,
  } = useToast();

  const [items, setItems] =
    useState(initialItems);

  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);

  const [processing, setProcessing] =
    useState(false);

  function updateParams(
    updates: Record<
      string,
      string | null
    >,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    for (const [key, value] of Object.entries(
      updates,
    )) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    params.delete("page");

    router.push(
      `${pathname}?${params.toString()}`,
    );
  }

  function handleRowClick(
    transactionType: TransactionType,
  ) {
    router.push(
      `/transaction-types/${encodeURIComponent(
        transactionType.id,
      )}`,
    );
  }

  function openEnable(
    transactionType: TransactionType,
  ) {
    setPendingAction({
      type: "enable",
      transactionType,
    });
  }

  function openDisable(
    transactionType: TransactionType,
  ) {
    setPendingAction({
      type: "disable",
      transactionType,
    });
  }

  async function handleConfirmAction() {
    if (!pendingAction) {
      return;
    }

    setProcessing(true);

    try {
      const updated =
        pendingAction.type === "enable"
          ? await enableTransactionType(
            pendingAction.transactionType.id,
          )
          : await disableTransactionType(
            pendingAction.transactionType.id,
          );

      setItems((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );

      success(
        pendingAction.type === "enable"
          ? "Transaction type enabled."
          : "Transaction type disabled.",
        `${updated.name} is now ${updated.active
          ? "active"
          : "disabled"
        }.`,
      );

      setPendingAction(null);
    } catch (error) {
      showError(
        pendingAction.type === "enable"
          ? "Failed to enable transaction type."
          : "Failed to disable transaction type.",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setProcessing(false);
    }
  }

  const columns = [
    {
      key: "code",
      header: (
        <SortButton
          field="code"
          label="Code"
        />
      ),
      render: (
        transactionType: TransactionType,
      ) => (
        <span className="font-mono text-sm font-medium">
          {transactionType.code}
        </span>
      ),
    },
    {
      key: "name",
      header: (
        <SortButton
          field="name"
          label="Name"
        />
      ),
      render: (
        transactionType: TransactionType,
      ) => (
        <span className="font-medium">
          {transactionType.name}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (
        transactionType: TransactionType,
      ) => (
        <span className="text-muted-foreground">
          {transactionType.description ||
            "—"}
        </span>
      ),
    },
    {
      key: "active",
      header: (
        <SortButton
          field="active"
          label="Status"
        />
      ),
      render: (
        transactionType: TransactionType,
      ) => (
        <StatusBadge
          tone={
            transactionType.active
              ? "success"
              : "neutral"
          }
          dot
        >
          {transactionType.active
            ? "Active"
            : "Disabled"}
        </StatusBadge>
      ),
    },
    {
      key: "updatedAt",
      header: (
        <SortButton
          field="updatedAt"
          label="Updated"
        />
      ),
      render: (
        transactionType: TransactionType,
      ) =>
        new Date(
          transactionType.updatedAt,
        ).toLocaleString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (
        transactionType: TransactionType,
      ) => (
        <div
          className="flex items-center gap-2"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          {permissions.canUpdate && (
            <Link
              href={`/transaction-types/${encodeURIComponent(
                transactionType.id,
              )}/edit`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Edit
            </Link>
          )}

          {transactionType.active
            ? permissions.canDisable && (
              <button
                type="button"
                className="text-sm font-medium text-destructive hover:underline"
                onClick={() =>
                  openDisable(
                    transactionType,
                  )
                }
              >
                Disable
              </button>
            )
            : permissions.canEnable && (
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
                onClick={() =>
                  openEnable(
                    transactionType,
                  )
                }
              >
                Enable
              </button>
            )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Transaction Types"
          description="Manage the transaction types supported by the payment platform."
        />

        {permissions.canCreate && (
          <Link
            href="/transaction-types/new"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Add Transaction Type
          </Link>
        )}
      </div>

      <FilterBar>
        <FilterSearch
          name="search"
          placeholder="Search transaction types..."
          defaultValue={
            searchParams.get("search") ??
            ""
          }
        />

        <FilterSelect
          name="active"
          placeholder="All statuses"
          options={ACTIVE_OPTIONS}
        />
      </FilterBar>

      {items.length === 0 ? (
        searchParams.get("search") ||
          searchParams.get("active") ? (
          <ErrorState
            title="No transaction types found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <EmptyState
            title="No transaction types"
            description="There are no transaction types in the catalogue yet."
          >
            {permissions.canCreate && (
              <Link
                href="/transaction-types/new"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add Transaction Type
              </Link>
            )}
          </EmptyState>
        )
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            getRowKey={(
              transactionType,
            ) => transactionType.id}
            onRowClick={
              handleRowClick
            }
          />

          <Pagination
            meta={initialMeta}
          />
        </>
      )}

      <ConfirmModal
        open={pendingAction !== null}
        title={
          pendingAction?.type ===
            "enable"
            ? "Enable transaction type?"
            : "Disable transaction type?"
        }
        description={
          pendingAction
            ? `${pendingAction.transactionType.name
            } will be ${pendingAction.type ===
              "enable"
              ? "enabled"
              : "disabled"
            }.`
            : ""
        }
        confirmLabel={
          pendingAction?.type ===
            "enable"
            ? "Enable"
            : "Disable"
        }
        confirmingLabel={
          pendingAction?.type ===
            "enable"
            ? "Enabling..."
            : "Disabling..."
        }
        confirming={processing}
        destructive={
          pendingAction?.type ===
          "disable"
        }
        onConfirm={
          handleConfirmAction
        }
        onCancel={() =>
          !processing &&
          setPendingAction(null)
        }
      />
    </PageContainer>
  );
}