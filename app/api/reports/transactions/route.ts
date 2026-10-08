import { findPlatformTransactionReport } from "@/features/reports/api/reports-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
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
        searchParams.get("search") ??
        undefined,

      clientId:
        searchParams.get("clientId") ??
        undefined,

      clientServiceId:
        searchParams.get("clientServiceId") ??
        undefined,

      providerId:
        searchParams.get("providerId") ??
        undefined,

      providerServiceId:
        searchParams.get("providerServiceId") ??
        undefined,

      currencyId:
        searchParams.get("currencyId") ??
        undefined,

      transactionTypeId:
        searchParams.get("transactionTypeId") ??
        undefined,

      status:
        searchParams.get("status") ??
        undefined,

      from:
        searchParams.get("from") ??
        undefined,

      to:
        searchParams.get("to") ??
        undefined,
    };

    const result =
      await findPlatformTransactionReport(
        params,
      );

    return NextResponse.json(
      result,
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Failed to fetch transaction report:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REPORT_FETCH_FAILED",
          message:
            "Unable to fetch transaction report.",
        },
      },
      { status: 500 },
    );
  }
}