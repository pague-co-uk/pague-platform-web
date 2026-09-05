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
// GET /api/clients/:id
// ============================================================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
): Promise<NextResponse> {
  const { id } =
    await context.params;

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

  try {
    const response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
          id,
        )}`,
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
  } catch (error) {
    console.error(
      "[Clients] Failed to fetch client from Control Plane.",
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
}

// ============================================================================
// PATCH /api/clients/:id
// ============================================================================

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
): Promise<NextResponse> {
  const { id } =
    await context.params;

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

  try {
    const response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
          id,
        )}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              request.headers.get(
                "content-type",
              ) ??
              "application/json",

            Cookie:
              cookieHeader,

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

    // ------------------------------------------------------------------------
    // Forward response
    // ------------------------------------------------------------------------

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
  } catch (error) {
    console.error(
      "[Clients] Failed to update client through Control Plane.",
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
}

// ============================================================================
// DELETE /api/clients/:id
// ============================================================================

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
): Promise<NextResponse> {
  const { id } =
    await context.params;

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
  // Control Plane request
  // --------------------------------------------------------------------------

  let response: Response;

  try {
    response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
          id,
        )}`,
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

          cache:
            "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Clients] Failed to delete client through Control Plane.",
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
  // Forward response
  //
  // DELETE on the Control Plane returns 204 No Content.
  // --------------------------------------------------------------------------

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