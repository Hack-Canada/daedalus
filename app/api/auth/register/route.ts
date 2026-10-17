import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { ApiResponse } from "@/types/api";
import { db } from "@/lib/db";
import {
  createVerificationToken,
  deleteExpiredTokens,
  getVerificationTokenByEmail,
} from "@/lib/db/queries/email-verification-tokens";
import { getUserByEmail } from "@/lib/db/queries/user";
import { users } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/emails/ses";
import { getPhaseState } from "@/lib/phase";
import { consumeRateLimit, limitAuthIp } from "@/lib/security/rate-limit";
import { readAuthJson, RequestError } from "@/lib/security/request";
import { registerSchema } from "@/lib/validations/register";

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await readAuthJson(req);
    await limitAuthIp(req);

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message,
      });
    }

    const { email: validatedEmail, name, password } = validation.data;

    const email = validatedEmail.toLowerCase();
    await consumeRateLimit("register", email, 5, 60 * 60);

    // Check if user registration is enabled based on current phase
    const { features } = await getPhaseState();
    if (!features.userRegistration) {
      // In production, allow only @hackcanada.org emails when registration is disabled
      if (process.env.NODE_ENV === "production") {
        if (!email.endsWith("@hackcanada.org")) {
          return NextResponse.json({
            success: false,
            message:
              "Registrations are currently disabled. Reach out to hi@hackcanada.org if you think this is an error.",
          });
        }
      } else {
        // In non-production, show friendly message
        return NextResponse.json({
          success: false,
          message: "Registrations are not open yet. Please check back later.",
        });
      }
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message:
          "Failed to create account. Account may already exist, or the provided email is invalid.",
      });
    }

    // Delete any expired tokens
    await deleteExpiredTokens(email);

    // Check for existing verification tokens
    const existingTokens = await getVerificationTokenByEmail(email);

    // If there's an active token, return message to check email
    const activeToken = existingTokens.find(
      (token: { expires: Date }) => token.expires > new Date(),
    );
    if (activeToken) {
      return NextResponse.json({
        success: false,
        message:
          "A verification email has already been sent. Please check your inbox.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verification = await db.transaction(async (tx) => {
      await tx.insert(users).values({ name, email, password: hashedPassword });
      return createVerificationToken(email, tx);
    });
    // Send only after the account and code exist durably. A failed send can be
    // recovered with the existing resend flow without holding database locks.
    const delivery = await sendWelcomeEmail({
      name,
      email,
      subject: "Verify your email address for Hack Canada",
      token: verification.tokenId,
      verificationCode: verification.code,
    });
    if (!delivery.success) console.error("Verification email delivery failed");
    const verificationTokenId = verification.tokenId;

    return NextResponse.json({
      success: true,
      message:
        "Account created successfully! Redirecting to email verification...",
      data: {
        verificationToken: verificationTokenId,
      },
    });
  } catch (error) {
    if (error instanceof RequestError)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    console.error("Error during registration:", error);

    return NextResponse.json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}
