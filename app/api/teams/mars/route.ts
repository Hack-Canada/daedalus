import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/api";
import { guardApplicationEdit } from "@/lib/apply/guard";
import { saveMarsAnswer } from "@/lib/db/queries/team";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  const guard = await guardApplicationEdit();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  if (typeof body?.marsAnswer !== "string") {
    return NextResponse.json(
      { success: false, message: "Write your Mars answer first." },
      { status: 400 },
    );
  }

  const result = await saveMarsAnswer(guard.userId, body.marsAnswer);
  return NextResponse.json(
    { success: result.success, message: result.message },
    { status: result.success ? 200 : 400 },
  );
}
