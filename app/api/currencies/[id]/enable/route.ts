import { NextRequest, NextResponse } from "next/server";

import {
  CurrenciesApiError,
  enableCurrency,
} from "@/features/currencies/api/currencies-server";

interface CurrencyRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  _request: NextRequest,
  context: CurrencyRouteContext,
) {
  const { id } = await context.params;

  try {
    const currency = await enableCurrency(id);

    return NextResponse.json({
      success: true,
      data: currency,
    });
  } catch (error) {
    if (error instanceof CurrenciesApiError) {
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
      `[API /currencies/${id}/enable] PATCH failed.`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to enable currency.",
      },
      {
        status: 500,
      },
    );
  }
}