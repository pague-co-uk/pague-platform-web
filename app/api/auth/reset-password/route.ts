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
// POST /api/auth/reset-password
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {

  // ==========================================================================
  // Request body
  // ==========================================================================

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Validate body
  // ==========================================================================

  if (
    typeof body !== "object" ||
    body === null
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Token
  // ==========================================================================

  if (
    !("token" in body) ||
    typeof body.token !== "string" ||
    !body.token.trim()
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Password reset token is required.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Password
  // ==========================================================================

  if (
    !("password" in body) ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "New password is required.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Password confirmation
  // ==========================================================================

  if (
    !("confirmPassword" in body) ||
    typeof body.confirmPassword !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Password confirmation is required.",
      },
      {
        status: 400,
      },
    );
  }

  const token =
    body.token.trim();

  const password =
    body.password;

  const confirmPassword =
    body.confirmPassword;

  // ==========================================================================
  // Password confirmation
  // ==========================================================================

  if (
    password !==
    confirmPassword
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Password confirmation does not match.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Control Plane
  // ==========================================================================

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/auth/reset-password`,
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
            JSON.stringify({
              token,
              password,
              confirmPassword,
            }),

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Auth] Password reset request failed.",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the authentication service. Please try again.",
      },
      {
        status: 502,
      },
    );
  }

  // ==========================================================================
  // Successful password reset
  //
  // Control Plane returns HTTP 204 No Content.
  //
  // Do NOT attempt to read response.json() or response.text() here.
  // ==========================================================================

  if (
    response.status === 204
  ) {
    return new NextResponse(
      null,
      {
        status: 204,
      },
    );
  }

  // ==========================================================================
  // Forward Control Plane error response
  // ==========================================================================

  const responseText =
    await response.text();

  return new NextResponse(
    responseText,
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
}