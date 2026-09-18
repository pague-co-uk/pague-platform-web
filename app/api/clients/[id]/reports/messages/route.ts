import { findClientMessageReport } from "@/features/reports/api/reports-server";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } =
      await context.params;

    const { searchParams } =
      new URL(request.url);

    const params = {
      page: searchParams.get("page")
        ? Number(searchParams.get("page"))
        : undefined,
      pageSize: searchParams.get("pageSize")
        ? Number(searchParams.get("pageSize"))
        : undefined,
      search:
        searchParams.get("search") ?? undefined,
      destination:
        searchParams.get("destination") ?? undefined,
      senderIdId:
        searchParams.get("senderIdId") ?? undefined,
      status:
        searchParams.get("status") ?? undefined,
      encoding:
        searchParams.get("encoding") ?? undefined,
      submittedFrom:
        searchParams.get("submittedFrom") ?? undefined,
      submittedTo:
        searchParams.get("submittedTo") ?? undefined,
    };

    const result =
      await findClientMessageReport(
        id,
        params,
      );

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch client message report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_FETCH_FAILED",
          message:
            "Unable to fetch client message report.",
        },
      },
      { status: 500 },
    );
  }
}