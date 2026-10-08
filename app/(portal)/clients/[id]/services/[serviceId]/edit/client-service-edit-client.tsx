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
  updateClientService,
} from "@/features/client-services/api/client-services-api";

import type {
  ClientService,
  UpdateClientServicePayload,
} from "@/features/client-services/types/client-service.types";

interface ClientServiceEditClientProps {
  readonly clientId: string;
  readonly initialClientService: ClientService;
}

export default function ClientServiceEditClient({
  clientId,
  initialClientService,
}: ClientServiceEditClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    configuration,
    setConfiguration,
  ] = useState(() => {
    if (
      initialClientService.configuration ===
      null
    ) {
      return "";
    }

    return JSON.stringify(
      initialClientService.configuration,
      null,
      2,
    );
  });

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

    const trimmedConfiguration =
      configuration.trim();

    let parsedConfiguration:
      Record<string, unknown> | undefined;

    if (trimmedConfiguration) {
      try {
        const parsed =
          JSON.parse(
            trimmedConfiguration,
          );

        if (
          parsed === null ||
          Array.isArray(parsed) ||
          typeof parsed !== "object"
        ) {
          setFormError(
            "Configuration must be a JSON object.",
          );
          return;
        }

        parsedConfiguration =
          parsed as Record<
            string,
            unknown
          >;
      } catch {
        setFormError(
          "Configuration must contain valid JSON.",
        );
        return;
      }
    }

    const payload:
      UpdateClientServicePayload = {
      ...(parsedConfiguration
        ? {
          configuration:
            parsedConfiguration,
        }
        : {}),
    };

    setSubmitting(true);

    try {
      await updateClientService(
        clientId,
        initialClientService.serviceId,
        payload,
      );

      success(
        "Service updated successfully.",
        `${initialClientService.serviceName} configuration has been updated.`,
      );

      router.push(
        `/clients/${encodeURIComponent(
          clientId,
        )}/services/${encodeURIComponent(
          initialClientService.serviceId,
        )}`,
      );

      router.refresh();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Failed to update client service.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <ContextAwareBackLinks
          clientHref={`/clients/${encodeURIComponent(
            clientId,
          )}/services/${encodeURIComponent(
            initialClientService.serviceId,
          )}`}
          clientLabel="Back to service"
          showPlatformLink={false}
        />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Edit Service
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Update the configuration for{" "}
            <span className="font-medium text-slate-700">
              {initialClientService.serviceName}
            </span>
            .
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Service configuration
                </h2>

                <p className="mt-1 font-mono text-xs text-slate-500">
                  {initialClientService.serviceCode}
                </p>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Service
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {initialClientService.serviceName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {initialClientService.serviceCategory}
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="configuration"
                  className="block text-sm font-medium text-slate-700"
                >
                  Configuration
                </label>

                <textarea
                  id="configuration"
                  value={configuration}
                  onChange={(event) => {
                    setConfiguration(
                      event.target.value,
                    );
                    setFormError(null);
                  }}
                  disabled={submitting}
                  rows={14}
                  spellCheck={false}
                  className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Configuration must be a valid
                  JSON object. Leave it empty if
                  this service does not require
                  client-specific configuration.
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
                href={`/clients/${encodeURIComponent(
                  clientId,
                )}/services/${encodeURIComponent(
                  initialClientService.serviceId,
                )}`}
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
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}