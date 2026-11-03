import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  hasPermission,
  isPlatformUser,
} from "@/lib/authorization/authorization";
import { getControlPlaneUrl } from "@/lib/control-plane";
import { BUILDER } from "@/features/report-builder/types";

export const runtime = "nodejs";

async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const route = path.join("/");
  const method = request.method;
  const manage =
    route === "connections/manage" ||
    /^connections\/[\w-]+\/test$/.test(route) ||
    (route.startsWith("connections") && method !== "GET");
  const exportRequest = route === "export";
  const edit = route.startsWith("reports") && method !== "GET";
  const allowed =
    /^(connections(\/manage|\/[\w-]+(\/schema|\/test)?)?|reports(\/[\w-]+)?|preview|export)$/.test(
      route,
    );
  if (!allowed)
    return Response.json(
      { success: false, message: "Not found." },
      { status: 404 },
    );
  try {
    const user = await getCurrentUser();
    if (!user || !user.active || user.locked)
      return Response.json(
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    const permissions = manage
      ? [BUILDER.connections]
      : [
          BUILDER.read,
          ...(edit ? [BUILDER.edit] : []),
          ...(exportRequest ? [BUILDER.export] : []),
        ];
    if (
      !permissions.every((p) => hasPermission(user, p)) ||
      (manage && !isPlatformUser(user))
    )
      return Response.json(
        { success: false, message: "Access denied." },
        { status: 403 },
      );
    if (method !== "GET") {
      let originHost = "";
      try {
        originHost = new URL(request.headers.get("origin") || "").host;
      } catch {
        /* Missing/invalid origins are rejected below. */
      }
      if (
        !originHost ||
        originHost !== (request.headers.get("host") || request.nextUrl.host)
      ) {
        return Response.json(
          { success: false, message: "Invalid request origin." },
          { status: 403 },
        );
      }
    }
    const session = request.cookies.get("session");
    if (!session)
      return Response.json(
        { success: false, message: "Sign in again to continue." },
        { status: 401 },
      );
    const body = method === "GET" ? undefined : await request.text();
    if (body && Buffer.byteLength(body) > 150000)
      return Response.json(
        { success: false, message: "Report configuration is too large." },
        { status: 413 },
      );
    const upstream = await fetch(
      `${getControlPlaneUrl()}/api/report-builder/${route}`,
      {
        method,
        headers: {
          Cookie: `session=${session.value}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body || undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(exportRequest ? 150000 : 45000),
      },
    );
    const headers = new Headers({
      "Cache-Control": "no-store",
      "Content-Type":
        upstream.headers.get("Content-Type") || "application/json",
    });
    for (const name of ["Content-Disposition", "X-Export-Row-Limit"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Unable to reach the reporting service. Please try again.",
      },
      { status: 502 },
    );
  }
}
export { forward as GET, forward as POST, forward as PUT, forward as DELETE };
