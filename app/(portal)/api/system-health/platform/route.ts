import {
  NextResponse,
} from "next/server";

import {
  findPlatformHealth,
  HealthApiError,
} from "@/features/health/api/server-health-api";

export async function GET() {
  try {
    const health =
      await findPlatformHealth();

    return NextResponse.json(
      health,
      {
        status: 200,
      },
    );
  } catch (error) {
    const status =
      error instanceof HealthApiError
        ? error.status
        : 502;

    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve platform health.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status,
      },
    );
  }
}