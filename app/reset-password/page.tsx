import { Suspense } from "react";

import ResetPasswordForm from "./reset-password-form";

// ============================================================================
// Reset password page
// ============================================================================

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center bg-[#0B1F3A] text-[#F8FAFC]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}