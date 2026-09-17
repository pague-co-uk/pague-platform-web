"use client";

import {
  Fraunces,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import Image from "next/image";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

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
// SVG Icons
// ============================================================================

const MessagingIcon = ({
  className,
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01" />
    <path d="M12 10h.01" />
    <path d="M16 10h.01" />
  </svg>
);

const PaymentsIcon = ({
  className,
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect
      x="1"
      y="4"
      width="22"
      height="16"
      rx="2"
      ry="2"
    />

    <line
      x1="1"
      y1="10"
      x2="23"
      y2="10"
    />

    <circle
      cx="18"
      cy="14"
      r="1"
    />

    <circle
      cx="6"
      cy="14"
      r="1"
    />
  </svg>
);

const MobileMoneyIcon = ({
  className,
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect
      x="5"
      y="2"
      width="14"
      height="20"
      rx="2"
      ry="2"
    />

    <line
      x1="12"
      y1="18"
      x2="12.01"
      y2="18"
    />

    <path d="M8 6h8" />
    <path d="M8 10h8" />
    <path d="M8 14h5" />
  </svg>
);

// ============================================================================
// Platform rails
// ============================================================================

const RAILS = [
  {
    key: "messaging",
    label: "Messaging",
    detail:
      "SMS delivered · 12,480 recipients · 98ms",
    icon: MessagingIcon,
  },
  {
    key: "payments",
    label: "Payments",
    detail:
      "Payment settled · £128.40 · Card",
    icon: PaymentsIcon,
  },
  {
    key: "mobile-money",
    label: "Mobile Money",
    detail:
      "Transfer confirmed · M-Pesa · Kenya",
    icon: MobileMoneyIcon,
  },
] as const;

// ============================================================================
// API response
// ============================================================================

interface LoginResponseData {
  requiresMfa: boolean;
}

interface LoginResponse {
  data: LoginResponseData;

  meta?: {
    requestId?: string;

    timestamp?: string;
  };
}

// ============================================================================
// Login form props
// ============================================================================

interface LoginFormProps {
  returnTo: string;
}

// ============================================================================
// Login page
// ============================================================================

export default function LoginForm({
  returnTo,
}: LoginFormProps) {
  const router =
    useRouter();

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    active,
    setActive,
  ] = useState(0);

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

  // ==========================================================================
  // Rail animation
  // ==========================================================================

  useEffect(() => {
    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    if (reduceMotion) {
      return;
    }

    const id =
      window.setInterval(() => {
        setActive(
          (value) =>
            (value + 1) %
            RAILS.length,
        );
      }, 3200);

    return () =>
      window.clearInterval(id);
  }, []);

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
    // Read credentials directly from the submitted form.
    //
    // The password is deliberately not kept in React state.
    // ========================================================================

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

    const password =
      String(
        formData.get(
          "password",
        ) ?? "",
      );

    // ========================================================================
    // Client-side validation
    // ========================================================================

    if (!identifier) {
      setError(
        "Enter your email or username.",
      );

      return;
    }

    if (!password) {
      setError(
        "Enter your password.",
      );

      return;
    }

    // ========================================================================
    // Submit
    // ========================================================================

    setIsSubmitting(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/auth/login",
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
                identifier,
                password,
              }),

            cache: "no-store",
          },
        );

      // ======================================================================
      // Parse response safely.
      // ======================================================================

      const responseBody =
        (await response
          .json()
          .catch(
            () => null,
          )) as unknown;

      // ======================================================================
      // Authentication failed
      // ======================================================================

      if (!response.ok) {
        setError(
          getErrorMessage(
            responseBody,
            "Unable to sign in. Please check your credentials and try again.",
          ),
        );

        return;
      }

      // ======================================================================
      // Validate successful response.
      // ======================================================================

      if (
        !isLoginResponse(
          responseBody,
        )
      ) {
        console.error(
          "Invalid login response:",
          responseBody,
        );

        setError(
          "The authentication service returned an invalid response. Please try again.",
        );

        return;
      }

      const loginData =
        responseBody.data;

      // ======================================================================
      // MFA required
      //
      // IMPORTANT:
      //
      // The verification token is NOT handled here.
      //
      // The Next.js /api/auth/login route has already stored the token in
      // the HTTP-only pague_mfa_token cookie.
      //
      // The browser therefore only needs to navigate to /mfa while carrying
      // the original return URL.
      // ======================================================================

      if (
        loginData.requiresMfa
      ) {
        router.replace(
          `/mfa?returnTo=${encodeURIComponent(returnTo)}`,
        );

        return;
      }

      // ======================================================================
      // Authentication completed without MFA
      //
      // The login route has already forwarded the Control Plane's
      // authentication cookie to the browser.
      //
      // Return the user to the page that originally required authentication.
      // ======================================================================

      router.replace(
        returnTo,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Login request failed:",
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

  return (
    <main
      className={`${inter.variable} ${fraunces.variable} ${mono.variable} relative h-[100dvh] overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#0F2847] to-[#0B1F3A] text-[#F8FAFC]`}
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

        {/* Animated gradient orb */}

        <div
          className="absolute left-1/2 top-[-380px] h-[720px] w-[720px] -translate-x-1/2 animate-pulse rounded-full opacity-[0.30] blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #2563EB 0%, #3B82F6 40%, transparent 70%)",
            animationDuration:
              "8s",
          }}
        />

        {/* Animated gradient orb */}

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

      <div className="relative z-10 flex h-full flex-col">

        {/* ==================================================================
            Header
        ================================================================== */}

        <header className="shrink-0 px-6 pt-7 sm:px-8 sm:pt-9 lg:px-12">
          <div className="mx-auto flex max-w-6xl items-center sm:items-start">
            <div className="group relative">
              <Image
                src="/logo.png"
                alt="Pague"
                width={200}
                height={68}
                priority
                className="h-9 w-auto object-contain brightness-0 invert transition duration-300 group-hover:scale-105 sm:h-11"
              />

              <div className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] transition-all duration-300 group-hover:w-full" />
            </div>
          </div>
        </header>

        {/* ==================================================================
            Main
        ================================================================== */}

        <div className="min-h-0 flex-1 px-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex h-full max-w-6xl items-center justify-center">
            <div className="w-full max-w-3xl -translate-y-1">

              {/* ============================================================
                  Platform branding
              ============================================================ */}

              <div className="text-center">
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#3B82F6]/50" />

                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#F8FAFC]/30">
                      Unified Platform
                    </span>

                    <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#3B82F6]/50" />
                  </div>
                </div>

                <h1
                  className="text-1xl font-light tracking-tight sm:text-2xl md:text-3xl"
                  style={{
                    fontFamily:
                      "var(--font-display)",
                  }}
                >
                  Every message.{" "}
                  <span className="bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] bg-clip-text text-transparent">
                    Every payment.
                  </span>
                </h1>

                <p className="mx-auto mt-4 max-w-[1000px] text-sm leading-6 text-[#F8FAFC]/60 sm:text-base sm:leading-7">
                  Bulk SMS, card payments, and mobile money —
                  sent, settled, and reconciled from a single
                  control plane.
                </p>
              </div>

              {/* ============================================================
                  Login
              ============================================================ */}

              <div className="mx-auto mt-8 w-full max-w-[420px] sm:mt-10">

                <div className="mb-6 text-center sm:mb-7">
                  <h2
                    className="text-2xl font-light tracking-[-0.02em] text-[#F8FAFC] sm:text-3xl"
                    style={{
                      fontFamily:
                        "var(--font-display)",
                    }}
                  >
                    Welcome back.
                  </h2>

                  <p className="mt-2 text-sm text-[#F8FAFC]/50">
                    Sign in to continue to your platform.
                  </p>
                </div>

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
                  className="mx-auto w-full space-y-4"
                >

                  {/* ========================================================
                      Identifier
                  ========================================================= */}

                  <div>
                    <label
                      htmlFor="identifier"
                      className={`mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#F8FAFC]/60 ${mono.className}`}
                    >
                      Email or username
                    </label>

                    <div className="group relative">
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#3B82F6]/20 to-[#60A5FA]/20 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />

                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        inputMode="email"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="you@example.com"
                        onChange={() => {
                          if (error) {
                            setError(
                              null,
                            );
                          }
                        }}
                        className="relative h-12 w-full rounded-lg border border-white/[0.15] bg-white/5 px-4 text-sm text-[#F8FAFC] backdrop-blur-sm transition-all duration-300 placeholder:text-[#F8FAFC]/30 hover:border-white/[0.30] focus:border-[#60A5FA] focus:bg-white/10 focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* ========================================================
                      Password
                  ========================================================= */}

                  <div>
                    <label
                      htmlFor="password"
                      className={`mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#F8FAFC]/60 ${mono.className}`}
                    >
                      Password
                    </label>

                    <div className="group relative">
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#3B82F6]/20 to-[#60A5FA]/20 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        onChange={() => {
                          if (error) {
                            setError(
                              null,
                            );
                          }
                        }}
                        className="relative h-12 w-full rounded-lg border border-white/[0.15] bg-white/5 px-4 pr-16 text-sm text-[#F8FAFC] backdrop-blur-sm transition-all duration-300 placeholder:text-[#F8FAFC]/30 hover:border-white/[0.30] focus:border-[#60A5FA] focus:bg-white/10 focus:shadow-[0_0_30px_rgba(59,130,246,0.15)] focus:outline-none"
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
                        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#F8FAFC]/40 transition-all duration-300 hover:bg-white/10 hover:text-[#F8FAFC]/80 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 ${mono.className}`}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        aria-pressed={
                          showPassword
                        }
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* ========================================================
                      Sign in
                  ========================================================= */}

                  <button
                    type="submit"
                    disabled={
                      isSubmitting
                    }
                    aria-busy={
                      isSubmitting
                    }
                    className="relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-sm font-medium text-white shadow-[0_8px_32px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(37,99,246,0.45)] focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isSubmitting && (
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-hidden="true"
                      />
                    )}

                    {isSubmitting
                      ? "Signing in…"
                      : "Sign in"}
                  </button>
                </form>

                {/* ==========================================================
                    Forgot password
                =========================================================== */}

                <div className="mt-4 text-center">
                  <Link
                    href="/forgot-password"
                    className="inline-flex cursor-pointer rounded text-sm font-medium text-[#F8FAFC]/40 transition-all duration-300 hover:text-[#60A5FA] hover:underline focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* ==========================================================
                    Platform rails
                =========================================================== */}

                <div className="mt-6 border-t border-white/[0.06] pt-4">
                  <div
                    className="mx-auto mt-8 max-w-[520px] sm:mt-10"
                    aria-hidden="true"
                  >
                    <div className="relative">

                      <div className="absolute left-0 right-0 top-[20px] h-px bg-gradient-to-r from-transparent via-white/[0.50] to-transparent" />

                      <div className="relative flex justify-between">
                        {RAILS.map(
                          (
                            rail,
                            index,
                          ) => {
                            const isActive =
                              index ===
                              active;

                            const IconComponent =
                              rail.icon;

                            return (
                              <button
                                key={
                                  rail.key
                                }
                                type="button"
                                className="group flex cursor-pointer flex-col items-center gap-2"
                                onClick={() =>
                                  setActive(
                                    index,
                                  )
                                }
                              >
                                <div className="relative">

                                  <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 ${isActive
                                        ? "border-[#3B82F6] bg-[#3B82F6]/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                                        : "border-white/20 bg-[#0B1F3A] hover:border-white/40"
                                      }`}
                                  >
                                    <IconComponent
                                      className={`h-4 w-4 transition-colors duration-500 ${isActive
                                          ? "text-[#60A5FA]"
                                          : "text-white/30 group-hover:text-white/50"
                                        }`}
                                    />
                                  </div>

                                  {isActive && (
                                    <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#3B82F6]/20" />
                                  )}
                                </div>

                                <div className="text-center">
                                  <span
                                    className={`block text-[10px] font-medium tracking-[0.12em] transition-colors duration-500 ${isActive
                                        ? "text-[#60A5FA]"
                                        : "text-white/30 group-hover:text-white/50"
                                      }`}
                                  >
                                    {
                                      rail.label
                                    }
                                  </span>
                                </div>
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    <div className="mt-3 h-5 overflow-hidden text-center">
                      <p
                        key={
                          active
                        }
                        className="animate-[fadeSlide_0.5s_ease] font-mono text-[10px] text-[#F8FAFC]/40 sm:text-[11px]"
                      >
                        {
                          RAILS[
                            active
                          ].detail
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================
            Footer
        ================================================================== */}

        <footer className="shrink-0 px-6 pb-5 sm:px-8 sm:pb-6 lg:px-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row">

            <p className="text-[10px] text-[#ffffff] sm:text-[11px]">
              ©{" "}
              {new Date().getFullYear()}{" "}
              Pague. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex gap-3">

                <span className="h-4 w-px bg-white/10" />

                <div className="flex gap-2">
                  {[
                    "Status",
                    "Docs",
                    "Support",
                  ].map(
                    (item) => (
                      <button
                        key={
                          item
                        }
                        type="button"
                        className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#ffffff] transition-colors hover:text-[#F8FAFC]/50"
                      >
                        {
                          item
                        }
                      </button>
                    ),
                  )}
                </div>

              </div>
            </div>

          </div>
        </footer>
      </div>

      {/* ====================================================================
          Animation
      ==================================================================== */}

      <style jsx global>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-\\[fadeSlide_0\\.5s_ease\\] {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

// ============================================================================
// Response validation
// ============================================================================

function isLoginResponse(
  value: unknown,
): value is LoginResponse {
  if (
    typeof value !==
    "object" ||
    value === null
  ) {
    return false;
  }

  if (
    !("data" in value)
  ) {
    return false;
  }

  const data =
    value.data;

  if (
    typeof data !==
    "object" ||
    data === null
  ) {
    return false;
  }

  if (
    !(
      "requiresMfa" in
      data
    )
  ) {
    return false;
  }

  return (
    typeof data.requiresMfa ===
    "boolean"
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
        messages.length > 0
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