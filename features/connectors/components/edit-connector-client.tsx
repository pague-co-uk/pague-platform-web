"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ConnectorsApiError,
  updateConnector,
  type Connector,
  type ConnectorTransport,
} from "@/features/connectors/api/connectors-api";

import {
  useToast,
} from "@/components/ui/toast";

interface EditConnectorClientProps {
  connector: Connector;
}

function serializeConfiguration(
  configuration?: Record<string, unknown>,
): string {
  if (!configuration) {
    return "";
  }

  return JSON.stringify(
    configuration,
    null,
    2,
  );
}

function parseConfiguration(
  value: string,
):
  | {
    valid: true;
    value:
    | Record<string, unknown>
    | undefined;
  }
  | {
    valid: false;
    error: string;
  } {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return {
      valid: true,
      value: undefined,
    };
  }

  try {
    const parsed =
      JSON.parse(trimmed);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {
        valid: false,
        error:
          "Configuration must be a JSON object.",
      };
    }

    return {
      valid: true,
      value:
        parsed as Record<
          string,
          unknown
        >,
    };
  } catch {
    return {
      valid: false,
      error:
        "Configuration must contain valid JSON.",
    };
  }
}

export default function EditConnectorClient({
  connector,
}: EditConnectorClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [name, setName] =
    useState(connector.name);

  const [code, setCode] =
    useState(connector.code);

  const [provider, setProvider] =
    useState(connector.provider);

  const [transport, setTransport] =
    useState<ConnectorTransport>(
      connector.transport,
    );

  const [configuration, setConfiguration] =
    useState(
      serializeConfiguration(
        connector.configuration,
      ),
    );

  const [configurationError, setConfigurationError] =
    useState<string | null>(null);

  const [configurationValid, setConfigurationValid] =
    useState(
      Boolean(
        connector.configuration,
      ),
    );

  const [formError, setFormError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  function handleConfigurationChange(
    value: string,
  ) {
    setConfiguration(value);
    setConfigurationError(null);
    setConfigurationValid(false);

    if (!value.trim()) {
      return;
    }

    const result =
      parseConfiguration(value);

    if (!result.valid) {
      setConfigurationError(
        result.error,
      );
      return;
    }

    setConfigurationValid(true);
  }

  function handleValidateJson() {
    setConfigurationError(null);
    setConfigurationValid(false);

    if (!configuration.trim()) {
      setConfigurationError(
        "Enter a JSON configuration before validating.",
      );
      return;
    }

    const result =
      parseConfiguration(
        configuration,
      );

    if (!result.valid) {
      setConfigurationError(
        result.error,
      );
      return;
    }

    setConfigurationValid(true);
  }

  function handlePrettyFormat() {
    setConfigurationError(null);

    if (!configuration.trim()) {
      setConfigurationError(
        "Enter a JSON configuration before formatting.",
      );
      return;
    }

    const result =
      parseConfiguration(
        configuration,
      );

    if (!result.valid) {
      setConfigurationError(
        result.error,
      );
      setConfigurationValid(false);
      return;
    }

    setConfiguration(
      JSON.stringify(
        result.value,
        null,
        2,
      ),
    );

    setConfigurationValid(true);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError(null);
    setConfigurationError(null);

    const trimmedName =
      name.trim();

    const trimmedCode =
      code.trim();

    const trimmedProvider =
      provider.trim();

    if (!trimmedName) {
      setFormError(
        "Connector name is required.",
      );
      return;
    }

    if (!trimmedCode) {
      setFormError(
        "Connector code is required.",
      );
      return;
    }

    if (!trimmedProvider) {
      setFormError(
        "Provider is required.",
      );
      return;
    }

    let parsedConfiguration:
      | Record<string, unknown>
      | undefined;

    if (configuration.trim()) {
      const result =
        parseConfiguration(
          configuration,
        );

      if (!result.valid) {
        setConfigurationError(
          result.error,
        );
        return;
      }

      parsedConfiguration =
        result.value;
    }

    setSubmitting(true);

    try {
      await updateConnector(
        connector.id,
        {
          name: trimmedName,
          code: trimmedCode,
          provider: trimmedProvider,
          transport,
          ...(parsedConfiguration
            ? {
              configuration:
                parsedConfiguration,
            }
            : {}),
        },
      );

      success(
        "Connector updated",
        `${trimmedName} was updated successfully.`,
      );

      router.push(
        `/connectors/${connector.id}`,
      );

      router.refresh();
    } catch (err) {
      const message =
        err instanceof ConnectorsApiError
          ? err.message
          : "Unable to update connector.";

      setFormError(message);

      showError(
        "Update failed",
        message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/connectors/${connector.id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to connector
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Edit connector
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the connector details and configuration.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="space-y-6 p-6">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="publicId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Public ID
            </label>

            <input
              id="publicId"
              name="publicId"
              type="text"
              value={connector.publicId}
              disabled
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-600 outline-none"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Public ID cannot be changed.
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              maxLength={100}
              required
              disabled={submitting}
              placeholder="Primary SMPP"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="code"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Code
            </label>

            <input
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value,
                )
              }
              maxLength={50}
              required
              disabled={submitting}
              placeholder="SMPP-1"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="provider"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Provider
            </label>

            <input
              id="provider"
              name="provider"
              type="text"
              value={provider}
              onChange={(event) =>
                setProvider(
                  event.target.value,
                )
              }
              maxLength={100}
              required
              disabled={submitting}
              placeholder="OpenSMPP"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="transport"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Transport
            </label>

            <select
              id="transport"
              name="transport"
              value={transport}
              onChange={(event) =>
                setTransport(
                  event.target.value as ConnectorTransport,
                )
              }
              disabled={submitting}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              <option value="SMPP">
                SMPP
              </option>

              <option value="HTTP">
                HTTP
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="configuration"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Configuration
            </label>

            <textarea
              id="configuration"
              name="configuration"
              value={configuration}
              onChange={(event) =>
                handleConfigurationChange(
                  event.target.value,
                )
              }
              disabled={submitting}
              rows={8}
              spellCheck={false}
              placeholder={`{
  "host": "127.0.0.1",
  "port": 2775
}`}
              className={`w-full rounded-lg border bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${configurationError
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : configurationValid
                    ? "border-green-300 focus:border-green-500 focus:ring-green-100"
                    : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                }`}
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={
                  handleValidateJson
                }
                disabled={
                  submitting ||
                  !configuration.trim()
                }
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Validate JSON
              </button>

              <button
                type="button"
                onClick={
                  handlePrettyFormat
                }
                disabled={
                  submitting ||
                  !configuration.trim()
                }
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pretty format
              </button>
            </div>

            {configurationError ? (
              <p
                role="alert"
                className="mt-2 text-xs text-red-600"
              >
                {configurationError}
              </p>
            ) : configurationValid ? (
              <p className="mt-2 text-xs text-green-600">
                Valid JSON configuration.
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                Optional JSON object containing the connector configuration.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Link
            href={`/connectors/${connector.id}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}