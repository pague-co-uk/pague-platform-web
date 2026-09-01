import {
  NextRequest,
  NextResponse,
} from "next/server";

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

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } =
    await context.params;

  try {
    const response =
      await fetch(
        `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
          id,
        )}/suspend`,
        {
          method: "POST",

          headers: {
            Cookie:
              request.headers.get(
                "cookie",
              ) ?? "",
          },

          cache:
            "no-store",
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
      "[API] Failed to proxy client suspend.",
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