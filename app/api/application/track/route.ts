import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types/api";
import { isApplyTrack } from "@/config/apply";
import { guardApplicationEdit } from "@/lib/apply/guard";
import {
  ApplicationConflict,
  setApplicationTrack,
} from "@/lib/db/queries/application";

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

  try {
    const result = await setApplicationTrack(
      guard.userId,
      track,
      body.expectedRevision,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApplicationConflict)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 },
      );
    return NextResponse.json(
      { success: false, message: "Could not switch tracks. Try again." },
      { status: 503 },
    );
  }
}
