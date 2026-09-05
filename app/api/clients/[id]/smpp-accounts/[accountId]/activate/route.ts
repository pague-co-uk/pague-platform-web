import { getControlPlaneUrl } from "@/lib/control-plane";
import {
  NextRequest,
  NextResponse,
} from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
    accountId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const {
    id: clientId,
    accountId,
  } = await context.params;

  const targetUrl =
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(
      clientId,
    )}/smpp-accounts/${encodeURIComponent(
      accountId,
    )}/activate`;

  const session =
    request.cookies.get("session")?.value;

  const headers = new Headers();

  if (session) {
    headers.set(
      "Cookie",
      `session=${session}`,
    );
  }

  const response = await fetch(
    targetUrl,
    {
      method: "POST",
      headers,
      cache: "no-store",
    },
  );

  if (response.status === 204) {
    return new NextResponse(
      null,
      {
        status: 204,
      },
    );
  }

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