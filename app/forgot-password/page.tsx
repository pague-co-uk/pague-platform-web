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
// Forgot password page
// ============================================================================

export default function ForgotPasswordPage() {
  const router =
    useRouter();

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
    submitted,
    setSubmitted,
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

    const identifier =
      String(
        formData.get(
          "identifier",
        ) ?? "",
      ).trim();

    // ========================================================================
    // Validation
    // ========================================================================

    if (!identifier) {
      setError(
        "Enter your email or username.",
      );

      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/auth/forgot-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                identifier,
              }),

            cache: "no-store",
          },
        );

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
            "Unable to process your request. Please try again.",
          ),
        );

        return;
      }

      // ======================================================================
      // Always show the same recovery message.
      //
      // This deliberately does not reveal whether the account exists.
      // ======================================================================

      setSubmitted(true);
    } catch (error) {
      console.error(
        "[Auth] Forgot-password request failed.",
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
          Ambient background
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

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize:
              "60px 60px",
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
                className="h-9 w-auto object-contain brightness-0 invert transition duration-300 group-hover:scale-[1.02] sm:h-11"
              />
            </Link>
          </div>
        </header>

        {/* ==================================================================
            Main
        ================================================================== */}

        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
          <div className="w-full max-w-[420px]">

            {/* ==============================================================
                Heading
            ============================================================== */}

            <div className="mb-8 text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#3B82F6]/50" />

                <span
                  className={`text-[10px] font-medium uppercase tracking-[0.15em] text-[#F8FAFC]/30 ${mono.className}`}
                >
                  Account recovery
                </span>

                <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#3B82F6]/50" />
              </div>

              <h1
                className="text-3xl font-light tracking-tight text-[#F8FAFC]"
                style={{
                  fontFamily:
                    "var(--font-display)",
                }}
              >
                Forgot your password?
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#F8FAFC]/50">
                Enter your email or username and
                we&apos;ll send you instructions to
                reset your password.
              </p>
            </div>

            {/* ==============================================================
                Recovery result
            ============================================================== */}

            {submitted ? (
              <div className="rounded-xl border border-white/[0.10] bg-white/[0.05] p-6 text-center backdrop-blur-sm">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/10 text-blue-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
                    />

                    <path
                      d="m6.5 7 5.5 4 5.5-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2
                  className="mt-4 text-xl font-light text-[#F8FAFC]"
                  style={{
                    fontFamily:
                      "var(--font-display)",
                  }}
                >
                  Check your email.
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#F8FAFC]/50">
                  If an account matches the
                  information you provided, a
                  verification code and password
                  recovery instructions have been
                  sent.
                </p>

                <p className="mt-5 text-xs text-[#F8FAFC]/30">
                  Check your spam or junk folder if
                  you don&apos;t see the message.
                </p>

                <Link
                  href="/login"
                  className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-[#60A5FA] transition hover:bg-white/5 hover:text-[#93C5FD] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
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
                  <div>
                    <label
                      htmlFor="identifier"
                      className={`mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#F8FAFC]/60 ${mono.className}`}
                    >
                      Email or username
                    </label>

                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="you@example.com or username"
                      onChange={() => {
                        if (error) {
                          setError(null);
                        }
                      }}
                      className="h-12 w-full rounded-lg border border-white/[0.15] bg-white/5 px-4 text-sm text-[#F8FAFC] backdrop-blur-sm transition-all duration-300 placeholder:text-[#F8FAFC]/30 hover:border-white/[0.30] focus:border-[#60A5FA] focus:bg-white/10 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting
                    }
                    aria-busy={
                      isSubmitting
                    }
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-sm font-medium text-white shadow-[0_8px_32px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(37,99,235,0.45)] focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isSubmitting && (
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-hidden="true"
                      />
                    )}

                    {isSubmitting
                      ? "Sending…"
                      : "Send verification code"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="cursor-pointer text-sm font-medium text-[#F8FAFC]/40 transition hover:text-[#60A5FA] hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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

        <footer className="shrink-0 px-6 pb-5 sm:px-8 sm:pb-6 lg:px-12">
          <div className="mx-auto flex max-w-6xl justify-center">
            <p className="text-[10px] text-white sm:text-[11px]">
              ©{" "}
              {new Date().getFullYear()}{" "}
              Pague. All rights reserved.
            </p>
          </div>
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

  if (
    "message" in data &&
    typeof data.message ===
    "string" &&
    data.message.trim()
  ) {
    return data.message;
  }

  return fallback;
}