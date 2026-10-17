import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { verifyEmailCode } from "@/lib/db/queries/email-verification-tokens";
import { isUserEmailVerified } from "@/lib/db/queries/user";
import { limitAuthIp } from "@/lib/security/rate-limit";
import { readAuthJson, RequestError } from "@/lib/security/request";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const verified = await isUserEmailVerified(email);

    return NextResponse.json({ verified }, { status: 200 });
  } catch (error) {
    console.error("Error checking email verification status:", error);
    return NextResponse.json(
      { error: "Failed to check verification status" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await readAuthJson(request);
    await limitAuthIp(request);
    const parsed = z
      .object({ token: z.string().uuid(), code: z.string().regex(/^\d{6}$/) })
      .safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Enter the six-digit code from your email." },
        { status: 400 },
      );
    if (!(await verifyEmailCode(parsed.data.token, parsed.data.code)))
      return NextResponse.json(
        {
          error:
            "Invalid, expired, or exhausted code. Request a new code if needed.",
        },
        { status: 400 },
      );
    return NextResponse.json({
      message: "Email verified successfully. Please sign in.",
    });
  } catch (error) {
    if (error instanceof RequestError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Verification is unavailable. Please try again later." },
      { status: 503 },
    );
  }
}
