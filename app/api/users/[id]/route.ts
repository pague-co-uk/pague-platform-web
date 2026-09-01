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

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================================
// Helpers
// ============================================================================

function getCookieHeader(
  request: NextRequest,
): string {
  return request.cookies
    .getAll()
    .map(
      ({
        name,
        value,
      }) => `${name}=${value}`,
    )
    .join("; ");
}

// ============================================================================
// GET /api/users/:id
// ============================================================================

export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  // ==========================================================================
  // Route parameter
  // ==========================================================================

  const { id } =
    await context.params;

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        message:
          "User identifier is required.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Authentication cookies
  // ==========================================================================

  const cookieHeader =
    getCookieHeader(request);

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
  // Control Plane
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
              cookieHeader,

            "User-Agent":
              request.headers.get(
                "user-agent",
              ) ?? "",
          },

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Users] Get-user request failed.",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the user service. Please try again.",
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
    responseText || null,
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

// ============================================================================
// DELETE /api/users/:id
// ============================================================================

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  // ==========================================================================
  // Route parameter
  // ==========================================================================

  const { id } =
    await context.params;

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        message:
          "User identifier is required.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Authentication cookies
  // ==========================================================================

  const cookieHeader =
    getCookieHeader(request);

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
  // Control Plane
  // ==========================================================================

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/users/${encodeURIComponent(id)}`,
        {
          method: "DELETE",

          headers: {
            Cookie:
              cookieHeader,

            "User-Agent":
              request.headers.get(
                "user-agent",
              ) ?? "",
          },

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Users] Delete-user request failed.",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the user service. Please try again.",
      },
      {
        status: 502,
      },
    );
  }

  // ==========================================================================
  // Control Plane returns 204 on successful deletion.
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
  // ==========================================================================

  const responseText =
    await response.text();

  return new NextResponse(
    responseText || null,
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