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
  if (
    typeof body?.essay !== "string" ||
    typeof body?.teamId !== "string" ||
    !Number.isSafeInteger(body?.revision)
  ) {
    return NextResponse.json(
      { success: false, message: "Write the team answer first." },
      { status: 400 },
    );
  }

  const result = await saveTeamEssay(guard.userId, body.essay, body);
  return NextResponse.json(result, {
    status: result.success ? 200 : result.conflict ? 409 : 400,
  });
}
