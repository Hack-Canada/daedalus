import { NextResponse } from "next/server";

import { ApiResponse } from "@/types/api";
import { TeamMail } from "@/lib/db/queries/team";
import { sendTeamAcceptedEmail, sendTeamRequestEmail } from "@/lib/emails/ses";

export function teamResponse(result: {
  success: boolean;
  message: string;
}): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: result.success, message: result.message },
    { status: result.success ? 200 : 400 },
  );
}

export function invalid(message: string): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function notifyTeam(mail?: TeamMail) {
  if (!mail) return;
  try {
    const result =
      mail.kind === "request"
        ? await sendTeamRequestEmail(mail)
        : await sendTeamAcceptedEmail(mail);
    if (!result.success) console.error("Team email failed:", result.error);
  } catch (error) {
    console.error("Team email failed:", error);
  }
}
