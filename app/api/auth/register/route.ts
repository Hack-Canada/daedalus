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
import { generateRandomCode } from "@/lib/utils";
import { registerSchema } from "@/lib/validations/register";

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.errors[0].message,
      });
    }

    const { email: validatedEmail, name, password } = validation.data;

    const email = validatedEmail.toLowerCase();

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
    const verificationCode = generateRandomCode(6);
    let verificationTokenId = "";

    await db.transaction(async (tx) => {
      // Create user
      await tx.insert(users).values({
        name,
        email,
        password: hashedPassword,
      });

      // Create new verification token
      const { tokenId, code } = await createVerificationToken(email, tx);

      // Send verification email
      const emailResult = await sendWelcomeEmail({
        name,
        email,
        subject: "Verify your email address for Hack Canada",
        token: tokenId,
        verificationCode: code,
      });
      // console.log("By passing send verification email, here it the OTP code:");
      // console.log(code);
      if (!emailResult.success) {
        throw new Error("Failed to send verification email.");
      }

      verificationTokenId = tokenId;
    });

    return NextResponse.json({
      success: true,
      message:
        "Account created successfully! Redirecting to email verification...",
      data: {
        verificationToken: verificationTokenId,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);

    return NextResponse.json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}
