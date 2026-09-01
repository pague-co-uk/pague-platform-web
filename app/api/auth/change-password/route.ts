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
// POST /api/auth/change-password
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {

  // ==========================================================================
  // Authentication cookies
  // ==========================================================================

  const cookieHeader =
    request.cookies
      .getAll()
      .map(
        ({
          name,
          value,
        }) =>
          `${name}=${value}`,
      )
      .join("; ");

  if (!cookieHeader) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Authentication required.",
      },
      {
        status: 401,
      },
    );
  }

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
        message:
          "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Validate request
  // ==========================================================================

  if (
    typeof body !== "object" ||
    body === null
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Current password
  // ==========================================================================

  if (
    !("currentPassword" in body) ||
    typeof body.currentPassword !==
    "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Current password is required.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // New password
  // ==========================================================================

  if (
    !("newPassword" in body) ||
    typeof body.newPassword !==
    "string"
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
    typeof body.confirmPassword !==
    "string"
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

  // ==========================================================================
  // Control Plane
  // ==========================================================================

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/auth/change-password`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Cookie:
              cookieHeader,

            "User-Agent":
              request.headers.get(
                "user-agent",
              ) ?? "",
          },

          body:
            JSON.stringify({
              currentPassword:
                body.currentPassword,

              newPassword:
                body.newPassword,

              confirmPassword:
                body.confirmPassword,
            }),

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Auth] Change-password request failed.",
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
  // Successful password change
  //
  // Control Plane returns 204 No Content.
  //
  // Do not attempt to read or forward a response body.
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
  // Forward Control Plane response
  //
  // Non-204 responses may contain an error body.
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