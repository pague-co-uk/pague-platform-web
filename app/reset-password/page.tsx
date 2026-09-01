"use client";

import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import Image from "next/image";

import Link from "next/link";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

// ============================================================================
// Reset password page
// ============================================================================

export default function ResetPasswordPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const token =
    searchParams.get(
      "token",
    );

  const [
    showPassword,
    setShowPassword,
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
    completed,
    setCompleted,
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

    if (!token) {
      setError(
        "This password reset link is invalid or incomplete.",
      );

      return;
    }

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const password =
      String(
        formData.get(
          "password",
        ) ?? "",
      );

    const confirmPassword =
      String(
        formData.get(
          "confirmPassword",
        ) ?? "",
      );

    // ========================================================================
    // Validation
    // ========================================================================

    if (!password) {
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
      password !==
      confirmPassword
    ) {
      setError(
        "Password confirmation does not match.",
      );

      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/auth/reset-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                token,
                password,
                confirmPassword,
              }),

            cache: "no-store",
          },
        );

      const responseBody =
        response.status === 204
          ? null
          : ((await response
            .json()
            .catch(
              () => null,
            )) as unknown);

      // ======================================================================
      // Failed
      // ======================================================================

      if (!response.ok) {
        setError(
          getErrorMessage(
            responseBody,
            "Unable to reset your password. The reset link may have expired or already been used.",
          ),
        );

        return;
      }

      // ======================================================================
      // Successful
      // ======================================================================

      setCompleted(true);
    } catch (error) {
      console.error(
        "[Auth] Password reset request failed.",
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
    <main
      className={`${inter.variable} ${fraunces.variable} ${mono.variable} relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#0F2847] to-[#0B1F3A] text-[#F8FAFC]`}
      style={{
        fontFamily:
          "var(--font-sans)",
      }}
    >
      {/* ====================================================================
          Background
      ==================================================================== */}

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize:
              "32px 32px",
          }}
        />

        <div
          className="absolute left-1/2 top-[-380px] h-[720px] w-[720px] -translate-x-1/2 rounded-full opacity-[0.30] blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #2563EB 0%, #3B82F6 40%, transparent 70%)",
          }}
        />
      </div>

      {/* ====================================================================
          Page
      ==================================================================== */}

      <div className="relative z-10 flex min-h-[100dvh] flex-col">

        {/* ==================================================================
            Header
        ================================================================== */}

        <header className="shrink-0 px-6 pt-7 sm:px-8 sm:pt-9 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/login"
              aria-label="Back to login"
              className="group inline-flex cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <Image
                src="/logo.png"
                alt="Pague"
                width={200}
                height={68}
                priority
                className="h-9 w-auto object-contain brightness-0 invert transition duration-300 group-hover:scale-105 sm:h-11"
              />
            </Link>
          </div>
        </header>

        {/* ==================================================================
            Main
        ================================================================== */}

        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-[420px]">

            {completed ? (
              // ================================================================
              // Success
              // ================================================================

              <div className="text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      d="m5 12 4 4L19 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h1
                  className="mt-5 text-3xl font-light"
                  style={{
                    fontFamily:
                      "var(--font-display)",
                  }}
                >
                  Password updated.
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#F8FAFC]/50">
                  Your password has been changed
                  successfully. You can now sign in
                  with your new password.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.replace(
                      "/login",
                    )
                  }
                  className="mt-7 inline-flex h-11 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-6 text-sm font-medium text-white shadow-[0_8px_32px_rgba(37,99,235,0.35)] transition hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-blue-500/25"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                {/* ==========================================================
                    Heading
                =========================================================== */}

                <div className="mb-8 text-center">

                  <div className="mb-4 flex items-center justify-center gap-3">
                    <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#3B82F6]/50" />

                    <span
                      className={`text-[10px] font-medium uppercase tracking-[0.15em] text-[#F8FAFC]/30 ${mono.className}`}
                    >
                      Password reset
                    </span>

                    <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#3B82F6]/50" />
                  </div>

                  <h1
                    className="text-3xl font-light"
                    style={{
                      fontFamily:
                        "var(--font-display)",
                    }}
                  >
                    Create a new password.
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-[#F8FAFC]/50">
                    Choose a new password for your
                    Pague account.
                  </p>
                </div>

                {/* ==========================================================
                    Invalid token
                =========================================================== */}

                {!token && (
                  <div
                    role="alert"
                    className="mb-4 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-xs leading-5 text-red-200"
                  >
                    This password reset link is
                    invalid or incomplete.
                  </div>
                )}

                {/* ==========================================================
                    Error
                =========================================================== */}

                {error && (
                  <div
                    role="alert"
                    className="mb-4 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-xs leading-5 text-red-200"
                  >
                    {error}
                  </div>
                )}

                {/* ==========================================================
                    Form
                =========================================================== */}

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-4"
                >

                  {/* ========================================================
                      Password
                  ========================================================= */}

                  <div>
                    <label
                      htmlFor="password"
                      className={`mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#F8FAFC]/60 ${mono.className}`}
                    >
                      New password
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Enter your new password"
                        onChange={() => {
                          if (error) {
                            setError(null);
                          }
                        }}
                        className="h-12 w-full rounded-lg border border-white/[0.15] bg-white/5 px-4 pr-16 text-sm text-[#F8FAFC] placeholder:text-[#F8FAFC]/30 backdrop-blur-sm transition focus:border-[#60A5FA] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#60A5FA]/30"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (
                              value,
                            ) =>
                              !value,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#F8FAFC]/40 transition hover:bg-white/10 hover:text-[#F8FAFC]/80 focus:outline-none"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* ========================================================
                      Confirm password
                  ========================================================= */}

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className={`mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#F8FAFC]/60 ${mono.className}`}
                    >
                      Confirm new password
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Confirm your new password"
                        onChange={() => {
                          if (error) {
                            setError(null);
                          }
                        }}
                        className="h-12 w-full rounded-lg border border-white/[0.15] bg-white/5 px-4 pr-16 text-sm text-[#F8FAFC] placeholder:text-[#F8FAFC]/30 backdrop-blur-sm transition focus:border-[#60A5FA] focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#60A5FA]/30"
                        required
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (
                              value,
                            ) =>
                              !value,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#F8FAFC]/40 transition hover:bg-white/10 hover:text-[#F8FAFC]/80 focus:outline-none"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password confirmation"
                            : "Show password confirmation"
                        }
                      >
                        {showConfirmPassword
                          ? "Hide"
                          : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* ========================================================
                      Submit
                  ========================================================= */}

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !token
                    }
                    aria-busy={
                      isSubmitting
                    }
                    className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-sm font-medium text-white shadow-[0_8px_32px_rgba(37,99,235,0.35)] transition hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(37,99,235,0.45)] focus:outline-none focus:ring-4 focus:ring-blue-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isSubmitting && (
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-hidden="true"
                      />
                    )}

                    {isSubmitting
                      ? "Updating password…"
                      : "Reset password"}
                  </button>
                </form>

                {/* ==========================================================
                    Back
                =========================================================== */}

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="cursor-pointer text-sm text-[#F8FAFC]/40 transition hover:text-[#60A5FA] hover:underline"
                  >
                    Back to sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ==================================================================
            Footer
        ================================================================== */}

        <footer className="shrink-0 px-6 pb-5 text-center">
          <p className="text-[10px] text-white sm:text-[11px]">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Pague. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
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
  // Standard API error envelope
  // ==========================================================================

  if (
    "data" in data &&
    typeof data.data ===
    "object" &&
    data.data !== null
  ) {
    const nested =
      getErrorMessage(
        data.data,
        "",
      );

    if (nested) {
      return nested;
    }
  }

  // ==========================================================================
  // error.message
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
  }

  // ==========================================================================
  // message
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
  // error
  // ==========================================================================

  if (
    "error" in data &&
    typeof data.error ===
    "string" &&
    data.error.trim()
  ) {
    return data.error;
  }

  return fallback;
}