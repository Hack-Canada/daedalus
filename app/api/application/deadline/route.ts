import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/api";
import { getPhaseState } from "@/lib/phase";

export const revalidate = 0;

export async function GET(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  const { dates } = await getPhaseState();
  const deadline = new Date(dates.registrationClose);

  return NextResponse.json({
    success: true,
    message: "Successfully retrieved the application deadline.",
    data: {
      deadline: deadline.toISOString(),
    },
  });
}
