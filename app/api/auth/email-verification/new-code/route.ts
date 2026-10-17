import { NextResponse } from "next/server";

import { ApiResponse } from "@/types/api";
import {
  createVerificationToken,
  deleteExpiredTokens,
  getVerificationTokenByEmail,
} from "@/lib/db/queries/email-verification-tokens";
import { getUserByEmail } from "@/lib/db/queries/user";
import { sendWelcomeEmail } from "@/lib/emails/ses";
import { consumeRateLimit, limitAuthIp } from "@/lib/security/rate-limit";
import { readAuthJson, RequestError } from "@/lib/security/request";
import { EmailValidationSchema } from "@/lib/validations/email-verification";

type ResponseData = {
  tokenId: string;
};

export async function POST(
  req: Request,
): Promise<NextResponse<ApiResponse<ResponseData>>> {
  try {
    const body = await readAuthJson(req);
    await limitAuthIp(req);

    const validatedFields = EmailValidationSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({
        success: false,
        message: validatedFields.error.message,
      });
    }

    const { email: validatedEmail } = validatedFields.data;
    const email = validatedEmail.toLowerCase();
    await consumeRateLimit("email-verification-new-code", email, 5, 60 * 60);

    const existingUser = await getUserByEmail(email);
    if (!existingUser || !existingUser.email || existingUser.emailVerified) {
      return NextResponse.json({
        success: false,
        // Do not let the user know if the email is invalid
        message: "Failed to send verification code to the provided email.",
      });
    }

    // Delete any expired tokens first
    await deleteExpiredTokens(email);

    // Check for existing verification tokens
    const existingTokens = await getVerificationTokenByEmail(email);

    // If there's an active token within the last 2 minutes
    const activeToken = existingTokens.find((token) => {
      // Convert createdAt to UTC and calculate age
      const createdAtUTC = new Date(token.createdAt.toISOString());
      const tokenAge = Date.now() - createdAtUTC.getTime();
      return tokenAge < 2 * 60 * 1000;
    });

    if (activeToken) {
      return NextResponse.json({
        success: false,
        message: `Please wait 2 minutes before requesting for a new code.`,
      });
    }

    // Create new verification token
    const { code, tokenId } = await createVerificationToken(email);

    const emailResult = await sendWelcomeEmail({
      name: existingUser.name,
      email: existingUser.email,
      subject: "Your new email verification code for Hack Canada",
      token: tokenId,
      verificationCode: code,
    });

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        message:
          "Failed to send verification email. Please try again later or contact us if the error persists.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
      data: { tokenId },
    });
  } catch (error) {
    if (error instanceof RequestError)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    console.error("Error generating new verification code", error);
    return NextResponse.json({
      success: false,
      message: "Something went wrong. Please try again later.",
      error: "Something went wrong. Please try again later.",
    });
  }
}
