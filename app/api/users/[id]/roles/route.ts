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

  return value.replace(/\/+$/, "");
}

// ============================================================================
// PUT /api/users/:id/roles
// ============================================================================

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } =
    await context.params;

  const body =
    await request.text();

  try {
    const response =
      await fetch(
        `${getControlPlaneUrl()}/api/users/${encodeURIComponent(id)}/roles`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              request.headers.get(
                "content-type",
              ) ??
              "application/json",

            Cookie:
              request.headers.get(
                "cookie",
              ) ?? "",
          },

          body,

          cache: "no-store",
        },
      );

    const responseBody =
      await response.text();

    return new NextResponse(
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
  } catch (error) {
    console.error(
      "[API] Failed to proxy user role update.",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Unable to connect to the Control Plane.",
        },
      },
      {
        status: 502,
      },
    );
  }
}