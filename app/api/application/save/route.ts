import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";

import { ApiResponse } from "@/types/api";
import { toApplicationRow } from "@/lib/apply/payload";
import {
  ApplicationConflict,
  getHackerApplicationByUserId,
  writeApplication,
} from "@/lib/db/queries/application";
import { getTeamForUser } from "@/lib/db/queries/team";
import { getPhaseState } from "@/lib/phase";
import { ownsResumeKey } from "@/lib/storage/resume-key";
import { HackerApplicationDraftSchema } from "@/lib/validations/application";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json({
        success: false,
        message: "You must be logged in to save an application",
      });
    }

    if (
      currentUser.role !== "unassigned" ||
      currentUser.status !== "not_applied"
    ) {
      return NextResponse.json({
        success: false,
        message:
          "You must not have submitted or been accepted to save an application",
      });
    }

    const { features } = await getPhaseState();
    if (!features.applicationSaving) {
      return NextResponse.json({
        success: false,
        message: "Application saving is not available at this time",
      });
    }

    const existing = await getHackerApplicationByUserId(currentUser.id);
    if (existing?.submissionStatus === "submitted") {
      return NextResponse.json({
        success: false,
        message: "This application has already been submitted",
      });
    }

    const body = await req.json();
    const validationResult = HackerApplicationDraftSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = Object.values(
        validationResult.error.flatten().fieldErrors,
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

    if (
      validationResult.data.resumeUrl &&
      !ownsResumeKey(currentUser.id, validationResult.data.resumeUrl)
    ) {
      return NextResponse.json(
        { success: false, message: "Upload your resume again before saving." },
        { status: 400 },
      );
    }

    const team = await getTeamForUser(currentUser.id);
    const updatedApplication = await writeApplication(
      {
        ...toApplicationRow(
          validationResult.data,
          currentUser.id,
          currentUser.email || "",
          Boolean(team),
        ),
        submissionStatus: "draft",
      },
      body.expectedRevision,
    );

    return NextResponse.json({
      success: true,
      message: "Application saved successfully",
      data: { revision: updatedApplication.application.revision },
    });
  } catch (error) {
    if (error instanceof ApplicationConflict)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 },
      );
    console.error("Save application error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to save application. Please try again.",
    });
  }
}
