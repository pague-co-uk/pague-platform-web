import "server-only";

import { cookies } from "next/headers";

// ============================================================================
// Types
// ============================================================================

export interface CurrentUser {
  userId: string;

  clientId: string;

  username: string;

  email: string;

  firstName: string;

  lastName: string;

  active: boolean;

  locked: boolean;

  mfaEnabled: boolean;

  roles: readonly AuthenticatedRole[];
}

export interface AuthenticatedRole {
  id: string;

  name: string;

  description: string | null;

  permissions: readonly AuthenticatedPermission[];
}

export interface AuthenticatedPermission {
  id: string;

  name: string;

  description: string | null;

  module: string;
}

// ============================================================================
// Control Plane response
// ============================================================================

interface AuthenticatedUserResponse {
  id: string;

  clientId: string;

  firstName: string;

  lastName: string;

  username: string;

  email: string;

  active: boolean;

  locked: boolean;

  mfaEnabled: boolean;

  roles: readonly AuthenticatedRole[];
}

interface ApiResponseEnvelope {
  success: boolean;

  data: unknown;

  meta?: unknown;
}

// ============================================================================
// Current user
// ============================================================================

export async function getCurrentUser(): Promise<
  CurrentUser | null
> {
  const cookieStore =
    await cookies();

  // ==========================================================================
  // Read browser authentication cookies
  //
  // IMPORTANT:
  //
  // Never log cookie values.
  // ==========================================================================

  const cookiesFromBrowser =
    cookieStore.getAll();

  const sessionCookie =
    cookieStore.get(
      "session",
    );

  const refreshTokenCookie =
    cookieStore.get(
      "refreshToken",
    );

  // ==========================================================================
  // No authentication cookies
  // ==========================================================================

  if (
    !sessionCookie?.value &&
    !refreshTokenCookie?.value
  ) {
    console.warn(
      "[Auth] No authentication cookies available. User is unauthenticated.",
    );

    return null;
  }

  // ==========================================================================
  // Build Cookie header
  //
  // Forward cookies exactly as received.
  //
  // Do NOT encode the cookie values.
  // ==========================================================================

  const cookieHeader =
    cookiesFromBrowser
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join("; ");

  // ==========================================================================
  // Control Plane
  // ==========================================================================

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/auth/me`,
        {
          method: "GET",

          headers: {
            Cookie:
              cookieHeader,
          },

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Auth] Failed to connect to Control Plane.",
      error,
    );

    throw new Error(
      "Unable to connect to the authentication service.",
    );
  }
  // ==========================================================================
  // Unauthenticated
  // ==========================================================================

  if (
    response.status ===
    401
  ) {
    console.warn(
      "[Auth] Control Plane rejected the authentication cookies.",
      {
        sessionPresent:
          Boolean(
            sessionCookie?.value,
          ),

        refreshTokenPresent:
          Boolean(
            refreshTokenCookie?.value,
          ),
      },
    );

    return null;
  }

  // ==========================================================================
  // Unexpected Control Plane failure
  // ==========================================================================

  if (!response.ok) {
    throw new Error(
      `Failed to retrieve authenticated user. Control Plane returned HTTP ${response.status}.`,
    );
  }

  // ==========================================================================
  // Parse response
  // ==========================================================================

  const responseText =
    await response.text();

  let responseBody: unknown;

  try {
    responseBody =
      JSON.parse(
        responseText,
      );
  } catch (error) {
    console.error(
      "[Auth] Control Plane /api/auth/me returned invalid JSON.",
      {
        error,
        body:
          responseText,
      },
    );

    throw new Error(
      "Control Plane returned an invalid authentication response.",
    );
  }

  // ==========================================================================
  // Extract user from standard API envelope
  // ==========================================================================

  if (
    !isApiResponseEnvelope(
      responseBody,
    )
  ) {
    console.error(
      "[Auth] Control Plane /api/auth/me returned an invalid API response.",
      {
        responseBody,
      },
    );

    throw new Error(
      "Invalid authentication response.",
    );
  }

  if (
    !responseBody.success
  ) {
    console.error(
      "[Auth] Control Plane /api/auth/me returned success=false.",
      {
        responseBody,
      },
    );

    return null;
  }

  if (
    !isAuthenticatedUserResponse(
      responseBody.data,
    )
  ) {
    console.error(
      "[Auth] Control Plane /api/auth/me returned an unexpected user response.",
      {
        responseBody,
      },
    );

    throw new Error(
      "Invalid authenticated user response.",
    );
  }

  const user =
    responseBody.data;

  // ==========================================================================
  // Authentication succeeded
  // ==========================================================================

  // ==========================================================================
  // Return authenticated user
  // ==========================================================================

  return {
    userId:
      user.id,

    clientId:
      user.clientId,

    username:
      user.username,

    email:
      user.email,

    firstName:
      user.firstName,

    lastName:
      user.lastName,

    active:
      user.active,

    locked:
      user.locked,

    mfaEnabled:
      user.mfaEnabled,

    roles:
      user.roles,
  };
}

// ============================================================================
// Authenticated user type guard
// ============================================================================

function isAuthenticatedUserResponse(
  value: unknown,
): value is AuthenticatedUserResponse {
  if (
    typeof value !==
    "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<AuthenticatedUserResponse>;

  return (
    typeof candidate.id ===
    "string" &&

    typeof candidate.clientId ===
    "string" &&

    typeof candidate.firstName ===
    "string" &&

    typeof candidate.lastName ===
    "string" &&

    typeof candidate.username ===
    "string" &&

    typeof candidate.email ===
    "string" &&

    typeof candidate.active ===
    "boolean" &&

    typeof candidate.locked ===
    "boolean" &&

    typeof candidate.mfaEnabled ===
    "boolean" &&

    Array.isArray(
      candidate.roles,
    )
  );
}

// ============================================================================
// API response envelope type guard
// ============================================================================

function isApiResponseEnvelope(
  value: unknown,
): value is ApiResponseEnvelope {
  if (
    typeof value !==
    "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Partial<ApiResponseEnvelope>;

  return (
    typeof candidate.success ===
    "boolean" &&
    "data" in candidate
  );
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