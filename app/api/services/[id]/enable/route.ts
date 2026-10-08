import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  enableService,
  ServicesApiError,
} from "@/features/services/api/services-server";

interface ServiceRouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================================
// PATCH /api/services/:id/enable
// ============================================================================

export async function PATCH(
  _request: NextRequest,
  context: ServiceRouteContext,
): Promise<NextResponse> {
  try {
    const { id } =
      await context.params;

    const service =
      await enableService(id);

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error(
      "Failed to enable service:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to enable service.",
      },
      {
        status:
          error instanceof ServicesApiError
            ? error.status
            : 500,
      },
    );
  }
}