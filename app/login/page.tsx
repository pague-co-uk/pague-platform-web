import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import LoginForm from "./login-form";

// ============================================================================
// Types
// ============================================================================

interface LoginPageProps {
  searchParams: Promise<{
    returnTo?: string;
  }>;
}

// ============================================================================
// Login page
// ============================================================================

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const {
    returnTo,
  } = await searchParams;

  const safeReturnTo =
    sanitizeReturnTo(
      returnTo,
    );

  const user =
    await getCurrentUser();

  if (
    user &&
    user.active &&
    !user.locked
  ) {
    redirect(
      safeReturnTo,
    );
  }

  return (
    <LoginForm
      returnTo={
        safeReturnTo
      }
    />
  );
}

// ============================================================================
// Return URL validation
// ============================================================================

function sanitizeReturnTo(
  value: string | undefined,
): string {
  if (!value) {
    return "/";
  }

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\") ||
    value.includes("\\") ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  ) {
    return "/";
  }

  return value;
}