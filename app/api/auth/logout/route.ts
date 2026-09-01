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
// POST /api/auth/logout
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  console.log(
    "[Logout Proxy] Logout request received.",
  );

  // ==========================================================================
  // Authentication cookies
  // ==========================================================================

  const sessionCookie =
    request.cookies.get("session");

  const refreshTokenCookie =
    request.cookies.get("refreshToken");

  console.log(
    "[Logout Proxy] Authentication cookie check.",
    {
      sessionPresent:
        Boolean(sessionCookie?.value),

      refreshTokenPresent:
        Boolean(refreshTokenCookie?.value),

      sessionLength:
        sessionCookie?.value.length ?? 0,

      refreshTokenLength:
        refreshTokenCookie?.value.length ?? 0,
    },
  );

  // ==========================================================================
  // Build Cookie header
  // ==========================================================================

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

  // ==========================================================================
  // Control Plane
  // ==========================================================================

  let response: Response;

  try {
    console.log(
      "[Logout Proxy] Sending logout request to Control Plane.",
    );

    response =
      await fetch(
        `${getControlPlaneUrl()}/api/auth/logout`,
        {
          method: "POST",

          headers: {
            Cookie:
              cookieHeader,

            "User-Agent":
              request.headers.get(
                "user-agent",
              ) ?? "",

            "X-Forwarded-For":
              request.headers.get(
                "x-forwarded-for",
              ) ?? "",
          },

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[Logout Proxy] Control Plane logout request failed.",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Unable to connect to the authentication service.",
      },
      {
        status: 502,
      },
    );
  }

  // ==========================================================================
  // Read Set-Cookie headers
  // ==========================================================================

  const setCookie =
    response.headers.get(
      "set-cookie",
    );

  console.log(
    "[Logout Proxy] Control Plane logout response received.",
    {
      status:
        response.status,

      ok:
        response.ok,

      hasSetCookie:
        Boolean(setCookie),

      setCookieCount:
        setCookie
          ? parseSetCookieHeaders(
            setCookie,
          ).length
          : 0,
    },
  );

  // ==========================================================================
  // Logout failed
  // ==========================================================================

  if (!response.ok) {
    const responseBody =
      await response.text();

    console.warn(
      "[Logout Proxy] Control Plane logout failed.",
      {
        status:
          response.status,
        body:
          responseBody,
      },
    );

    return new NextResponse(
      responseBody ||
      JSON.stringify({
        message:
          "Logout failed.",
      }),
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

  // ==========================================================================
  // Prepare response
  // ==========================================================================

  const nextResponse =
    new NextResponse(
      null,
      {
        status:
          response.status,
      },
    );

  // ==========================================================================
  // Forward authentication cookies
  //
  // The Control Plane is responsible for clearing:
  //
  // - session
  // - refreshToken
  //
  // We forward those Set-Cookie headers to the browser.
  // ==========================================================================

  if (setCookie) {
    const cookies =
      parseSetCookieHeaders(
        setCookie,
      );

    for (const cookie of cookies) {
      const cookieName =
        getCookieName(cookie);

      console.log(
        "[Logout Proxy] Forwarding authentication cookie.",
        {
          name:
            cookieName,
          httpOnly:
            /;\s*HttpOnly/i.test(
              cookie,
            ),
          secure:
            /;\s*Secure/i.test(
              cookie,
            ),
          sameSite:
            getSameSite(cookie),
          path:
            getCookieAttribute(
              cookie,
              "Path",
            ),
          maxAge:
            getCookieAttribute(
              cookie,
              "Max-Age",
            ),
        },
      );

      nextResponse.headers.append(
        "Set-Cookie",
        rewriteSetCookie(
          cookie,
        ),
      );
    }
  }

  console.log(
    "[Logout Proxy] Logout completed successfully.",
  );

  return nextResponse;
}

// ============================================================================
// Set-Cookie parsing
// ============================================================================

function parseSetCookieHeaders(
  value: string,
): string[] {
  /*
   * The Control Plane currently returns two cookies:
   *
   *   Set-Cookie: session=...; ...
   *   Set-Cookie: refreshToken=...; ...
   *
   * In environments where multiple Set-Cookie values are combined into
   * a single header, split on cookie boundaries rather than blindly
   * splitting on commas because Expires may itself contain commas.
   */

  return value.split(
    /,(?=\s*[A-Za-z0-9_-]+=)/,
  );
}

// ============================================================================
// Cookie name
// ============================================================================

function getCookieName(
  cookie: string,
): string {
  return (
    cookie
      .split(";", 1)[0]
      ?.split("=", 1)[0]
      ?.trim() ?? ""
  );
}

// ============================================================================
// Cookie attribute
// ============================================================================

function getCookieAttribute(
  cookie: string,
  attribute: string,
): string | null {
  const match =
    cookie.match(
      new RegExp(
        `;\\s*${attribute}=([^;]*)`,
        "i",
      ),
    );

  return match?.[1]?.trim() ?? null;
}

// ============================================================================
// SameSite
// ============================================================================

function getSameSite(
  cookie: string,
): string | null {
  const match =
    cookie.match(
      /;\s*SameSite=([^;]+)/i,
    );

  return match?.[1]?.trim() ?? null;
}

// ============================================================================
// Cookie rewriting
// ============================================================================

function rewriteSetCookie(
  value: string,
): string {
  /*
   * The Control Plane and Next.js may not be running on the same host.
   *
   * Remove Domain so the browser stores the authentication cookie for
   * the Next.js application host.
   */

  return value.replace(
    /;\s*Domain=[^;]+/gi,
    "",
  );
}