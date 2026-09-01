import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "@/lib/auth/get-current-user";

import LoginForm from "./login-form";

// ============================================================================
// Login page
//
// This is deliberately a Server Component.
//
// Before rendering the login form, we ask the Control Plane whether the
// browser already has a valid authenticated session.
//
// If the session is valid, the user is sent directly to the dashboard.
// ============================================================================

export default async function LoginPage() {
  // ==========================================================================
  // Check existing authentication
  // ==========================================================================

  const user =
    await getCurrentUser();

  // ==========================================================================
  // Already authenticated
  // ==========================================================================

  if (
    user &&
    user.active &&
    !user.locked
  ) {
    redirect("/");
  }

  // ==========================================================================
  // Unauthenticated
  //
  // Render the client-side login experience.
  // ==========================================================================

  return <LoginForm />;
}