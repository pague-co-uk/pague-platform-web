import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  disableService,
  ServicesApiError,
} from "@/features/services/api/services-server";

interface ServiceRouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================================
// PATCH /api/services/:id/disable
// ============================================================================

export async function PATCH(
  _request: NextRequest,
  context: ServiceRouteContext,
): Promise<NextResponse> {
  try {
    const { id } =
      await context.params;

    const service =
      await disableService(id);

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error(
      "Failed to disable service:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to disable service.",
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