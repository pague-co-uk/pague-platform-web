import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getControlPlaneUrl } from "@/lib/control-plane";

interface RouteContext {
  params: Promise<{
    id: string;
    publicId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    id,
    publicId,
  } = await context.params;

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
        id,
      )}/messages/public/${encodeURIComponent(
        publicId,
      )}`,
      {
        method: "GET",
        headers: {
          Cookie:
            request.headers.get(
              "cookie",
            ) ?? "",
        },
        cache: "no-store",
      },
    );

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
}