import { NextRequest, NextResponse } from "next/server";

import {
  CountryCurrenciesServerApiError,
  deleteCountryCurrency,
  findCountryCurrency,
  updateCountryCurrency,
} from "@/features/country-currencies/api/country-currencies-server";

import type {
  UpdateCountryCurrencyPayload,
} from "@/features/country-currencies/types/country-currency.types";

interface RouteContext {
  params: Promise<{
    countryCode: string;
    currencyId: string;
  }>;
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
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      countryCode,
      currencyId,
    } = await context.params;

    const result =
      await findCountryCurrency(
        countryCode,
        currencyId,
      );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      countryCode,
      currencyId,
    } = await context.params;

    const payload =
      (await request.json()) as UpdateCountryCurrencyPayload;

    const result =
      await updateCountryCurrency(
        countryCode,
        currencyId,
        payload,
      );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      countryCode,
      currencyId,
    } = await context.params;

    await deleteCountryCurrency(
      countryCode,
      currencyId,
    );

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}