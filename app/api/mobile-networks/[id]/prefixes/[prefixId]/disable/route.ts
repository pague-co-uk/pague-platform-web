import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getControlPlaneUrl,
} from "@/lib/control-plane";

interface RouteContext {
  params: Promise<{
    id: string;
    prefixId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    id,
    prefixId,
  } = await context.params;

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/mobile-networks/${encodeURIComponent(id)}/prefixes/${encodeURIComponent(prefixId)}/disable`,
      {
        method: "POST",
        headers: {
          cookie:
            request.headers.get(
              "cookie",
            ) ?? "",
        },
        cache: "no-store",
      },
    );

  const body =
    await response.arrayBuffer();

  return new NextResponse(
    body,
    {
      status:
        response.status,
      headers: {
        "content-type":
          response.headers.get(
            "content-type",
          ) ?? "application/json",
      },
    },
  );
}