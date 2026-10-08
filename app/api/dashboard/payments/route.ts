import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getControlPlaneUrl,
  getCookieHeader,
} from "@/lib/control-plane";

export async function GET(
  request: NextRequest,
) {
  const controlPlaneUrl =
    getControlPlaneUrl();

  const searchParams =
    request.nextUrl.searchParams;

  const query = new URLSearchParams();

  const period =
    searchParams.get("period");

  if (period) {
    query.set("period", period);
  }

  const url =
    `${controlPlaneUrl}/api/dashboard/payments` +
    (query.toString()
      ? `?${query.toString()}`
      : "");

  try {
    const response =
      await fetch(url, {
        method: "GET",
        headers: {
          Cookie:
            getCookieHeader(
              request,
            ),
        },
        cache: "no-store",
      });

    const body =
      await response.text();

    return new NextResponse(
      body,
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
      "[Dashboard Payments API] Failed to proxy request.",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Unable to reach the control-plane API.",
        },
      },
      {
        status: 502,
      },
    );
  }
}