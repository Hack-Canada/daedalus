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
  if (
    typeof body?.marsAnswer !== "string" ||
    typeof body?.teamId !== "string" ||
    !Number.isSafeInteger(body?.revision) ||
    typeof body?.membershipId !== "string"
  ) {
    return NextResponse.json(
      { success: false, message: "Write your Mars answer first." },
      { status: 400 },
    );
  }

  const result = await saveMarsAnswer(guard.userId, body.marsAnswer, body);
  return NextResponse.json(result, {
    status: result.success ? 200 : result.conflict ? 409 : 400,
  });
}
