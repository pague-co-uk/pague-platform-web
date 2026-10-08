import {
  NextResponse,
} from "next/server";

import {
  disableProviderService,
} from "@/features/provider-services/api/provider-services-server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  _request: Request,
  { params }: RouteContext,
) {
  const { id } =
    await params;

  try {
    const result =
      await disableProviderService(
        id,
      );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status =
      error instanceof Error &&
        "status" in error &&
        typeof error.status === "number"
        ? error.status
        : 500;

    const message =
      error instanceof Error
        ? error.message
        : "Unable to disable provider service.";

    return NextResponse.json(
      {
        success: false,
        message,
        error: {
          message,
        },
      },
      {
        status,
      },
    );
  }
}