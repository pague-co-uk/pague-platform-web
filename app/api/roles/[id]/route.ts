import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  deleteRole,
  findRoleById,
  updateRole,
} from "@/features/access-control/api/server-roles-api";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    const role = await findRoleById(id);

    return NextResponse.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(
      "Failed to fetch role:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch role.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const role = await updateRole(id, body);

    return NextResponse.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error(
      "Failed to update role:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update role.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    await deleteRole(id);

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    console.error(
      "Failed to delete role:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete role.",
      },
      { status: 500 },
    );
  }
}