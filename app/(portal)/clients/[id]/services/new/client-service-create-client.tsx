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
  createClientService,
} from "@/features/client-services/api/client-services-api";

import type {
  CreateClientServicePayload,
} from "@/features/client-services/types/client-service.types";

import type {
  Service,
} from "@/features/services/api/services-api";

interface ClientServiceCreateClientProps {
  readonly clientId: string;
  readonly services: readonly Service[];
}

export default function ClientServiceCreateClient({
  clientId,
  services,
}: ClientServiceCreateClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    selectedServiceCode,
    setSelectedServiceCode,
  ] = useState("");

  const [
    configuration,
    setConfiguration,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState<string | null>(null);

  const selectedService =
    services.find(
      (service) =>
        service.code ===
        selectedServiceCode,
    ) ?? null;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setFormError(null);

    if (!selectedServiceCode) {
      setFormError(
        "Select a service.",
      );
      return;
    }

    let parsedConfiguration:
      Record<string, unknown> | undefined;

    const trimmedConfiguration =
      configuration.trim();

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
      CreateClientServicePayload = {
      serviceCode:
        selectedServiceCode,
      ...(parsedConfiguration
        ? {
          configuration:
            parsedConfiguration,
        }
        : {}),
    };

    setSubmitting(true);

    try {
      const clientService =
        await createClientService(
          clientId,
          payload,
        );

      success(
        "Service assigned successfully.",
        `${selectedService?.name ?? selectedServiceCode} is now assigned to this client.`,
      );

      router.push(
        `/clients/${encodeURIComponent(
          clientId,
        )}/services/${encodeURIComponent(
          clientService.serviceId,
        )}`,
      );
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Failed to assign service.",
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
          )}/services`}
          clientLabel="Back to client services"
          showPlatformLink={false}
        />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Add Service
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Assign a platform service to this
            client.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Service assignment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select an active service from
                the platform service catalog.
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-slate-700"
                >
                  Service
                </label>

                <select
                  id="service"
                  value={selectedServiceCode}
                  onChange={(event) => {
                    setSelectedServiceCode(
                      event.target.value,
                    );
                    setFormError(null);
                  }}
                  disabled={submitting}
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">
                    Select a service
                  </option>

                  {services.map(
                    (service) => (
                      <option
                        key={service.id}
                        value={service.code}
                      >
                        {service.name} (
                        {service.code})
                      </option>
                    ),
                  )}
                </select>

                {services.length ===
                  0 && (
                    <p className="mt-2 text-sm text-slate-500">
                      There are currently no
                      active services available
                      to assign.
                    </p>
                  )}
              </div>

              {selectedService && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {
                          selectedService.name
                        }
                      </h3>

                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {
                          selectedService.code
                        }
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                      {
                        selectedService.category
                      }
                    </span>
                  </div>

                  {selectedService.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {
                        selectedService.description
                      }
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="configuration"
                  className="block text-sm font-medium text-slate-700"
                >
                  Configuration
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
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
                  rows={10}
                  spellCheck={false}
                  placeholder={`{
  "example": "value"
}`}
                  className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Configuration must be a JSON
                  object. Leave this empty if the
                  service does not require
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
                )}/services`}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  submitting ||
                  services.length === 0
                }
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Assigning..."
                  : "Assign Service"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}