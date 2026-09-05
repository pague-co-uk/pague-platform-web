import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  updateRolePermissions,
} from "@/features/access-control/api/server-roles-api";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const role = await updateRolePermissions(
      id,
      body,
    );

    return NextResponse.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(
      "Failed to update role permissions:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update role permissions.",
      },
      { status: 500 },
    );
  }
}