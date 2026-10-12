import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { getUserById } from "@/lib/db/queries/user";
import { rsvp, users } from "@/lib/db/schema";
import { sendHackathonPrepEmail } from "@/lib/emails/ses";
import { getPhaseState } from "@/lib/phase";
import { RsvpFormSchema } from "@/lib/validations/rsvp-form";

type RsvpResponse = {
  success?: boolean;
  error?: string;
  alert?: string;
};

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.id) {
      return NextResponse.json<RsvpResponse>({
        error: "You must be logged in to RSVP.",
      });
    }

    const userId = currentUser.id;

    // Check if RSVP is allowed based on current phase
    const { features } = await getPhaseState();
    if (!features.rsvpAccess) {
      return NextResponse.json<RsvpResponse>({
        error: "RSVP is not available at this time.",
      });
    }

    const body = await req.json();
    const validatedFields = RsvpFormSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json<RsvpResponse>({
        error: "Invalid fields provided.",
      });
    }

    const rsvpData = validatedFields.data;

    // Fetch the user from the database
    const existingUser = await getUserById(userId);

    if (!existingUser) {
      return NextResponse.json<RsvpResponse>({
        error: "User not found.",
      });
    }

    // Ensure that the user is qualified to RSVP
    // - user must be accepted
    // - user must not ALREADY be a hacker
    const canRsvp =
      currentUser?.status === "accepted" && currentUser.role !== "hacker";

    if (!canRsvp) {
      return NextResponse.json<RsvpResponse>({
        error: "You do not have the required permissions to RSVP.",
      });
    }

    // Start a db transaction
    const result = await db.transaction(async (tx) => {
      // Update user's role to hacker
      await tx
        .update(users)
        .set({
          role: "hacker",
          rsvpAt: new Date(),
        })
        .where(eq(users.id, userId));

      const rsvpInsertData = {
        userId,
        emergencyContactName: rsvpData.emergencyContactName,
        relationshipToParticipant: rsvpData.relationshipToParticipant,
        emergencyContactPhoneNumber: rsvpData.emergencyContactPhoneNumber,
        alternativePhoneNumber: rsvpData.alternativePhoneNumber || null,
        dietaryRestrictions: rsvpData.dietaryRestrictions
          ? rsvpData.dietaryRestrictions.value === "Other (please specify)" ||
            rsvpData.dietaryRestrictions.value === "Allergies (please specify)"
            ? `${rsvpData.dietaryRestrictions.value.replace(" (please specify)", "")}: ${rsvpData.dietaryRestrictions.customValue}`
            : rsvpData.dietaryRestrictions.value
          : null,
        tshirtSize: rsvpData.tshirtSize,
        agreeToTerms: rsvpData.agreeToTerms,
        mediaConsent: rsvpData.mediaConsent,
      };

      await tx.insert(rsvp).values(rsvpInsertData);

      // Send hackathon prep email after DB updates
      const emailResult = await sendHackathonPrepEmail({
        name: existingUser.name.split(" ")[0],
        email: existingUser.email,
        userId,
      });

      // If email fails, throw error to rollback transaction
      if (!emailResult.success) {
        throw new Error("Failed to send confirmation email");
      }

      return { success: true } as RsvpResponse;
    });

    return NextResponse.json<RsvpResponse>(result);
  } catch (error) {
    console.error("ERROR FROM RSVP API - INTERNAL SERVER ERROR", error);
    return NextResponse.json<RsvpResponse>({
      error: "An unexpected error occurred. Please try again.",
    });
  }
}
