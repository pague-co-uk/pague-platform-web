import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getControlPlaneUrl } from "@/lib/control-plane";

interface RouteContext {
  params: Promise<{
    id: string;
    apiKeyId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    id,
    apiKeyId,
  } = await context.params;

  const response =
    await fetch(
      `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(id)}/api-keys/${encodeURIComponent(apiKeyId)}/revoke`,
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
    await response.text();

  return new NextResponse(
    body,
    {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get(
            "content-type",
          ) ??
          "application/json",
      },
    },
  );
}