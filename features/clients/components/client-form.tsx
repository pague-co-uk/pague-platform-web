"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

// ============================================================================
// Types
// ============================================================================

export interface ClientFormValues {
  readonly companyName: string;

  readonly clientCode?: string;

  readonly displayName: string;

  readonly email: string;

  readonly phone: string;

  readonly rateLimitPerSecond: string;

  readonly timezone: string;
}

export interface ClientFormProps {
  readonly mode: "create" | "edit";

  readonly initialValues?: Partial<ClientFormValues>;

  readonly loading?: boolean;

  readonly onSubmit: (
    values: ClientFormValues,
  ) => Promise<void>;

  readonly onCancel: () => void;
}

// ============================================================================
// Defaults
// ============================================================================

const DEFAULT_VALUES: ClientFormValues = {
  companyName: "",
  clientCode: "",
  displayName: "",
  email: "",
  phone: "",
  rateLimitPerSecond: "100",
  timezone: "Africa/Blantyre",
};

// ============================================================================
// Client form
// ============================================================================

export default function ClientForm({
  mode,
  initialValues,
  loading = false,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  const [
    values,
    setValues,
  ] = useState<ClientFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });

  const [
    errors,
    setErrors,
  ] = useState<
    Partial<
      Record<
        keyof ClientFormValues,
        string
      >
    >
  >({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // ==========================================================================
  // Update values when initial values change
  // ==========================================================================

  useEffect(() => {
    setValues({
      ...DEFAULT_VALUES,
      ...initialValues,
    });

    setErrors({});
  }, [initialValues]);

  // ==========================================================================
  // Field update
  // ==========================================================================

  function updateField(
    field: keyof ClientFormValues,
    value: string,
  ) {
    setValues(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setErrors(
      (current) => {
        if (!current[field]) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[field];

        return next;
      },
    );
  }

  // ==========================================================================
  // Validation
  // ==========================================================================

  function validate(): boolean {
    const nextErrors: Partial<
      Record<
        keyof ClientFormValues,
        string
      >
    > = {};

    // ------------------------------------------------------------------------
    // Company name
    // ------------------------------------------------------------------------

    if (
      !values.companyName.trim()
    ) {
      nextErrors.companyName =
        "Company name is required.";
    }

    // ------------------------------------------------------------------------
    // Client code
    // ------------------------------------------------------------------------

    if (
      mode === "create" &&
      !values.clientCode?.trim()
    ) {
      nextErrors.clientCode =
        "Client code is required.";
    }

    // ------------------------------------------------------------------------
    // Display name
    // ------------------------------------------------------------------------

    if (
      values.displayName.length >
      255
    ) {
      nextErrors.displayName =
        "Display name must not exceed 255 characters.";
    }

    // ------------------------------------------------------------------------
    // Email
    // ------------------------------------------------------------------------

    if (!values.email.trim()) {
      nextErrors.email =
        "Email is required.";
    } else if (
      !isValidEmail(
        values.email,
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    // ------------------------------------------------------------------------
    // Phone
    // ------------------------------------------------------------------------

    if (
      values.phone.length >
      50
    ) {
      nextErrors.phone =
        "Phone number must not exceed 50 characters.";
    }

    // ------------------------------------------------------------------------
    // Rate limit
    // ------------------------------------------------------------------------

    if (
      !values.rateLimitPerSecond.trim()
    ) {
      nextErrors.rateLimitPerSecond =
        "Rate limit is required.";
    } else {
      const rateLimit =
        Number(
          values.rateLimitPerSecond,
        );

      if (
        !Number.isInteger(
          rateLimit,
        )
      ) {
        nextErrors.rateLimitPerSecond =
          "Rate limit must be a whole number.";
      } else if (
        rateLimit < 1
      ) {
        nextErrors.rateLimitPerSecond =
          "Rate limit must be at least 1.";
      } else if (
        rateLimit > 100000
      ) {
        nextErrors.rateLimitPerSecond =
          "Rate limit must not exceed 100,000.";
      }
    }

    // ------------------------------------------------------------------------
    // Timezone
    // ------------------------------------------------------------------------

    if (!values.timezone.trim()) {
      nextErrors.timezone =
        "Timezone is required.";
    }

    setErrors(
      nextErrors,
    );

    return (
      Object.keys(
        nextErrors,
      ).length === 0
    );
  }

  // ==========================================================================
  // Submit
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      loading ||
      submitting
    ) {
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(
        values,
      );
    } finally {
      setSubmitting(false);
    }
  }

  const busy =
    loading ||
    submitting;

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <form
      onSubmit={
        handleSubmit
      }
      noValidate
      className="space-y-6"
    >
      {/* ======================================================================
          Basic information
      ======================================================================= */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <FormSectionHeader
          title="Basic information"
          description="Identify the client and provide its primary contact details."
        />

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <FormField
            label="Company name"
            required
            error={
              errors.companyName
            }
          >
            <input
              type="text"
              value={
                values.companyName
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "companyName",
                  event.target.value,
                )
              }
              placeholder="Vibrant Systems Limited"
              maxLength={255}
              disabled={busy}
              className={getInputClassName(
                !!errors.companyName,
              )}
            />
          </FormField>

          {mode ===
            "create" && (
              <FormField
                label="Client code"
                required
                hint="A unique code used to identify the client."
                error={
                  errors.clientCode
                }
              >
                <input
                  type="text"
                  value={
                    values.clientCode ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "clientCode",
                      event.target.value,
                    )
                  }
                  placeholder="PAGUE"
                  maxLength={255}
                  disabled={busy}
                  className={getInputClassName(
                    !!errors.clientCode,
                  )}
                />
              </FormField>
            )}

          <FormField
            label="Display name"
            hint="Optional name displayed throughout the platform."
            error={
              errors.displayName
            }
          >
            <input
              type="text"
              value={
                values.displayName
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "displayName",
                  event.target.value,
                )
              }
              placeholder="Pague"
              maxLength={255}
              disabled={busy}
              className={getInputClassName(
                !!errors.displayName,
              )}
            />
          </FormField>

          <FormField
            label="Email"
            required
            error={
              errors.email
            }
          >
            <input
              type="email"
              value={
                values.email
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "email",
                  event.target.value,
                )
              }
              placeholder="admin@example.com"
              maxLength={255}
              autoComplete="email"
              disabled={busy}
              className={getInputClassName(
                !!errors.email,
              )}
            />
          </FormField>

          <FormField
            label="Phone"
            hint="Optional contact number."
            error={
              errors.phone
            }
          >
            <input
              type="tel"
              value={
                values.phone
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "phone",
                  event.target.value,
                )
              }
              placeholder="+265991234567"
              maxLength={50}
              autoComplete="tel"
              disabled={busy}
              className={getInputClassName(
                !!errors.phone,
              )}
            />
          </FormField>
        </div>
      </section>

      {/* ======================================================================
          Platform configuration
      ======================================================================= */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <FormSectionHeader
          title="Platform configuration"
          description="Configure request limits and regional settings for this client."
        />

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <FormField
            label="Rate limit per second"
            required
            hint="Maximum number of requests/messages permitted per second."
            error={
              errors.rateLimitPerSecond
            }
          >
            <input
              type="number"
              value={
                values.rateLimitPerSecond
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "rateLimitPerSecond",
                  event.target.value,
                )
              }
              min={1}
              max={100000}
              step={1}
              disabled={busy}
              className={getInputClassName(
                !!errors.rateLimitPerSecond,
              )}
            />
          </FormField>

          <FormField
            label="Timezone"
            required
            hint="IANA timezone used for client-local operations."
            error={
              errors.timezone
            }
          >
            <input
              type="text"
              value={
                values.timezone
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "timezone",
                  event.target.value,
                )
              }
              placeholder="Africa/Blantyre"
              disabled={busy}
              className={getInputClassName(
                !!errors.timezone,
              )}
            />
          </FormField>
        </div>
      </section>

      {/* ======================================================================
          Actions
      ======================================================================= */}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={
            onCancel
          }
          disabled={busy}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}

          {busy
            ? mode ===
              "create"
              ? "Creating client…"
              : "Saving changes…"
            : mode ===
              "create"
              ? "Create client"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// Form section header
// ============================================================================

interface FormSectionHeaderProps {
  readonly title: string;

  readonly description?: string;
}

function FormSectionHeader({
  title,
  description,
}: FormSectionHeaderProps) {
  return (
    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
      <h2 className="text-sm font-semibold text-slate-900">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Form field
// ============================================================================

interface FormFieldProps {
  readonly label: string;

  readonly required?: boolean;

  readonly hint?: string;

  readonly error?: string;

  readonly children: React.ReactNode;
}

function FormField({
  label,
  required = false,
  hint,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="min-w-0">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </span>

        <div className="mt-1.5">
          {children}
        </div>
      </label>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// ============================================================================
// Input styles
// ============================================================================

function getInputClassName(
  hasError: boolean,
): string {
  return [
    "block w-full rounded-lg border bg-white px-3 py-2.5",
    "text-sm text-slate-900",
    "placeholder:text-slate-400",
    "outline-none transition",
    "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
    "focus:ring-2",
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10",
  ].join(" ");
}

// ============================================================================
// Email validation
// ============================================================================

function isValidEmail(
  value: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim(),
  );
}