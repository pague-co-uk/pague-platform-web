"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

import {
  createProviderService,
  updateProviderService,
} from "@/features/provider-services/api/provider-services-api";

import type {
  CreateProviderServicePayload,
  ProviderService,
  UpdateProviderServicePayload,
} from "@/features/provider-services/types/provider-service.types";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  ContextAwareBackLinks,
} from "@/components/ui/context-aware-back-links";

import { JsonEditor } from "@/components/ui/json-editor";
import {
  useToast,
} from "@/components/ui/toast";

interface ProviderOption {
  code: string;
  name: string;
}

interface ServiceOption {
  code: string;
  name: string;
  category: string;
}

interface ProviderServiceFormProps {
  mode: "create" | "edit";
  providerService?: ProviderService;
  providers?: readonly ProviderOption[];
  services?: readonly ServiceOption[];
}

export default function ProviderServiceForm({
  mode,
  providerService,
  providers = [],
  services = [],
}: ProviderServiceFormProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [
    providerCode,
    setProviderCode,
  ] = useState(
    providerService?.providerCode ?? "",
  );

  const [
    serviceCode,
    setServiceCode,
  ] = useState(
    providerService?.serviceCode ?? "",
  );

  const [
    externalServiceCode,
    setExternalServiceCode,
  ] = useState(
    providerService?.externalServiceCode ?? "",
  );

  const [
    configuration,
    setConfiguration,
  ] = useState(
    providerService?.configuration
      ? JSON.stringify(
        providerService.configuration,
        null,
        2,
      )
      : "",
  );

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

    const normalizedProviderCode =
      providerCode.trim();

    const normalizedServiceCode =
      serviceCode.trim();

    const normalizedExternalServiceCode =
      externalServiceCode.trim();

    if (mode === "create") {
      if (!normalizedProviderCode) {
        setFormError(
          "Payment provider is required.",
        );
        return;
      }

      if (!normalizedServiceCode) {
        setFormError(
          "Payment service is required.",
        );
        return;
      }
    }

    if (
      normalizedExternalServiceCode.length >
      100
    ) {
      setFormError(
        "External service code must not exceed 100 characters.",
      );
      return;
    }

    let parsedConfiguration:
      | Record<string, unknown>
      | undefined;

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

    setSubmitting(true);

    try {
      if (mode === "create") {
        const payload:
          CreateProviderServicePayload =
        {
          providerCode:
            normalizedProviderCode,
          serviceCode:
            normalizedServiceCode,

          ...(normalizedExternalServiceCode
            ? {
              externalServiceCode:
                normalizedExternalServiceCode,
            }
            : {}),

          ...(parsedConfiguration !==
            undefined
            ? {
              configuration:
                parsedConfiguration,
            }
            : {}),
        };

        const created =
          await createProviderService(
            payload,
          );

        success(
          "Provider service created successfully.",
          `${created.providerName} / ${created.serviceName} has been configured.`,
        );

        router.push(
          `/provider-services/${encodeURIComponent(
            created.id,
          )}`,
        );

        return;
      }

      if (!providerService) {
        setFormError(
          "Provider service is required for editing.",
        );
        return;
      }

      const payload:
        UpdateProviderServicePayload =
      {
        ...(normalizedExternalServiceCode
          ? {
            externalServiceCode:
              normalizedExternalServiceCode,
          }
          : {}),

        ...(parsedConfiguration !==
          undefined
          ? {
            configuration:
              parsedConfiguration,
          }
          : {}),
      };

      const updated =
        await updateProviderService(
          providerService.id,
          payload,
        );

      success(
        "Provider service updated successfully.",
        `${updated.providerName} / ${updated.serviceName} has been updated.`,
      );

      router.push(
        `/provider-services/${encodeURIComponent(
          updated.id,
        )}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : mode === "create"
            ? "Failed to create provider service."
            : "Failed to update provider service.";

      setFormError(message);
      showError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    mode === "create"
      ? "Add Provider Service"
      : "Edit Provider Service";

  const description =
    mode === "create"
      ? "Configure a payment service for a payment provider."
      : `Update the configuration for ${providerService?.providerName ??
      "this provider service"
      }.`;

  return (
    <PageContainer>
      <div className="space-y-6">
        <ContextAwareBackLinks
          clientHref={
            mode === "edit" &&
              providerService
              ? `/provider-services/${encodeURIComponent(
                providerService.id,
              )}`
              : "/provider-services"
          }
          clientLabel={
            mode === "edit"
              ? "Back to provider service"
              : "Provider Services"
          }
          showPlatformLink={false}
        />

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-950">
                Provider Service Configuration
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {mode === "create"
                  ? "Select the provider and service, then configure the provider-specific mapping."
                  : "Update the provider-specific mapping and configuration."}
              </p>
            </div>

            <div className="space-y-6 px-6 py-6">
              {mode === "create" && (
                <>
                  <div>
                    <label
                      htmlFor="providerCode"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Payment Provider
                    </label>

                    <select
                      id="providerCode"
                      name="providerCode"
                      value={providerCode}
                      onChange={(event) => {
                        setProviderCode(
                          event.target.value,
                        );
                        setFormError(null);
                      }}
                      disabled={submitting}
                      className="mt-1 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="">
                        Select a payment provider
                      </option>

                      {providers.map(
                        (provider) => (
                          <option
                            key={provider.code}
                            value={provider.code}
                          >
                            {provider.name} (
                            {provider.code})
                          </option>
                        ),
                      )}
                    </select>

                    <p className="mt-1 text-xs text-slate-500">
                      Select the payment provider
                      that will provide this
                      service.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="serviceCode"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Payment Service
                    </label>

                    <select
                      id="serviceCode"
                      name="serviceCode"
                      value={serviceCode}
                      onChange={(event) => {
                        setServiceCode(
                          event.target.value,
                        );
                        setFormError(null);
                      }}
                      disabled={submitting}
                      className="mt-1 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      <option value="">
                        Select a payment service
                      </option>

                      {services.map(
                        (service) => (
                          <option
                            key={service.code}
                            value={service.code}
                          >
                            {service.name} (
                            {service.code}) —{" "}
                            {service.category}
                          </option>
                        ),
                      )}
                    </select>

                    <p className="mt-1 text-xs text-slate-500">
                      Select the platform payment
                      service that this provider
                      supports.
                    </p>
                  </div>
                </>
              )}

              {mode === "edit" &&
                providerService && (
                  <div className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Provider
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {
                          providerService.providerName
                        }
                      </p>

                      <p className="font-mono text-xs text-slate-500">
                        {
                          providerService.providerCode
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Service
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {
                          providerService.serviceName
                        }
                      </p>

                      <p className="font-mono text-xs text-slate-500">
                        {
                          providerService.serviceCode
                        }
                      </p>
                    </div>
                  </div>
                )}

              <div>
                <label
                  htmlFor="externalServiceCode"
                  className="block text-sm font-medium text-slate-700"
                >
                  External Service Code
                </label>

                <input
                  id="externalServiceCode"
                  name="externalServiceCode"
                  type="text"
                  value={
                    externalServiceCode
                  }
                  onChange={(event) => {
                    setExternalServiceCode(
                      event.target.value,
                    );
                    setFormError(null);
                  }}
                  maxLength={100}
                  placeholder="Provider-specific service code"
                  disabled={submitting}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Optional code used by the external
                  payment provider.
                </p>
              </div>

              <JsonEditor
                id="configuration"
                name="configuration"
                label="Configuration"
                value={configuration}
                onChange={(value) => {
                  setConfiguration(value);
                  setFormError(null);
                }}
                placeholder={`{
  "key": "value"
}`}
                rows={12}
                disabled={submitting}
                optional
                validateJson
                prettyFormat
                description="Optional provider-specific configuration."
              />

              {formError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Link
                href={
                  mode === "edit" &&
                    providerService
                    ? `/provider-services/${encodeURIComponent(
                      providerService.id,
                    )}`
                    : "/provider-services"
                }
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : mode === "create"
                    ? "Create Provider Service"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}