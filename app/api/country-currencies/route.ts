import { NextRequest, NextResponse } from "next/server";

import {
  CountryCurrenciesServerApiError,
  createCountryCurrency,
  findCountryCurrencies,
} from "@/features/country-currencies/api/country-currencies-server";

import type {
  CreateCountryCurrencyPayload,
} from "@/features/country-currencies/types/country-currency.types";

function parsePositiveInteger(
  value: string | null,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1
  ) {
    return fallback;
  }

  return parsed;
}

function parseBoolean(
  value: string | null,
): boolean | undefined {
  if (value === null) {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function errorResponse(
  error: unknown,
) {
  if (
    error instanceof CountryCurrenciesServerApiError
  ) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.status ?? 500,
      },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message:
        "An unexpected error occurred.",
    },
    {
      status: 500,
    },
  );
}

export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const page = parsePositiveInteger(
      searchParams.get("page"),
      1,
    );

    const pageSize = parsePositiveInteger(
      searchParams.get("pageSize"),
      20,
    );

    const countryCode =
      searchParams.get("countryCode") ??
      undefined;

    const currencyId =
      searchParams.get("currencyId") ??
      undefined;

    const isPrimary = parseBoolean(
      searchParams.get("isPrimary"),
    );

    const isOfficial = parseBoolean(
      searchParams.get("isOfficial"),
    );

    const search =
      searchParams.get("search")?.trim() ||
      undefined;

    const sort =
      searchParams.get("sort") ??
      undefined;

    const result =
      await findCountryCurrencies({
        page,
        pageSize,
        countryCode,
        currencyId,
        isPrimary,
        isOfficial,
        search,
        sort,
      });

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
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const payload =
      (await request.json()) as CreateCountryCurrencyPayload;

    const result =
      await createCountryCurrency(payload);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}