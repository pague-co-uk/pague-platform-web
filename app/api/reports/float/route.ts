import { findPlatformFloatLedgerReport } from "@/features/reports/api/reports-server";
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
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      transactionType:
        searchParams.get("transactionType") ?? undefined,
      referenceType:
        searchParams.get("referenceType") ?? undefined,
      clientId:
        searchParams.get("clientId") ?? undefined,
    };

    const result =
      await findPlatformFloatLedgerReport(params);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch float ledger report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_FETCH_FAILED",
          message:
            "Unable to fetch float ledger report.",
        },
      },
      { status: 500 },
    );
  }
}