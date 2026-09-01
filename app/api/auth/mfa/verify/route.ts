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
// POST /api/auth/mfa/verify
// ============================================================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse> {
  // ==========================================================================
  // MFA verification token
  // ==========================================================================

  const verificationToken =
    request.cookies.get(
      "pague_mfa_token",
    )?.value;

  if (!verificationToken) {
    return NextResponse.json(
      {
        message:
          "Your verification session has expired. Please sign in again.",
      },
      {
        status: 401,
      },
    );
  }

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
        message:
          "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Validate request body
  // ==========================================================================

  if (
    typeof body !==
    "object" ||
    body === null
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid request.",
      },
      {
        status: 400,
      },
    );
  }

  // ==========================================================================
  // Validate MFA code
  // ==========================================================================

  if (
    !("code" in body) ||
    typeof body.code !==
    "string"
  ) {
    return NextResponse.json(
      {
        message:
          "MFA verification code is required.",
      },
      {
        status: 400,
      },
    );
  }

  const code =
    body.code.trim();

  // ==========================================================================
  // Validate MFA code format
  // ==========================================================================

  if (
    !/^\d{6}$/.test(code)
  ) {
    return NextResponse.json(
      {
        message:
          "Enter the 6-digit verification code.",
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
        `${getControlPlaneUrl()}/api/auth/mfa/verify`,
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
              verificationToken,
              code,
            }),

          cache: "no-store",
        },
      );
  } catch (error) {
    console.error(
      "[MFA Proxy] MFA verification request failed.",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Unable to connect to the authentication service. Please try again.",
      },
      {
        status: 502,
      },
    );
  }

  // ==========================================================================
  // Read response
  // ==========================================================================

  const responseBody =
    await response.text();

  // ==========================================================================
  // MFA verification failed
  // ==========================================================================

  if (!response.ok) {
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
  }

  // ==========================================================================
  // Create Next.js response
  // ==========================================================================

  const nextResponse =
    new NextResponse(
      responseBody ||
      JSON.stringify({
        success: true,
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

  // ==========================================================================
  // Read Control Plane Set-Cookie headers
  // ==========================================================================
  //
  // The Control Plane currently returns:
  //
  //   session
  //   refreshToken
  //
  // We deliberately do NOT copy the raw Set-Cookie strings directly onto
  // nextResponse.headers.
  //
  // Instead, parse the cookies and register them through NextResponse.cookies.
  //
  // This allows Next.js to own the final Set-Cookie headers and prevents
  // clearMfaCookie() from interfering with the authentication cookies.
  //
  // ==========================================================================

  const setCookies =
    response.headers.getSetCookie();

  // ==========================================================================
  // Forward authentication cookies
  // ==========================================================================

  for (const setCookie of setCookies) {
    const parsed =
      parseSetCookie(
        setCookie,
      );

    if (!parsed) {
      console.error(
        "[MFA Proxy] Unable to parse Control Plane Set-Cookie header.",
        {
          cookie:
            describeSetCookie(
              setCookie,
            ),
        },
      );

      continue;
    }

    // ------------------------------------------------------------------------
    // Do not forward Domain
    //
    // The Control Plane and Portal may not share the same host.
    //
    // Removing Domain causes the browser to associate the cookie with the
    // Portal host that returned this response.
    // ------------------------------------------------------------------------

    const cookieOptions = {
      httpOnly:
        parsed.httpOnly,

      secure:
        parsed.secure,

      sameSite:
        parsed.sameSite,

      path:
        parsed.path ?? "/",

      ...(parsed.expires
        ? {
          expires:
            parsed.expires,
        }
        : {}),

      ...(parsed.maxAge !==
        null
        ? {
          maxAge:
            parsed.maxAge,
        }
        : {}),
    };

    nextResponse.cookies.set(
      parsed.name,
      parsed.value,
      cookieOptions,
    );
  }

  // ==========================================================================
  // Clear temporary MFA verification cookie
  // ==========================================================================

  clearMfaCookie(
    nextResponse,
  );

  // ==========================================================================
  // Final diagnostics
  // ==========================================================================

  return nextResponse;
}

// ============================================================================
// Parse Set-Cookie
// ============================================================================

interface ParsedSetCookie {
  name: string;

  value: string;

  httpOnly: boolean;

  secure: boolean;

  sameSite:
  | "strict"
  | "lax"
  | "none";

  path: string | undefined;

  expires: Date | undefined;

  maxAge: number | undefined;
}

function parseSetCookie(
  header: string,
): ParsedSetCookie | null {
  const parts =
    header.split(";");

  const first =
    parts.shift()?.trim();

  if (!first) {
    return null;
  }

  const separator =
    first.indexOf("=");

  if (separator <= 0) {
    return null;
  }

  const name =
    first
      .slice(
        0,
        separator,
      )
      .trim();

  const value =
    first
      .slice(
        separator + 1,
      )
      .trim();

  let httpOnly =
    false;

  let secure =
    false;

  let sameSite:
    | "strict"
    | "lax"
    | "none" =
    "lax";

  let path:
    | string
    | undefined;

  let expires:
    | Date
    | undefined;

  let maxAge:
    | number
    | undefined;

  for (const rawAttribute of parts) {
    const attribute =
      rawAttribute.trim();

    if (!attribute) {
      continue;
    }

    const equalsIndex =
      attribute.indexOf("=");

    const attributeName =
      (
        equalsIndex >= 0
          ? attribute.slice(
            0,
            equalsIndex,
          )
          : attribute
      )
        .trim()
        .toLowerCase();

    const attributeValue =
      equalsIndex >= 0
        ? attribute
          .slice(
            equalsIndex + 1,
          )
          .trim()
        : "";

    switch (
    attributeName
    ) {
      case "httponly":
        httpOnly = true;
        break;

      case "secure":
        secure = true;
        break;

      case "samesite": {
        const normalized =
          attributeValue.toLowerCase();

        if (
          normalized ===
          "strict"
        ) {
          sameSite =
            "strict";
        } else if (
          normalized ===
          "none"
        ) {
          sameSite =
            "none";
        } else {
          sameSite =
            "lax";
        }

        break;
      }

      case "path":
        path =
          attributeValue ||
          "/";
        break;

      case "expires": {
        const date =
          new Date(
            attributeValue,
          );

        if (
          !Number.isNaN(
            date.getTime(),
          )
        ) {
          expires = date;
        }

        break;
      }

      case "max-age": {
        const parsed =
          Number.parseInt(
            attributeValue,
            10,
          );

        if (
          Number.isFinite(
            parsed,
          )
        ) {
          maxAge = parsed;
        }

        break;
      }

      case "domain":
        // Deliberately ignored.
        break;

      default:
        break;
    }
  }

  return {
    name,
    value,
    httpOnly,
    secure,
    sameSite,
    path,
    expires,
    maxAge,
  };
}

// ============================================================================
// Cookie diagnostics
//
// NEVER log cookie values.
// ============================================================================

function describeSetCookie(
  value: string,
) {
  const parsed =
    parseSetCookie(
      value,
    );

  if (!parsed) {
    return {
      name: "unknown",
    };
  }

  return {
    name:
      parsed.name,

    httpOnly:
      parsed.httpOnly,

    secure:
      parsed.secure,

    sameSite:
      capitalize(
        parsed.sameSite,
      ),

    path:
      parsed.path ??
      null,

    expires:
      parsed.expires
        ? parsed.expires.toUTCString()
        : null,

    maxAge:
      parsed.maxAge ??
      null,
  };
}

function getSetCookieName(
  value: string,
): string {
  const separator =
    value.indexOf("=");

  if (separator <= 0) {
    return "unknown";
  }

  return value
    .slice(
      0,
      separator,
    )
    .trim();
}

function capitalize(
  value: string,
): string {
  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(1)
  );
}

// ============================================================================
// Clear MFA cookie
// ============================================================================

function clearMfaCookie(
  response: NextResponse,
): void {
  response.cookies.set(
    "pague_mfa_token",
    "",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/api/auth",

      maxAge: 0,
    },
  );
}