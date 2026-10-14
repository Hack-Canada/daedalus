import { NextResponse } from "next/server";

import { ApiResponse } from "@/types/api";
import { guardApplicationEdit } from "@/lib/apply/guard";
import { leaveTeam } from "@/lib/db/queries/team";

export async function POST(): Promise<NextResponse<ApiResponse>> {
  const guard = await guardApplicationEdit();
  if (!guard.ok) return guard.response;

  const result = await leaveTeam(guard.userId);
  return NextResponse.json(
    { success: result.success, message: result.message },
    { status: result.success ? 200 : 400 },
  );
}
