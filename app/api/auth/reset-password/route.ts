import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { consumePasswordReset } from "@/lib/db/queries/password-reset";
import { consumeRateLimit, limitAuthIp } from "@/lib/security/rate-limit";
import { readAuthJson, RequestError } from "@/lib/security/request";
import { ResetPasswordSchema } from "@/lib/validations/reset-password";

export async function POST(req: NextRequest) {
  try {
    const body = await readAuthJson(req);
    await limitAuthIp(req);
    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { success: false, message: "Invalid password or token." },
        { status: 400 },
      );
    await consumeRateLimit("password-reset", parsed.data.token, 5, 15 * 60);
    const hash = await bcrypt.hash(parsed.data.password, 10);
    if (!(await consumePasswordReset(parsed.data.token, hash))) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired reset token. Please request a new password reset.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json({
      success: true,
      message: "Password changed successfully! Please sign in again.",
    });
  } catch (error) {
    if (error instanceof RequestError)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    console.error("Password reset error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Password reset is unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }
}
