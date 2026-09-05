import { getControlPlaneUrl } from "@/lib/control-plane";
import {
  NextRequest,
  NextResponse,
} from "next/server";


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
// GET /api/clients
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

  // --------------------------------------------------------------------------
  // Query parameters
  // --------------------------------------------------------------------------

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
    const parameter of
    allowedParameters
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

  // --------------------------------------------------------------------------
  // Control Plane request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients?${query.toString()}`,
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

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Clients] Failed to fetch clients from Control Plane.",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to connect to the client service. Please try again.",
      },
      {
        status: 502,
      },
    );
  }

  // --------------------------------------------------------------------------
  // Forward Control Plane response
  // --------------------------------------------------------------------------

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

// ============================================================================
// POST /api/clients
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

  // --------------------------------------------------------------------------
  // Request body
  // --------------------------------------------------------------------------

  const body =
    await request.text();

  // --------------------------------------------------------------------------
  // Control Plane request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients`,
        {
          method: "POST",

          headers: {
            Cookie:
              cookieHeader,

            "Content-Type":
              request.headers.get(
                "content-type",
              ) ??
              "application/json",

            "User-Agent":
              request.headers.get(
                "user-agent",
              ) ?? "",
          },

          body,

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Clients] Failed to create client through Control Plane.",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to connect to the client service. Please try again.",
      },
      {
        status: 502,
      },
    );
  }

  // --------------------------------------------------------------------------
  // Forward Control Plane response
  // --------------------------------------------------------------------------

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