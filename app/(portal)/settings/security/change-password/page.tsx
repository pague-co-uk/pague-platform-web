"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  PageContainer,
} from "@/components/layout/page-container";

import {
  PageHeader,
} from "@/components/layout/page-header";

// ============================================================================
// Change password page
// ============================================================================

export default function ChangePasswordPage() {
  const router =
    useRouter();

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    success,
    setSuccess,
  ] = useState(false);

  // ==========================================================================
  // Submit
  // ==========================================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const currentPassword =
      String(
        formData.get(
          "currentPassword",
        ) ?? "",
      );

    const newPassword =
      String(
        formData.get(
          "newPassword",
        ) ?? "",
      );

    const confirmPassword =
      String(
        formData.get(
          "confirmPassword",
        ) ?? "",
      );

    // ========================================================================
    // Client-side validation
    // ========================================================================

    if (!currentPassword) {
      setError(
        "Enter your current password.",
      );

      return;
    }

    if (!newPassword) {
      setError(
        "Enter your new password.",
      );

      return;
    }

    if (!confirmPassword) {
      setError(
        "Confirm your new password.",
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New password confirmation does not match.",
      );

      return;
    }

    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/auth/change-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword,
              }),

            cache: "no-store",
          },
        );

      // ======================================================================
      // Handle authentication failure
      // ======================================================================

      if (
        response.status ===
        401
      ) {
        router.replace(
          "/login",
        );

        return;
      }

      // ======================================================================
      // 204 No Content
      //
      // The Control Plane returns 204 after successfully changing the
      // password. There is deliberately no response body to parse.
      // ======================================================================

      if (
        response.status ===
        204
      ) {
        setSuccess(true);

        form.reset();

        return;
      }

      // ======================================================================
      // Error response
      // ======================================================================

      const responseBody =
        (await response
          .json()
          .catch(
            () => null,
          )) as unknown;

      if (!response.ok) {
        setError(
          getErrorMessage(
            responseBody,
            "Unable to change your password. Please try again.",
          ),
        );

        return;
      }

      // ==========================================================================
      // Unexpected successful response
      // ==========================================================================

      setSuccess(true);

      form.reset();
    } catch (error) {
      console.error(
        "[Auth] Change-password request failed.",
        error,
      );

      setError(
        "Unable to connect to the authentication service. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Change password"
        description="Update the password used to access your Pague account."
      />

      {/* ====================================================================
          Centered content
      ==================================================================== */}

      <div className="flex w-full justify-center">
        <div className="w-full max-w-lg">

          {/* ==================================================================
              Success
          ================================================================== */}

          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"
            >
              <div className="flex items-start gap-3">

                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="m5 12 4 4L19 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    Password changed successfully.
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Your password has been updated.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* ==================================================================
              Error
          ================================================================== */}

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          {/* ==================================================================
              Form
          ================================================================== */}

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-5 sm:p-6"
            >

              {/* ==============================================================
                  Current password
              ============================================================== */}

              <PasswordField
                id="currentPassword"
                name="currentPassword"
                label="Current password"
                autoComplete="current-password"
                placeholder="Enter your current password"
                visible={
                  showCurrentPassword
                }
                onToggle={() =>
                  setShowCurrentPassword(
                    (value) =>
                      !value,
                  )
                }
              />

              {/* ==============================================================
                  New password
              ============================================================== */}

              <PasswordField
                id="newPassword"
                name="newPassword"
                label="New password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                visible={
                  showNewPassword
                }
                onToggle={() =>
                  setShowNewPassword(
                    (value) =>
                      !value,
                  )
                }
              />

              {/* ==============================================================
                  Confirm password
              ============================================================== */}

              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm new password"
                autoComplete="new-password"
                placeholder="Confirm your new password"
                visible={
                  showConfirmPassword
                }
                onToggle={() =>
                  setShowConfirmPassword(
                    (value) =>
                      !value,
                  )
                }
              />

              {/* ==============================================================
                  Actions
              ============================================================== */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <Link
                  href="/"
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
                  aria-busy={
                    isSubmitting
                  }
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden="true"
                    />
                  )}

                  {isSubmitting
                    ? "Changing password…"
                    : "Change password"}
                </button>

              </div>
            </form>
          </div>

          {/* ==================================================================
              Security note
          ================================================================== */}

          <p className="mt-4 text-center text-xs text-slate-400">
            Changing your password will sign you out of your
            other active sessions.
          </p>

        </div>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// Password field
// ============================================================================

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  placeholder,
  visible,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-slate-600"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={
            visible
              ? "text"
              : "password"
          }
          autoComplete={
            autoComplete
          }
          placeholder={
            placeholder
          }
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-16 text-sm text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
          required
        />

        <button
          type="button"
          onClick={
            onToggle
          }
          className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
        >
          {visible
            ? "Hide"
            : "Show"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Error handling
// ============================================================================

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data !== "object" ||
    data === null
  ) {
    return fallback;
  }

  // ==========================================================================
  // NestJS error object
  // ==========================================================================

  if (
    "error" in data &&
    typeof data.error ===
    "object" &&
    data.error !== null
  ) {
    const error =
      data.error;

    if (
      "message" in error &&
      typeof error.message ===
      "string" &&
      error.message.trim()
    ) {
      return error.message;
    }

    if (
      "message" in error &&
      Array.isArray(
        error.message,
      )
    ) {
      const messages =
        error.message.filter(
          (
            value,
          ): value is string =>
            typeof value ===
            "string" &&
            value.trim()
              .length > 0,
        );

      if (
        messages.length > 0
      ) {
        return messages.join(
          ". ",
        );
      }
    }
  }

  // ==========================================================================
  // Top-level message
  // ==========================================================================

  if (
    "message" in data &&
    typeof data.message ===
    "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  // ==========================================================================
  // Top-level message array
  // ==========================================================================

  if (
    "message" in data &&
    Array.isArray(
      data.message,
    )
  ) {
    const messages =
      data.message.filter(
        (
          value,
        ): value is string =>
          typeof value ===
          "string" &&
          value.trim()
            .length > 0,
      );

    if (
      messages.length > 0
    ) {
      return messages.join(
        ". ",
      );
    }
  }

  return fallback;
}