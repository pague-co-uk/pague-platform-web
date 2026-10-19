import { NextRequest, NextResponse } from "next/server";
import { getControlPlaneUrl } from "@/lib/control-plane";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string; messageId: string }> }) {
  const { id, messageId } = await context.params;
  const response = await fetch(
    `${getControlPlaneUrl()}/api/clients/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}/retry`,
    { method: "POST", headers: { Cookie: request.headers.get("cookie") ?? "" }, cache: "no-store" },
  );
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
