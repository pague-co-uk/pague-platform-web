"use client";

import Link from "next/link";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

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
  createPaymentProvider,
} from "@/features/payment-providers/api/payment-providers-api";

import type {
  CreatePaymentProviderPayload,
} from "@/features/payment-providers/types/payment-provider.types";

const PROVIDER_CODE_PATTERN =
  /^[A-Z][A-Z0-9_]*$/;

export default function PaymentProviderCreateClient() {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    code,
    setCode,
  ] = useState("");

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    metadata,
    setMetadata,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setFormError(null);

    const normalizedCode =
      code.trim();

    const normalizedName =
      name.trim();

    const normalizedDescription =
      description.trim();

    if (!normalizedCode) {
      setFormError(
        "Provider code is required.",
      );
      return;
    }

    if (
      normalizedCode.length > 50
    ) {
      setFormError(
        "Provider code must not exceed 50 characters.",
      );
      return;
    }

    if (
      !PROVIDER_CODE_PATTERN.test(
        normalizedCode,
      )
    ) {
      setFormError(
        "Provider code must start with an uppercase letter and contain only uppercase letters, numbers, and underscores.",
      );
      return;
    }

    if (!normalizedName) {
      setFormError(
        "Provider name is required.",
      );
      return;
    }

    if (
      normalizedName.length > 100
    ) {
      setFormError(
        "Provider name must not exceed 100 characters.",
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

    let parsedMetadata:
      Record<string, unknown> | undefined;

    const trimmedMetadata =
      metadata.trim();

    if (trimmedMetadata) {
      try {
        const parsed =
          JSON.parse(
            trimmedMetadata,
          );

        if (
          parsed === null ||
          Array.isArray(parsed) ||
          typeof parsed !== "object"
        ) {
          setFormError(
            "Metadata must be a JSON object.",
          );
          return;
        }

        parsedMetadata =
          parsed as Record<
            string,
            unknown
          >;
      } catch {
        setFormError(
          "Metadata must contain valid JSON.",
        );
        return;
      }
    }

    const payload:
      CreatePaymentProviderPayload = {
      code: normalizedCode,
      name: normalizedName,
      ...(normalizedDescription
        ? {
          description:
            normalizedDescription,
        }
        : {}),
      ...(parsedMetadata
        ? {
          metadata:
            parsedMetadata,
        }
        : {}),
    };

    setSubmitting(true);

    try {
      const provider =
        await createPaymentProvider(
          payload,
        );

      success(
        "Provider created successfully.",
        `${provider.name} has been added to the payment provider catalogue.`,
      );

      router.push(
        `/payment-providers/${encodeURIComponent(
          provider.id,
        )}`,
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Failed to create payment provider.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <ContextAwareBackLinks
          clientHref="/payment-providers"
          clientLabel="Back to payment providers"
          showPlatformLink={false}
        />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Add Payment Provider
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Add a payment provider to the
            platform catalogue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Provider details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the provider's platform
                identity and optional metadata.
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-slate-700"
                >
                  Code
                </label>

                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(event) => {
                    setCode(
                      event.target.value.toUpperCase(),
                    );
                    setFormError(null);
                  }}
                  disabled={submitting}
                  maxLength={50}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="AIRTEL"
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Must start with an uppercase
                  letter and contain only
                  uppercase letters, numbers, and
                  underscores.
                </p>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Name
                </label>

                <input
                  id="name"
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
                  autoComplete="off"
                  placeholder="Airtel Money"
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
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
                  value={description}
                  onChange={(event) => {
                    setDescription(
                      event.target.value,
                    );
                    setFormError(null);
                  }}
                  disabled={submitting}
                  maxLength={255}
                  rows={4}
                  placeholder="Airtel Money payment provider."
                  className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="metadata"
                  className="block text-sm font-medium text-slate-700"
                >
                  Metadata
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="metadata"
                  value={metadata}
                  onChange={(event) => {
                    setMetadata(
                      event.target.value,
                    );
                    setFormError(null);
                  }}
                  disabled={submitting}
                  rows={10}
                  spellCheck={false}
                  placeholder={`{
  "key": "value"
}`}
                  className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Metadata must be a JSON object.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/payment-providers"
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
                  ? "Creating..."
                  : "Create Provider"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}