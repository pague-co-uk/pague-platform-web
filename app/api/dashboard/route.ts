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
// GET /api/dashboard
// ============================================================================

export async function GET(
  request: NextRequest,
) {
  // ==========================================================================
  // Authentication
  // ==========================================================================

  const session =
    request.cookies.get(
      "session",
    );

  if (!session?.value) {
    return NextResponse.json(
      {
        success: false,

        error: {
          message:
            "Authentication required.",
        },
      },
      {
        status: 401,
      },
    );
  }

  // ==========================================================================
  // Query parameters
  // ==========================================================================

  const period =
    request.nextUrl.searchParams.get(
      "period",
    ) ?? "30d";

  // ==========================================================================
  // Validate period
  // ==========================================================================

  if (
    period !== "7d" &&
    period !== "30d" &&
    period !== "90d"
  ) {
    return NextResponse.json(
      {
        success: false,

        error: {
          message:
            "Invalid dashboard period.",
        },
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Request
  // ==========================================================================

  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "period",
    period,
  );

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/dashboard?${searchParams.toString()}`,
        {
          method: "GET",

          headers: {
            Cookie:
              `${session.name}=${session.value}`,
          },

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Dashboard API] Failed to connect to Control Plane.",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error: {
          message:
            "Unable to connect to the dashboard service.",
        },
      },
      {
        status: 502,
      },
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
  // Forward response
  // ==========================================================================

  if (!response.ok) {
    console.error(
      "[Dashboard API] Control Plane request failed.",
      {
        status:
          response.status,

        statusText:
          response.statusText,

        body,
      },
    );

    return NextResponse.json(
      body,
      {
        status:
          response.status,
      },
    );
  }

  return NextResponse.json(
    body,
    {
      status:
        response.status,
    },
  );
}