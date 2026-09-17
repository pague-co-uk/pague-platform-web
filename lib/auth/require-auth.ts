import "server-only";

import {
  headers,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentUser,
} from "./get-current-user";

import type {
  CurrentUser,
} from "./get-current-user";

export async function requireAuth(): Promise<CurrentUser> {
  const user =
    await getCurrentUser();

  if (!user) {
    const requestHeaders =
      await headers();

    const returnTo =
      sanitizeReturnTo(
        requestHeaders.get(
          "x-pague-return-to",
        ),
      );

    redirect(
      `/login?returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  if (!user.active || user.locked) {
    const requestHeaders =
      await headers();

    const returnTo =
      sanitizeReturnTo(
        requestHeaders.get(
          "x-pague-return-to",
        ),
      );

    redirect(
      `/login?returnTo=${encodeURIComponent(returnTo)}`,
    );
  }

  return user;
}

function sanitizeReturnTo(
  value: string | null,
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