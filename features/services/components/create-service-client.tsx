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
  JsonEditor,
} from "@/components/ui/json-editor";

import {
  createService,
  ServicesApiError,
} from "@/features/services/api/services-api";

interface CreateServiceClientProps { }

type ServiceCategory =
  | "MESSAGING"
  | "PAYMENTS";

export default function CreateServiceClient(
  _props: CreateServiceClientProps,
) {
  const router = useRouter();

  // ==========================================================================
  // Form state
  // ==========================================================================

  const [code, setCode] =
    useState("");

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState<ServiceCategory>(
      "PAYMENTS",
    );

  const [metadata, setMetadata] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================================================
  // Submit
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);

    const trimmedCode =
      code.trim().toUpperCase();

    const trimmedName =
      name.trim();

    const trimmedDescription =
      description.trim();

    // ------------------------------------------------------------------------
    // Code validation
    // ------------------------------------------------------------------------

    if (!trimmedCode) {
      setError(
        "Service code is required.",
      );
      return;
    }

    if (
      !/^[A-Z][A-Z0-9_]*$/.test(
        trimmedCode,
      )
    ) {
      setError(
        "Code must start with an uppercase letter and contain only uppercase letters, numbers, and underscores.",
      );
      return;
    }

    // ------------------------------------------------------------------------
    // Name validation
    // ------------------------------------------------------------------------

    if (!trimmedName) {
      setError(
        "Service name is required.",
      );
      return;
    }

    if (trimmedName.length > 100) {
      setError(
        "Service name must not exceed 100 characters.",
      );
      return;
    }

    // ------------------------------------------------------------------------
    // Description validation
    // ------------------------------------------------------------------------

    if (
      trimmedDescription.length >
      255
    ) {
      setError(
        "Description must not exceed 255 characters.",
      );
      return;
    }

    // ------------------------------------------------------------------------
    // Metadata
    //
    // JsonEditor handles the editing/validation UX. We parse the value here
    // before constructing the API payload.
    // ------------------------------------------------------------------------

    let parsedMetadata:
      | Record<string, unknown>
      | undefined;

    if (metadata.trim()) {
      try {
        const parsed =
          JSON.parse(metadata);

        if (
          typeof parsed !==
          "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          setError(
            "Metadata must be a valid JSON object.",
          );
          return;
        }

        parsedMetadata =
          parsed as Record<
            string,
            unknown
          >;
      } catch {
        setError(
          "Metadata must contain valid JSON.",
        );
        return;
      }
    }

    // ------------------------------------------------------------------------
    // Create
    // ------------------------------------------------------------------------

    setSubmitting(true);

    try {
      await createService({
        code: trimmedCode,
        name: trimmedName,
        description:
          trimmedDescription ||
          undefined,
        category,
        metadata:
          parsedMetadata,
      });

      router.push("/services");
      router.refresh();
    } catch (err) {
      if (
        err instanceof
        ServicesApiError
      ) {
        setError(err.message);
      } else if (
        err instanceof Error
      ) {
        setError(err.message);
      } else {
        setError(
          "Failed to create service.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <PageContainer>
      <div className="space-y-6">

        {/* ====================================================================
            Back navigation
        ==================================================================== */}

        <ContextAwareBackLinks
          clientHref="/services"
          clientLabel="Back to services"
          showPlatformLink={false}
        />

        {/* ====================================================================
            Page header
        ==================================================================== */}

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Create Service
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Create a payment or messaging
            service available to clients and
            providers.
          </p>
        </div>

        {/* ====================================================================
            Centered form
        ==================================================================== */}

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* ==================================================================
                Form header
            ================================================================== */}

            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Service information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Define the service code, name,
                category, description, and
                optional metadata.
              </p>
            </div>

            {/* ==================================================================
                Form fields
            ================================================================== */}

            <div className="space-y-6 p-6">

              {/* Error */}

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Code */}

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-slate-700"
                >
                  Code
                </label>

                <input
                  id="code"
                  name="code"
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value,
                    )
                  }
                  placeholder="AIRTIME"
                  maxLength={50}
                  disabled={submitting}
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Uppercase letters, numbers,
                  and underscores only. The code
                  cannot be changed after
                  creation.
                </p>
              </div>

              {/* Name */}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Airtime"
                  maxLength={100}
                  disabled={submitting}
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <div className="mt-1.5 flex justify-end">
                  <span className="text-xs text-slate-400">
                    {name.length}/100
                  </span>
                </div>
              </div>

              {/* Category */}

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value as ServiceCategory,
                    )
                  }
                  disabled={submitting}
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="PAYMENTS">
                    Payments
                  </option>

                  <option value="MESSAGING">
                    Messaging
                  </option>
                </select>
              </div>

              {/* Description */}

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Describe what this service is used for."
                  maxLength={255}
                  rows={4}
                  disabled={submitting}
                  className="mt-2 block w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <div className="mt-1.5 flex justify-end">
                  <span className="text-xs text-slate-400">
                    {description.length}/255
                  </span>
                </div>
              </div>

              {/* Metadata */}

              <JsonEditor
                id="metadata"
                name="metadata"
                label="Metadata"
                value={metadata}
                onChange={setMetadata}
                disabled={submitting}
                optional
                placeholder={`{
  "key": "value"
}`}
                description="Optional JSON object containing additional service metadata."
              />
            </div>

            {/* ==================================================================
                Actions
            ================================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <Link
                href="/services"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Creating…"
                  : "Create Service"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}