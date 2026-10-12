import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/api";
import { isApplyTrack } from "@/config/apply";
import { guardApplicationEdit } from "@/lib/apply/guard";
import { setApplicationTrack } from "@/lib/db/queries/team";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  const guard = await guardApplicationEdit();
  if (!guard.ok) return guard.response;

  if (guard.user.role !== "unassigned" || guard.user.status !== "not_applied") {
    return NextResponse.json({
      success: false,
      message: "This application can no longer change tracks.",
    });
  }

  const body = await req.json().catch(() => null);
  const track = body?.applicationType;

  if (typeof track !== "string" || !isApplyTrack(track)) {
    return NextResponse.json(
      { success: false, message: "Choose Quick, Normal, or Team." },
      { status: 400 },
    );
  }

  const result = await setApplicationTrack(guard.userId, track);
  return NextResponse.json(
    { success: result.success, message: result.message },
    { status: result.success ? 200 : 400 },
  );
}
