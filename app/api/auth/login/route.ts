import {
  NextRequest,
  NextResponse,
} from "next/server";

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
// Types
// ============================================================================

interface ControlPlaneLoginData {
  requiresMfa: boolean;

  sessionId?: string;

  verificationToken?: string;

  expiresAt?: string;
}

interface ControlPlaneLoginResponse {
  data: ControlPlaneLoginData;

  meta?: {
    requestId?: string;

    timestamp?: string;
  };
}

// ============================================================================
// POST /api/auth/login
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  // ==========================================================================
  // Read request body
  // ==========================================================================

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    const response =
      NextResponse.json(
        {
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );

    clearMfaCookie(
      response,
    );

    return response;
  }

  // ==========================================================================
  // Call Control Plane
  // ==========================================================================

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "User-Agent":
              request.headers.get(
                "user-agent",
              ) ?? "",
          },

          body:
            JSON.stringify(body),

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "Control Plane login request failed:",
      error,
    );

    const nextResponse =
      NextResponse.json(
        {
          message:
            "Unable to connect to the authentication service.",
        },
        {
          status: 502,
        },
      );

    clearMfaCookie(
      nextResponse,
    );

    return nextResponse;
  }

  // ==========================================================================
  // Read Control Plane response
  // ==========================================================================

  const responseBody =
    await response.text();

  // ==========================================================================
  // Authentication failed
  //
  // Nothing should be stored in the MFA cookie when login fails.
  // ==========================================================================

  if (!response.ok) {
    const nextResponse =
      new NextResponse(
        responseBody,
        {
          status:
            response.status,

          headers: {
            "Content-Type":
              response.headers.get(
                "content-type",
              ) ??
              "application/json",
          },
        },
      );

    clearMfaCookie(
      nextResponse,
    );

    return nextResponse;
  }

  // ==========================================================================
  // Parse Control Plane response
  // ==========================================================================

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(
        responseBody,
      );
  } catch {
    const nextResponse =
      NextResponse.json(
        {
          message:
            "Invalid response received from the authentication service.",
        },
        {
          status: 502,
        },
      );

    clearMfaCookie(
      nextResponse,
    );

    return nextResponse;
  }

  // ==========================================================================
  // Validate response structure
  // ==========================================================================

  if (
    !isControlPlaneLoginResponse(
      parsed,
    )
  ) {
    console.error(
      "Invalid Control Plane login response:",
      parsed,
    );

    const nextResponse =
      NextResponse.json(
        {
          message:
            "Invalid response received from the authentication service.",
        },
        {
          status: 502,
        },
      );

    clearMfaCookie(
      nextResponse,
    );

    return nextResponse;
  }

  const data =
    parsed.data;

  // ==========================================================================
  // MFA required
  // ==========================================================================

  if (
    data.requiresMfa
  ) {
    // ========================================================================
    // The Control Plane must provide a verification token.
    // ========================================================================

    if (
      !data.verificationToken
    ) {
      console.error(
        "MFA required but no verification token was returned.",
      );

      const nextResponse =
        NextResponse.json(
          {
            message:
              "Authentication service did not provide an MFA verification token.",
          },
          {
            status: 502,
          },
        );

      clearMfaCookie(
        nextResponse,
      );

      return nextResponse;
    }

    // ========================================================================
    // Create response.
    //
    // IMPORTANT:
    //
    // We deliberately DO NOT return verificationToken to the browser.
    //
    // It is stored in an HTTP-only cookie instead.
    // ========================================================================

    const nextResponse =
      NextResponse.json(
        {
          data: {
            requiresMfa:
              true,

            expiresAt:
              data.expiresAt ??
              null,
          },

          meta:
            parsed.meta ?? {},
        },
        {
          status: 200,
        },
      );

    // ========================================================================
    // Calculate token lifetime
    // ========================================================================

    const maxAge =
      getMfaCookieMaxAge(
        data.expiresAt,
      );

    // ========================================================================
    // Store MFA verification token
    // ========================================================================

    nextResponse.cookies.set(
      "pague_mfa_token",
      data.verificationToken,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/api/auth",

        maxAge,
      },
    );

    return nextResponse;
  }

  // ==========================================================================
  // Authentication completed without MFA
  // ==========================================================================
  //
  // The Control Plane has already established the authenticated session and
  // returned its authentication cookies.
  //
  // ==========================================================================

  const nextResponse =
    NextResponse.json(
      {
        data: {
          requiresMfa:
            false,
        },

        meta:
          parsed.meta ?? {},
      },
      {
        status: 200,
      },
    );

  // ==========================================================================
  // Forward authentication cookies
  // ==========================================================================

  forwardSetCookie(
    response,
    nextResponse,
  );

  // ==========================================================================
  // Ensure no stale MFA state survives a successful login
  // ==========================================================================

  clearMfaCookie(
    nextResponse,
  );

  return nextResponse;
}

// ============================================================================
// Response validation
// ============================================================================

function isControlPlaneLoginResponse(
  value: unknown,
): value is ControlPlaneLoginResponse {
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

  if (
    typeof data.requiresMfa !==
    "boolean"
  ) {
    return false;
  }

  if (
    "verificationToken" in
    data &&
    data.verificationToken !==
    undefined &&
    typeof data.verificationToken !==
    "string"
  ) {
    return false;
  }

  if (
    "expiresAt" in
    data &&
    data.expiresAt !==
    undefined &&
    typeof data.expiresAt !==
    "string"
  ) {
    return false;
  }

  if (
    "sessionId" in
    data &&
    data.sessionId !==
    undefined &&
    typeof data.sessionId !==
    "string"
  ) {
    return false;
  }

  return true;
}

// ============================================================================
// Forward Set-Cookie
// ============================================================================

function forwardSetCookie(
  response: Response,
  nextResponse: NextResponse,
): void {
  const setCookie =
    response.headers.get(
      "set-cookie",
    );

  if (!setCookie) {
    return;
  }

  nextResponse.headers.set(
    "set-cookie",
    rewriteSetCookie(
      setCookie,
    ),
  );
}

// ============================================================================
// Cookie handling
// ============================================================================

function rewriteSetCookie(
  value: string,
): string {
  return value.replace(
    /;\s*Domain=[^;]+/gi,
    "",
  );
}

// ============================================================================
// MFA cookie lifetime
// ============================================================================

function getMfaCookieMaxAge(
  expiresAt?: string,
): number {
  // ==========================================================================
  // Defensive fallback
  //
  // MFA verification tokens should be short-lived.
  // ==========================================================================

  if (!expiresAt) {
    return 5 * 60;
  }

  const expires =
    new Date(
      expiresAt,
    ).getTime();

  if (
    !Number.isFinite(
      expires,
    )
  ) {
    return 5 * 60;
  }

  const seconds =
    Math.floor(
      (expires -
        Date.now()) /
      1000,
    );

  return Math.max(
    1,
    seconds,
  );
}

// ============================================================================
// Clear MFA cookie
// ============================================================================

function clearMfaCookie(
  response: NextResponse,
): void {
  response.cookies.set(
    "pague_mfa_token",
    "",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/api/auth",

      maxAge: 0,
    },
  );
}