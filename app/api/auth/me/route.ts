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
// GET /api/auth/me
// ============================================================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  // ==========================================================================
  // Read the browser authentication cookies
  //
  // These are HTTP-only, so they are deliberately read on the server.
  // ==========================================================================

  const cookieHeader =
    request.headers.get("cookie");

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
  // Forward the request to the Control Plane
  // ==========================================================================

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/auth/me`,
        {
          method: "GET",

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
      "Authentication identity request failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the authentication service.",
      },
      {
        status: 502,
      },
    );
  }

  // ==========================================================================
  // Read Control Plane response
  // ==========================================================================

  const responseBody =
    await response.text();

  // ==========================================================================
  // Forward response
  // ==========================================================================

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

  // ==========================================================================
  // Forward Set-Cookie headers
  //
  // This is important if /me refreshes or rotates authentication cookies.
  // ==========================================================================

  const setCookie =
    response.headers.get(
      "set-cookie",
    );

  if (setCookie) {
    nextResponse.headers.set(
      "set-cookie",
      rewriteSetCookie(
        setCookie,
      ),
    );
  }

  return nextResponse;
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