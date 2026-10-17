import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { ApiResponse } from "@/types/api";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/lib/db/queries/user";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { sendResetPasswordEmail } from "@/lib/emails/ses";
import { consumeRateLimit, limitAuthIp } from "@/lib/security/rate-limit";
import { readAuthJson, RequestError } from "@/lib/security/request";
import { ForgotPasswordSchema } from "@/lib/validations/forgot-password";

const TOKEN_EXPIRATION_TIME = 1000 * 60 * 2;

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await readAuthJson(req);
    await limitAuthIp(req);

    const validatedFields = ForgotPasswordSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({
        success: true,
        message:
          "A password reset link will be sent to the email if an account is registered under it.",
      });
    }

    const { email: validatedEmail } = validatedFields.data;

    const email = validatedEmail.toLowerCase();
    await consumeRateLimit("forgot-password", email, 5, 60 * 60);

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return NextResponse.json({
        success: true,
        message:
          "A password reset link will be sent to the email if an account is registered under it.",
      });
    }

    const token = await db.transaction(async (tx) => {
      await tx
        .select()
        .from(users)
        .where(eq(users.id, existingUser.id))
        .for("no key update");
      const existing = await tx
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, existingUser.id));
      if (
        existing.some(
          (row) => row.createdAt.getTime() > Date.now() - TOKEN_EXPIRATION_TIME,
        )
      ) {
        throw new RequestError(
          "A reset link was sent recently. Please check your email.",
          429,
        );
      }
      const nextToken = crypto.randomUUID();
      await tx
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, existingUser.id));
      await tx
        .insert(passwordResetTokens)
        .values({ token: nextToken, userId: existingUser.id });
      return nextToken;
    });
    const delivery = await sendResetPasswordEmail({
      name: existingUser.name,
      email: existingUser.email,
      subject: "Reset your Hack Canada password",
      token,
    });
    if (!delivery.success)
      throw new Error("Failed to send reset password email");

    return NextResponse.json({
      success: true,
      message: "A password reset link has been sent to your email.",
    });
  } catch (error) {
    if (error instanceof RequestError)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    console.error("Error during password reset request:", error);

    return NextResponse.json({
      success: false,
      message: "Something went wrong, please try again.",
    });
  }
}
