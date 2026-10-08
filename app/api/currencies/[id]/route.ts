import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  CurrenciesApiError,
  findCurrencyById,
  updateCurrency,
} from "@/features/currencies/api/currencies-server";

import type {
  UpdateCurrencyPayload,
} from "@/features/currencies/types/currency.types";

interface CurrencyRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: CurrencyRouteContext,
) {
  const { id } =
    await context.params;

  try {
    const currency =
      await findCurrencyById(id);

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
      `[API /currencies/${id}] GET failed.`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load currency.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: CurrencyRouteContext,
) {
  const { id } =
    await context.params;

  try {
    const body =
      (await request.json()) as UpdateCurrencyPayload;

    const currency =
      await updateCurrency(
        id,
        body,
      );

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
      `[API /currencies/${id}] PATCH failed.`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update currency.",
      },
      {
        status: 500,
      },
    );
  }
}