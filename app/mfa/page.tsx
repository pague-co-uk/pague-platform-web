"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import {
  useRouter,
} from "next/navigation";

import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

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
// MFA page
// ============================================================================

export default function MfaPage() {
  const router =
    useRouter();

  const [
    code,
    setCode,
  ] = useState("");

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

  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  // ==========================================================================
  // Focus code input
  // ==========================================================================

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ==========================================================================
  // Code input
  // ==========================================================================

  const handleCodeChange = (
    value: string,
  ) => {
    /*
     * MFA codes are six numeric digits.
     *
     * Strip everything except digits and limit the value to six characters.
     */

    const normalized =
      value
        .replace(/\D/g, "")
        .slice(0, 6);

    setCode(
      normalized,
    );

    if (error) {
      setError(null);
    }
  };

  // ==========================================================================
  // Submit
  // ==========================================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    // ========================================================================
    // Validate code
    // ========================================================================

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Enter the 6-digit verification code.",
      );

      inputRef.current?.focus();

      return;
    }

    // ========================================================================
    // Submit verification
    // ========================================================================

    setIsSubmitting(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/auth/mfa/verify",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            /*
             * The verificationToken is stored in an HTTP-only cookie by
             * /api/auth/login.
             *
             * JavaScript cannot read that cookie.
             *
             * The browser automatically sends it with this request.
             */

            credentials:
              "include",

            body:
              JSON.stringify({
                code,
              }),

            cache: "no-store",
          },
        );

      // ======================================================================
      // Parse response safely
      // ======================================================================

      const responseBody =
        (await response
          .json()
          .catch(
            () => null,
          )) as unknown;

      // ======================================================================
      // Verification failed
      // ======================================================================

      if (!response.ok) {
        // ====================================================================
        // MFA session expired / missing
        // ====================================================================

        if (
          response.status ===
          401
        ) {
          setError(
            "Your verification session has expired. Please sign in again.",
          );

          window.setTimeout(
            () => {
              router.replace(
                "/login",
              );
            },
            1200,
          );

          return;
        }

        // ====================================================================
        // Other verification errors
        // ====================================================================

        setError(
          getErrorMessage(
            responseBody,
            "The verification code is incorrect or has expired.",
          ),
        );

        /*
         * Only clear the code after an actual authentication rejection.
         *
         * The remember-device selection remains untouched so the user does
         * not have to select it again if they retry the code.
         */

        setCode("");

        inputRef.current?.focus();

        return;
      }

      // ======================================================================
      // Verification successful
      //
      // The MFA route has:
      //
      // 1. Verified the code.
      // 2. Forwarded the authenticated session cookie.
      // 3. Cleared the temporary MFA verification cookie.
      //
      // No authentication state is stored in localStorage or sessionStorage.
      // ======================================================================

      router.replace(
        "/",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "MFA verification request failed:",
        error,
      );

      setError(
        "Unable to connect to the authentication service. Please try again.",
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  };

  // ==========================================================================
  // Render
  // ==========================================================================

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
        {/* Dot texture */}

        <div
          className="absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize:
              "32px 32px",
          }}
        />

        {/* Top glow */}

        <div
          className="absolute left-1/2 top-[-380px] h-[720px] w-[720px] -translate-x-1/2 animate-pulse rounded-full opacity-[0.30] blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #2563EB 0%, #3B82F6 40%, transparent 70%)",
            animationDuration:
              "8s",
          }}
        />

        {/* Bottom glow */}

        <div
          className="absolute bottom-[-420px] left-1/2 h-[680px] w-[680px] -translate-x-1/2 animate-pulse rounded-full opacity-[0.15] blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #60A5FA 0%, #3B82F6 50%, transparent 70%)",
            animationDuration:
              "10s",
            animationDelay:
              "2s",
          }}
        />

        {/* Grid */}

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
            <Image
              src="/logo.png"
              alt="Pague"
              width={200}
              height={68}
              priority
              className="h-9 w-auto object-contain brightness-0 invert sm:h-11"
            />
          </div>
        </header>

        {/* ==================================================================
            Main
        ================================================================== */}

        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[420px]">

            {/* ==============================================================
                Heading
            =============================================================== */}

            <div className="text-center">

              {/* Security indicator */}

              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#60A5FA] shadow-[0_0_30px_rgba(59,130,246,0.12)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                  />

                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h1
                className="text-3xl font-light tracking-[-0.02em] text-[#F8FAFC]"
                style={{
                  fontFamily:
                    "var(--font-display)",
                }}
              >
                Verify your identity.
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#F8FAFC]/50">
                We&apos;ve sent a 6-digit verification
                code to your email address. Enter it
                below to complete sign in.
              </p>
            </div>

            {/* ==============================================================
                Form
            =============================================================== */}

            <div className="mt-8">

              {/* Error */}

              {error && (
                <div
                  id="mfa-error"
                  role="alert"
                  className="mb-4 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-xs leading-5 text-red-200"
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-5"
              >

                {/* ========================================================
                    Verification code
                ========================================================= */}

                <div>
                  <label
                    htmlFor="mfa-code"
                    className={`mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#F8FAFC]/60 ${mono.className}`}
                  >
                    Verification code
                  </label>

                  <input
                    ref={inputRef}
                    id="mfa-code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    autoFocus
                    maxLength={6}
                    value={code}
                    onChange={(
                      event,
                    ) =>
                      handleCodeChange(
                        event.target.value,
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                    aria-invalid={
                      error
                        ? true
                        : undefined
                    }
                    aria-describedby={
                      error
                        ? "mfa-error"
                        : undefined
                    }
                    className="h-14 w-full rounded-lg border border-white/[0.15] bg-white/5 px-4 text-center font-mono text-2xl font-medium tracking-[0.35em] text-[#F8FAFC] backdrop-blur-sm transition-all duration-300 placeholder:text-[#F8FAFC]/20 hover:border-white/[0.30] focus:border-[#60A5FA] focus:bg-white/10 focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="000000"
                  />

                  <p className="mt-2 text-center text-[11px] text-[#F8FAFC]/30">
                    The code expires shortly for your
                    security.
                  </p>
                </div>

                {/* ========================================================
                    Verify
                ========================================================= */}

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    code.length !== 6
                  }
                  aria-busy={
                    isSubmitting
                  }
                  className="relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-sm font-medium text-white shadow-[0_8px_32px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(37,99,235,0.45)] focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting && (
                    <span
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden="true"
                    />
                  )}

                  {isSubmitting
                    ? "Verifying…"
                    : "Verify and continue"}
                </button>
              </form>
            </div>

            {/* ==============================================================
                Security information
            =============================================================== */}

            <div className="mt-7 border-t border-white/[0.06] pt-5 text-center">

              <div className="flex items-center justify-center gap-2 text-[#F8FAFC]/30">

                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                  />

                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    strokeLinecap="round"
                  />
                </svg>

                <span className="text-[10px] uppercase tracking-[0.12em]">
                  Secure authentication
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-[#F8FAFC]/30">
                Your verification token is protected
                by an HTTP-only secure cookie and is
                never exposed to the browser application.
              </p>
            </div>

            {/* ==============================================================
                Back to login
            =============================================================== */}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() =>
                  router.replace(
                    "/login",
                  )
                }
                disabled={
                  isSubmitting
                }
                className="rounded text-sm font-medium text-[#F8FAFC]/40 transition-colors hover:text-[#60A5FA] hover:underline focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Return to sign in
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================================
            Footer
        ================================================================== */}

        <footer className="shrink-0 px-6 pb-5 sm:px-8 sm:pb-6 lg:px-12">
          <div className="mx-auto flex max-w-6xl justify-center">
            <p className="text-[10px] text-[#ffffff]/60 sm:text-[11px]">
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
    typeof data !==
    "object" ||
    data === null
  ) {
    return fallback;
  }

  // ==========================================================================
  // Standard API envelope
  //
  // {
  //   data: ...,
  //   meta: ...
  // }
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
  // message
  // ==========================================================================

  if (
    "message" in data
  ) {
    const message =
      data.message;

    if (
      typeof message ===
      "string" &&
      message.trim()
    ) {
      return message;
    }

    if (
      Array.isArray(
        message,
      )
    ) {
      const messages =
        message.filter(
          (
            value,
          ): value is string =>
            typeof value ===
            "string" &&
            value.trim()
              .length > 0,
        );

      if (
        messages.length >
        0
      ) {
        return messages.join(
          ". ",
        );
      }
    }
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