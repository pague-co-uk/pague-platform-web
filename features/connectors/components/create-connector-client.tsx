"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ConnectorsApiError,
  createConnector,
  type ConnectorTransport,
} from "@/features/connectors/api/connectors-api";

import {
  useToast,
} from "@/components/ui/toast";

interface CreateConnectorClientProps { }

export default function CreateConnectorClient(
  { }: CreateConnectorClientProps,
) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  const [publicId, setPublicId] =
    useState("");

  const [name, setName] =
    useState("");

  const [code, setCode] =
    useState("");

  const [provider, setProvider] =
    useState("");

  const [transport, setTransport] =
    useState<ConnectorTransport>("SMPP");

  const [configuration, setConfiguration] =
    useState("");

  const [validateJson, setValidateJson] =
    useState(true);

  const [prettyFormat, setPrettyFormat] =
    useState(false);

  const [configurationError, setConfigurationError] =
    useState<string | null>(null);

  const [configurationValid, setConfigurationValid] =
    useState(false);

  const [formError, setFormError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  function parseConfiguration(
    value: string,
  ):
    | {
      valid: true;
      value: Record<string, unknown> | undefined;
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

  function handleConfigurationChange(
    value: string,
  ) {
    setConfiguration(value);
    setConfigurationError(null);
    setConfigurationValid(false);

    if (!validateJson) {
      return;
    }

    if (!value.trim()) {
      setConfigurationValid(false);
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
      parseConfiguration(configuration);

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
      parseConfiguration(configuration);

    if (!result.valid) {
      setConfigurationError(
        result.error,
      );
      setConfigurationValid(false);
      return;
    }

    const formatted =
      JSON.stringify(
        result.value,
        null,
        2,
      );

    setConfiguration(formatted);
    setConfigurationValid(true);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError(null);
    setConfigurationError(null);

    const trimmedPublicId =
      publicId.trim();

    const trimmedName =
      name.trim();

    const trimmedCode =
      code.trim();

    const trimmedProvider =
      provider.trim();

    if (!trimmedPublicId) {
      setFormError(
        "Public ID is required.",
      );
      return;
    }

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

      setConfigurationValid(true);
    }

    setSubmitting(true);

    try {
      await createConnector({
        publicId:
          trimmedPublicId,
        name:
          trimmedName,
        code:
          trimmedCode,
        provider:
          trimmedProvider,
        transport,
        ...(parsedConfiguration
          ? {
            configuration:
              parsedConfiguration,
          }
          : {}),
      });

      success(
        "Connector created",
        `${trimmedName} was created successfully.`,
      );

      router.push(
        "/connectors",
      );

      router.refresh();
    } catch (err) {
      const message =
        err instanceof ConnectorsApiError
          ? err.message
          : "Unable to create connector.";

      setFormError(message);

      showError(
        "Creation failed",
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
          href="/connectors"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to connectors
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Create connector
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a connector for an external messaging or transport provider.
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
              value={publicId}
              onChange={(event) =>
                setPublicId(
                  event.target.value,
                )
              }
              maxLength={20}
              required
              disabled={submitting}
              placeholder="CON-001"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
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

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={validateJson}
                  onChange={(event) => {
                    const checked =
                      event.target.checked;

                    setValidateJson(
                      checked,
                    );

                    if (!checked) {
                      setConfigurationError(
                        null,
                      );
                      setConfigurationValid(
                        false,
                      );
                    } else if (
                      configuration.trim()
                    ) {
                      const result =
                        parseConfiguration(
                          configuration,
                        );

                      if (!result.valid) {
                        setConfigurationError(
                          result.error,
                        );
                        setConfigurationValid(
                          false,
                        );
                      } else {
                        setConfigurationError(
                          null,
                        );
                        setConfigurationValid(
                          true,
                        );
                      }
                    }
                  }}
                  disabled={submitting}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  Validate JSON
                </span>
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={prettyFormat}
                  onChange={(event) => {
                    const checked =
                      event.target.checked;

                    setPrettyFormat(
                      checked,
                    );

                    if (checked) {
                      handlePrettyFormat();
                    }
                  }}
                  disabled={submitting}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  Pretty format
                </span>
              </label>
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
            href="/connectors"
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
              ? "Creating..."
              : "Create connector"}
          </button>
        </div>
      </form>
    </main>
  );
}