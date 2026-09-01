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
// Authentication cookies
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
      }) =>
        `${name}=${value}`,
    )
    .join("; ");
}

// ============================================================================
// Control Plane headers
// ============================================================================

function getControlPlaneHeaders(
  request: NextRequest,
  includeContentType = false,
): HeadersInit {
  const headers: Record<
    string,
    string
  > = {};

  const cookieHeader =
    getCookieHeader(request);

  if (cookieHeader) {
    headers.Cookie =
      cookieHeader;
  }

  const userAgent =
    request.headers.get(
      "user-agent",
    );

  if (userAgent) {
    headers["User-Agent"] =
      userAgent;
  }

  if (includeContentType) {
    headers["Content-Type"] =
      request.headers.get(
        "content-type",
      ) ??
      "application/json";
  }

  return headers;
}

// ============================================================================
// Forward Control Plane response
// ============================================================================

async function forwardResponse(
  response: Response,
): Promise<NextResponse> {
  // ==========================================================================
  // No content
  // ==========================================================================

  if (
    response.status ===
    204
  ) {
    return new NextResponse(
      null,
      {
        status: 204,
      },
    );
  }

  // ==========================================================================
  // Response body
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
// GET /api/users
// ============================================================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
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

  const searchParams =
    request.nextUrl.searchParams;

  const query =
    new URLSearchParams();

  const allowedParameters = [
    "search",
    "status",
    "page",
    "pageSize",
    "sortBy",
    "sortDirection",
  ] as const;

  for (
    const parameter of allowedParameters
  ) {
    const value =
      searchParams.get(
        parameter,
      );

    if (value !== null) {
      query.set(
        parameter,
        value,
      );
    }
  }

  let response: Response;

  try {
    const queryString =
      query.toString();

    response =
      await fetch(
        `${getControlPlaneUrl()}/api/users${queryString
          ? `?${queryString}`
          : ""
        }`,
        {
          method: "GET",

          headers:
            getControlPlaneHeaders(
              request,
            ),

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Users] Failed to fetch users.",
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

  return forwardResponse(
    response,
  );
}

// ============================================================================
// POST /api/users
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
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
  // Read request body
  // ==========================================================================

  let body: string;

  try {
    body =
      await request.text();
  } catch (error) {
    console.error(
      "[Users] Failed to read create-user request body.",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Forward to Control Plane
  // ==========================================================================

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/users`,
        {
          method: "POST",

          headers:
            getControlPlaneHeaders(
              request,
              true,
            ),

          body,

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Users] Failed to create user.",
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

  return forwardResponse(
    response,
  );
}