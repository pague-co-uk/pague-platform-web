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
// POST /api/auth/forgot-password
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
        message:
          "Invalid request.",
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
    body === null ||
    !("identifier" in body) ||
    typeof body.identifier !== "string"
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Email or username is required.",
      },
      {
        status: 400,
      },
    );
  }

  const identifier =
    body.identifier.trim();

  if (!identifier) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Email or username is required.",
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
        `${getControlPlaneUrl()}/api/auth/forgot-password`,
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
              identifier,
            }),

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Auth] Forgot-password request failed.",
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
  // Forward Control Plane response
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