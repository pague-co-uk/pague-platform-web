import "server-only";

import { cookies } from "next/headers";

import type {
  User,
} from "../types/user";

// ============================================================================
// Error
// ============================================================================

export class ServerUsersApiError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);

    this.name =
      "ServerUsersApiError";

    this.status =
      status;
  }
}

// ============================================================================
// Configuration
// ============================================================================

function getControlPlaneUrl(): string {
  const value =
    process.env.CONTROL_PLANE_API_URL;

  if (!value) {
    throw new Error(
      "CONTROL_PLANE_API_URL is not configured.",
    );
  }

  return value.replace(
    /\/+$/,
    "",
  );
}

// ============================================================================
// Find user by ID
// ============================================================================

export async function findUserById(
  id: string,
): Promise<User | null> {
  // ==========================================================================
  // Authentication
  // ==========================================================================

  const cookieStore =
    await cookies();

  /*
   * The Control Plane currently authenticates the request using the session
   * cookie.
   */
  const session =
    cookieStore.get(
      "session",
    );

  if (!session?.value) {
    throw new ServerUsersApiError(
      "Authentication required.",
      401,
    );
  }

  // ==========================================================================
  // Request
  // ==========================================================================

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/users/${encodeURIComponent(id)}`,
        {
          method: "GET",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Users] Failed to connect to Control Plane.",
      error,
    );

    throw new ServerUsersApiError(
      "Unable to connect to the user service.",
      502,
    );
  }

  // ==========================================================================
  // Parse response
  // ==========================================================================

  const text =
    await response.text();

  let body: unknown =
    null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body =
        text;
    }
  }

  // ==========================================================================
  // Not found
  // ==========================================================================

  if (
    response.status ===
    404
  ) {
    return null;
  }

  // ==========================================================================
  // Authentication failure
  // ==========================================================================

  if (
    response.status ===
    401
  ) {
    throw new ServerUsersApiError(
      getErrorMessage(
        body,
        "Authentication required.",
      ),
      401,
    );
  }

  // ==========================================================================
  // Other API errors
  // ==========================================================================

  if (!response.ok) {
    throw new ServerUsersApiError(
      getErrorMessage(
        body,
        "Unable to load user.",
      ),
      response.status,
    );
  }

  // ==========================================================================
  // Validate response envelope
  // ==========================================================================

  if (
    typeof body !==
    "object" ||
    body === null
  ) {
    throw new ServerUsersApiError(
      "Invalid user response.",
      response.status,
    );
  }

  if (
    !("success" in body) ||
    body.success !== true
  ) {
    throw new ServerUsersApiError(
      "Invalid user response.",
      response.status,
    );
  }

  if (
    !("data" in body) ||
    typeof body.data !==
    "object" ||
    body.data === null
  ) {
    throw new ServerUsersApiError(
      "Invalid user response.",
      response.status,
    );
  }

  // ==========================================================================
  // Return user
  // ==========================================================================

  return body.data as User;
}

// ============================================================================
// Error extraction
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

  // --------------------------------------------------------------------------
  // Standard API error
  // --------------------------------------------------------------------------

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

  // --------------------------------------------------------------------------
  // Direct message
  // --------------------------------------------------------------------------

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