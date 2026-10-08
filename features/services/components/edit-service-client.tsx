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
  useToast,
} from "@/components/ui/toast";

import {
  ServicesApiError,
  updateService,
} from "@/features/services/api/services-api";

import type {
  Service,
  ServiceCategory,
  UpdateServiceInput,
} from "@/features/services/api/services-api";

interface EditServiceClientProps {
  service: Service;
}

export default function EditServiceClient({
  service,
}: EditServiceClientProps) {
  const router = useRouter();

  const {
    success,
    error: showError,
  } = useToast();

  // ==========================================================================
  // Form state
  // ==========================================================================

  const [name, setName] =
    useState(service.name);

  const [category, setCategory] =
    useState<ServiceCategory>(
      service.category,
    );

  const [description, setDescription] =
    useState(
      service.description ?? "",
    );

  const [metadata, setMetadata] =
    useState(
      service.metadata
        ? JSON.stringify(
          service.metadata,
          null,
          2,
        )
        : "",
    );

  const [submitting, setSubmitting] =
    useState(false);

  const [formError, setFormError] =
    useState<string | null>(null);

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

    setFormError(null);

    const trimmedName =
      name.trim();

    const trimmedDescription =
      description.trim();

    // ------------------------------------------------------------------------
    // Name validation
    // ------------------------------------------------------------------------

    if (!trimmedName) {
      setFormError(
        "Service name is required.",
      );
      return;
    }

    if (trimmedName.length > 100) {
      setFormError(
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
      setFormError(
        "Description must not exceed 255 characters.",
      );
      return;
    }

    // ------------------------------------------------------------------------
    // Metadata
    //
    // JsonEditor owns JSON validation for the UI. We still parse the value
    // here before submitting so the API always receives an object.
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

    // ------------------------------------------------------------------------
    // Update payload
    // ------------------------------------------------------------------------

    const input: UpdateServiceInput =
    {
      name: trimmedName,
      category,
      description:
        trimmedDescription ||
        undefined,
      metadata:
        parsedMetadata,
    };

    setSubmitting(true);

    try {
      await updateService(
        service.id,
        input,
      );

      success(
        "Service updated successfully.",
      );

      router.push(
        `/services/${service.id}`,
      );

      router.refresh();
    } catch (error) {
      const message =
        error instanceof
          ServicesApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to update service.";

      setFormError(message);
      showError(message);
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
          clientHref={`/services/${service.id}`}
          clientLabel="Back to service"
          showPlatformLink={false}
        />

        {/* ====================================================================
            Page header
        ==================================================================== */}

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Edit Service
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Update the configuration for{" "}
            <span className="font-medium text-slate-700">
              {service.name}
            </span>
            .
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
                Update the service name, category,
                description, and metadata.
              </p>
            </div>

            {/* ==================================================================
                Form fields
            ================================================================== */}

            <div className="space-y-6 p-6">

              {/* Code */}

              <div>
                <label
                  htmlFor="service-code"
                  className="block text-sm font-medium text-slate-700"
                >
                  Code
                </label>

                <input
                  id="service-code"
                  type="text"
                  value={service.code}
                  disabled
                  className="mt-2 block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-500"
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  The service code cannot be changed.
                </p>
              </div>

              {/* Name */}

              <div>
                <label
                  htmlFor="service-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Name
                </label>

                <input
                  id="service-name"
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
                  htmlFor="service-category"
                  className="block text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <select
                  id="service-category"
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
                  <option value="MESSAGING">
                    Messaging
                  </option>

                  <option value="PAYMENTS">
                    Payments
                  </option>
                </select>
              </div>

              {/* Description */}

              <div>
                <label
                  htmlFor="service-description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="service-description"
                  name="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  maxLength={255}
                  rows={4}
                  disabled={submitting}
                  className="mt-2 block w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  placeholder="Describe what this service is used for..."
                />

                <div className="mt-1.5 flex justify-end">
                  <span className="text-xs text-slate-400">
                    {description.length}/255
                  </span>
                </div>
              </div>

              {/* Metadata */}

              <JsonEditor
                id="service-metadata"
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

              {/* Error */}

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}
            </div>

            {/* ==================================================================
                Actions
            ================================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <Link
                href={`/services/${service.id}`}
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
                  ? "Saving…"
                  : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}