import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";

import { ApiResponse } from "@/types/api";
import { MIN_TEAM_APPLY } from "@/config/apply";
import { toApplicationRow } from "@/lib/apply/payload";
import {
  ApplicationConflict,
  completeApplicationSubmission,
  writeApplication,
} from "@/lib/db/queries/application";
import { getTeamForUser } from "@/lib/db/queries/team";
import { sendApplicationSubmittedEmail } from "@/lib/emails/ses";
import { getPhaseState } from "@/lib/phase";
import { finalizeResume } from "@/lib/storage/resume";
import {
  HackerApplicationSubmissionSchema,
  teamAnswerError,
} from "@/lib/validations/application";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json({
        success: false,
        message: "You must be logged in to submit an application",
      });
    }

    if (
      currentUser.role !== "unassigned" ||
      currentUser.status !== "not_applied"
    ) {
      return NextResponse.json({
        success: false,
        message:
          "You must not have received a decision to submit an application",
      });
    }

    const { features } = await getPhaseState();
    if (!features.applicationSubmission) {
      return NextResponse.json({
        success: false,
        message: "Application submissions are not available at this time",
      });
    }

    const body = await req.json();
    const validatedFields = HackerApplicationSubmissionSchema.safeParse(body);

    if (!validatedFields.success) {
      const errorMessages = Object.values(
        validatedFields.error.flatten().fieldErrors,
      )
        .flat()
        .join(", ");
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application data",
          error: errorMessages,
        },
        { status: 400 },
      );
    }

    const { data } = validatedFields;
    const team = await getTeamForUser(currentUser.id);

    if (data.applicationType === "team") {
      if (!team || team.members.length < MIN_TEAM_APPLY) {
        return NextResponse.json(
          {
            success: false,
            message: `A team application needs at least ${MIN_TEAM_APPLY} people, including you.`,
          },
          { status: 400 },
        );
      }

      const mine = team.members.find((member) => member.isMe);
      const teamError = teamAnswerError(mine?.marsAnswer || "", team.essay);
      if (teamError) {
        return NextResponse.json(
          { success: false, message: teamError },
          { status: 400 },
        );
      }
    }

    let resumeUrl = "";
    try {
      if (data.resumeUrl) {
        resumeUrl = await finalizeResume(currentUser.id, data.resumeUrl);
      }
    } catch (error) {
      console.error("Resume finalize error:", error);
      return NextResponse.json({
        success: false,
        message: "Upload your resume again before submitting.",
      });
    }

    const saved = await writeApplication(
      {
        ...toApplicationRow(
          { ...data, resumeUrl },
          currentUser.id,
          currentUser.email || "",
          Boolean(team),
        ),
        submissionStatus: "submitted",
      },
      body.expectedRevision,
      true,
    );

    await completeApplicationSubmission(currentUser.id);

    await sendApplicationSubmittedEmail({
      name: data.firstName,
      email: currentUser.email || data.email,
      subject: "Thanks for applying to Hack Canada!",
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
      data: { revision: saved.application.revision },
    });
  } catch (error) {
    if (error instanceof ApplicationConflict)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 },
      );
    console.error("Submission Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to submit application. Please try again.",
    });
  }
}
