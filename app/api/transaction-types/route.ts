import { NextRequest, NextResponse } from "next/server";

import {
  createTransactionType,
  findTransactionTypes,
} from "@/features/transaction-types/api/transaction-types-server";

export async function GET(
  request: NextRequest,
) {
  const searchParams =
    request.nextUrl.searchParams;

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
    active:
      searchParams.get("active") === null
        ? undefined
        : searchParams.get("active") === "true",
    sort:
      searchParams.get("sort") ??
      undefined,
  };

  try {
    const result =
      await findTransactionTypes(params);

    return NextResponse.json({
      success: true,
      data: {
        data: result.items,
        pagination: {
          page: result.meta.page,
          pageSize: result.meta.pageSize,
          totalItems: result.meta.total,
          totalPages: result.meta.totalPages,
          hasNext:
            result.meta.page <
            result.meta.totalPages,
          hasPrevious:
            result.meta.page > 1,
        },
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch transaction types.",
      error,
    );

    const status =
      error &&
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number"
        ? error.status
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch transaction types.",
        },
      },
      { status },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const payload = await request.json();

    const transactionType =
      await createTransactionType(
        payload,
      );

    return NextResponse.json({
      success: true,
      data: transactionType,
    });
  } catch (error) {
    console.error(
      "Failed to create transaction type.",
      error,
    );

    const status =
      error &&
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number"
        ? error.status
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to create transaction type.",
        },
      },
      { status },
    );
  }
}