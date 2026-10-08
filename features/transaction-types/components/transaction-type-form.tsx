"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  ContextAwareBackLinks,
} from "@/components/ui/context-aware-back-links";

import {
  useToast,
} from "@/components/ui/toast";

import {
  createTransactionType,
  updateTransactionType,
} from "@/features/transaction-types/api/transaction-types-api";

import type {
  CreateTransactionTypePayload,
  TransactionType,
  UpdateTransactionTypePayload,
} from "@/features/transaction-types/types/transaction-type.types";

interface TransactionTypeFormProps {
  readonly mode: "create" | "edit";
  readonly transactionType?: TransactionType;
}

const TRANSACTION_TYPE_CODE_PATTERN =
  /^[A-Z][A-Z0-9_]*$/;

export default function TransactionTypeForm({
  mode,
  transactionType,
}: TransactionTypeFormProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const isEdit = mode === "edit";

  const [
    code,
    setCode,
  ] = useState(
    transactionType?.code ?? "",
  );

  const [
    name,
    setName,
  ] = useState(
    transactionType?.name ?? "",
  );

  const [
    description,
    setDescription,
  ] = useState(
    transactionType?.description ?? "",
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState<string | null>(null);

  const backHref = isEdit
    ? `/transaction-types/${encodeURIComponent(
      transactionType?.id ?? "",
    )}`
    : "/transaction-types";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setFormError(null);

    const normalizedCode =
      code.trim().toUpperCase();

    const normalizedName =
      name.trim();

    const normalizedDescription =
      description.trim();

    if (!isEdit) {
      if (!normalizedCode) {
        setFormError(
          "Transaction type code is required.",
        );
        return;
      }

      if (
        normalizedCode.length > 50
      ) {
        setFormError(
          "Code must not exceed 50 characters.",
        );
        return;
      }

      if (
        !TRANSACTION_TYPE_CODE_PATTERN.test(
          normalizedCode,
        )
      ) {
        setFormError(
          "Code must start with an uppercase letter and contain only uppercase letters, numbers, and underscores.",
        );
        return;
      }
    }

    if (!normalizedName) {
      setFormError(
        "Transaction type name is required.",
      );
      return;
    }

    if (
      normalizedName.length > 100
    ) {
      setFormError(
        "Name must not exceed 100 characters.",
      );
      return;
    }

    if (
      normalizedDescription.length >
      255
    ) {
      setFormError(
        "Description must not exceed 255 characters.",
      );
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        if (!transactionType) {
          throw new Error(
            "Transaction type is required for editing.",
          );
        }

        const payload:
          UpdateTransactionTypePayload =
        {
          name: normalizedName,
          ...(normalizedDescription
            ? {
              description:
                normalizedDescription,
            }
            : {}),
        };

        const updated =
          await updateTransactionType(
            transactionType.id,
            payload,
          );

        success(
          "Transaction type updated.",
          `${updated.name} has been updated successfully.`,
        );

        router.push(
          `/transaction-types/${encodeURIComponent(
            updated.id,
          )}`,
        );

        return;
      }

      const payload:
        CreateTransactionTypePayload =
      {
        code: normalizedCode,
        name: normalizedName,
        ...(normalizedDescription
          ? {
            description:
              normalizedDescription,
          }
          : {}),
      };

      const created =
        await createTransactionType(
          payload,
        );

      success(
        "Transaction type created.",
        `${created.name} has been added to the transaction type catalogue.`,
      );

      router.push(
        `/transaction-types/${encodeURIComponent(
          created.id,
        )}`,
      );
    } catch (error) {
      showError(
        isEdit
          ? "Failed to update transaction type."
          : "Failed to create transaction type.",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <ContextAwareBackLinks
          clientHref={backHref}
          clientLabel={
            isEdit
              ? "Back to transaction type"
              : "Back to transaction types"
          }
          showPlatformLink={false}
        />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {isEdit
              ? "Edit Transaction Type"
              : "Create Transaction Type"}
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {isEdit
              ? "Update the transaction type details used by the payment platform."
              : "Add a transaction type to the payment platform catalogue."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Transaction type details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {isEdit
                    ? "Update the display information for this transaction type."
                    : "Define the identity and description of this transaction type."}
                </p>
              </div>
            </div>

            <div className="space-y-7 p-6">
              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3"
                >
                  <p className="text-sm font-medium text-red-800">
                    Unable to save transaction type
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-700">
                    {formError}
                  </p>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Code
                  </label>

                  <input
                    id="code"
                    name="code"
                    type="text"
                    value={code}
                    onChange={(event) => {
                      setCode(
                        event.target.value.toUpperCase(),
                      );
                      setFormError(null);
                    }}
                    disabled={
                      isEdit || submitting
                    }
                    maxLength={50}
                    placeholder="e.g. PAYMENT"
                    spellCheck={false}
                    className="block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    {isEdit
                      ? "The transaction type code cannot be changed."
                      : "Uppercase letters, numbers, and underscores. Must begin with a letter."}
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(
                        event.target.value,
                      );
                      setFormError(null);
                    }}
                    disabled={submitting}
                    maxLength={100}
                    placeholder="e.g. Payment"
                    className="block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <div className="flex justify-end">
                    <span className="text-xs text-slate-400">
                      {name.length}/100
                    </span>
                  </div>
                </div>
              </div>

              {isEdit && transactionType && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Current code
                      </p>

                      <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                        {transactionType.code}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {transactionType.active
                          ? "Active"
                          : "Disabled"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Description
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(event) => {
                    setDescription(
                      event.target.value,
                    );
                    setFormError(null);
                  }}
                  disabled={submitting}
                  maxLength={255}
                  rows={5}
                  placeholder="Describe when this transaction type is used..."
                  className="block w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <div className="flex items-center justify-between">
                  <p className="text-xs leading-5 text-slate-500">
                    Optional description shown when managing this transaction type.
                  </p>

                  <span className="shrink-0 text-xs text-slate-400">
                    {description.length}/255
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href={backHref}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? isEdit
                    ? "Saving..."
                    : "Creating..."
                  : isEdit
                    ? "Save Changes"
                    : "Create Transaction Type"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}