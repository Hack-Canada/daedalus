import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/api";
import { guardApplicationEdit } from "@/lib/apply/guard";
import { saveTeamEssay } from "@/lib/db/queries/team";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  const guard = await guardApplicationEdit();
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => null);
  if (typeof body?.essay !== "string") {
    return NextResponse.json(
      { success: false, message: "Write the team answer first." },
      { status: 400 },
    );
  }

  const result = await saveTeamEssay(guard.userId, body.essay);
  return NextResponse.json(
    { success: result.success, message: result.message },
    { status: result.success ? 200 : 400 },
  );
}
