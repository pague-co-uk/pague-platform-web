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
// POST /api/users/:id/activate
// ============================================================================

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
): Promise<NextResponse> {
  const { id } = await params;

  const cookieHeader =
    request.cookies
      .getAll()
      .map(
        ({
          name,
          value,
        }) => `${name}=${value}`,
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

  let response: Response;

  try {
    response = await fetch(
      `${getControlPlaneUrl()}/api/users/${encodeURIComponent(id)}/activate`,
      {
        method: "POST",

        headers: {
          Cookie: cookieHeader,

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
      "[Users] Activate-user request failed.",
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