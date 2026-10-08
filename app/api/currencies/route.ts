import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createCurrency,
  CurrenciesApiError,
  findCurrencies,
} from "@/features/currencies/api/currencies-server";

import type {
  CreateCurrencyPayload,
} from "@/features/currencies/types/currency.types";

export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const pageValue =
      searchParams.get("page");

    const pageSizeValue =
      searchParams.get("pageSize");

    const search =
      searchParams.get("search");

    const active =
      searchParams.get("active");

    const sort =
      searchParams.get("sort");

    const page =
      pageValue
        ? Number(pageValue)
        : undefined;

    const pageSize =
      pageSizeValue
        ? Number(pageSizeValue)
        : undefined;

    const activeValue =
      active === "true"
        ? true
        : active === "false"
          ? false
          : undefined;

    const result =
      await findCurrencies({
        page,
        pageSize,
        search:
          search || undefined,
        active: activeValue,
        sort:
          sort || undefined,
      });

    return NextResponse.json({
      success: true,
      data: {
        data: result.items,
        pagination: {
          page: result.meta.page,
          pageSize:
            result.meta.pageSize,
          totalItems:
            result.meta.total,
          totalPages:
            result.meta.totalPages,
          hasNext:
            result.meta.page <
            result.meta.totalPages,
          hasPrevious:
            result.meta.page > 1,
        },
      },
    });
  } catch (error) {
    if (
      error instanceof CurrenciesApiError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.status,
        },
      );
    }

    console.error(
      "[API /currencies] GET failed.",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load currencies.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as CreateCurrencyPayload;

    const currency =
      await createCurrency(body);

    return NextResponse.json({
      success: true,
      data: currency,
    });
  } catch (error) {
    if (
      error instanceof CurrenciesApiError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.status,
        },
      );
    }

    console.error(
      "[API /currencies] POST failed.",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create currency.",
      },
      {
        status: 500,
      },
    );
  }
}