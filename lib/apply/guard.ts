import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";

import { ApiResponse } from "@/types/api";
import { getPhaseState } from "@/lib/phase";

export async function guardApplicationEdit() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "You must be logged in." },
        { status: 401 },
      ) satisfies NextResponse<ApiResponse>,
    };
  }

  const { features } = await getPhaseState();
  if (!features.applicationSaving && !features.applicationSubmission) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, message: "Applications are closed." },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, userId: user.id, user };
}
