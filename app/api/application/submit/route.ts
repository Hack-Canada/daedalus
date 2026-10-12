import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";

import { MIN_TEAM_APPLY } from "@/config/apply";
import { ApiResponse } from "@/types/api";
import { toApplicationRow } from "@/lib/apply/payload";
import {
  createOrUpdateApplication,
  submitApplication,
} from "@/lib/db/queries/application";
import { getTeamForUser } from "@/lib/db/queries/team";
import { sendApplicationSubmittedEmail } from "@/lib/emails/ses";
import { getPhaseState } from "@/lib/phase";
import { deletePendingResume, finalizeResume } from "@/lib/storage/resume";
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

    if (currentUser.role !== "unassigned" || currentUser.status !== "not_applied") {
      return NextResponse.json({
        success: false,
        message: "You must not have received a decision to submit an application",
      });
    }

    const { features } = await getPhaseState();
    if (!features.applicationSubmission) {
      return NextResponse.json({
        success: false,
        message: "Application submissions are not available at this time",
      });
    }

    const validatedFields = HackerApplicationSubmissionSchema.safeParse(
      await req.json(),
    );

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

    let resumeUrl: string;
    try {
      resumeUrl = await finalizeResume(currentUser.id, data.resumeUrl);
    } catch (error) {
      console.error("Resume finalize error:", error);
      return NextResponse.json({
        success: false,
        message: "Upload your resume again before submitting.",
      });
    }

    const createResult = await createOrUpdateApplication({
      ...toApplicationRow(
        { ...data, resumeUrl },
        currentUser.id,
        currentUser.email || "",
        Boolean(team),
      ),
      submissionStatus: "submitted",
    });

    if (!createResult.success || !createResult.data) {
      return NextResponse.json({
        success: false,
        message: "Failed to create application. Please try again.",
      });
    }

    const updatedApplication = await submitApplication(createResult.data);
    if (!updatedApplication.success) {
      return NextResponse.json({
        success: false,
        message: "Failed to submit application. Please try again.",
      });
    }

    if (data.resumeUrl.startsWith("pending/")) {
      try {
        await deletePendingResume(currentUser.id, data.resumeUrl);
      } catch (error) {
        console.error("Pending resume cleanup error:", error);
      }
    }

    await sendApplicationSubmittedEmail({
      name: data.firstName,
      email: currentUser.email || data.email,
      subject: "Thanks for applying to Hack Canada!",
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (error) {
    console.error("Submission Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to submit application. Please try again.",
    });
  }
}
