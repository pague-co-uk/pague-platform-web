import { findPlatformMessageReport } from "@/features/reports/api/reports-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

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
      clientId:
        searchParams.get("clientId") ?? undefined,
    };

    const result =
      await findPlatformMessageReport(params);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch message report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_FETCH_FAILED",
          message:
            "Unable to fetch message report.",
        },
      },
      { status: 500 },
    );
  }
}